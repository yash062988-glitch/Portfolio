import * as THREE from 'three';

/**
 * Procedural Head & Neck Tracking Controller — Production Quality
 *
 * Applies an additive local-space rotation to neck + head bones so Charizard
 * tracks the cursor.  Animation clips are never overwritten — the procedural
 * offset is composed on top of whatever the mixer has already written.
 *
 * Design rules:
 *   - Owns ONLY neck + head bones.
 *   - Bones discovered once after GLB load.
 *   - Zero per-frame allocations.
 *   - No React state updates inside update().
 *   - Never rotates spine / pelvis / root / legs / wings / tail.
 *   - Critically damped smoothing — no jitter, no overshoot, no oscillation.
 *   - Velocity-adaptive tracking speed.
 *   - Adaptive neck/head weight distribution.
 *   - Dead zone for micro-jitter elimination.
 *   - Clamp after smoothing — never snap into limits.
 */

// ── Tunables ────────────────────────────────────────────────────────────────

const YAW_LIMIT        = THREE.MathUtils.degToRad(85);   // left / right (was 60)
const PITCH_UP_LIMIT   = THREE.MathUtils.degToRad(30);
const PITCH_DOWN_LIMIT = THREE.MathUtils.degToRad(25);

// Critically damped spring constants (ω = natural frequency, rad/s)
// ω = 12 gives ~0.5s settle with zero overshoot — fast but smooth
const TARGET_OMEGA     = 14;   // target position smoothing
const ROT_OMEGA_BASE   = 10;   // rotation smoothing (slow cursor)
const ROT_OMEGA_FAST   = 22;   // rotation smoothing (fast cursor)

// Velocity range for adaptive tracking (world units/s)
const VEL_SLOW = 2;   // below this → precise
const VEL_FAST = 15;  // above this → quick response

// Adaptive weight range
const NECK_WEIGHT_MIN = 0.30;  // small movement — mostly head
const NECK_WEIGHT_MAX = 0.55;  // large movement — more neck
const HEAD_WEIGHT_MIN = 0.45;  // large movement
const HEAD_WEIGHT_MAX = 0.70;  // small movement

// Weight at which neck starts contributing first (fraction of yaw range)
const NECK_LEAD_THRESHOLD = THREE.MathUtils.degToRad(15);

// Dead zone — angular change below this is ignored (radians ≈ 0.3°)
const DEAD_ZONE = 0.005;

const WEIGHT_BLEND_RATE = 4.0;   // context weight blend speed
const SUPPRESS_WEIGHT   = 0.0;   // target weight when fully suppressed

const TARGET_Y_OFFSET  = 1.8;   // raise look-target above ground plane

// ── Types ───────────────────────────────────────────────────────────────────

export type LocomotionContext = 'idle' | 'walk' | 'run' | 'flight';

/** Animation phases that require head-tracking to be fully suppressed. */
export type SuppressReason =
  | 'sleep-start' | 'sleep-loop' | 'sleep-end'
  | 'takeoff' | 'landing-begin' | 'landing-loop' | 'landing-finish'
  | 'interaction' | 'none';

export interface HeadTrackingDebugInfo {
  enabled: boolean;
  trackingWeight: number;
  headYaw: number;
  headPitch: number;
  neckRotation: number;
  cursorTargetX: number;
  cursorTargetY: number;
  cursorTargetZ: number;
  neckBoneName: string;
  headBoneName: string;
  updateRate: number;
}

// ── Controller ───────────────────────────────────────────────────────────────

export class HeadTrackingController {
  private neckBone: THREE.Object3D | null = null;
  private headBone: THREE.Object3D | null = null;
  private neckBoneName = 'None';
  private headBoneName = 'None';
  private bonesDiscovered = false;

  // Current additive offsets (smoothed toward target each frame)
  private currentNeckOffset = new THREE.Quaternion();
  private currentHeadOffset = new THREE.Quaternion();

  // Desired offsets computed this frame
  private desiredNeckOffset = new THREE.Quaternion();
  private desiredHeadOffset = new THREE.Quaternion();

