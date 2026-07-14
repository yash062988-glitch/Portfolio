import * as THREE from 'three';
import { OneShotAnimationController, OneShotState, PoolProvider, LoopChecker, FadeOutLocomotionFn } from './OneShotAnimationController';
import { INTERACTION_COOLDOWN_MS } from './InteractionConfig';
import { FlightAnimationManifest } from './FlightAnimationManifest';

export interface InteractionDebugInfo {
  interactionActive: boolean;
  currentOneShot: string;
  previousAnimationName: string;
  queuedState: string;
  poolSize: number;
  mode: InteractionMode;
  animationOwner: string;
  interactionWeight: number;
  locomotionWeight: number;
  currentLocomotionClip: string;
  currentInteractionClip: string;
}

export type InteractionMode = 'Ground' | 'Flight';

export const WebsiteEvent = {
  NAVIGATION_HOVER: 'NAVIGATION_HOVER',
  PROJECT_HOVER: 'PROJECT_HOVER',
  PROJECT_OPEN: 'PROJECT_OPEN',
  CERTIFICATION_OPEN: 'CERTIFICATION_OPEN',
  CONTACT_SUCCESS: 'CONTACT_SUCCESS',
  RESUME_CLICK: 'RESUME_CLICK',
  DOWNLOAD_COMPLETE: 'DOWNLOAD_COMPLETE',
  PORTFOLIO_FINISHED: 'PORTFOLIO_FINISHED',
} as const;

export type WebsiteEventType = typeof WebsiteEvent[keyof typeof WebsiteEvent];


/**
 * Handles left-click events and orchestrates one-shot animation playback.
 *
 * Supports dual mode:
 *   - Ground mode: uses ground interaction pool (000xx animations)
 *   - Flight mode: uses flight interaction pool (200xx animations)
 *
 * The pool is switched when flight starts or completes.
 */
export class InteractionController {
  private oneShotController: OneShotAnimationController;
  private actions: Record<string, THREE.AnimationAction> = {};

  private getMovementAction: (() => THREE.AnimationAction | null) | null = null;
  private getFSMAnimationName: (() => string | null) | null = null;
  private isFlightActive: (() => boolean) | null = null;
  private isSleeping: (() => boolean) | null = null;
  private onOneShotComplete: ((restoreAnimName: string | null) => void) | null = null;
  private onInteractionStart: ((action: THREE.AnimationAction) => void) | null = null;

  private lastClickTime = 0;
  private savedMovementAction: THREE.AnimationAction | null = null;
  private savedMovementName: string | null = null;

  private boundClickHandler: (e: MouseEvent) => void;

  private mode: InteractionMode = 'Ground';
  private groundPoolProvider: PoolProvider | null = null;
  private groundLoopChecker: LoopChecker | null = null;
  private flightPoolProvider: PoolProvider | null = null;
  private flightLoopChecker: LoopChecker | null = null;

  private activeInteractionType: 'None' | 'ManualClick' | 'WebsiteEvent' = 'None';
  private queuedEvent: { animationName: string; isNotice: boolean; timestamp: number } | null = null;
  private lastNoticeTime = 0;
  private isTransitionActive: (() => boolean) | null = null;
  private isCharizardHidden: (() => boolean) | null = null;

  constructor() {
    this.oneShotController = new OneShotAnimationController();
    this.boundClickHandler = this.handleClick.bind(this);
  }

