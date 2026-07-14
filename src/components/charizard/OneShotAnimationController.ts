import * as THREE from 'three';
import { getFlightSequence, FlightSequenceDefinition } from './FlightAnimationManifest';

const COMMON_CLIPS = new Set([
  // Ground
  'pm0006_00_00_00300_roar01',
  'pm0006_00_00_00320_refresh01',
  'pm0006_00_00_00400_attack01',
  'pm0006_00_00_00410_attack02',
  'pm0006_00_00_00450_rangeattack01',
  // Flight
  'pm0006_00_00_20400_attack01',
  'pm0006_00_00_20410_attack02',
  'pm0006_00_00_20450_rangeattack01',
]);

const RARE_CLIPS = new Set([
  // Ground
  'pm0006_00_00_00500_damage01',
  'pm0006_00_00_00501_damage02',
  'pm0006_00_00_00563_hate01',
  // Flight
  'pm0006_00_00_20500_damage01',
  'pm0006_00_00_20501_damage02',
]);


export interface ResolvedOneShot {
  animationName: string;
  label: string;
  fadeInDuration: number;
  fadeOutDuration: number;
  timeScale: number;
  duration: number;
}

export interface OneShotState {
  isActive: boolean;
  currentLabel: string;
  currentAnimationName: string;
}

/**
 * Pool provider — returns animation names eligible for one-shot playback.
 * The InteractionController supplies different providers for ground vs flight mode.
 */
export type PoolProvider = () => string[];
export type LoopChecker = (name: string) => boolean;

/**
 * Single animation owner system — only ONE owner may control the mixer at any moment.
 */
export enum AnimationOwner {
  None             = 'None',
  FlightLocomotion = 'FlightLocomotion',
  FlightTransition = 'FlightTransition',
  Interaction      = 'Interaction',
  Sleep            = 'Sleep',
}

/**
 * Callback to fade out all locomotion animations before an interaction begins.
 * In flight mode, this fades out hover/slow/fast flight clips and zeroes their weights.
 * In ground mode, this is a no-op (ground handles fade via previousAction).
 */
export type FadeOutLocomotionFn = () => void;

// ── Sequence playback state machine ─────────────────────────────────────────
type SequencePhase = 'start' | 'loop' | 'end';

interface ActiveSequence {
  definition: FlightSequenceDefinition;
  phase: SequencePhase;
}

/**
 * Manages discovery, selection, and lifecycle of one-shot animations.
 *
 * Lifecycle guarantee (simple one-shot):
 *   reset() → fadeIn() → play() → LoopOnce → clampWhenFinished
 *   → finished event (or fallback timeout) → fadeOut() → stop()
 *   → restore movement animation via callback
 *
 * Lifecycle guarantee (sequence — start → loop → end):
 *   start: LoopOnce → finished → advance to loop
 *   loop:  LoopRepeat, plays for one full clip duration → advance to end
 *   end:   LoopOnce → finished → fire onFinish (restore callback)
 *
 * When an interaction starts in flight mode, all locomotion animations are
 * faded out and their weights zeroed so the interaction clip owns the mixer
 * exclusively at weight 1.
 */
export class OneShotAnimationController {
  private actions: Record<string, THREE.AnimationAction> = {};
  private mixer: THREE.AnimationMixer | null = null;
  private pool: ResolvedOneShot[] = [];

  private poolProvider: PoolProvider | null = null;
  private loopChecker: LoopChecker | null = null;

  private lastPlayedName: string | null = null;

  private isActive = false;
  private currentOneShot: ResolvedOneShot | null = null;
  private currentAction: THREE.AnimationAction | null = null;
  private onFinishCallback: ((restoreAnimName: string | null) => void) | null = null;

  private boundFinishedListener: ((e: THREE.Event) => void) | null = null;
  private fallbackTimerId: ReturnType<typeof setTimeout> | null = null;

  // Animation ownership
  private animationOwner: AnimationOwner = AnimationOwner.None;
  private fadeOutLocomotionFn: FadeOutLocomotionFn | null = null;

  // Active sequence state — null when playing a simple one-shot
  private activeSequence: ActiveSequence | null = null;

