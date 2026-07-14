import * as THREE from 'three';
import { HeadTrackingController } from './HeadTrackingController';
import { SleepAnimations } from '../GroundAnimationManifest';


/**
 * Sleep Controller — Exclusive owner of sleeping behaviour.
 *
 * State machine:
 *   Awake → FacingUser → PreparingSleep → Sleeping → Waking → Awake
 *
 * Design rules:
 *   - Owns ONLY sleep animations: 00280, 00281, 00282.
 *   - Uses mixer 'finished' events for transitions — never timers, never guessing duration.
 *   - No polling, no duplicated timers, no animation spam, no repeated play() per frame.
 *   - No race conditions — every transition is guarded by state checks.
 *   - Head tracking suppression is owned here, not in Viewer.
 *   - Viewer calls sleepController.update(delta, cursorX, cursorY, camera, groupRef) once per frame.
 *   - notifyActivity() must be called by Viewer on every user event that should reset the timer.
 */

export enum SleepState {
  Awake          = 'Awake',
  FacingUser     = 'FacingUser',   // Rotating to face camera before sleeping
  PreparingSleep = 'PreparingSleep',
  Sleeping       = 'Sleeping',
  Waking         = 'Waking',
}

export interface SleepDebugInfo {
  state: SleepState;
  idleSeconds: number;
  idleThreshold: number;
}

export interface SleepCallbacks {
  /** Called when sleep fully releases control — Viewer should restore the idle animation. */
  onWakeComplete: () => void;
  /** Returns true when flight is active (sleep cannot start while flying). */
  isFlightActive: () => boolean;
  /** Returns true when an interaction one-shot is active (sleep cannot start). */
  isInteractionActive: () => boolean;
  /** Returns true when the FSM is in Idle state (required for sleep). */
  isFSMIdle: () => boolean;
  /** Returns true when the character is moving (speed > threshold). */
  isMoving: () => boolean;
  /** Callback to play a sleep animation via the central playAnimation handler. */
  playAnimation?: (name: string, owner: string, role: string, reason: string, gated: boolean, restoreOnly: boolean, crossfadeDuration: number) => void;
}

// ── Animation names ──────────────────────────────────────────────────────────

const SLEEP_START = SleepAnimations.start;
const SLEEP_LOOP  = SleepAnimations.loop;
const SLEEP_END   = SleepAnimations.end;

const IDLE_THRESHOLD = 10; // seconds of complete inactivity before sleep

// How close the rotation must be (radians) before starting sleep animation
const FACE_USER_THRESHOLD = 0.08; // ~4.6 degrees
// Slerp speed for facing the user
const FACE_USER_SLERP = 3.5;
// Crossfade duration for all sleep transitions
const FADE_DURATION = 0.4;

export class SleepController {
  private state: SleepState = SleepState.Awake;

  private mixer: THREE.AnimationMixer | null = null;
  private actions: Record<string, THREE.AnimationAction> = {};
  private headTracking: HeadTrackingController | null = null;
  private callbacks: SleepCallbacks | null = null;

  // Idle timer — accumulates seconds of complete inactivity
  private idleSeconds = 0;

  // Bound mixer 'finished' listener — stored so it can be removed
  private boundFinishedListener: ((e: THREE.Event) => void) | null = null;

  // Actions pending stop after fade-out (for LoopRepeat clips with no 'finished' event)
  private pendingStops: THREE.AnimationAction[] = [];

  // Pre-allocated temporaries for FacingUser rotation
  private readonly upAxis = new THREE.Vector3(0, 1, 0);
  private readonly faceTargetQuat = new THREE.Quaternion();

  // Click listener — stored so it can be removed on destroy
  private boundClickListener: (() => void) | null = null;

  // ── Initialization ──────────────────────────────────────────────────────