  init(
    mixer: THREE.AnimationMixer,
    actions: Record<string, THREE.AnimationAction>,
    getMovementAction: () => THREE.AnimationAction | null,
    getFSMAnimName: () => string | null,
    getIsFlightActive: () => boolean,
    onComplete: (restoreAnimName: string | null) => void,
    groundPool: { provider: PoolProvider; loopChecker: LoopChecker },
    flightPool: { provider: PoolProvider; loopChecker: LoopChecker },
    getIsSleeping: () => boolean,
    onInteractionStart?: (action: THREE.AnimationAction) => void,
    getIsTransitionActive?: () => boolean,
    getIsCharizardHidden?: () => boolean,
  ): void {
    this.actions = actions;
    this.getMovementAction = getMovementAction;
    this.getFSMAnimationName = getFSMAnimName;
    this.isFlightActive = getIsFlightActive;
    this.isSleeping = getIsSleeping;
    this.onOneShotComplete = onComplete;
    this.onInteractionStart = onInteractionStart ?? null;
    this.isTransitionActive = getIsTransitionActive ?? null;
    this.isCharizardHidden = getIsCharizardHidden ?? null;

    this.groundPoolProvider = groundPool.provider;
    this.groundLoopChecker = groundPool.loopChecker;
    this.flightPoolProvider = flightPool.provider;
    this.flightLoopChecker = flightPool.loopChecker;

    // Initialize with ground pool
    this.oneShotController.init(
      mixer,
      actions,
      groundPool.provider,
      groundPool.loopChecker
    );
    // ── Wire up internal fade-out for flight locomotion animations ──────────
    // When an interaction starts in flight mode, all hover/slow/fast flight
    // clips must be faded out and zeroed so the interaction clip owns the
    // mixer exclusively. We do this internally so Viewer doesn't need to wire it.
    console.log("[TRACE] setFadeOutLocomotionFn() REGISTERED");
    this.oneShotController.setFadeOutLocomotionFn(() => {
      if (!this.isFlightActive || !this.isFlightActive()) return;
      this.fadeOutFlightLocomotion(actions);
    });

    window.addEventListener('click', this.boundClickHandler);
    console.log('[InteractionController] Ready. Ground pool size:', this.oneShotController.getPoolSize());
  }

  /**
   * Fade out all flight locomotion animation clips smoothly.
   * Uses fadeOut only — no manual weight zeroing. The crossFadeTo in
   * OneShotAnimationController.play() handles weight transfer naturally.
   */
  private fadeOutFlightLocomotion(actions: Record<string, THREE.AnimationAction>): void {
    console.log("[TRACE] fadeOutFlightLocomotion() CALLED");
    const flightLocoNames = FlightAnimationManifest.movement.map(e => e.name);
    for (const name of flightLocoNames) {
      const action = actions[name];
      if (action && (action.isRunning() || action.getEffectiveWeight() > 0)) {
        action.fadeOut(0.20);
      }
    }
  }

  /**
   * Set a callback that fades out all flight locomotion animations.
   * Called by the FlightController to give the OneShotController the ability
   * to fade out hover/slow/fast before an interaction clip plays.
   */
  setFadeOutLocomotionFn(fn: FadeOutLocomotionFn | null): void {
    this.oneShotController.setFadeOutLocomotionFn(fn);
  }

  destroy(): void {
    window.removeEventListener('click', this.boundClickHandler);
  }

  /**
   * Switch to flight interaction pool (200xx animations).
   */
  switchToFlightMode(): void {
    if (this.mode === 'Flight' || !this.flightPoolProvider || !this.flightLoopChecker) return;
    this.mode = 'Flight';
    this.oneShotController.switchPool(this.flightPoolProvider, this.flightLoopChecker);
    console.log('[InteractionController] Switched to Flight mode. Pool size:', this.oneShotController.getPoolSize());
  }

  /**
   * Switch back to ground interaction pool (000xx animations).
   */
  switchToGroundMode(): void {
    if (this.mode === 'Ground' || !this.groundPoolProvider || !this.groundLoopChecker) return;
    this.mode = 'Ground';
    this.oneShotController.switchPool(this.groundPoolProvider, this.groundLoopChecker);
    console.log('[InteractionController] Switched to Ground mode. Pool size:', this.oneShotController.getPoolSize());
  }

  getMode(): InteractionMode {
    return this.mode;
  }