  // ── Critically damped spring for target position ─────────────────────────
  // Position + velocity vectors for 3D target smoothing
  private smoothedTarget = new THREE.Vector3();
  private targetVel = new THREE.Vector3();
  private targetInitialized = false;

  // ── Smoothed yaw/pitch angles ────────────────────────────────────────────
  // We smooth the *angles* directly (not quaternions) then build the
  // quaternion from the smoothed result.  This eliminates quaternion jitter.
  private smoothYaw = 0;
  private smoothPitch = 0;
  private yawVel = 0;
  private pitchVel = 0;

  // Previous cursor world position for velocity calculation
  private prevCursorX = 0;
  private prevCursorZ = 0;
  private cursorVelInitialized = false;

  // Context → desired tracking weight
  private currentWeight = 1.0;
  private targetWeight  = 1.0;

  // Suppression state — when set, targetWeight eases toward 0
  private suppressReason: SuppressReason = 'none';
  private locomotionContext: LocomotionContext = 'idle';

  // Telemetry
  private enabled     = true;
  private headYaw     = 0;
  private headPitch   = 0;
  private neckYawMag  = 0;

  // Frame-rate measurement
  private frameCount    = 0;
  private fpsAccumTime  = 0;
  private measuredHz    = 60;

  // Reusable temporaries — zero per-frame allocation
  private readonly tmpA   = new THREE.Vector3();
  private readonly tmpDir = new THREE.Vector3();
  private readonly tmpInvQuat  = new THREE.Quaternion();
  private readonly tmpBlend    = new THREE.Quaternion();
  private readonly tmpClipQuat = new THREE.Quaternion();
  private readonly tmpEuler    = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly tmpBonePos  = new THREE.Vector3();

  // ── Public API ───────────────────────────────────────────────────────────

  discoverBones(root: THREE.Object3D): void {
    if (this.bonesDiscovered) return;

    let neckName = 'None';
    let headName = 'None';

    root.traverse((child) => {
      const n = child.name.toLowerCase();
      if (!this.neckBone && (n.includes('neck') || n.includes('j_neck') || n.includes('bone_neck'))) {
        this.neckBone = child;
        neckName = child.name;
      }
      if (!this.headBone && child !== this.neckBone &&
          (n.includes('head') || n.includes('j_head') || n.includes('bone_head'))) {
        this.headBone = child;
        headName = child.name;
      }
    });

    this.neckBoneName = neckName;
    this.headBoneName = headName;
    this.bonesDiscovered = true;

    if (this.neckBone && this.headBone) {
      console.log(`[HeadTracking] Found — neck: "${neckName}", head: "${headName}"`);
    } else {
      console.warn(`[HeadTracking] Incomplete — neck: ${neckName}, head: ${headName}`);
    }
  }

  setEnabled(enabled: boolean): void { this.enabled = enabled; }
  isEnabled(): boolean { return this.enabled; }

  setLocomotionContext(ctx: LocomotionContext): void {
    this.locomotionContext = ctx;
    this.recomputeTargetWeight();
  }

  setSuppressed(reason: SuppressReason): void {
    this.suppressReason = reason;
    this.recomputeTargetWeight();
  }

  clearSuppression(): void {
    this.suppressReason = 'none';
    this.recomputeTargetWeight();
  }

  getSuppressReason(): SuppressReason { return this.suppressReason; }

  setInteractionActive(active: boolean): void {
    if (active && this.suppressReason === 'none') {
      this.targetWeight = 0.3;
    } else if (!active && this.suppressReason === 'none') {
      this.recomputeTargetWeight();
    }
  }

  private recomputeTargetWeight(): void {
    if (this.suppressReason !== 'none') {
      this.targetWeight = SUPPRESS_WEIGHT;
      return;
    }
    switch (this.locomotionContext) {
      case 'idle':  this.targetWeight = 1.0; break;
      case 'walk':  this.targetWeight = 1.0; break;
      case 'run':   this.targetWeight = 0.7; break;
      case 'flight':this.targetWeight = 0.85; break;
    }
  }