  // Loop phase: timeout ID for advancing after one loop cycle
  private loopAdvanceTimerId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Initialize with a pool provider and loop checker.
   * The pool is rebuilt from the provider each time switchPool is called.
   */
  init(
    mixer: THREE.AnimationMixer,
    actions: Record<string, THREE.AnimationAction>,
    poolProvider: PoolProvider,
    loopChecker: LoopChecker
  ): void {
    this.mixer = mixer;
    this.actions = actions;
    this.poolProvider = poolProvider;
    this.loopChecker = loopChecker;
    this.rebuildPool();
  }

  /**
   * Rebuild the pool from the current provider.
   * Called when switching between ground and flight mode.
   */
  rebuildPool(): void {
    if (!this.poolProvider || !this.loopChecker) return;

    const manifestNames = this.poolProvider();

    this.pool = manifestNames
      .filter(name => !this.loopChecker!(name))
      .map(name => {
        const action = this.actions[name];
        if (!action) return null;
        const clip = action.getClip();
        if (!clip || clip.duration <= 0 || !clip.tracks || clip.tracks.length === 0) {
          console.warn(`[OneShotController] Excluding "${name}" — invalid clip`);
          return null;
        }
        return {
          animationName: name,
          label: name,
          fadeInDuration: 0.2,
          fadeOutDuration: 0.3,
          timeScale: 1.0,
          duration: clip.duration,
        };
      })
      .filter((p): p is ResolvedOneShot => p !== null);

    console.log('[OneShotController] Pool rebuilt:', this.pool.length, 'animations');
    this.pool.forEach(p => console.log('  +', p.animationName, `(${p.duration.toFixed(2)}s)`));
  }

  /**
   * Switch the pool provider and loop checker (ground ↔ flight).
   */
  switchPool(poolProvider: PoolProvider, loopChecker: LoopChecker): void {
    this.poolProvider = poolProvider;
    this.loopChecker = loopChecker;
    this.lastPlayedName = null;
    this.rebuildPool();
  }

  /**
   * Set a callback that fades out all locomotion animations.
   * Called before an interaction begins in flight mode.
   */
  setFadeOutLocomotionFn(fn: FadeOutLocomotionFn | null): void {
    this.fadeOutLocomotionFn = fn;
  }

  hasPool(): boolean {
    return this.pool.length > 0;
  }

  getPoolSize(): number {
    return this.pool.length;
  }

  isPlaying(): boolean {
    return this.isActive;
  }

  getAnimationOwner(): AnimationOwner {
    return this.animationOwner;
  }

  getCurrentState(): OneShotState {
    return {
      isActive: this.isActive,
      currentLabel: this.currentOneShot?.label ?? '',
      currentAnimationName: this.currentOneShot?.animationName ?? '',
    };
  }