  init(
    mixer: THREE.AnimationMixer,
    actions: Record<string, THREE.AnimationAction>,
    headTracking: HeadTrackingController | null,
    callbacks: SleepCallbacks
  ): void {
    this.mixer = mixer;
    this.actions = actions;
    this.headTracking = headTracking;
    this.callbacks = callbacks;

    // Listen for mouse clicks globally — any click wakes from sleep and resets timer
    this.boundClickListener = () => this.handleMouseClick();
    window.addEventListener('mousedown', this.boundClickListener);

    console.log('[SleepController] Ready. Animations:',
      SLEEP_START in actions ? '00280 ✓' : '00280 ✗',
      SLEEP_LOOP  in actions ? '00281 ✓' : '00281 ✗',
      SLEEP_END   in actions ? '00282 ✓' : '00282 ✗',
    );
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Called by Viewer once per frame.
   * cursorX/Y are NDC mouse coords used for cursor-move detection.
   * camera is used to compute the face-user target rotation.
   * groupQuaternion is the character's current world quaternion (read + write).
   * groupPosition is the character's world position (read only, for facing direction).
   */
  update(
    delta: number,
    cursorX: number,
    cursorY: number,
    camera: THREE.Camera,
    groupPosition: THREE.Vector3,
    groupQuaternion: THREE.Quaternion
  ): void {
    const dt = Math.min(delta, 0.05);

    // ── Process pending stops (LoopRepeat clips fading out) ──────────────
    if (this.pendingStops.length > 0) {
      this.pendingStops = this.pendingStops.filter(action => {
        if (!action.isRunning() || action.getEffectiveWeight() < 0.01) {
          action.stop();
          return false;
        }
        return true;
      });
    }

    switch (this.state) {
      case SleepState.Awake:
        this.updateAwake(dt, cursorX, cursorY);
        break;

      case SleepState.FacingUser:
        this.updateFacingUser(dt, camera, groupPosition, groupQuaternion);
        break;

      case SleepState.Sleeping:
        // Any cursor movement while sleeping triggers wake
        this.updateSleeping(cursorX, cursorY);
        break;

      // PreparingSleep and Waking resolve via mixer 'finished' events — nothing to poll
      default:
        break;
    }
  }

  /**
   * Call this from Viewer whenever any activity occurs that should reset the
   * inactivity timer and cancel pending sleep:
   *   - Mouse movement
   *   - Mouse click (also handled internally via mousedown listener)
   *   - Interaction starts / finishes
   *   - Flight starts / finishes
   *   - Takeoff / landing
   *   - Wake animation begins / finishes
   *   - Any locomotion resumes
   */
  notifyActivity(): void {
    this.idleSeconds = 0;

    // If we are in FacingUser — cancel and return to Awake immediately.
    // Do NOT cancel PreparingSleep/Sleeping/Waking here; those are already
    // running animations. forceWake() or the normal wake path handles those.
    if (this.state === SleepState.FacingUser) {
      this.setState(SleepState.Awake);
      console.log('[SleepController] FacingUser cancelled — activity detected');
    }
  }

  /**
   * Returns true when the character is in any sleep state (not Awake).
   * Viewer uses this to gate movement, turning, flight, cursor following,
   * interaction, and head tracking.
   */
  isSleeping(): boolean {
    return this.state !== SleepState.Awake && this.state !== SleepState.FacingUser;
  }

  /**
   * Returns true when sleep owns the character and locomotion must be blocked.
   * This includes FacingUser (character is rotating, not following cursor).
   */
  isOwningMovement(): boolean {
    return this.state !== SleepState.Awake;
  }

  getState(): SleepState { return this.state; }

  getDebugInfo(): SleepDebugInfo {
    return {
      state: this.state,
      idleSeconds: this.idleSeconds,
      idleThreshold: IDLE_THRESHOLD,
    };
  }

  /**
   * Force-wake — used when flight starts or interaction is triggered while sleeping.
   * Immediately stops all sleep animations and transitions to Awake.
   */
  forceWake(): void {
    if (this.state === SleepState.Awake) return;
    this.removeFinishedListener();
    this.stopAllSleepActions();
    this.setState(SleepState.Awake);
    this.idleSeconds = 0;
    if (this.headTracking) this.headTracking.clearSuppression();
    // Notify Viewer to restore locomotion — same as natural wake path
    if (this.callbacks) this.callbacks.onWakeComplete();
  }

  destroy(): void {
    this.removeFinishedListener();
    this.stopAllSleepActions();
    if (this.boundClickListener) {
      window.removeEventListener('mousedown', this.boundClickListener);
      this.boundClickListener = null;
    }
  }

  // ── Internal event handlers ──────────────────────────────────────────────

  private handleMouseClick(): void {
    this.idleSeconds = 0;

    if (this.state === SleepState.FacingUser) {
      this.setState(SleepState.Awake);
      console.log('[SleepController] FacingUser cancelled — mouse click');
      return;
    }

    if (this.state === SleepState.Sleeping) {
      this.enterWaking();
    }
  }

  // ── State update methods ─────────────────────────────────────────────────

  private updateAwake(dt: number, cursorX: number, cursorY: number): void {
    // Any cursor movement resets the timer
    const moved = Math.abs(cursorX) + Math.abs(cursorY) > 0;
    // We track absolute movement by comparing with last-known position stored
    // in Viewer. The cursorX/Y values change each frame when the mouse moves.
    // We detect movement by storing the last seen values.
    if (!this._cursorInitialized) {
      this._lastCursorX = cursorX;
      this._lastCursorY = cursorY;
      this._cursorInitialized = true;
    } else {
      const dx = cursorX - this._lastCursorX;
      const dy = cursorY - this._lastCursorY;
      if (dx * dx + dy * dy > 0.0001) {
        this.idleSeconds = 0;
        this._lastCursorX = cursorX;
        this._lastCursorY = cursorY;
      } else {
        this.idleSeconds += dt;
      }
    }

    // Suppress the unused warning (moved is just for type safety below)
    void moved;

    if (this.idleSeconds >= IDLE_THRESHOLD && this.canSleep()) {
      this.enterFacingUser();
    }
  }

  // Cursor tracking fields (declared below as private to keep constructor clean)
  private _lastCursorX = 0;
  private _lastCursorY = 0;
  private _cursorInitialized = false;
  // Cursor position at the moment Sleeping began (to detect first-move wakes)
  private _sleepCursorX = 0;
  private _sleepCursorY = 0;

  private updateFacingUser(
    dt: number,
    camera: THREE.Camera,
    groupPosition: THREE.Vector3,
    groupQuaternion: THREE.Quaternion
  ): void {
    // Compute the direction from the character to the camera (projected onto XZ plane)
    const toCamera = new THREE.Vector3();
    toCamera.subVectors(camera.position, groupPosition);
    toCamera.y = 0;

    if (toCamera.lengthSq() < 0.001) {
      // Camera directly above — skip rotation, proceed to sleep
      this.enterPreparingSleep(groupQuaternion);
      return;
    }

    toCamera.normalize();

    // Target rotation: character's +Z forward should face the camera
    const targetYaw = Math.atan2(toCamera.x, toCamera.z);
    this.faceTargetQuat.setFromAxisAngle(this.upAxis, targetYaw);

    // Slerp toward target
    const t = 1 - Math.exp(-FACE_USER_SLERP * dt);
    groupQuaternion.slerp(this.faceTargetQuat, t);

    // Check if we're close enough
    const dot = groupQuaternion.dot(this.faceTargetQuat);
    // |dot| close to 1 means the quaternions are nearly identical
    const angularDiff = 2 * Math.acos(Math.min(Math.abs(dot), 1));
    if (angularDiff < FACE_USER_THRESHOLD) {
      this.enterPreparingSleep(groupQuaternion);
    }
  }

  private updateSleeping(cursorX: number, cursorY: number): void {
    // Wake on any cursor movement from the position when sleep started
    const dx = cursorX - this._sleepCursorX;
    const dy = cursorY - this._sleepCursorY;
    if (dx * dx + dy * dy > 0.0001) {
      this.enterWaking();
    }
  }

  // ── State transitions ────────────────────────────────────────────────────

  private canSleep(): boolean {
    if (!this.callbacks) return false;
    if (this.callbacks.isFlightActive()) return false;
    if (this.callbacks.isInteractionActive()) return false;
    if (!this.callbacks.isFSMIdle()) return false;
    if (this.callbacks.isMoving()) return false;
    return true;
  }

  private enterFacingUser(): void {
    if (this.state !== SleepState.Awake) return;
    this.setState(SleepState.FacingUser);
    this.idleSeconds = 0;
    console.log('[SleepController] FacingUser — rotating to face camera');
  }

  private enterPreparingSleep(groupQuaternion: THREE.Quaternion): void {
    if (this.state !== SleepState.FacingUser) return;
    this.setState(SleepState.PreparingSleep);

    // Snap to exact target rotation before handing off to animation
    groupQuaternion.copy(this.faceTargetQuat);

    // Suppress head tracking
    if (this.headTracking) this.headTracking.setSuppressed('sleep-start');

    const action = this.actions[SLEEP_START];
    if (!action) {
      this.enterSleeping();
      return;
    }

    // Fade out all non-sleep actions from the whole mixer
    this.fadeOutAllNonSleepActions(action);

    // Fully configure the action before playing
    action.stop();
    action.reset();
    action.enabled = true;
    action.time = 0;
    action.paused = false;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);

    if (this.callbacks?.playAnimation) {
      this.callbacks.playAnimation(SLEEP_START, 'SleepController', 'Sleep Prepare', 'Start sleep', false, false, FADE_DURATION);
    } else {
      action.fadeIn(FADE_DURATION);
      action.play();
    }

    this.attachFinishedListener(action, () => {
      if (this.state !== SleepState.PreparingSleep) return;
      this.enterSleeping();
    });

    console.log('[SleepController] PreparingSleep — playing sleep01_start');
    console.log(`[Owner] Sleep → "00280_sleep01_start" (weight=1, LoopOnce)`);
  }