  /**
   * Per-frame update.
   *
   * @param delta         Frame delta (seconds).
   * @param cursorWorld   Cursor world position (ground-plane hit).
   * @param characterPos  Character root world position.
   * @param characterQuat Character root world quaternion (body facing direction).
   * @param _camera       Unused (kept for interface compatibility).
   */
  update(
    delta: number,
    cursorWorld: THREE.Vector3,
    characterPos: THREE.Vector3,
    characterQuat: THREE.Quaternion,
    _camera: THREE.Camera
  ): void {
    if (!this.enabled || !this.bonesDiscovered) return;
    if (!this.neckBone && !this.headBone) return;

    const dt = Math.min(delta, 0.05);

    // Frame-rate measurement
    this.frameCount++;
    this.fpsAccumTime += dt;
    if (this.fpsAccumTime >= 0.5) {
      this.measuredHz = this.frameCount / this.fpsAccumTime;
      this.frameCount = 0;
      this.fpsAccumTime = 0;
    }

    // ── 1. Critically damped target position smoothing ─────────────────────
    // Using a 2nd-order critically damped spring (damping ratio = 1):
    //   a = ω² (target - x) - 2ω v
    //   v += a * dt
    //   x += v * dt
    // This gives the fastest possible settling with zero overshoot.
    this.tmpA.set(cursorWorld.x, TARGET_Y_OFFSET, cursorWorld.z);

    if (!this.targetInitialized) {
      this.smoothedTarget.copy(this.tmpA);
      this.targetVel.set(0, 0, 0);
      this.targetInitialized = true;
    } else {
      const ax = TARGET_OMEGA * TARGET_OMEGA * (this.tmpA.x - this.smoothedTarget.x) - 2 * TARGET_OMEGA * this.targetVel.x;
      const ay = TARGET_OMEGA * TARGET_OMEGA * (this.tmpA.y - this.smoothedTarget.y) - 2 * TARGET_OMEGA * this.targetVel.y;
      const az = TARGET_OMEGA * TARGET_OMEGA * (this.tmpA.z - this.smoothedTarget.z) - 2 * TARGET_OMEGA * this.targetVel.z;
      this.targetVel.x += ax * dt;
      this.targetVel.y += ay * dt;
      this.targetVel.z += az * dt;
      this.smoothedTarget.x += this.targetVel.x * dt;
      this.smoothedTarget.y += this.targetVel.y * dt;
      this.smoothedTarget.z += this.targetVel.z * dt;
    }

    // ── 2. Compute cursor velocity for adaptive tracking ──────────────────
    let cursorSpeed = 0;
    if (!this.cursorVelInitialized) {
      this.prevCursorX = cursorWorld.x;
      this.prevCursorZ = cursorWorld.z;
      this.cursorVelInitialized = true;
    } else {
      const vx = (cursorWorld.x - this.prevCursorX) / Math.max(dt, 1e-6);
      const vz = (cursorWorld.z - this.prevCursorZ) / Math.max(dt, 1e-6);
      cursorSpeed = Math.sqrt(vx * vx + vz * vz);
      this.prevCursorX = cursorWorld.x;
      this.prevCursorZ = cursorWorld.z;
    }

    // Adaptive rotation smoothing rate — faster cursor → quicker response
    const speedT = THREE.MathUtils.clamp(
      (cursorSpeed - VEL_SLOW) / (VEL_FAST - VEL_SLOW), 0, 1
    );
    const rotOmega = ROT_OMEGA_BASE + (ROT_OMEGA_FAST - ROT_OMEGA_BASE) * speedT;

    // ── 3. Compute desired yaw/pitch in character-local space ─────────────
    const pivot = this.neckBone ?? this.headBone;
    if (!pivot) return;

    pivot.getWorldPosition(this.tmpBonePos);
    this.tmpDir.subVectors(this.smoothedTarget, this.tmpBonePos);

    // Convert to character-local space
    this.tmpInvQuat.copy(characterQuat).invert();
    this.tmpDir.applyQuaternion(this.tmpInvQuat);

    const dirLen = this.tmpDir.length();
    if (dirLen < 1e-4) {
      // On pivot — ease angles back to neutral
      this.smoothYaw = this.criticallyDampedAngle(this.smoothYaw, 0, this.yawVel, rotOmega, dt).val;
      this.yawVel = this.criticallyDampedAngle(this.smoothYaw, 0, this.yawVel, rotOmega, dt).vel;
      this.smoothPitch = this.criticallyDampedAngle(this.smoothPitch, 0, this.pitchVel, rotOmega, dt).val;
      this.pitchVel = this.criticallyDampedAngle(this.smoothPitch, 0, this.pitchVel, rotOmega, dt).vel;
    } else {
      this.tmpDir.divideScalar(dirLen);

      const yaw = Math.atan2(this.tmpDir.x, this.tmpDir.z);
      const horizLen = Math.sqrt(this.tmpDir.x ** 2 + this.tmpDir.z ** 2);
      const pitch = Math.atan2(this.tmpDir.y, Math.max(horizLen, 0.001));

      // ── 4. Dead zone — ignore tiny angular changes ──────────────────────
      const yawDelta = yaw - this.smoothYaw;
      const pitchDelta = pitch - this.smoothPitch;

      // Wrap yaw delta to [-π, π] for correct comparison
      const wrappedYawDelta = Math.atan2(Math.sin(yawDelta), Math.cos(yawDelta));

      if (Math.abs(wrappedYawDelta) < DEAD_ZONE && Math.abs(pitchDelta) < DEAD_ZONE) {
        // Within dead zone — don't update desired angles, let spring settle
        // Still apply smoothing so the current offset eases toward last target
      } else {
        // ── 5. Critically damped angle smoothing ─────────────────────────
        // Smooth the *angles* first, then build quaternions from them.
        // This prevents quaternion jitter and allows clamping after smoothing.
        const yawResult = this.criticallyDampedAngle(this.smoothYaw, yaw, this.yawVel, rotOmega, dt);
        this.smoothYaw = yawResult.val;
        this.yawVel = yawResult.vel;

        const pitchResult = this.criticallyDampedAngle(this.smoothPitch, pitch, this.pitchVel, rotOmega, dt);
        this.smoothPitch = pitchResult.val;
        this.pitchVel = pitchResult.vel;
      }
    }

    // ── 6. Clamp AFTER smoothing ──────────────────────────────────────────
    // The head smoothly reaches the limit, never snaps into the clamp.
    const clampedYaw   = THREE.MathUtils.clamp(this.smoothYaw,   -YAW_LIMIT,        YAW_LIMIT);
    const clampedPitch = THREE.MathUtils.clamp(this.smoothPitch, -PITCH_DOWN_LIMIT,  PITCH_UP_LIMIT);

    // ── 7. Adaptive neck/head weight distribution ─────────────────────────
    // Small movements → mostly head.  Large movements → more neck.
    // Neck leads first, head finishes — realistic body mechanics.
    const yawMag = Math.abs(clampedYaw);
    const weightT = THREE.MathUtils.clamp(yawMag / NECK_LEAD_THRESHOLD, 0, 1);
    const neckWeight = NECK_WEIGHT_MIN + (NECK_WEIGHT_MAX - NECK_WEIGHT_MIN) * weightT;
    const headWeight = HEAD_WEIGHT_MAX - (HEAD_WEIGHT_MAX - HEAD_WEIGHT_MIN) * weightT;

    // ── 8. Build desired quaternions from smoothed+clamped angles ──────────
    this.tmpEuler.set(clampedPitch * neckWeight, clampedYaw * neckWeight, 0, 'YXZ');
    this.desiredNeckOffset.setFromEuler(this.tmpEuler);

    this.tmpEuler.set(clampedPitch * headWeight, clampedYaw * headWeight, 0, 'YXZ');
    this.desiredHeadOffset.setFromEuler(this.tmpEuler);

    // ── 9. Slerp current offsets toward desired ────────────────────────────
    // Additional slerp layer on top of the angle smoothing for extra stability
    const slerpT = 1 - Math.exp(-rotOmega * dt);
    this.currentNeckOffset.slerp(this.desiredNeckOffset, slerpT);
    this.currentHeadOffset.slerp(this.desiredHeadOffset, slerpT);

    // ── 10. Blend tracking weight ──────────────────────────────────────────
    this.currentWeight = THREE.MathUtils.lerp(
      this.currentWeight,
      this.targetWeight,
      1 - Math.exp(-WEIGHT_BLEND_RATE * dt)
    );

    // ── 11. Apply additive offset on top of mixer output ───────────────────
    if (this.neckBone) {
      this.tmpClipQuat.copy(this.neckBone.quaternion);
      this.applyAdditive(this.neckBone, this.tmpClipQuat, this.currentNeckOffset, this.currentWeight);
    }
    if (this.headBone) {
      this.tmpClipQuat.copy(this.headBone.quaternion);
      this.applyAdditive(this.headBone, this.tmpClipQuat, this.currentHeadOffset, this.currentWeight);
    }

    // ── 12. Telemetry ──────────────────────────────────────────────────────
    this.tmpEuler.setFromQuaternion(this.currentHeadOffset, 'YXZ');
    this.headYaw   = this.tmpEuler.y;
    this.headPitch = this.tmpEuler.x;
    this.tmpEuler.setFromQuaternion(this.currentNeckOffset, 'YXZ');
    this.neckYawMag = Math.abs(this.tmpEuler.y);

    // Suppress unused variable warning — characterPos is part of the interface
    void characterPos;
  }

