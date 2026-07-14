import * as THREE from 'three';
import { getFlightMovementAnimations, FlightMovementAnimations, getFlightAnimations } from './FlightAnimationManifest';
import { getMovementAnimations, getFlightTransitionAnimations } from './GroundAnimationManifest';
import { AnimationOwner } from './OneShotAnimationController';
import { MovementConfig } from './Config';

/**
 * Flight Controller — split into two independent internal systems:
 *
 * 1. Flight Phase Manager (FlightController)
 *    - Current phase, phase transitions, animation ownership for transitions
 *    - Mixer finished events, enter/exit callbacks
 *    - NEVER modifies position, velocity, rotation, steering, or speed
 *
 * 2. Flight Locomotion (FlightLocomotion)
 *    - Cursor following, target position, steering, velocity, acceleration,
 *      deceleration, rotation smoothing, arrival lock, hover movement
 *    - NEVER triggers takeoff/landing, plays transition animations, or
 *      listens to mixer events
 *
 * Update order every frame:
 *   1. Update Flight Phase
 *   2. Decide whether locomotion is allowed (canMove)
 *   3. If canMove: update target → steering → acceleration → velocity → move → rotate
 *   4. Apply hover bobbing
 *   5. Update locomotion animation
 */

// ── Enums & Types ───────────────────────────────────────────────────────────

export enum FlightPhase {
  Inactive     = 'Inactive',
  PreLaunch    = 'PreLaunch',
  Takeoff      = 'Takeoff',
  Flying       = 'Flying',
  LandingBegin = 'LandingBegin',
  LandingLoop  = 'LandingLoop',
  LandingFinish= 'LandingFinish',
}

export enum FlightMode {
  AutoGround    = 'AutoGround',
  ManualFlight  = 'ManualFlight',
  AutoFlight    = 'AutoFlight',
  ManualGround  = 'ManualGround',
}

export type FlightTriggerSource = 'Button' | 'Cursor' | 'Page';

export interface FlightConfig {
  flightDistanceThreshold: number;
  flySpeed: number;
  flightHeight: number;
  landingDistance: number;
  climbSpeed: number;
  turnSpeed: number;
  acceleration: number;
  deceleration: number;
}

export const DefaultFlightConfig: FlightConfig = {
  flightDistanceThreshold: 15,
  flySpeed: 5,
  flightHeight: 4,
  landingDistance: 1.5,
  climbSpeed: 2.5,
  turnSpeed: 3.5,
  acceleration: 2.5,
  deceleration: 3,
};

// ── Flight locomotion states (mirrors ground idle/walk/run) ─────────────────

type FlightLocoState = 'hover' | 'slow' | 'fast';

const FADE_LOCO            = 0.35;   // crossfade for locomotion transitions
const FADE_TRANSITION      = 0.4;    // crossfade for phase transitions
const FADE_INTERACTION_IN  = 0.20;   // crossfade from locomotion → interaction
// const FADE_INTERACTION_OUT = 0.35;   // crossfade from interaction → locomotion
export const GROUND_IDLE_CROSSFADE = 0.3; // crossfade duration for returning to ground idle
// Dead-zone hysteresis: once inside landingDistance, stay stopped until cursor
// moves landingDistance + HOVER_HYSTERESIS away. Prevents oscillation at the boundary.
const HOVER_HYSTERESIS     = 0.8;


// ── Debug info ──────────────────────────────────────────────────────────────

export interface FlightDebugInfo {
  phase: FlightPhase;
  mode: string;
  currentFlightAnimation: string;
  altitude: number;
  verticalVelocity: number;
  horizontalSpeed: number;
  distanceToTarget: number;
  takeoffTriggered: boolean;
  landingTriggered: boolean;
  animOwner: string;
  animWeight: number;
  animTime: number;
  loopMode: string;
  animRunning: boolean;
  groundAnimWeight: number;
  flightAnimWeight: number;
  interactionActive: boolean;
  currentInteraction: string;
  fsmState: string;
  flightMode: FlightMode;
  triggerSource: FlightTriggerSource | 'None';
  hoverActive: boolean;
  takeoffComplete: boolean;
  cursorHeight: number;
  headHeight: number;
  flightThreshold: number;
  aboveThreshold: boolean;
  autoFlightTriggered: boolean;
  interactionPool: 'Ground' | 'Flight';
  poolSize: number;
  flightFSMState: string;
  locomotionSet: 'Ground' | 'Flight';
  requestedAnimation: string;
  restoreClip: string;
  movementFrozen: boolean;
  // Arrival lock debug
  hasArrived: boolean;
  arrivalDistance: number;
  arrivalLock: boolean;
  arrivalLocked: boolean;
  movementSkipped: boolean;
  remainingDistance: number;
  unlockDistance: number;
  unlockRadius: number;
  horizontalVelocity: number;
  // Architecture debug
  currentPhase: string;
  canMove: boolean;
  locomotionEnabled: boolean;
  animationOwner: string;
  currentLocomotionState: string;
  currentTarget: string;
  currentVelocity: number;
  // Animation ownership debug
  animationOwnerDebug: string;
  currentLocomotionClip: string;
  currentInteractionClip: string;
  interactionWeight: number;
  locomotionWeight: number;
  // Flight shutdown debug
  flightPhase: string;
  flightActive: boolean;
  shutdownPending: boolean;
  shutdownComplete: boolean;
  movementOwner: string;
  steeringEnabled: boolean;
  groundEnabled: boolean;
  groundSpeed: number;
  flightSpeed: number;
  transitionInProgress: boolean;
}

export interface FlightCallbacks {
  getCurrentAnimationName: () => string | null;
  onFlightComplete: () => void;
  onFlightStart: () => void;
  onEnterFlightMode: () => void;
  onExitFlightMode: () => void;
  getInteractionActive: () => boolean;
  getCurrentInteraction: () => string;
  getFSMState: () => string;
  getGroundAnimWeight: () => number;
  onFlightShutdownComplete: () => void;
  playAnimation: (name: string, owner: string, role: string, reason: string, gated?: boolean, restoreOnly?: boolean, crossfadeDuration?: number) => void;
  releaseAnimationOwner?: (owner: string) => void;
  getCurrentActionDetails?: () => { name: string; weight: number; time: number; loopMode: string; running: boolean } | null;
  isSleepOwningMovement?: () => boolean;
  updateFSM?: (context: {
    currentSpeed: number;
    targetSpeed: number;
    distanceToTarget: number;
    rotationComplete: boolean;
    animationComplete: boolean;
  }) => void;
}

// ── Easing ─────────────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ═════════════════════════════════════════════════════════════════════════════
// FLIGHT LOCOMOTION — movement only, never knows about phases or transitions
// ═════════════════════════════════════════════════════════════════════════════

class FlightLocomotion {
  private config: FlightConfig;
  private flightAnimNames: FlightMovementAnimations;
  private flyHoverAnim: string | null = null;
  private callbacks: FlightCallbacks | null = null;

  // Movement state
  private currentSpeed = 0;
  private bobTimer = 0;
  private hasArrived = false;
  private targetPosition = new THREE.Vector3();
  private movementFrozen = false;
  private steeringEnabled = false;

  // Locomotion animation state (hover/slow/fast only — never transition clips)
  private flightLocoState: FlightLocoState = 'hover';
  private lastFlightAnim: string | null = null;

  private inspectedClipsDiag = new Set<string>();

  private lastDiagTime = 0;
  private oscillationCounter = 0;
  private lastArrivedDiag = false;
  private lastDesiredSpeedDiag = 0;
  private lastTargetDiag = new THREE.Vector3();
  private currentPositionDiag = new THREE.Vector3();
  private targetPositionDiag = new THREE.Vector3();
  private lastDistance = 0;

  // Pre-allocated temporaries — zero per-frame allocation
  private readonly tmpDir  = new THREE.Vector3();
  private readonly tmpQuat = new THREE.Quaternion();
  private readonly upAxis  = new THREE.Vector3(0, 1, 0);

  // Flight steering, banking, and pitch states
  private readonly flightYawQuat = new THREE.Quaternion();
  private currentRoll = 0;
  private currentPitch = 0;
  private prevY = 0;
  private yawInitialized = false;

  constructor(config: FlightConfig, animNames: FlightMovementAnimations) {
    this.config = config;
    this.flightAnimNames = animNames;
  }