  private handleClick(e: MouseEvent): void {
    if (e.button !== 0) return;

    const now = Date.now();
    if (now - this.lastClickTime < INTERACTION_COOLDOWN_MS) return;
    this.lastClickTime = now;

    // Manual click has higher priority than WebsiteEvent.
    // If a manual click is already active, ignore this click.
    if (this.activeInteractionType === 'ManualClick') return;
    if (!this.oneShotController.hasPool()) return;

    if (this.mode === 'Ground' && this.isFlightActive && this.isFlightActive()) return;
    if (this.isSleeping && this.isSleeping()) return;

    // Interrupt any active website event
    if (this.activeInteractionType === 'WebsiteEvent' && this.oneShotController.isPlaying()) {
      console.log('[InteractionController] Interrupting active website event for manual click');
      this.oneShotController.forceStop(null);
    }

    this.savedMovementAction = this.getMovementAction ? this.getMovementAction() : null;
    this.savedMovementName = this.getFSMAnimationName ? this.getFSMAnimationName() : null;

    this.activeInteractionType = 'ManualClick';

    const started = this.oneShotController.play(
      this.savedMovementAction,
      this.onOneShotEnd.bind(this),
      (action) => {
        if (this.onInteractionStart) {
          this.onInteractionStart(action);
        }
      }
    );

    if (started) {
      const state = this.oneShotController.getCurrentState();
      console.log('[InteractionController] One-shot started:', state.currentLabel, '— mode:', this.mode);
    }
  }

  private onOneShotEnd(restoreAnimName: string | null): void {
    this.activeInteractionType = 'None';
    if (this.onOneShotComplete) {
      this.onOneShotComplete(restoreAnimName);
    }
    this.checkQueuedEvent();
  }

  playNotice(): boolean {
    const isFlight = this.isFlightActive ? this.isFlightActive() : false;
    const animName = isFlight ? 'pm0006_00_00_20560_notice01' : 'pm0006_00_00_00560_notice01';
    return this.triggerWebsiteEvent(animName, true);
  }

  playGlad(): boolean {
    const isFlight = this.isFlightActive ? this.isFlightActive() : false;
    // Flight does not have glad, map to flight roar pm0006_00_00_20300_roar01 or flight notice
    const animName = isFlight ? 'pm0006_00_00_20300_roar01' : 'pm0006_00_00_00550_glad01';
    return this.triggerWebsiteEvent(animName, false);
  }

  triggerWebsiteInteraction(event: string): boolean {
    let animName = '';
    let isNotice = false;
    const isFlight = this.isFlightActive ? this.isFlightActive() : false;

    switch (event) {
      case WebsiteEvent.NAVIGATION_HOVER:
      case WebsiteEvent.PROJECT_HOVER:
      case WebsiteEvent.PROJECT_OPEN:
      case WebsiteEvent.CERTIFICATION_OPEN:
      case WebsiteEvent.RESUME_CLICK:
        isNotice = true;
        animName = isFlight ? 'pm0006_00_00_20560_notice01' : 'pm0006_00_00_00560_notice01';
        break;

      case WebsiteEvent.CONTACT_SUCCESS:
      case WebsiteEvent.DOWNLOAD_COMPLETE:
      case WebsiteEvent.PORTFOLIO_FINISHED:
        isNotice = false;
        animName = isFlight ? 'pm0006_00_00_20300_roar01' : 'pm0006_00_00_00550_glad01';
        break;

      default:
        console.warn(`[InteractionController] Unknown WebsiteEvent: ${event}`);
        return false;
    }

    return this.triggerWebsiteEvent(animName, isNotice);
  }