  private enterSleeping(): void {
    this.setState(SleepState.Sleeping);

    if (this.headTracking) this.headTracking.reset();
    if (this.headTracking) this.headTracking.setSuppressed('sleep-loop');

    // Stop start clip cleanly
    this.stopAction(SLEEP_START);

    const action = this.actions[SLEEP_LOOP];
    if (!action) {
      console.warn('[SleepController] No sleep01_loop clip found');
      return;
    }

    this.fadeOutAllNonSleepActions(action);

    action.stop();
    action.reset();
    action.enabled = true;
    action.time = 0;
    action.paused = false;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);

    if (this.callbacks?.playAnimation) {
      this.callbacks.playAnimation(SLEEP_LOOP, 'SleepController', 'Sleep Sleep', 'Loop sleep', false, false, FADE_DURATION);
    } else {
      action.fadeIn(FADE_DURATION);
      action.play();
    }

    // Record cursor position at the moment we enter Sleeping so we can detect first-move
    this._sleepCursorX = this._lastCursorX;
    this._sleepCursorY = this._lastCursorY;

    console.log('[SleepController] Sleeping — looping sleep01_loop');
    console.log(`[Owner] Sleep → "00281_sleep01_loop" (weight=1, LoopRepeat)`);
  }

  private enterWaking(): void {
    if (this.state !== SleepState.Sleeping) return;
    this.setState(SleepState.Waking);

    if (this.headTracking) this.headTracking.setSuppressed('sleep-end');

    // Stop loop clip cleanly
    this.stopAction(SLEEP_LOOP);

    const action = this.actions[SLEEP_END];
    if (!action) {
      this.enterAwake();
      return;
    }

    this.fadeOutAllNonSleepActions(action);

    action.stop();
    action.reset();
    action.enabled = true;
    action.time = 0;
    action.paused = false;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);

    if (this.callbacks?.playAnimation) {
      this.callbacks.playAnimation(SLEEP_END, 'SleepController', 'Sleep Wake', 'Wake up', false, false, FADE_DURATION);
    } else {
      action.fadeIn(FADE_DURATION);
      action.play();
    }

    this.attachFinishedListener(action, () => {
      if (this.state !== SleepState.Waking) return;
      this.enterAwake();
    });

    console.log('[SleepController] Waking — playing sleep01_end');
    console.log(`[Owner] Sleep → "00282_sleep01_end" (weight=1, LoopOnce)`);
  }

  private enterAwake(): void {
    this.stopAllSleepActions();

    this.setState(SleepState.Awake);
    this.idleSeconds = 0;
    // Reset cursor tracking so the timer restarts fresh after waking
    this._cursorInitialized = false;

    if (this.headTracking) this.headTracking.clearSuppression();

    if (this.callbacks) this.callbacks.onWakeComplete();

    console.log('[SleepController] Awake — control returned to locomotion FSM');
    console.log(`[Owner] Sleep → released (restoring FSM idle)`);
  }

  // ── Mixer 'finished' event management ────────────────────────────────────

  private attachFinishedListener(
    targetAction: THREE.AnimationAction,
    onComplete: () => void
  ): void {
    this.removeFinishedListener();

    let fired = false;
    const listener = (e: THREE.Event) => {
      const finishedAction = (e as unknown as { action: THREE.AnimationAction }).action;
      if (finishedAction !== targetAction || fired) return;
      fired = true;
      this.removeFinishedListener();
      onComplete();
    };

    this.boundFinishedListener = listener;
    if (this.mixer) this.mixer.addEventListener('finished', listener);
  }

  private removeFinishedListener(): void {
    if (this.boundFinishedListener && this.mixer) {
      this.mixer.removeEventListener('finished', this.boundFinishedListener);
    }
    this.boundFinishedListener = null;
  }

  // ── Action cleanup ───────────────────────────────────────────────────────

  private stopAction(name: string): void {
    const action = this.actions[name];
    if (!action) return;
    if (!action.isRunning() && action.getEffectiveWeight() < 0.01) return;

    action.fadeOut(FADE_DURATION);

    // For LoopRepeat clips the 'finished' event never fires — track via pendingStops
    this.pendingStops.push(action);
  }

  private stopAllSleepActions(): void {
    this.removeFinishedListener();
    this.pendingStops = [];
    for (const name of [SLEEP_START, SLEEP_LOOP, SLEEP_END]) {
      const action = this.actions[name];
      if (!action) continue;
      action.stop();
      action.reset();
      action.setEffectiveWeight(0);
    }
  }

  /**
   * Fade out ALL running actions in the mixer except the one about to play.
   * This ensures sleep takes full ownership, not just fading the 3 sleep clips.
   */
  private fadeOutAllNonSleepActions(keepAction: THREE.AnimationAction): void {
    for (const action of Object.values(this.actions)) {
      if (!action || action === keepAction) continue;
      if (action.isRunning() || action.getEffectiveWeight() > 0.001) {
        action.fadeOut(FADE_DURATION);
      }
    }
  }

  // ── Utility ──────────────────────────────────────────────────────────────

  private setState(newState: SleepState): void {
    if (this.state === newState) return;
    console.log(`[SleepController] ${this.state} → ${newState}`);
    this.state = newState;
  }
}