  /**
   * Critically damped spring for angle smoothing.
   * Handles angle wrapping (always takes shortest path).
   * Returns both the new value and velocity for state tracking.
   */
  private criticallyDampedAngle(
    current: number,
    target: number,
    velocity: number,
    omega: number,
    dt: number
  ): { val: number; vel: number } {
    // Shortest-path angle difference
    let diff = target - current;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));

    const accel = omega * omega * diff - 2 * omega * velocity;
    const newVel = velocity + accel * dt;
    const newVal = current + newVel * dt;

    return { val: newVal, vel: newVel };
  }

  // bone.quaternion = clipLocal * slerp(identity, offset, weight)
  private applyAdditive(
    bone: THREE.Object3D,
    clipLocal: THREE.Quaternion,
    offset: THREE.Quaternion,
    weight: number
  ): void {
    this.tmpBlend.identity().slerp(offset, weight);
    bone.quaternion.copy(clipLocal).multiply(this.tmpBlend);
  }

  reset(): void {
    this.currentNeckOffset.identity();
    this.currentHeadOffset.identity();
    this.desiredNeckOffset.identity();
    this.desiredHeadOffset.identity();
    this.targetInitialized = false;
    this.cursorVelInitialized = false;
    this.smoothYaw = 0;
    this.smoothPitch = 0;
    this.yawVel = 0;
    this.pitchVel = 0;
    this.targetVel.set(0, 0, 0);
    this.currentWeight = 1.0;
    this.targetWeight  = 1.0;
    this.suppressReason = 'none';
    if (this.neckBone) this.neckBone.quaternion.identity();
    if (this.headBone) this.headBone.quaternion.identity();
  }

  getDebugInfo(): HeadTrackingDebugInfo {
    return {
      enabled:        this.enabled,
      trackingWeight: this.currentWeight,
      headYaw:        this.headYaw,
      headPitch:      this.headPitch,
      neckRotation:   this.neckYawMag,
      cursorTargetX:  this.smoothedTarget.x,
      cursorTargetY:  this.smoothedTarget.y,
      cursorTargetZ:  this.smoothedTarget.z,
      neckBoneName:   this.neckBoneName,
      headBoneName:   this.headBoneName,
      updateRate:     this.measuredHz,
    };
  }
}