  private triggerWebsiteEvent(animationName: string, isNotice: boolean): boolean {
    const now = Date.now();

    // Anti-spam for Notice: ignore duplicates within 1 second
    if (isNotice) {
      if (now - this.lastNoticeTime < 1000) {
        console.log(`[InteractionController] Notice event request ignored due to 1s cooldown`);
        return false;
      }
      this.lastNoticeTime = now;
    }

    const isBusy = 
      (this.isSleeping && this.isSleeping()) ||
      (this.isCharizardHidden && this.isCharizardHidden()) ||
      (this.isTransitionActive && this.isTransitionActive()) ||
      (this.activeInteractionType === 'ManualClick') ||
      (this.oneShotController.isPlaying() && this.activeInteractionType === 'WebsiteEvent');

    if (isBusy) {
      console.log(`[InteractionController] Charizard is busy. Queuing event: ${animationName}`);
      this.queuedEvent = { animationName, isNotice, timestamp: now };
      return false;
    }

    // Otherwise, play it immediately!
    this.playWebsiteEvent(animationName);
    return true;
  }

  private playWebsiteEvent(animationName: string): void {
    if (!this.oneShotController.hasPool()) return;

    this.savedMovementAction = this.getMovementAction ? this.getMovementAction() : null;
    this.savedMovementName = this.getFSMAnimationName ? this.getFSMAnimationName() : null;

    this.activeInteractionType = 'WebsiteEvent';

    const started = this.oneShotController.play(
      this.savedMovementAction,
      this.onOneShotEnd.bind(this),
      (action) => {
        if (this.onInteractionStart) {
          this.onInteractionStart(action);
        }
        // Force the owner ref update to keep viewer aligned
        this.activeInteractionType = 'WebsiteEvent';
      },
      animationName
    );

    if (started) {
      console.log(`[InteractionController] WebsiteEvent animation started: ${animationName}`);
    } else {
      this.activeInteractionType = 'None';
    }
  }

  checkQueuedEvent(): void {
    if (!this.queuedEvent) return;

    // If still busy, do not dequeue yet
    const isBusy =
      (this.isSleeping && this.isSleeping()) ||
      (this.isCharizardHidden && this.isCharizardHidden()) ||
      (this.isTransitionActive && this.isTransitionActive()) ||
      this.oneShotController.isPlaying();

    if (isBusy) {
      return;
    }

    const { animationName, isNotice, timestamp } = this.queuedEvent;
    this.queuedEvent = null;

    // If it's a notice and is older than 1 second, discard
    if (isNotice && Date.now() - timestamp > 1000) {
      console.log(`[InteractionController] Discarding queued Notice event (stale)`);
      return;
    }

    console.log(`[InteractionController] Playing queued event: ${animationName}`);
    this.playWebsiteEvent(animationName);
  }

  isInteractionActive(): boolean {
    return this.oneShotController.isPlaying();
  }

  forceStopInteraction(restoreAction: THREE.AnimationAction | null): void {
    this.oneShotController.forceStop(restoreAction);
  }

  getOneShotState(): OneShotState {
    return this.oneShotController.getCurrentState();
  }

  getDebugInfo(): InteractionDebugInfo {
    const state = this.oneShotController.getCurrentState();
    const owner = this.oneShotController.getAnimationOwner();
    const interactionAction = state.isActive && state.currentAnimationName
      ? this.actions[state.currentAnimationName]
      : null;
    const movementAction = this.getMovementAction ? this.getMovementAction() : null;
    return {
      interactionActive: state.isActive,
      currentOneShot: state.currentLabel || 'None',
      previousAnimationName: this.savedMovementName || 'None',
      queuedState: this.getFSMAnimationName ? (this.getFSMAnimationName() ?? 'None') : 'None',
      poolSize: this.oneShotController.getPoolSize(),
      mode: this.mode,
      animationOwner: owner,
      interactionWeight: interactionAction ? interactionAction.getEffectiveWeight() : 0,
      locomotionWeight: movementAction ? movementAction.getEffectiveWeight() : 0,
      currentLocomotionClip: movementAction ? movementAction.getClip().name : 'None',
      currentInteractionClip: state.currentAnimationName || 'None',
    };
  }
}