  pickRandom(): ResolvedOneShot | null {
    if (this.pool.length === 0) return null;
    if (this.pool.length === 1) return this.pool[0];

    const weights = this.pool.map(item => {
      if (COMMON_CLIPS.has(item.animationName)) return 15.0;
      if (RARE_CLIPS.has(item.animationName)) return 3.0;
      return 1.0;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) {
      return this.pool[Math.floor(Math.random() * this.pool.length)];
    }

    let candidate: ResolvedOneShot | null = null;
    let attempts = 0;
    do {
      const r = Math.random() * totalWeight;
      let cumulative = 0;
      for (let i = 0; i < this.pool.length; i++) {
        cumulative += weights[i];
        if (r <= cumulative) {
          candidate = this.pool[i];
          break;
        }
      }
      attempts++;
    } while (candidate && candidate.animationName === this.lastPlayedName && attempts < 10);

    return candidate ?? this.pool[0];
  }

  play(
    previousAction: THREE.AnimationAction | null,
    onFinish: (restoreAnimName: string | null) => void,
    onStart?: (action: THREE.AnimationAction) => void,
    specificAnimationName?: string
  ): boolean {
    if (!this.mixer) return false;

    if (this.isActive) {
      this.cleanupCurrent();
    }

    let oneShot: ResolvedOneShot | null = null;
    if (specificAnimationName) {
      // Find in pool first
      oneShot = this.pool.find(p => p.animationName === specificAnimationName) ?? null;
      if (!oneShot) {
        // If not in the click random pool (e.g. glad, notice), construct it on the fly
        const action = this.actions[specificAnimationName];
        if (action) {
          const clip = action.getClip();
          if (clip && clip.duration > 0) {
            oneShot = {
              animationName: specificAnimationName,
              label: specificAnimationName,
              fadeInDuration: 0.2,
              fadeOutDuration: 0.3,
              timeScale: 1.0,
              duration: clip.duration,
            };
          }
        }
      }
    } else {
      oneShot = this.pickRandom();
    }

    if (!oneShot) return false;

    const action = this.actions[oneShot.animationName];
    if (!action) return false;

    // ── Take ownership: Interaction owns the mixer now ───────────────────────
    this.animationOwner = AnimationOwner.Interaction;

    // ── Crossfade from locomotion → interaction clip ──────────────────────────
    // The fadeOutLocomotionFn fades out all flight locomotion clips smoothly.
    if (this.fadeOutLocomotionFn) {
      console.log("[TRACE] Executing fadeOutLocomotionFn");
      this.fadeOutLocomotionFn();
    }

    this.isActive = true;
    this.currentOneShot = oneShot;
    this.currentAction = action;
    this.onFinishCallback = onFinish;
    this.lastPlayedName = oneShot.animationName;

    // ── Detect whether this is a sequence entry point ────────────────────────
    const sequence = getFlightSequence(oneShot.animationName);
    this.activeSequence = sequence ? { definition: sequence, phase: 'start' } : null;

    // ── Play the entry clip ──────────────────────────────────────────────────
    this.playClipOneShot(action, previousAction, oneShot.fadeInDuration);

    // ── Notify Viewer so it can sync currentActionRef immediately ─────────────
    if (onStart) onStart(action);

    if (sequence) {
      console.log(`[OneShotController] Sequence Started: "${oneShot.animationName}" (start → loop → end)`);
      console.log(`[Owner] Interaction → "${oneShot.animationName}" (LoopOnce, sequence start)`);
      // Finished listener advances to loop phase
      this.attachFinishedListener(action, () => {
        if (!this.isActive || this.activeSequence?.phase !== 'start') return;
        this.advanceSequenceToLoop();
      });
    } else {
      console.log(`[OneShotController] Interaction Started: "${oneShot.animationName}" | Duration: ${oneShot.duration.toFixed(2)}s`);
      console.log(`[Owner] Interaction → "${oneShot.animationName}" (weight=1, LoopOnce)`);
      this.attachFinishedListener(action, () => {
        if (!this.isActive || this.currentOneShot !== oneShot) return;
        console.log(`[OneShotController] Finished Event: "${oneShot.animationName}"`);
        this.completeOneShot(oneShot, false);
      });
      // Fallback only for simple one-shots
      this.armFallback(oneShot);
    }

    return true;
  }

  // ── Sequence phase transitions ───────────────────────────────────────────

  private advanceSequenceToLoop(): void {
    if (!this.activeSequence || !this.mixer) return;
    const { definition } = this.activeSequence;
    this.activeSequence.phase = 'loop';

    const prevAction = this.currentAction;
    const loopAction = this.actions[definition.loop];
    if (!loopAction) {
      // No loop clip — skip straight to end
      this.advanceSequenceToEnd();
      return;
    }

    // Fade out start clip
    if (prevAction && prevAction !== loopAction) prevAction.fadeOut(0.15);

    // Configure loop clip
    loopAction.stop();
    loopAction.reset();
    loopAction.enabled = true;
    loopAction.time = 0;
    loopAction.paused = false;
    loopAction.setLoop(THREE.LoopRepeat, Infinity);
    loopAction.clampWhenFinished = false;
    loopAction.setEffectiveTimeScale(1);
    loopAction.setEffectiveWeight(0);
    loopAction.fadeIn(0.15);
    loopAction.play();

    this.currentAction = loopAction;

    const clipDuration = loopAction.getClip().duration;
    console.log(`[OneShotController] Sequence → loop "${definition.loop}" (${clipDuration.toFixed(2)}s)`);
    console.log(`[Owner] Interaction → "${definition.loop}" (LoopRepeat, sequence loop)`);

    // LoopRepeat never fires 'finished' — advance after one full cycle via timeout
    this.loopAdvanceTimerId = setTimeout(() => {
      if (!this.isActive || this.activeSequence?.phase !== 'loop') return;
      this.advanceSequenceToEnd();
    }, clipDuration * 1000);
  }

  private advanceSequenceToEnd(): void {
    if (!this.activeSequence || !this.mixer) return;
    const { definition } = this.activeSequence;
    this.activeSequence.phase = 'end';

    this.clearLoopAdvanceTimer();

    const prevAction = this.currentAction;
    const endAction = this.actions[definition.end];
    if (!endAction) {
      // No end clip — complete directly
      this.completeSequence();
      return;
    }

    // Fade out loop clip
    if (prevAction && prevAction !== endAction) prevAction.fadeOut(0.15);

    // Configure end clip
    endAction.stop();
    endAction.reset();
    endAction.enabled = true;
    endAction.time = 0;
    endAction.paused = false;
    endAction.setLoop(THREE.LoopOnce, 1);
    endAction.clampWhenFinished = true;
    endAction.setEffectiveTimeScale(1);
    endAction.setEffectiveWeight(0);
    endAction.fadeIn(0.15);
    endAction.play();

    this.currentAction = endAction;

    console.log(`[OneShotController] Sequence → end "${definition.end}"`);
    console.log(`[Owner] Interaction → "${definition.end}" (LoopOnce, sequence end)`);

    this.attachFinishedListener(endAction, () => {
      if (!this.isActive || this.activeSequence?.phase !== 'end') return;
      console.log(`[OneShotController] Sequence end finished: "${definition.end}"`);
      this.completeSequence();
    });

    // Fallback for end clip
    const endDuration = endAction.getClip().duration;
    this.armFallbackRaw(endDuration, () => {
      if (!this.isActive || this.activeSequence?.phase !== 'end') return;
      console.warn(`[OneShotController] Sequence end fallback: "${definition.end}"`);
      this.completeSequence();
    });
  }

  private completeSequence(): void {
    const seq = this.activeSequence;
    this.activeSequence = null;

    // Fade out the end (or final) action
    if (this.currentAction) {
      const currentAction = this.currentAction;
      const fadeOut = this.currentOneShot?.fadeOutDuration ?? 0.3;
      currentAction.fadeOut(fadeOut);
      setTimeout(() => { if (!currentAction.isRunning()) return; currentAction.enabled = false; }, (fadeOut + 0.2) * 1000);
    }

    if (seq) {
      console.log(`[OneShotController] Sequence Complete: ${seq.definition.start} → ${seq.definition.loop} → ${seq.definition.end}`);
    }
    console.log(`[Owner] Interaction → released`);

    this.isActive = false;
    this.currentOneShot = null;
    this.currentAction = null;
    this.animationOwner = AnimationOwner.None;

    const cb = this.onFinishCallback;
    this.onFinishCallback = null;
    if (cb) cb(null);
  }

  // ── Simple one-shot completion ───────────────────────────────────────────

  private completeOneShot(oneShot: ResolvedOneShot, fromFallback: boolean): void {
    this.removeFinishedListener();
    this.clearFallbackTimer();

    const action = this.actions[oneShot.animationName];
    if (action) {
      action.fadeOut(oneShot.fadeOutDuration);
      setTimeout(() => {
        if (!action.isRunning()) return;
        action.enabled = false;
      }, (oneShot.fadeOutDuration + 0.2) * 1000);
    }

    console.log(`[OneShotController] Complete | Fallback: ${fromFallback}`);
    console.log(`[Owner] Interaction → released`);

    this.isActive = false;
    this.currentOneShot = null;
    this.currentAction = null;
    this.animationOwner = AnimationOwner.None;

    const cb = this.onFinishCallback;
    this.onFinishCallback = null;
    if (cb) cb(null);
  }

  // ── Interruption / force-stop ────────────────────────────────────────────

  private cleanupCurrent(): void {
    this.removeFinishedListener();
    this.clearFallbackTimer();
    this.clearLoopAdvanceTimer();

    if (this.currentOneShot) {
      const action = this.actions[this.currentOneShot.animationName];
      if (action) {
        action.fadeOut(0.2);
        setTimeout(() => { action.enabled = false; }, 250);
      }
    }

    // If mid-sequence, also fade out the currently playing clip
    if (this.activeSequence && this.currentAction) {
      const current = this.currentAction;
      current.fadeOut(0.2);
      setTimeout(() => { if (!current.isRunning()) return; current.enabled = false; }, 250);
    }

    this.isActive = false;
    this.currentOneShot = null;
    this.currentAction = null;
    this.activeSequence = null;
    this.animationOwner = AnimationOwner.None;

    const cb = this.onFinishCallback;
    this.onFinishCallback = null;
    if (cb) cb(null);
  }

  forceStop(_restoreAction: THREE.AnimationAction | null): void {
    if (!this.isActive) return;

    const oneShot = this.currentOneShot;
    const seq = this.activeSequence;
    this.cleanupCurrent();

    // NOTE: restoreAction is NOT played here. Viewer owns the restore.
    if (seq) {
      console.log(`[OneShotController] Force-stopped sequence: "${seq.definition.start}" (phase: ${seq.phase})`);
    } else if (oneShot) {
      console.log(`[OneShotController] Force-stopped: "${oneShot.animationName}"`);
    }
  }

  // ── Animation helpers ────────────────────────────────────────────────────

  /**
   * Configure and play a LoopOnce clip with crossfade from a previous action.
   * Used for the initial entry clip and for simple one-shots.
   */
  private playClipOneShot(
    action: THREE.AnimationAction,
    previousAction: THREE.AnimationAction | null,
    fadeInDuration: number
  ): void {
    action.stop();
    action.reset();
    action.enabled = true;
    action.time = 0;
    action.paused = false;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.setEffectiveTimeScale(1);

    if (previousAction && previousAction !== action && previousAction.isRunning()) {
      // Ground path: crossfade from the previous movement action
      previousAction.crossFadeTo(action, fadeInDuration, true);
      action.setEffectiveWeight(1);
    } else {
      // Flight path: locomotion already faded by fadeOutLocomotionFn
      action.setEffectiveWeight(0);
      action.fadeIn(fadeInDuration);
    }
    action.play();
  }

  // ── Mixer 'finished' event management ────────────────────────────────────

  private attachFinishedListener(
    targetAction: THREE.AnimationAction,
    onComplete: () => void
  ): void {
    this.removeFinishedListener();
    if (!this.mixer) return;

    let fired = false;
    const listener = (e: THREE.Event) => {
      const finishedAction = (e as unknown as { action: THREE.AnimationAction }).action;
      if (finishedAction !== targetAction || fired) return;
      fired = true;
      this.removeFinishedListener();
      onComplete();
    };

    this.boundFinishedListener = listener;
    this.mixer.addEventListener('finished', listener);
  }

  private removeFinishedListener(): void {
    if (this.boundFinishedListener && this.mixer) {
      this.mixer.removeEventListener('finished', this.boundFinishedListener);
    }
    this.boundFinishedListener = null;
  }

  // ── Fallback timers ──────────────────────────────────────────────────────

  private armFallback(oneShot: ResolvedOneShot): void {
    const delay = (oneShot.duration / Math.max(oneShot.timeScale, 0.01) + 0.5) * 1000;
    this.armFallbackRaw(delay / 1000, () => {
      if (!this.isActive || this.currentOneShot !== oneShot) return;
      console.warn(`[OneShotController] Fallback Used: "${oneShot.animationName}"`);
      this.completeOneShot(oneShot, true);
    });
  }

  private armFallbackRaw(durationSeconds: number, cb: () => void): void {
    this.clearFallbackTimer();
    this.fallbackTimerId = setTimeout(cb, (durationSeconds + 0.5) * 1000);
  }

  private clearFallbackTimer(): void {
    if (this.fallbackTimerId !== null) {
      clearTimeout(this.fallbackTimerId);
      this.fallbackTimerId = null;
    }
  }

  private clearLoopAdvanceTimer(): void {
    if (this.loopAdvanceTimerId !== null) {
      clearTimeout(this.loopAdvanceTimerId);
      this.loopAdvanceTimerId = null;
    }
  }
}