  setCallbacks(callbacks: FlightCallbacks): void {
    this.callbacks = callbacks;
  }

  setConfig(config: Partial<FlightConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setFlyHoverAnimation(name: string | null): void {
    this.flyHoverAnim = name;
  }

  getFlyHoverAnim(): string | null { return this.flyHoverAnim; }

  setMovementFrozen(frozen: boolean): void {
    this.movementFrozen = frozen;
  }

  isMovementFrozen(): boolean { return this.movementFrozen; }

  getAnimationOwner(): AnimationOwner {
    if (this.callbacks?.getInteractionActive?.()) {
      return AnimationOwner.Interaction;
    }
    return AnimationOwner.FlightLocomotion;
  }

  notifyInteractionComplete(): void {
    this.movementFrozen = false;
  }

  stopMovement(): void {
    this.currentSpeed = 0;
    this.hasArrived = false;
  }

  setSteeringEnabled(enabled: boolean): void {
    this.steeringEnabled = enabled;
  }

  isSteeringEnabled(): boolean {
    return this.steeringEnabled;
  }

  shutdownFlight(): void {
    this.currentSpeed = 0;
    this.bobTimer = 0;
    this.hasArrived = false;
    this.targetPosition.set(0, 0, 0);
    this.movementFrozen = false;
    this.steeringEnabled = false;
    this.lastFlightAnim = null;
    this.flightLocoState = 'hover';
    this.inspectedClipsDiag.clear();
    this.lastDiagTime = 0;
    this.oscillationCounter = 0;
    this.lastArrivedDiag = false;
    this.lastDesiredSpeedDiag = 0;
    this.lastTargetDiag.set(0, 0, 0);
    this.lastDistance = 0;
    this.flightYawQuat.set(0, 0, 0, 1);
    this.currentRoll = 0;
    this.currentPitch = 0;
    this.prevY = 0;
    this.yawInitialized = false;
  }

  getSteeringEnabled(): boolean { return this.steeringEnabled; }
  getHasValidTarget(): boolean { return true; }
  getDesiredFlightTarget(): THREE.Vector3 { return this.targetPosition; }
  getPursuitTarget(): THREE.Vector3 { return this.targetPosition; }

  setInitialTarget(target: THREE.Vector3): void {
    this.targetPosition.copy(target);
  }

  reset(): void {
    this.currentSpeed = 0;
    this.bobTimer = 0;
    this.hasArrived = false;
    this.movementFrozen = false;
    this.lastFlightAnim = null;
    this.flightLocoState = 'hover';
    this.inspectedClipsDiag.clear();
    this.lastDiagTime = 0;
    this.oscillationCounter = 0;
    this.lastArrivedDiag = false;
    this.lastDesiredSpeedDiag = 0;
    this.lastTargetDiag.set(0, 0, 0);
    this.lastDistance = 0;
    this.flightYawQuat.set(0, 0, 0, 1);
    this.currentRoll = 0;
    this.currentPitch = 0;
    this.prevY = 0;
    this.yawInitialized = false;
  }

  getFlightRestoreAnimation(): string | null {
    switch (this.flightLocoState) {
      case 'fast':  return this.flightAnimNames.run;
      case 'slow':  return this.flightAnimNames.walk;
      default:      return this.flightAnimNames.idleLoop ?? this.flyHoverAnim;
    }
  }

  getLocoState(): FlightLocoState { return this.flightLocoState; }
  getCurrentSpeed(): number { return this.currentSpeed; }
  getHasArrived(): boolean { return this.hasArrived; }
  getDesiredTarget(): THREE.Vector3 { return this.targetPosition; }
  getLastFlightAnim(): string | null { return this.lastFlightAnim; }
  getLastDistance(): number { return this.lastDistance; }

  update(
    dt: number,
    canMove: boolean,
    targetPosition: THREE.Vector3,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion,
    actions: Record<string, THREE.AnimationAction>,
    facingQuaternion?: THREE.Quaternion | null
  ): void {
    this.targetPosition.copy(targetPosition);
    this.currentPositionDiag.copy(position);
    this.targetPositionDiag.copy(targetPosition);

    if (!this.yawInitialized) {
      const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
      this.flightYawQuat.setFromAxisAngle(this.upAxis, euler.y);
      this.yawInitialized = true;
    }

    // Compute direction and distance directly
    this.tmpDir.subVectors(targetPosition, position);
    this.tmpDir.y = 0;
    const distance = this.tmpDir.length();
    this.lastDistance = distance;

    const accelFactor = (rate: number) => 1 - Math.exp(-rate * dt);

    // ── 1. Arrival Lock Hysteresis ──
    if (this.hasArrived) {
      const unlockRadius = this.config.landingDistance + HOVER_HYSTERESIS;
      if (distance > unlockRadius) {
        this.hasArrived = false;
        this.currentSpeed = 0;
      } else {
        this.currentSpeed = 0;
        this.bobTimer += dt;
        const bob = Math.sin(this.bobTimer * 3) * 0.08;
        const targetY = this.config.flightHeight + bob;
        position.y = THREE.MathUtils.lerp(
          position.y, targetY,
          1 - Math.exp(-this.config.climbSpeed * dt)
        );

        // Keep facing the cursor, or face user if provided
        if (facingQuaternion) {
          this.flightYawQuat.slerp(facingQuaternion, accelFactor(this.config.turnSpeed));
        } else {
          const desiredRotation = Math.atan2(this.tmpDir.x, this.tmpDir.z);
          this.tmpQuat.setFromAxisAngle(this.upAxis, desiredRotation);
          this.flightYawQuat.slerp(this.tmpQuat, accelFactor(this.config.turnSpeed));
        }

        // Smoothly decay banking and pitch to 0
        this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, 0, 1 - Math.exp(-6 * dt));
        this.currentPitch = THREE.MathUtils.lerp(this.currentPitch, 0, 1 - Math.exp(-6 * dt));
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.currentPitch);
        const rollQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.currentRoll);
        quaternion.copy(this.flightYawQuat).multiply(pitchQuat).multiply(rollQuat);

        this.updateLocomotionAnimation(actions);
        this.prevY = position.y;
        return;
      }
    }

    // ── 2. Frozen/Steering Disabled Decay ──
    if (!this.steeringEnabled || !canMove) {
      this.bobTimer += dt;
      const bob = Math.sin(this.bobTimer * 3) * 0.08;
      position.y = THREE.MathUtils.lerp(
        position.y,
        this.config.flightHeight + bob,
        1 - Math.exp(-this.config.climbSpeed * dt)
      );
      this.currentSpeed = THREE.MathUtils.lerp(
        this.currentSpeed, 0,
        1 - Math.exp(-this.config.deceleration * dt)
      );

      // Decelerate banking and pitch smoothly
      this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, 0, 1 - Math.exp(-6 * dt));
      this.currentPitch = THREE.MathUtils.lerp(this.currentPitch, 0, 1 - Math.exp(-6 * dt));
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.currentPitch);
      const rollQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.currentRoll);
      quaternion.copy(this.flightYawQuat).multiply(pitchQuat).multiply(rollQuat);

      this.updateLocomotionAnimation(actions);
      this.prevY = position.y;
      return;
    }

    // ── 3. Active locomotion travel ──
    if (distance > this.config.landingDistance) {
      this.tmpDir.normalize();

      // Smooth step distance-based deceleration ramp
      const t = THREE.MathUtils.clamp(
        (distance - this.config.landingDistance) /
        (this.config.flightDistanceThreshold - this.config.landingDistance),
        0,
        1
      );
      const eased = t * t * (3 - 2 * t);
      const targetSpeed = THREE.MathUtils.lerp(0, this.config.flySpeed, eased);

      const rate = targetSpeed > this.currentSpeed
        ? this.config.acceleration
        : this.config.deceleration;
      this.currentSpeed = THREE.MathUtils.lerp(
        this.currentSpeed, targetSpeed, accelFactor(rate)
      );
      this.currentSpeed = Math.min(this.currentSpeed, this.config.flySpeed);

      // Slerp heading with speed-dependent turning speed
      const desiredRotation = Math.atan2(this.tmpDir.x, this.tmpDir.z);
      this.tmpQuat.setFromAxisAngle(this.upAxis, desiredRotation);

      const speedRatio = this.currentSpeed / this.config.flySpeed;
      const turnSpeedScale = 1.0 - 0.65 * speedRatio; // rotate quickly at low speed, slower at high speed
      const turnRate = this.config.turnSpeed * turnSpeedScale;
      this.flightYawQuat.slerp(this.tmpQuat, accelFactor(turnRate));

      // Move along forward steering vector instead of raw cursor direction
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.flightYawQuat).normalize();

      const remainingTravel = Math.max(distance - this.config.landingDistance, 0);
      const move = Math.min(this.currentSpeed * dt, remainingTravel);
      position.x += forward.x * move;
      position.z += forward.z * move;

      // Banking (Roll) based on yaw turn angle difference (dot product of right vector and desired target direction)
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.flightYawQuat).normalize();
      const desiredDir = this.tmpDir.clone().normalize();
      const rightDot = right.dot(desiredDir);
      const targetRoll = -rightDot * (Math.PI / 6) * speedRatio;
      this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, targetRoll, 1 - Math.exp(-6 * dt));

      // Pitch (Climb/descent pitch)
      if (this.prevY === 0) {
        this.prevY = position.y;
      }
      const verticalDiff = position.y - this.prevY;
      const targetPitch = THREE.MathUtils.clamp(verticalDiff * 5.0, -Math.PI / 8, Math.PI / 8);
      this.currentPitch = THREE.MathUtils.lerp(this.currentPitch, targetPitch, 1 - Math.exp(-6 * dt));

      // Combine orientations
      const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.currentPitch);
      const rollQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.currentRoll);
      quaternion.copy(this.flightYawQuat).multiply(pitchQuat).multiply(rollQuat);
    } else {
      // Natural arrival, no snapping
      this.hasArrived = true;
      this.currentSpeed = 0;
    }

    this.bobTimer += dt;
    const bob = Math.sin(this.bobTimer * 3) * 0.08;
    const targetY = this.config.flightHeight + bob;
    position.y = THREE.MathUtils.lerp(
      position.y, targetY,
      1 - Math.exp(-this.config.climbSpeed * dt)
    );

    // Diagnostics
    const desiredSpeed = this.hasArrived ? 0 : (distance > this.config.flightDistanceThreshold ? this.config.flySpeed : this.config.flySpeed * 0.5);

    if (this.hasArrived !== this.lastArrivedDiag) {
      console.log(
        `========== ARRIVAL STATE ==========\n` +
        `Previous:\n${this.lastArrivedDiag}\n` +
        `Current:\n${this.hasArrived}\n\n` +
        `Distance:\n${distance.toFixed(4)}\n` +
        `Landing Distance:\n${this.config.landingDistance.toFixed(4)}\n\n` +
        `Current Speed:\n${this.currentSpeed.toFixed(4)}\n` +
        `Desired Speed:\n${desiredSpeed.toFixed(4)}\n` +
        `==================================\n`
      );
      this.lastArrivedDiag = this.hasArrived;
    }

    if (Math.abs(desiredSpeed - this.lastDesiredSpeedDiag) > 0.2) {
      const reason = this.hasArrived ? 'Arrived at landing distance'
        : (distance > this.config.flightDistanceThreshold) ? 'Distance above flight distance threshold'
        : 'Distance below flight distance threshold';
      console.log(
        `========== SPEED TARGET ==========\n` +
        `Previous Desired Speed:\n${this.lastDesiredSpeedDiag.toFixed(4)}\n` +
        `Current Desired Speed:\n${desiredSpeed.toFixed(4)}\n\n` +
        `Distance:\n${distance.toFixed(4)}\n\n` +
        `Reason:\n${reason}\n` +
        `==================================\n`
      );
      this.lastDesiredSpeedDiag = desiredSpeed;
    }

    if (this.lastTargetDiag.lengthSq() === 0) {
      this.lastTargetDiag.copy(this.targetPosition);
    } else if (this.targetPosition.distanceTo(this.lastTargetDiag) > 0.001) {
      console.log(
        `========== TARGET UPDATE ==========\n` +
        `Previous Target:\n[${this.lastTargetDiag.x.toFixed(4)}, ${this.lastTargetDiag.y.toFixed(4)}, ${this.lastTargetDiag.z.toFixed(4)}]\n` +
        `Current Target:\n[${this.targetPosition.x.toFixed(4)}, ${this.targetPosition.y.toFixed(4)}, ${this.targetPosition.z.toFixed(4)}]\n\n` +
        `Distance Between Targets:\n${this.targetPosition.distanceTo(this.lastTargetDiag).toFixed(4)}\n\n` +
        `Current Position:\n[${position.x.toFixed(4)}, ${position.y.toFixed(4)}, ${position.z.toFixed(4)}]\n` +
        `==================================\n`
      );
      this.lastTargetDiag.copy(this.targetPosition);
    }

    this.updateLocomotionAnimation(actions);
    this.prevY = position.y;
  }

  private updateLocomotionAnimation(
    actions: Record<string, THREE.AnimationAction>,
  ): void {
    if (this.callbacks?.getInteractionActive?.()) return;

    // Suspend locomotion state evaluation during the Takeoff → Hover crossfade,
    // unless this is the very first frame where locomotion state hasn't been set yet.
    const groundTakeoff = getFlightTransitionAnimations().takeoff;
    const flightTakeoff = getFlightAnimations().takeoff;
    const takeoffAction = (groundTakeoff && actions[groundTakeoff]) || (flightTakeoff && actions[flightTakeoff]);
    if (this.lastFlightAnim !== null && takeoffAction && takeoffAction.isRunning() && takeoffAction.getEffectiveWeight() > 0) {
      return;
    }

    const speed = this.currentSpeed;
    const flySpeed = this.config.flySpeed;
    let desired: FlightLocoState = this.flightLocoState;

    // Apply percentage-based thresholds with hysteresis
    const hoverLimit = flySpeed * 0.05;      // 5%
    const hoverExitLimit = flySpeed * 0.08;  // 8%
    const runLimit = flySpeed * 0.65;        // 65%
    const runExitLimit = flySpeed * 0.55;    // 55%

    if (this.flightLocoState === 'hover') {
      if (speed >= hoverExitLimit) {
        desired = 'slow';
      }
    } else if (this.flightLocoState === 'slow') {
      if (speed < hoverLimit) {
        desired = 'hover';
      } else if (speed >= runLimit) {
        desired = 'fast';
      }
    } else if (this.flightLocoState === 'fast') {
      if (speed < runExitLimit) {
        desired = 'slow';
      }
    }

    // Force default state initialization if lastFlightAnim is null (first frame after takeoff)
    if (this.lastFlightAnim === null) {
      desired = 'hover';
    }

    if (desired !== this.flightLocoState) {
      const isOscillationTransition =
        (this.flightLocoState === 'hover' && desired === 'slow') ||
        (this.flightLocoState === 'slow' && desired === 'hover');

      if (isOscillationTransition) {
        const now = performance.now();
        const elapsed = now - this.lastDiagTime;
        
        if (this.lastDiagTime > 0 && elapsed < 500) {
          this.oscillationCounter++;
        }
        
        const prev = this.flightLocoState;
        const next = desired;
        this.lastDiagTime = now;

        const distance = this.tmpDir.length();
        const desiredSpeed = this.hasArrived ? 0 : (distance > this.config.flightDistanceThreshold ? this.config.flySpeed : this.config.flySpeed * 0.5);

        console.log(
          `========== LOCOMOTION OSCILLATION ==========\n` +
          `Time:\n${Date.now()}\n\n` +
          `Transition:\n${prev.toUpperCase()} → ${next.toUpperCase()}\n\n` +
          `Previous State:\n${prev}\n\n` +
          `Next State:\n${next}\n\n` +
          `Current Speed:\n${speed.toFixed(4)}\n\n` +
          `Desired Speed:\n${desiredSpeed.toFixed(4)}\n\n` +
          `Distance:\n${distance.toFixed(4)}\n\n` +
          `Landing Distance:\n${this.config.landingDistance.toFixed(4)}\n\n` +
          `Flight Distance Threshold:\n${this.config.flightDistanceThreshold.toFixed(4)}\n\n` +
          `hasArrived:\n${this.hasArrived}\n\n` +
          `Current Position:\n[${this.currentPositionDiag.x.toFixed(4)}, ${this.currentPositionDiag.y.toFixed(4)}, ${this.currentPositionDiag.z.toFixed(4)}]\n\n` +
          `Desired Target:\n[${this.targetPosition.x.toFixed(4)}, ${this.targetPosition.y.toFixed(4)}, ${this.targetPosition.z.toFixed(4)}]\n\n` +
          `Oscillation Count:\n${this.oscillationCounter}\n` +
          `===========================================\n`
        );
      }
    }

    const animName =
      desired === 'hover' ? (this.flightAnimNames.idleLoop ?? this.flyHoverAnim)
      : desired === 'slow' ? this.flightAnimNames.walk
      : this.flightAnimNames.run;

    if (!animName) return;
    const newAction = actions[animName];
    if (!newAction) return;

    if (newAction && !this.inspectedClipsDiag.has(animName)) {
      this.inspectedClipsDiag.add(animName);
      const clip = newAction.getClip();
      const candidateNodes = ['origin', 'origin_109_17_12', 'Root', 'Hips'];
      let foundBone = 'None';
      let hasTrans = 'NO';
      let hasRot = 'NO';
      
      for (const node of candidateNodes) {
        const transTrack = clip.tracks.some(t => t.name.toLowerCase().includes(node.toLowerCase()) && t.name.endsWith('.position'));
        const rotTrack = clip.tracks.some(t => t.name.toLowerCase().includes(node.toLowerCase()) && (t.name.endsWith('.quaternion') || t.name.endsWith('.rotation')));
        if (transTrack || rotTrack) {
          foundBone = node;
          hasTrans = transTrack ? 'YES' : 'NO';
          hasRot = rotTrack ? 'YES' : 'NO';
          break;
        }
      }

      console.log(
        `Animation: ${animName}\n` +
        `Root Bone: ${foundBone}\n` +
        `Contains Translation: ${hasTrans}\n` +
        `Contains Rotation: ${hasRot}\n`
      );
    }

    // Never request the same locomotion animation twice. If desired state is active, return.
    if (desired === this.flightLocoState && this.lastFlightAnim !== null) {
      return;
    }

    if (this.lastFlightAnim === null || desired !== this.flightLocoState) {
      console.log(
        `[Locomotion Request] Timestamp: ${Date.now()} | Previous State: ${this.flightLocoState} | Desired State: ${desired} | Requested Clip: ${animName} | Speed: ${speed.toFixed(2)} | Gated Value: true | Flight Active State: true`
      );
    }

    if (this.callbacks?.getCurrentAnimationName?.() === animName) {
      this.flightLocoState = desired;
      this.lastFlightAnim = animName;
      return;
    }

    newAction.setLoop(THREE.LoopRepeat, Infinity);
    newAction.clampWhenFinished = false;

    if (this.callbacks) {
      console.log(
        `[FlightLocomotion]\n\n` +
        `Request:\n${animName}\n\n` +
        `Gate:\nfalse\n\n` +
        `Expected:\nViewer ACCEPTED`
      );
      this.callbacks.playAnimation(animName, 'FlightFSM', 'Flight Locomotion', `Flight speed state: ${desired}`, false, false, FADE_LOCO);
    }

    this.flightLocoState = desired;
    this.lastFlightAnim = animName;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// FLIGHT CONTROLLER — Phase Manager (transitions, animations, mixer events)
// ═════════════════════════════════════════════════════════════════════════════

export class FlightController {
  private phase: FlightPhase = FlightPhase.Inactive;
  private config: FlightConfig;
  private callbacks: FlightCallbacks | null = null;
  private shutdownPending = false;
  private shutdownComplete = false;

  private flightMode: FlightMode = FlightMode.AutoGround;
  private triggerSource: FlightTriggerSource | 'None' = 'None';
  private flightSystemEnabled = false;

  // Animation names
  private flightAnimNames: FlightMovementAnimations = getFlightMovementAnimations();
  private takeoffAnim: string | null = null;
  private landingBeginAnim: string | null = null;
  private landingLoopAnim: string | null = null;
  private landingFinishAnim: string | null = null;
  private flyHoverAnim: string | null = null;
  private flightModeNotified = false;

  // Ground locomotion state
  private groundSpeed = 0;
  private targetQuaternion = new THREE.Quaternion();
  private wasFlightActive = false;

  // Transition animation state
  private transitionStarted = false;
  private transitionFallbackId: number | null = null;

  // Mixer 'finished' listener
  private finishedListener: ((e: THREE.Event) => void) | null = null;
  private mixer: THREE.AnimationMixer | null = null;

  // Phase state
  private phaseTimer = 0;
  private preLaunchTimer = 0;
  private readonly preLaunchDuration = 0.5;
  private launchDirection = new THREE.Vector3();
  private startY = 0;
  private descentStartY = 0;
  private prevY = 0;

  // Locomotion system — completely independent movement module
  private locomotion: FlightLocomotion;

  // Temporaries (used only by Phase Manager for takeoff/prelaunch rotation)
  private readonly tmpQuat = new THREE.Quaternion();
  private readonly upAxis  = new THREE.Vector3(0, 1, 0);

  // Debug
  private lastLoggedPhase: FlightPhase = FlightPhase.Inactive;

  // ── Constructor ─────────────────────────────────────────────────────────

  constructor(config: FlightConfig = DefaultFlightConfig) {
    this.config = config;
    this.locomotion = new FlightLocomotion(config, this.flightAnimNames);
  }

  // ── Configuration ────────────────────────────────────────────────────────

  setConfig(config: Partial<FlightConfig>): void {
    this.config = { ...this.config, ...config };
    this.locomotion.setConfig(config);
  }

  setCallbacks(callbacks: FlightCallbacks): void {
    this.callbacks = callbacks;
    this.locomotion.setCallbacks(callbacks);
  }

  setAnimations(
    _takeoff: string | null,
    _fly: string | null,
    landingBegin: string | null,
    landingLoop: string | null,
    landingFinish: string | null
  ): void {
    this.takeoffAnim      = _takeoff;
    this.landingBeginAnim = landingBegin;
    this.landingLoopAnim  = landingLoop;
    this.landingFinishAnim= landingFinish;
    console.log('[FlightController] Transition animations set:', {
      takeoff: _takeoff ?? '(none)',
      landingBegin: landingBegin ?? '(none)',
      landingLoop: landingLoop ?? '(none)',
      landingFinish: landingFinish ?? '(none)',
    });
  }

  setFlyHoverAnimation(name: string | null): void {
    this.flyHoverAnim = name;
    this.locomotion.setFlyHoverAnimation(name);
  }

  // ── Status queries ───────────────────────────────────────────────────────

  isActive(): boolean { return this.phase !== FlightPhase.Inactive; }
  isFlightSystemEnabled(): boolean { return this.flightSystemEnabled; }
  getPhase(): FlightPhase { return this.phase; }
  isFlying(): boolean { return this.phase === FlightPhase.Flying; }
  getFlightMode(): FlightMode { return this.flightMode; }
  getTriggerSource(): FlightTriggerSource | 'None' { return this.triggerSource; }

  getMode(): string {
    switch (this.phase) {
      case FlightPhase.PreLaunch:    return 'PreLaunch';
      case FlightPhase.Takeoff:      return 'Takeoff';
      case FlightPhase.Flying: {
        const state = this.locomotion.getLocoState();
        return state.charAt(0).toUpperCase() + state.slice(1);
      }
      case FlightPhase.LandingBegin: return 'LandingBegin';
      case FlightPhase.LandingLoop:  return 'LandingLoop';
      case FlightPhase.LandingFinish:return 'LandingFinish';
      default: return 'Grounded';
    }
  }

  getCurrentFlightAnimation(): string {
    switch (this.phase) {
      case FlightPhase.PreLaunch:     return 'PreLaunch';
      case FlightPhase.Takeoff:       return this.takeoffAnim ?? 'None';
      case FlightPhase.Flying:        return this.locomotion.getLastFlightAnim() ?? (this.flyHoverAnim ?? 'None');
      case FlightPhase.LandingBegin:  return this.landingBeginAnim ?? 'None';
      case FlightPhase.LandingLoop:   return this.landingLoopAnim ?? 'None';
      case FlightPhase.LandingFinish: return this.landingFinishAnim ?? 'None';
      default: return 'None';
    }
  }

  shouldFly(distance: number): boolean {
    return distance > this.config.flightDistanceThreshold;
  }

  isMovementFrozenPhase(): boolean {
    return this.phase === FlightPhase.LandingBegin
      || this.phase === FlightPhase.LandingLoop
      || this.phase === FlightPhase.LandingFinish
      || this.phase === FlightPhase.Takeoff
      || this.phase === FlightPhase.PreLaunch;
  }

  getLocomotionArrived(): boolean {
    return this.locomotion.getHasArrived();
  }

  // ── Interaction support ─────────────────────────────────────────────────

  notifyInteractionComplete(): void {
    if (this.phase !== FlightPhase.Flying) return;
    this.locomotion.notifyInteractionComplete();
  }

  /**
   * Returns a function that fades out all flight locomotion animations.
   * Intended to be passed to OneShotAnimationController so it can fade out
   * hover/slow/fast before playing an interaction clip.
   */
  getFadeOutLocomotionFn(actions: Record<string, THREE.AnimationAction>): () => void {
    return () => {
      const names = [
        this.flightAnimNames.idleLoop,
        this.flightAnimNames.idleVariation1,
        this.flightAnimNames.idleVariation2,
        this.flightAnimNames.walk,
        this.flightAnimNames.run,
        this.flightAnimNames.turnLeft,
        this.flightAnimNames.turnRight,
        this.flyHoverAnim,
      ];
      for (const name of names) {
        if (!name) continue;
        const action = actions[name];
        if (action && (action.isRunning() || action.getEffectiveWeight() > 0)) {
          action.fadeOut(FADE_INTERACTION_IN);
        }
      }
    };
  }

  getAnimationOwner(): AnimationOwner {
    return this.locomotion.getAnimationOwner();
  }

  setMovementFrozen(frozen: boolean): void {
    this.locomotion.setMovementFrozen(frozen);
  }

  getFlightRestoreAnimation(): string | null {
    return this.locomotion.getFlightRestoreAnimation();
  }

  resetLocomotionSpeed(): void {
    this.groundSpeed = 0;
    this.locomotion.reset();
  }

  // ── Flight start / landing requests ──────────────────────────────────────

  start(targetPosition: THREE.Vector3, currentPosition: THREE.Vector3, source: FlightTriggerSource = 'Button'): boolean {
    if (this.phase !== FlightPhase.Inactive) return false;
    if (!this.takeoffAnim) {
      console.warn('[FlightController] Cannot start — missing takeoff animation');
      return false;
    }

    this.triggerSource = source;
    this.flightMode = source === 'Button' ? FlightMode.ManualFlight : FlightMode.AutoFlight;

    this.launchDirection.subVectors(targetPosition, currentPosition);
    this.launchDirection.y = 0;
    if (this.launchDirection.length() < 0.01) this.launchDirection.set(0, 0, 1);
    this.launchDirection.normalize();

    this.startY = currentPosition.y;
    this.prevY = currentPosition.y;
    this.preLaunchTimer = 0;
    this.phaseTimer = 0;
    this.transitionStarted = false;
    this.flightModeNotified = false;
    this.lastLoggedPhase = FlightPhase.Inactive;
    this.locomotion.reset();
    this.locomotion.setInitialTarget(targetPosition);

    if (this.callbacks) this.callbacks.onFlightStart();

    this.phase = FlightPhase.PreLaunch;
    console.log(`[FlightController] Flight started — source=${source}`);
    return true;
  }

  requestTakeoff(targetPosition: THREE.Vector3, currentPosition: THREE.Vector3, source: FlightTriggerSource = 'Button'): boolean {
    if (source === 'Button') {
      this.flightSystemEnabled = true;
    } else if (source === 'Cursor') {
      if (!this.flightSystemEnabled) {
        return false;
      }
    }
    return this.start(targetPosition, currentPosition, source);
  }

  requestLanding(source: FlightTriggerSource = 'Button'): boolean {
    if (this.phase !== FlightPhase.Flying) return false;
    this.triggerSource = source;
    this.flightMode = source === 'Button' ? FlightMode.ManualGround : FlightMode.AutoGround;
    this.shutdownPending = true;
    this.shutdownComplete = false;
    // Immediately disable all steering — no new targets, no cursor following
    this.locomotion.setSteeringEnabled(false);
    this.phase = FlightPhase.LandingBegin;
    this.phaseTimer = 0;
    this.descentStartY = 0;
    this.transitionStarted = false;
    this.locomotion.stopMovement();
    this.locomotion.setMovementFrozen(true);
    this.removeFinishedListener();
    console.log(`[FlightController] Landing requested — source=${source}, steering disabled, shutdown pending`);
    return true;
  }

  /**
   * Public API for Viewer to request ground mode. Initiates the landing
   * sequence. Viewer must wait for onFlightShutdownComplete before enabling
   * GroundController.
   */
  requestGroundMode(): boolean {
    this.flightSystemEnabled = false;
    return this.requestLanding('Button');
  }

  isShutdownPending(): boolean { return this.shutdownPending; }
  isShutdownComplete(): boolean { return this.shutdownComplete; }

  /**
   * Advance from LandingBegin to LandingLoop. Clears fallback timer and
   * resets transition state. Extracted to a method so fallback + finished
   * listener share the same code path.
   */
  private advanceToLandingLoop(): void {
    if (this.transitionFallbackId !== null) {
      clearTimeout(this.transitionFallbackId);
      this.transitionFallbackId = null;
    }
    this.removeFinishedListener();
    this.phase = FlightPhase.LandingLoop;
    this.phaseTimer = 0;
    this.transitionStarted = false;
  }

  // ── Main update ──────────────────────────────────────────────────────────

  update(
    delta: number,
    targetPosition: THREE.Vector3,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion,
    mixer: THREE.AnimationMixer | null,
    actions: Record<string, THREE.AnimationAction>,
    facingQuaternion?: THREE.Quaternion | null
  ): boolean {
    const dt = Math.min(delta, 0.05);

    if (this.phase === FlightPhase.Inactive) {
      if (this.wasFlightActive) {
        this.groundSpeed = 0;
        this.wasFlightActive = false;
      }
      this.updateGroundLocomotion(dt, targetPosition, position, quaternion);
      return true;
    }

    this.wasFlightActive = true;
    this.mixer = mixer;
    this.logStateEnter();
    this.prevY = position.y;

    // ── 1. Update Flight Phase (may change phase, play transition animations) ──
    this.updatePhase(dt, position, quaternion, mixer, actions);

    // ── 2. Decide whether locomotion is allowed ───────────────────────────────
    const canMove = this.phase === FlightPhase.Flying && !this.locomotion.isMovementFrozen();

    // ── 3. If Flying, update locomotion (steering, velocity, move, rotate, hover) ─
    if (this.phase === FlightPhase.Flying) {
      this.locomotion.update(dt, canMove, targetPosition, position, quaternion, actions, facingQuaternion);
      
      const lastDistance = this.locomotion.getLastDistance();
      const hasArrived = this.locomotion.getHasArrived();
      if (lastDistance <= this.config.landingDistance || hasArrived) {
        console.log(`[FlightController] Controller Position: [${position.x.toFixed(4)}, ${position.y.toFixed(4)}, ${position.z.toFixed(4)}]`);
      }
    }

    return true;
  }

  private updateGroundLocomotion(
    dt: number,
    targetPosition: THREE.Vector3,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion
  ): void {
    const direction = new THREE.Vector3().subVectors(targetPosition, position);
    direction.y = 0;
    const distance = direction.length();

    const interactionFrozen = this.callbacks?.getInteractionActive() ?? false;
    const sleepFrozen = this.callbacks?.isSleepOwningMovement?.() ?? false;
    const movementFrozen = interactionFrozen || sleepFrozen;

    const context = {
      currentSpeed: movementFrozen ? 0 : this.groundSpeed,
      targetSpeed: 0,
      distanceToTarget: movementFrozen ? 0 : distance,
      rotationComplete: movementFrozen,
      animationComplete: false,
    };

    const accelFactor = (rate: number) => 1 - Math.exp(-rate * dt);

    if (!movementFrozen && distance > MovementConfig.stoppingDistance) {
      direction.normalize();
      context.targetSpeed = distance > MovementConfig.runDistanceThreshold
        ? MovementConfig.runSpeed
        : MovementConfig.walkSpeed;

      const rate = context.targetSpeed > this.groundSpeed
        ? MovementConfig.acceleration
        : MovementConfig.deceleration;

      this.groundSpeed = THREE.MathUtils.lerp(
        this.groundSpeed,
        context.targetSpeed,
        accelFactor(rate)
      );
      this.groundSpeed = Math.min(this.groundSpeed, MovementConfig.runSpeed);

      const targetRotation = Math.atan2(direction.x, direction.z);
      const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
      const currentRotation = euler.y;
      const rotDiff = THREE.MathUtils.euclideanModulo(
        targetRotation - currentRotation + Math.PI,
        Math.PI * 2
      ) - Math.PI;
      const rotationThreshold = 0.3;

      context.rotationComplete = Math.abs(rotDiff) < rotationThreshold;

      if (this.groundSpeed > 0.05) {
        this.targetQuaternion.setFromAxisAngle(this.upAxis, targetRotation);
        quaternion.slerp(this.targetQuaternion, accelFactor(MovementConfig.turnSpeed));
      }

      const maxMoveThisFrame = Math.max(0, distance - MovementConfig.stoppingDistance);
      const moveDistance = Math.min(this.groundSpeed * dt, maxMoveThisFrame);
      position.x += direction.x * moveDistance;
      position.z += direction.z * moveDistance;
      position.y = 0;
    } else if (!movementFrozen) {
      this.groundSpeed = THREE.MathUtils.lerp(
        this.groundSpeed,
        0,
        accelFactor(MovementConfig.deceleration)
      );
      if (this.groundSpeed < 0.05) {
        this.groundSpeed = 0;
      }
      context.rotationComplete = true;
    }

    if (this.callbacks?.updateFSM) {
      this.callbacks.updateFSM(context);
    }
  }

  // ── Phase update dispatcher ──────────────────────────────────────────────

  private updatePhase(
    dt: number,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion,
    mixer: THREE.AnimationMixer | null,
    actions: Record<string, THREE.AnimationAction>
  ): void {
    // Suppress ground actions during any active flight phase
    this.suppressGroundActions(actions);

    switch (this.phase) {
      case FlightPhase.PreLaunch:     this.updatePreLaunch(dt, position, quaternion); break;
      case FlightPhase.Takeoff:       this.updateTakeoff(dt, position, quaternion, mixer, actions); break;
      case FlightPhase.Flying:        break; // Locomotion handles all Flying movement
      case FlightPhase.LandingBegin:  this.updateLandingBegin(dt, position, mixer, actions); break;
      case FlightPhase.LandingLoop:   this.updateLandingLoop(dt, position, mixer, actions); break;
      case FlightPhase.LandingFinish: this.updateLandingFinish(dt, position, mixer, actions); break;
      default: break;
    }
  }

  // ── PreLaunch: brief rotation toward launch direction ────────────────────

  private updatePreLaunch(dt: number, position: THREE.Vector3, quaternion: THREE.Quaternion): void {
    this.preLaunchTimer += dt;
    const targetRotation = Math.atan2(this.launchDirection.x, this.launchDirection.z);
    this.tmpQuat.setFromAxisAngle(this.upAxis, targetRotation);
    quaternion.slerp(this.tmpQuat, 1 - Math.exp(-this.config.turnSpeed * 1.5 * dt));
    position.y = this.startY;

    if (this.preLaunchTimer >= this.preLaunchDuration) {
      this.phase = FlightPhase.Takeoff;
      this.phaseTimer = 0;
      this.startY = position.y;
      this.transitionStarted = false;
    }
  }

  // ── Takeoff: play takeoff clip once, climb to flight height ───────────────
  // Completes on mixer 'finished' event (not timer-based).

  private updateTakeoff(
    dt: number,
    position: THREE.Vector3,
    quaternion: THREE.Quaternion,
    mixer: THREE.AnimationMixer | null,
    actions: Record<string, THREE.AnimationAction>
  ): void {
    if (!this.transitionStarted && this.takeoffAnim && actions[this.takeoffAnim]) {
      const action = actions[this.takeoffAnim];
      
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.setEffectiveTimeScale(1);

      if (this.callbacks) {
        this.callbacks.playAnimation(this.takeoffAnim, 'TakeoffController', 'Flight Transition', 'Takeoff start', false, false, FADE_TRANSITION);
      }
      this.transitionStarted = true;
      console.log(`[Owner] Flight → takeoff (weight=1, LoopOnce)`);

      this.setupFinishedListener(mixer, action, () => {
        const takeoffAction = action;
        const hoverAnimName = this.flightAnimNames.idleLoop ?? this.flyHoverAnim;
        const hoverAction = hoverAnimName ? actions[hoverAnimName] : null;

        // 1. Takeoff Finished
        console.log(`[FlightController] Takeoff Finished | Clip: ${takeoffAction.getClip().name} | Weight: ${takeoffAction.getEffectiveWeight()}`);

        // 2. Hover Requested
        if (hoverAction) {
          console.log(`[FlightController] Hover Requested | Clip: ${hoverAction.getClip().name} | Weight: ${hoverAction.getEffectiveWeight()}`);
        }

        // Release TakeoffController owner so FlightFSM can take over
        this.callbacks?.releaseAnimationOwner?.('TakeoffController');

        // Request Hover through existing playAnimation callback with gated=false and FADE_TRANSITION duration
        if (this.callbacks && hoverAnimName) {
          this.callbacks.playAnimation(hoverAnimName, 'FlightFSM', 'Flight Locomotion', 'Takeoff complete', false, false, FADE_TRANSITION);
        }

        // 3. Hover Started (log when hover starts, e.g. after a tiny timeout of 50ms)
        setTimeout(() => {
          if (hoverAction) {
            console.log(`[FlightController] Hover Started | Clip: ${hoverAction.getClip().name} | Weight: ${hoverAction.getEffectiveWeight().toFixed(3)}`);
          }
        }, 50);

        // 4. Takeoff Released (log and release Takeoff action after crossfade completes)
        setTimeout(() => {
          console.log(`[FlightController] Takeoff Released | Clip: ${takeoffAction.getClip().name} | Weight: ${takeoffAction.getEffectiveWeight().toFixed(3)}`);
          takeoffAction.stop();
        }, FADE_TRANSITION * 1000);

        this.advanceToFlying(actions);
      });
    }

    // Climb with eased progress
    this.phaseTimer += dt;
    const clipDuration = (this.takeoffAnim && actions[this.takeoffAnim])
      ? actions[this.takeoffAnim].getClip().duration : 2;
    const progress = Math.min(this.phaseTimer / Math.max(clipDuration, 1.2), 1);
    const eased = easeInOut(progress);
    position.y = this.startY + (this.config.flightHeight - this.startY) * eased;

    // Continue rotating toward launch direction
    const targetRotation = Math.atan2(this.launchDirection.x, this.launchDirection.z);
    this.tmpQuat.setFromAxisAngle(this.upAxis, targetRotation);
    quaternion.slerp(this.tmpQuat, 1 - Math.exp(-this.config.turnSpeed * dt));
  }

  private advanceToFlying(actions: Record<string, THREE.AnimationAction>): void {
    this.phase = FlightPhase.Flying;
    this.phaseTimer = 0;
    this.transitionStarted = false;
    this.shutdownPending = false;
    this.shutdownComplete = false;
    this.locomotion.reset();
    this.locomotion.setSteeringEnabled(true);
    this.suppressGroundActions(actions);

    if (!this.flightModeNotified && this.callbacks?.onEnterFlightMode) {
      this.flightModeNotified = true;
      this.callbacks.onEnterFlightMode();
    }
  }

  // ── LandingBegin: play clip once, descend partially ──────────────────────
  // Completes on mixer 'finished' event.

  private updateLandingBegin(
    dt: number,
    position: THREE.Vector3,
    mixer: THREE.AnimationMixer | null,
    actions: Record<string, THREE.AnimationAction>
  ): void {
    if (this.phaseTimer === 0) this.descentStartY = position.y;

    if (!this.transitionStarted && this.landingBeginAnim && actions[this.landingBeginAnim]) {
      const action = actions[this.landingBeginAnim];
      
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.setEffectiveTimeScale(1);

      if (this.callbacks) {
        this.callbacks.playAnimation(this.landingBeginAnim, 'LandingController', 'Flight Transition', 'Landing begin start', false, false, FADE_TRANSITION);
      }
      this.transitionStarted = true;
      console.log(`[Owner] Flight → landing-begin (weight=1, LoopOnce)`);

      this.setupFinishedListener(mixer, action, () => {
        this.advanceToLandingLoop();
      });

      // ── Fallback: if 'finished' never fires, advance after clip duration + 0.5s
      const clipDur = action.getClip().duration;
      this.transitionFallbackId = window.setTimeout(() => {
        if (this.phase === FlightPhase.LandingBegin) {
          console.warn('[FlightController] LandingBegin fallback — advancing to LandingLoop');
          this.advanceToLandingLoop();
        }
      }, (clipDur + 0.5) * 1000);
    } else if (!this.transitionStarted && !this.landingBeginAnim) {
      this.advanceToLandingLoop();
      return;
    }

    this.phaseTimer += dt;
    const descentTarget = this.descentStartY * 0.7;
    position.y = THREE.MathUtils.lerp(position.y, descentTarget, 1 - Math.exp(-this.config.climbSpeed * 0.8 * dt));
  }

  // ── LandingLoop: play loop clip, continue descending ─────────────────────

  private updateLandingLoop(
    dt: number,
    position: THREE.Vector3,
    _mixer: THREE.AnimationMixer | null,
    actions: Record<string, THREE.AnimationAction>
  ): void {
    const loopDuration = (this.landingLoopAnim && actions[this.landingLoopAnim])
      ? actions[this.landingLoopAnim].getClip().duration : 0.5;

    if (!this.transitionStarted && this.landingLoopAnim && actions[this.landingLoopAnim]) {
      const action = actions[this.landingLoopAnim];
      
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.setEffectiveTimeScale(1);

      if (this.callbacks) {
        this.callbacks.playAnimation(this.landingLoopAnim, 'LandingController', 'Flight Transition', 'Landing loop start', false, false, FADE_TRANSITION);
      }
      this.transitionStarted = true;
      console.log(`[Owner] Flight → landing-loop (weight=1, LoopRepeat)`);
    } else if (!this.transitionStarted && !this.landingLoopAnim) {
      this.phase = FlightPhase.LandingFinish;
      this.phaseTimer = 0;
      this.transitionStarted = false;
      return;
    }

    this.phaseTimer += dt;
    const descentTarget = this.descentStartY * 0.3;
    position.y = THREE.MathUtils.lerp(position.y, descentTarget, 1 - Math.exp(-this.config.climbSpeed * dt));

    if (this.phaseTimer >= loopDuration) {
      this.removeFinishedListener();
      if (this.transitionFallbackId !== null) {
        clearTimeout(this.transitionFallbackId);
        this.transitionFallbackId = null;
      }
      this.phase = FlightPhase.LandingFinish;
      this.phaseTimer = 0;
      this.transitionStarted = false;
    }
  }

  // ── LandingFinish: play clip once, descend to ground ──────────────────────
  // Completes on mixer 'finished' event.

  private updateLandingFinish(
    dt: number,
    position: THREE.Vector3,
    mixer: THREE.AnimationMixer | null,
    actions: Record<string, THREE.AnimationAction>
  ): void {
    if (!this.transitionStarted && this.landingFinishAnim && actions[this.landingFinishAnim]) {
      const action = actions[this.landingFinishAnim];
      
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.setEffectiveTimeScale(1);

      if (this.callbacks) {
        this.callbacks.playAnimation(this.landingFinishAnim, 'LandingController', 'Flight Transition', 'Landing finish start', false, false, FADE_TRANSITION);
      }
      this.transitionStarted = true;
      console.log(`[Owner] Flight → landing-finish (weight=1, LoopOnce)`);

      this.setupFinishedListener(mixer, action, () => {
        if (this.transitionFallbackId !== null) {
          clearTimeout(this.transitionFallbackId);
          this.transitionFallbackId = null;
        }
        this.complete(position, actions);
      });

      // ── Fallback: if 'finished' never fires, complete after clip duration + 1s
      const clipDur = action.getClip().duration;
      this.transitionFallbackId = window.setTimeout(() => {
        if (this.phase === FlightPhase.LandingFinish) {
          console.warn('[FlightController] LandingFinish fallback — completing shutdown');
          this.complete(position, actions);
        }
      }, (clipDur + 1.0) * 1000);
    } else if (!this.transitionStarted && !this.landingFinishAnim) {
      this.complete(position, actions);
      return;
    }

    this.phaseTimer += dt;
    const groundProximity = Math.max(position.y / this.config.flightHeight, 0.1);
    const descentRate = this.config.climbSpeed * groundProximity;
    position.y = THREE.MathUtils.lerp(position.y, 0, 1 - Math.exp(-Math.max(descentRate, 0.5) * dt));

    const clipDuration = (this.landingFinishAnim && actions[this.landingFinishAnim])
      ? actions[this.landingFinishAnim].getClip().duration : 1.5;
    if (Math.abs(position.y) < 0.02 && this.phaseTimer >= clipDuration * 0.9) {
      position.y = 0;
      this.complete(position, actions);
    }
  }

  // ── Mixer 'finished' event management ─────────────────────────────────────

  private setupFinishedListener(
    mixer: THREE.AnimationMixer | null,
    expectedAction: THREE.AnimationAction,
    onComplete: () => void
  ): void {
    this.removeFinishedListener();
    if (!mixer) return;

    let fired = false;
    this.finishedListener = (e: THREE.Event) => {
      const finishedAction = (e as unknown as { action: THREE.AnimationAction }).action;
      if (finishedAction !== expectedAction || fired) return;
      fired = true;
      this.removeFinishedListener();
      onComplete();
    };
    mixer.addEventListener('finished', this.finishedListener);
  }

  private removeFinishedListener(): void {
    if (this.finishedListener && this.mixer) {
      this.mixer.removeEventListener('finished', this.finishedListener);
    }
    this.finishedListener = null;
  }

  // ── Suppress ground actions ──────────────────────────────────────────────

  private buildFlightAnimSet(): Set<string> {
    const names = [
      this.takeoffAnim,
      this.landingBeginAnim,
      this.landingLoopAnim,
      this.landingFinishAnim,
      this.flyHoverAnim,
      this.flightAnimNames.idleLoop,
      this.flightAnimNames.idleVariation1,
      this.flightAnimNames.idleVariation2,
      this.flightAnimNames.walk,
      this.flightAnimNames.run,
      this.flightAnimNames.turnLeft,
      this.flightAnimNames.turnRight,
    ].filter((n): n is string => n !== null);
    return new Set(names);
  }

  private suppressGroundActions(actions: Record<string, THREE.AnimationAction>): void {
    // When an interaction owns the mixer, do NOT touch any actions —
    // the interaction clip must play uninterrupted at weight 1.
    if (this.callbacks?.getInteractionActive?.()) return;

    const flightSet = this.buildFlightAnimSet();
    for (const [, action] of Object.entries(actions)) {
      const clipName = action.getClip().name;
      if (flightSet.has(clipName)) continue;
      if (action.isRunning() || action.getEffectiveWeight() > 0) {
        action.fadeOut(0.2);
      }
    }
  }

  // ── Completion ───────────────────────────────────────────────────────────

  private complete(position: THREE.Vector3, _actions: Record<string, THREE.AnimationAction>): void {
    // Part 2 — Landing Animation Snapshot
    const movAnims = getMovementAnimations();
    const candidates = {
      'Takeoff': this.takeoffAnim,
      'Hover': this.flightAnimNames.idleLoop ?? this.flyHoverAnim,
      'Slow Flight': this.flightAnimNames.walk,
      'Fast Flight': this.flightAnimNames.run,
      'Landing Begin': this.landingBeginAnim,
      'Landing Loop': this.landingLoopAnim,
      'Landing Finish': this.landingFinishAnim,
      'Ground Idle': movAnims.idleVariation1, // Ground idle uses defaultidle01!
      'Ground Walk': movAnims.walk,
      'Ground Run': movAnims.run,
    };

    for (const [label, animName] of Object.entries(candidates)) {
      if (!animName) continue;
      const action = _actions[animName];
      if (!action) continue;
      console.log(
        `Animation:\n${animName} (${label})\n\n` +
        `Running:\n${action.isRunning()}\n\n` +
        `Enabled:\n${action.enabled}\n\n` +
        `Paused:\n${action.paused}\n\n` +
        `Effective Weight:\n${action.getEffectiveWeight()}\n\n` +
        `Time:\n${action.time}\n\n` +
        `Loop Mode:\n${action.loop === THREE.LoopRepeat ? 'LoopRepeat' : action.loop === THREE.LoopOnce ? 'LoopOnce' : String(action.loop)}\n` +
        `=================================\n`
      );
    }

    position.y = 0;
    this.removeFinishedListener();
    this.phase = FlightPhase.Inactive;
    this.phaseTimer = 0;
    this.preLaunchTimer = 0;
    this.launchDirection.set(0, 0, 0);
    this.descentStartY = 0;
    this.transitionStarted = false;
    this.flightMode = FlightMode.AutoGround;
    this.triggerSource = 'None';

    // ── Full flight shutdown — reset ALL runtime variables ───────────────────
    this.locomotion.shutdownFlight();
    this.shutdownPending = false;
    this.shutdownComplete = true;

    if (this.flightModeNotified && this.callbacks?.onExitFlightMode) {
      this.flightModeNotified = false;
      this.callbacks.onExitFlightMode();
    }
    if (this.callbacks) this.callbacks.onFlightComplete();
    if (this.callbacks?.onFlightShutdownComplete) {
      this.callbacks.onFlightShutdownComplete();
    }
    console.log(`[Owner] Flight → released (landing complete, shutdown complete)`);

    // Clean up residual flight actions after Ground Idle crossfade completes
    const delayMs = GROUND_IDLE_CROSSFADE * 1000 + 50;
    setTimeout(() => {
      const targetClips = [
        this.flightAnimNames.idleLoop ?? this.flyHoverAnim,
        this.flightAnimNames.walk,
        this.flightAnimNames.run,
        this.takeoffAnim,
        this.landingBeginAnim,
        this.landingLoopAnim,
        this.landingFinishAnim
      ];
      for (const animName of targetClips) {
        if (!animName) continue;
        const action = _actions[animName];
        if (action && (action.isRunning() || action.getEffectiveWeight() > 0)) {
          action.stop();
          action.reset();
          action.setEffectiveWeight(0);
          action.enabled = false;
        }
      }
    }, delayMs);
  }

  cancel(position: THREE.Vector3, actions?: Record<string, THREE.AnimationAction>): void {
    this.complete(position, actions ?? {});
  }

  // ── Debug ───────────────────────────────────────────────────────────────

  private logStateEnter(): void {
    if (this.phase === this.lastLoggedPhase) return;
    this.lastLoggedPhase = this.phase;
    const name = this.getPhaseDisplayName();
    console.log(`%c[FlightController] ENTER ${name}`, 'color: #00ff88; font-weight: bold;');
  }

  private getPhaseDisplayName(): string {
    switch (this.phase) {
      case FlightPhase.Inactive:      return 'GROUNDED';
      case FlightPhase.PreLaunch:    return 'PRELAUNCH';
      case FlightPhase.Takeoff:      return 'TAKEOFF';
      case FlightPhase.Flying:       return 'FLYING';
      case FlightPhase.LandingBegin: return 'LANDING BEGIN';
      case FlightPhase.LandingLoop:  return 'LANDING LOOP';
      case FlightPhase.LandingFinish:return 'LANDING FINISH';
      default: return 'UNKNOWN';
    }
  }

  getDebugInfo(): FlightDebugInfo {
    const canMove = this.phase === FlightPhase.Flying && !this.locomotion.isMovementFrozen();
    const cb = this.callbacks;
    const animOwner = this.phase === FlightPhase.Inactive
      ? 'Ground FSM'
      : this.phase === FlightPhase.Flying
        ? 'FlightLocomotion'
        : 'FlightPhaseManager';
    const target = this.locomotion.getPursuitTarget();

    const actionDetails = cb?.getCurrentActionDetails?.() ?? null;
    const animWeight = actionDetails ? actionDetails.weight : 0;
    const animTime = actionDetails ? actionDetails.time : 0;
    const loopMode = actionDetails ? actionDetails.loopMode : '—';
    const animRunning = actionDetails ? actionDetails.running : false;

    return {
      phase: this.phase,
      mode: this.getMode(),
      currentFlightAnimation: this.getCurrentFlightAnimation(),
      altitude: 0,
      verticalVelocity: 0,
      horizontalSpeed: this.locomotion.getCurrentSpeed(),
      distanceToTarget: 0,
      takeoffTriggered: this.phase === FlightPhase.Takeoff || this.phase === FlightPhase.PreLaunch,
      landingTriggered: this.phase === FlightPhase.LandingBegin || this.phase === FlightPhase.LandingLoop || this.phase === FlightPhase.LandingFinish,
      animOwner,
      animWeight,
      animTime,
      loopMode,
      animRunning,
      groundAnimWeight: cb ? cb.getGroundAnimWeight() : 0,
      flightAnimWeight: animWeight,
      interactionActive: cb ? cb.getInteractionActive() : false,
      currentInteraction: cb ? cb.getCurrentInteraction() : 'None',
      fsmState: cb ? cb.getFSMState() : 'Unknown',
      flightMode: this.flightMode,
      triggerSource: this.triggerSource,
      hoverActive: this.phase === FlightPhase.Flying,
      takeoffComplete: this.phase === FlightPhase.Flying || this.phase.startsWith('Landing'),
      cursorHeight: 0,
      headHeight: 0,
      flightThreshold: this.config.flightDistanceThreshold,
      aboveThreshold: false,
      autoFlightTriggered: false,
      interactionPool: 'Ground',
      poolSize: 0,
      flightFSMState: this.locomotion.getLocoState(),
      locomotionSet: this.phase === FlightPhase.Inactive ? 'Ground' : 'Flight',
      requestedAnimation: this.locomotion.getLastFlightAnim() ?? 'None',
      restoreClip: this.getFlightRestoreAnimation() ?? 'None',
      movementFrozen: this.locomotion.isMovementFrozen(),
      hasArrived: this.locomotion.getHasArrived(),
      arrivalDistance: this.config.landingDistance,
      arrivalLock: this.locomotion.getHasArrived(),
      arrivalLocked: this.locomotion.getHasArrived(),
      movementSkipped: this.locomotion.getHasArrived(),
      remainingDistance: 0,
      unlockDistance: this.config.landingDistance + HOVER_HYSTERESIS,
      unlockRadius: this.config.landingDistance + HOVER_HYSTERESIS,
      horizontalVelocity: this.locomotion.getCurrentSpeed(),
      currentPhase: this.phase,
      canMove,
      locomotionEnabled: this.phase === FlightPhase.Flying,
      animationOwner: animOwner,
      currentLocomotionState: this.locomotion.getLocoState(),
      currentTarget: `${target.x.toFixed(1)}, ${target.z.toFixed(1)}`,
      currentVelocity: this.locomotion.getCurrentSpeed(),
      animationOwnerDebug: String(this.locomotion.getAnimationOwner()),
      currentLocomotionClip: this.locomotion.getLastFlightAnim() ?? 'None',
      currentInteractionClip: cb ? cb.getCurrentInteraction() : 'None',
      interactionWeight: 0,
      locomotionWeight: animWeight,
      flightPhase: this.phase,
      flightActive: this.phase !== FlightPhase.Inactive,
      shutdownPending: this.shutdownPending,
      shutdownComplete: this.shutdownComplete,
      movementOwner: this.phase === FlightPhase.Inactive ? 'GroundController' : 'FlightController',
      steeringEnabled: this.locomotion.isSteeringEnabled(),
      groundEnabled: this.phase === FlightPhase.Inactive,
      groundSpeed: this.groundSpeed,
      flightSpeed: this.locomotion.getCurrentSpeed(),
      transitionInProgress: this.phase !== FlightPhase.Inactive && this.phase !== FlightPhase.Flying,
    };
  }

  enrichDebugInfo(
    info: FlightDebugInfo,
    position: THREE.Vector3,
    targetPosition: THREE.Vector3
  ): FlightDebugInfo {
    const verticalVelocity = (position.y - this.prevY) / 0.016;
    const dx = targetPosition.x - position.x;
    const dz = targetPosition.z - position.z;
    const dist = Math.hypot(dx, dz);
    return { ...info, altitude: position.y, verticalVelocity, distanceToTarget: dist };
  }

  getLastDistance(): number {
    return this.locomotion.getLastDistance();
  }

  getHasArrived(): boolean {
    return this.locomotion.getHasArrived();
  }

  getLandingDistance(): number {
    return this.config.landingDistance;
  }

  getGroundSpeed(): number {
    return this.groundSpeed;
  }
}
