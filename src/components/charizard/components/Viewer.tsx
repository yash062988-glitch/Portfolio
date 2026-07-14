"use client";
import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Center, Bounds, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { Loading } from './Loading';
// import { AnimationPanel } from './AnimationPanel';
import { MovementConfig, FlightConfig } from '../Config';
import { StateMachine, CharacterState } from '../fsm';
import { InteractionController, InteractionDebugInfo } from '../InteractionController';
import { GroundAnimationManifest, getGroundInteractionPool, getMovementAnimations, getFlightTransitionAnimations, validateAgainstGroundManifest, isGroundLoop, SleepAnimations } from '../GroundAnimationManifest';
import { FlightAnimationManifest, getFlightInteractionPool, getFlightHoverIdle, validateAgainstFlightManifest, isFlightLoop, getFlightMovementAnimations } from '../FlightAnimationManifest';
import { FlightController, FlightPhase, FlightDebugInfo, FlightMode, GROUND_IDLE_CROSSFADE } from '../FlightController';
import { HeadTrackingController, HeadTrackingDebugInfo, LocomotionContext, SuppressReason } from '../controllers/HeadTrackingController';
import { SleepController } from '../controllers/SleepController';

// Feature flag — set to true to re-enable procedural head tracking
const ENABLE_HEAD_TRACKING = false;

const MODEL_URL = '/models/charizard.glb';

export type AnimationOwnerName =
  | 'GroundFSM'
  | 'FlightFSM'
  | 'SleepController'
  | 'InteractionController'
  | 'TakeoffController'
  | 'LandingController'
  | 'System';

const OwnerPriority: Record<AnimationOwnerName, number> = {
  'InteractionController': 6,
  'SleepController': 5,
  'TakeoffController': 4,
  'LandingController': 3,
  'FlightFSM': 2,
  'GroundFSM': 1,
  'System': 0,
};

export function Viewer() {
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const [currentAnimationName, setCurrentAnimationName] = useState<string>('');
  const [animationDuration, setAnimationDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flight mode state — manual toggle via debug toolbar
  const [flightMode, setFlightMode] = useState<'Ground' | 'Flight'>('Ground');

  // Debug state - FSM info
  const [debugInfo, setDebugInfo] = useState({
    speed: 0,
    state: 'Idle',
    previousState: 'Idle',
    distance: 0,
    targetX: 0,
    targetZ: 0,
    positionX: 0,
    positionZ: 0,
    transitionReason: 'Initial state',
    movementMode: 'Walk',
    role: 'Unknown',
    flightAnim: 'None',
    flightThreshold: FlightConfig.flightDistanceThreshold,
    requestedAnim: 'None',
    previousAnim: 'None',
    activeOwner: 'System',
  });

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const currentOwnerRef = useRef<AnimationOwnerName>('System');
  const fsmRef = useRef<StateMachine>(new StateMachine());
  const interactionControllerRef = useRef<InteractionController>(new InteractionController());
  const flightControllerRef = useRef<FlightController>(new FlightController(FlightConfig));

  // Head tracking controller (Phase 5) — procedural neck + head cursor tracking
  // Dormant when ENABLE_HEAD_TRACKING is false — ref exists but never updated
  const headTrackingRef = useRef<HeadTrackingController>(new HeadTrackingController());
  const sleepControllerRef = useRef<SleepController>(new SleepController());
  const [headTrackingDebug, setHeadTrackingDebug] = useState<HeadTrackingDebugInfo>({
    enabled: ENABLE_HEAD_TRACKING,
    trackingWeight: 1,
    headYaw: 0,
    headPitch: 0,
    neckRotation: 0,
    cursorTargetX: 0,
    cursorTargetY: 0,
    cursorTargetZ: 0,
    neckBoneName: 'None',
    headBoneName: 'None',
    updateRate: 60,
  });

  // Shared refs — accessible by both Viewer buttons and ModelWithControls
  const groupRef = useRef<THREE.Group>(null);
  const targetPositionRef = useRef(new THREE.Vector3());
  const autoFlightTriggeredRef = useRef(false);

  // Click & Double click interaction state/refs
  interface FloatingEmoji {
    id: number;
    text: string;
    x: number;
    y: number;
    dx: number;
    dy: number;
  }
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Interaction debug state
  const [interactionDebug, setInteractionDebug] = useState<InteractionDebugInfo>({
    interactionActive: false,
    currentOneShot: 'None',
    previousAnimationName: 'None',
    queuedState: 'None',
    poolSize: 0,
    mode: 'Ground',
    animationOwner: 'None',
    interactionWeight: 0,
    locomotionWeight: 0,
    currentLocomotionClip: 'None',
    currentInteractionClip: 'None',
  });

  const [flightDebug, setFlightDebug] = useState<FlightDebugInfo>(
    flightControllerRef.current.getDebugInfo()
  );

  const validateRequiredRoles = (loadedClips: THREE.AnimationClip[]) => {
    const clipNames = new Set(loadedClips.map(c => c.name));

    const required = [
      // Ground
      { role: 'Ground Idle', clip: 'pm0006_00_00_00010_defaultidle01' },
      { role: 'Ground Walk', clip: 'pm0006_00_00_00030_walk01_loop' },
      { role: 'Ground Run', clip: 'pm0006_00_00_00100_run01_loop' },
      // Flight
      { role: 'Flight Hover', clip: 'pm0006_00_00_20000_defaultwait01_loop' },
      { role: 'Flight Cruise', clip: 'pm0006_00_00_20030_walk01_loop' },
      { role: 'Flight Fast Flight', clip: 'pm0006_00_00_20100_run01_loop' },
      // Sleep
      { role: 'Sleep Prepare', clip: SleepAnimations.start },
      { role: 'Sleep Sleep', clip: SleepAnimations.loop },
      { role: 'Sleep Wake', clip: SleepAnimations.end },
    ];

    console.group('[Manifest Validation] Required Roles Audit');
    required.forEach(item => {
      if (clipNames.has(item.clip)) {
        console.log(`[PASS] Role: "${item.role}" -> Resolved to valid clip "${item.clip}"`);
      } else {
        console.warn(`[WARN] Role: "${item.role}" -> MISSING clip "${item.clip}"!`);
      }
    });
    console.groupEnd();
  };

  const handleAnimationsLoaded = useCallback((loadedAnimations: THREE.AnimationClip[]) => {
    setAnimations(loadedAnimations);
    validateRequiredRoles(loadedAnimations);
  }, []);

  const handleMixerReady = useCallback((mixer: THREE.AnimationMixer, actions: Record<string, THREE.AnimationAction>) => {
    mixerRef.current = mixer;
    actionsRef.current = actions;

    if (Object.keys(actions).length > 0) {
      const firstName = Object.keys(actions)[0];
      const action = actions[firstName];
      if (action) {
        action.reset().play();
        currentActionRef.current = action;
        setCurrentAnimationName(firstName);
        setAnimationDuration(action.getClip().duration);
      }
    }
  }, []);

  // Play animation - used by FSM and AnimationPanel
  // gated=true: skip while a one-shot is active (FSM-driven calls only)
  // restoreOnly=true: update tracking refs but don't touch THREE actions (used after one-shot restore)
  // Play animation - used by FSM, sleep, flight, and interaction controllers
  // gated=true: skip while a one-shot is active (FSM-driven calls only)
  // restoreOnly=true: update tracking refs but don't touch THREE actions (used after one-shot restore)
  const handlePlayAnimation = useCallback((
    name: string,
    owner: string,
    role: string,
    reason: string,
    gated = false,
    restoreOnly = false,
    crossfadeDuration = GROUND_IDLE_CROSSFADE
  ) => {
    const currentName = currentActionRef.current?.getClip().name ?? 'None';

    // 1. Replay Prevention
    if (name === currentName && currentActionRef.current?.isRunning()) {
      return;
    }

    // 2. Ownership Priority Verification
    const reqPriority = OwnerPriority[owner as AnimationOwnerName] ?? 0;
    const activePriority = OwnerPriority[currentOwnerRef.current] ?? 0;

    // Sleep clips bypass standard sleep owner check
    const isSleepClip = name === SleepAnimations.start ||
      name === SleepAnimations.loop ||
      name === SleepAnimations.end;

    if (gated && interactionControllerRef.current.isInteractionActive()) {
      console.log(`[Viewer Request] REJECTED | Reason: blocked by active interaction | Caller: ${owner} | Clip: ${name}`);
      return;
    }

    if (!isSleepClip && sleepControllerRef.current.isOwningMovement()) {
      console.log(`[Viewer Request] REJECTED | Reason: blocked by sleep controller | Caller: ${owner} | Clip: ${name}`);
      return;
    }

    if (gated && flightControllerRef.current.isActive()) {
      console.log(`[Viewer Request] REJECTED | Reason: blocked by flight gate | Caller: ${owner} | Clip: ${name}`);
      return;
    }

    if (reqPriority < activePriority) {
      console.log(
        `[Viewer Request] REJECTED | Reason: lower priority | Caller: ${owner} (${reqPriority}) | Active: ${currentOwnerRef.current} (${activePriority}) | Clip: ${name}`
      );
      return;
    }

    // Accept request, update owner
    const prevOwner = currentOwnerRef.current;
    currentOwnerRef.current = owner as AnimationOwnerName;

    const mixer = mixerRef.current;
    const actions = actionsRef.current;
    const previousAction = currentActionRef.current;

    if (!actions[name] || !mixer) {
      console.log(`[Viewer Request] REJECTED | Reason: invalid clip or missing mixer | Clip: ${name}`);
      return;
    }

    const newAction = actions[name];
    if (!newAction) {
      console.log(`[Viewer Request] REJECTED | Reason: invalid clip | Clip: ${name}`);
      return;
    }

    // 3. Centralized Animation Change Logging
    console.log(
      `========== ANIMATION TRANSITION ==========\n` +
      `Owner Change:  ${prevOwner} (${OwnerPriority[prevOwner]}) -> ${owner} (${reqPriority})\n` +
      `Role:          ${role}\n` +
      `Previous Clip: ${currentName}\n` +
      `New Clip:      ${name}\n` +
      `Reason:        ${reason}\n` +
      `==========================================`
    );

    // Update tracking state
    currentActionRef.current = newAction;
    setCurrentAnimationName(name);
    const clip = newAction.getClip();
    if (clip) setAnimationDuration(clip.duration);
    setIsPlaying(true);

    setDebugInfo(prev => ({
      ...prev,
      requestedAnim: name,
      previousAnim: currentName,
      transitionReason: reason,
      role: role,
      activeOwner: owner,
    }));

    // restoreOnly: OneShotController already started the fade-in, just sync refs
    if (restoreOnly) {
      return;
    }

    // Smooth manual crossfade: fade out the previous active action and fade in the new one
    if (previousAction && previousAction !== newAction) {
      previousAction.fadeOut(crossfadeDuration);
    }

    newAction.reset();
    newAction.setEffectiveTimeScale(1);
    newAction.setEffectiveWeight(1);
    newAction.fadeIn(crossfadeDuration);
    newAction.play();
  }, []);

  const handleCharizardClick = useCallback((x: number, y: number) => {
    sleepControllerRef.current.forceWake();
    sleepControllerRef.current.notifyActivity();
    
    // Choose animation based on flight status
    const isAirborne = flightControllerRef.current.isActive();
    const attackAnim = isAirborne 
      ? 'pm0006_00_00_20450_rangeattack01' 
      : 'pm0006_00_00_00450_rangeattack01';
      
    if (actionsRef.current && actionsRef.current[attackAnim]) {
      const action = actionsRef.current[attackAnim];
      const duration = action.getClip().duration;
      
      handlePlayAnimation(attackAnim, 'InteractionController', 'Click Fire Attack', 'Single click trigger', false, false);
      
      setTimeout(() => {
        const isStillAirborne = flightControllerRef.current.isActive();
        const restoreAnim = isStillAirborne 
          ? 'pm0006_00_00_20000_defaultwait01_loop'
          : 'pm0006_00_00_00010_defaultidle01';
          
        const restoreOwner = isStillAirborne ? 'FlightFSM' : 'GroundFSM';
        const restoreRole = isStillAirborne ? 'Flight Hover' : 'Ground Idle';
        
        handlePlayAnimation(restoreAnim, restoreOwner, restoreRole, 'Restore after click interaction', false, false);
      }, (duration + 0.1) * 1000);
    }
    
    // Spawn fire emojis
    const fireEmojis = ['🔥', '🔥', '☄️', '💥', '💨', '🔥'];
    const newEmojis = Array.from({ length: 12 }).map((_, idx) => ({
      id: Date.now() + idx,
      text: fireEmojis[Math.floor(Math.random() * fireEmojis.length)],
      x: x,
      y: y,
      dx: (Math.random() - 0.5) * 240,
      dy: -150 - Math.random() * 200,
    }));
    setEmojis((prev) => [...prev, ...newEmojis]);
    
    setTimeout(() => {
      setEmojis((prev) => prev.filter((e) => !newEmojis.find((ne) => ne.id === e.id)));
    }, 1500);
    
    const fireMessages = [
      "🔥 Flamethrower! Feel the heat!",
      "🔥 Charizard, use Fire Blast!",
      "🔥 Clearing the compiler with fire!",
      "🔥 Roar! Ready to battle!",
      "🔥 Dragon breath active!"
    ];
    const msg = fireMessages[Math.floor(Math.random() * fireMessages.length)];
    setBubbleText(msg);
    
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setBubbleText(null);
    }, 3000);
  }, [handlePlayAnimation, actionsRef]);

  const handleCharizardDoubleClick = useCallback((x: number, y: number) => {
    sleepControllerRef.current.forceWake();
    sleepControllerRef.current.notifyActivity();
    
    const isAirborne = flightControllerRef.current.isActive();
    const roarAnim = isAirborne 
      ? 'pm0006_00_00_20300_roar01' 
      : 'pm0006_00_00_00300_roar01';
      
    if (actionsRef.current && actionsRef.current[roarAnim]) {
      const action = actionsRef.current[roarAnim];
      const duration = action.getClip().duration;
      
      handlePlayAnimation(roarAnim, 'InteractionController', 'Click Roar Attack', 'Double click trigger', false, false);
      
      setTimeout(() => {
        const isStillAirborne = flightControllerRef.current.isActive();
        const restoreAnim = isStillAirborne 
          ? 'pm0006_00_00_20000_defaultwait01_loop'
          : 'pm0006_00_00_00010_defaultidle01';
          
        const restoreOwner = isStillAirborne ? 'FlightFSM' : 'GroundFSM';
        const restoreRole = isStillAirborne ? 'Flight Hover' : 'Ground Idle';
        
        handlePlayAnimation(restoreAnim, restoreOwner, restoreRole, 'Restore after double click interaction', false, false);
      }, (duration + 0.1) * 1000);
    }
    
    // Spawn combat emojis
    const combatEmojis = ['⚡', '💥', '🐉', '💢', '💨', '💥'];
    const newEmojis = Array.from({ length: 12 }).map((_, idx) => ({
      id: Date.now() + idx,
      text: combatEmojis[Math.floor(Math.random() * combatEmojis.length)],
      x: x,
      y: y,
      dx: (Math.random() - 0.5) * 240,
      dy: -150 - Math.random() * 200,
    }));
    setEmojis((prev) => [...prev, ...newEmojis]);
    
    setTimeout(() => {
      setEmojis((prev) => prev.filter((e) => !newEmojis.find((ne) => ne.id === e.id)));
    }, 1500);
    
    const roarMessages = [
      "🦖 RROOOOOAAARRR!",
      "⚡ Double click power! Over 9000!",
      "🐉 Dragon Claw! Critical hit!",
      "💥 Seismic Toss! Ground shaking!",
      "🦖 RAWR! Feel the dragon rage!"
    ];
    const msg = roarMessages[Math.floor(Math.random() * roarMessages.length)];
    setBubbleText(msg);
    
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setBubbleText(null);
    }, 3000);
  }, [handlePlayAnimation, actionsRef]);

  const releaseAnimationOwner = useCallback((owner: string) => {
    if (currentOwnerRef.current === owner) {
      currentOwnerRef.current = 'System';
      setDebugInfo(prev => ({
        ...prev,
        activeOwner: 'System',
      }));
    }
  }, []);

  const initializeLocomotionState = useCallback((mode: 'Ground' | 'Flight') => {
    if (mode === 'Flight') {
      console.log('[Viewer] Initializing Flight Locomotion State');
      fsmRef.current.requestStateChange(CharacterState.Idle, 'Flight locomotion init reset');
      flightControllerRef.current.resetLocomotionSpeed();
      currentOwnerRef.current = 'FlightFSM';

      // Symmetrical manifest-driven ground locomotion cleanup: stop, disable, set weight = 0
      const groundLocoNames = GroundAnimationManifest.movement.map(e => e.name);
      if (actionsRef.current) {
        for (const name of groundLocoNames) {
          const action = actionsRef.current[name];
          if (action) {
            action.stop();
            action.enabled = false;
            action.setEffectiveWeight(0);
          }
        }
      }

      const hoverAnim = getFlightMovementAnimations().idleLoop;
      if (hoverAnim) {
        handlePlayAnimation(hoverAnim, 'FlightFSM', 'Flight Hover', 'Locomotion Mode Init (Flight)', false, false);
      }
    } else {
      console.log('[Viewer] Initializing Ground Locomotion State');
      fsmRef.current.requestStateChange(CharacterState.Idle, 'Ground locomotion init reset');
      currentOwnerRef.current = 'GroundFSM';

      // Symmetrical manifest-driven flight locomotion cleanup: stop, disable, set weight = 0
      const flightLocoNames = FlightAnimationManifest.movement.map(e => e.name);
      if (actionsRef.current) {
        for (const name of flightLocoNames) {
          const action = actionsRef.current[name];
          if (action) {
            action.stop();
            action.enabled = false;
            action.setEffectiveWeight(0);
          }
        }
      }

      const groundIdle = getMovementAnimations().idleLoop;
      if (groundIdle) {
        handlePlayAnimation(groundIdle, 'GroundFSM', 'Ground Idle', 'Locomotion Mode Init (Ground)', false, false);
      }
    }

    setDebugInfo(prev => ({
      ...prev,
      state: fsmRef.current.getCurrentState(),
      movementMode: mode === 'Flight' ? 'Fly' : 'Walk',
      speed: 0,
      role: mode === 'Flight' ? 'Flight Idle' : 'Ground Idle',
      requestedAnim: mode === 'Flight' ? (getFlightMovementAnimations().idleLoop ?? 'None') : (getMovementAnimations().idleLoop ?? 'None'),
      transitionReason: 'Mode initialization',
    }));
  }, [handlePlayAnimation]);

  // Initialize InteractionController once mixer + actions + FSM are ready
  const handleInteractionReady = useCallback((
    mixer: THREE.AnimationMixer,
    actions: Record<string, THREE.AnimationAction>,
    _movementNames: (string | null)[]
  ) => {
    const ic = interactionControllerRef.current;

    // Set up flight controller callbacks
    flightControllerRef.current.setCallbacks({
      getCurrentAnimationName: () => {
        const action = currentActionRef.current;
        if (!action) return null;
        const clip = action.getClip();
        return clip ? clip.name : null;
      },
      onFlightStart: () => {
        console.log('[Viewer] Flight started');
        setFlightMode('Flight');
        // Force-wake sleep FIRST — ensures sleep actions are stopped before
        // forceStopInteraction tries to use currentActionRef (which may point
        // to a sleep action).
        sleepControllerRef.current.forceWake();
        sleepControllerRef.current.notifyActivity();
        if (interactionControllerRef.current.isInteractionActive()) {
          interactionControllerRef.current.forceStopInteraction(currentActionRef.current);
        }
        // Force Ground FSM state to Idle immediately so it does not leak Ground locomotion clips
        fsmRef.current.requestStateChange(CharacterState.Idle, 'Takeoff start reset');
      },
      onFlightComplete: () => {
        releaseAnimationOwner('FlightFSM');
        releaseAnimationOwner('TakeoffController');
        releaseAnimationOwner('LandingController');
        console.log('[Viewer] Flight complete — awaiting shutdown finalization');
        autoFlightTriggeredRef.current = false;
        sleepControllerRef.current.notifyActivity();
      },
      onEnterFlightMode: () => {
        console.log('[Viewer] Entering flight mode — switching interaction pool');
        interactionControllerRef.current.switchToFlightMode();
        initializeLocomotionState('Flight');
        interactionControllerRef.current.checkQueuedEvent();
      },
      onExitFlightMode: () => {
        console.log('[Viewer] Exiting flight mode — switching interaction pool');
        interactionControllerRef.current.switchToGroundMode();
      },
      onFlightShutdownComplete: () => {
        console.log('[Viewer] Flight shutdown complete — enabling GroundController');
        setFlightMode('Ground');
        sleepControllerRef.current.notifyActivity();
        initializeLocomotionState('Ground');
        interactionControllerRef.current.checkQueuedEvent();

        const fsmAnim = fsmRef.current.getCurrentAnimationName();
        const currentActionName = currentActionRef.current?.getClip().name ?? 'None';

        // Part 3 — Viewer Ownership
        console.log(
          `========== CURRENT OWNER ==========\n\n` +
          `CurrentActionRef:\n${currentActionName}\n\n` +
          `Ground FSM Animation:\n${fsmAnim}\n\n` +
          `Flight Active:\n${flightControllerRef.current.isActive()}\n\n` +
          `Interaction Active:\n${interactionControllerRef.current.isInteractionActive()}\n\n` +
          `Sleep Active:\n${sleepControllerRef.current.isOwningMovement()}\n\n` +
          `===================================\n`
        );

        // Part 4 — Final Ownership Verification
        let highestWeightedAction: THREE.AnimationAction | null = null;
        let highestWeight = -1;
        if (actionsRef.current) {
          for (const act of Object.values(actionsRef.current)) {
            if (act && act.getEffectiveWeight() > highestWeight) {
              highestWeight = act.getEffectiveWeight();
              highestWeightedAction = act;
            }
          }
        }
        const highestWeightedName = highestWeightedAction ? highestWeightedAction.getClip().name : 'None';
        const match = highestWeightedName === currentActionName;

        console.log(
          `========== FINAL OWNER ==========\n\n` +
          `CurrentActionRef:\n${currentActionName}\n\n` +
          `Highest Weighted Action:\n${highestWeightedName}\n\n` +
          `Highest Effective Weight:\n${highestWeight.toFixed(4)}\n\n` +
          `Do they match?\n${match ? 'YES' : 'NO'}\n` +
          `=================================\n`
        );
      },
      getInteractionActive: () => interactionControllerRef.current.isInteractionActive(),
      getCurrentInteraction: () => {
        const state = interactionControllerRef.current.getOneShotState();
        return state.currentLabel || 'None';
      },
      getFSMState: () => fsmRef.current.getCurrentState() ?? 'Unknown',
      getGroundAnimWeight: () => {
        const action = currentActionRef.current;
        return action ? action.getEffectiveWeight() : 0;
      },
      playAnimation: handlePlayAnimation,
      releaseAnimationOwner: releaseAnimationOwner,
      getCurrentActionDetails: () => {
        const action = currentActionRef.current;
        if (!action) return null;
        return {
          name: action.getClip().name,
          weight: action.getEffectiveWeight(),
          time: action.time,
          loopMode: action.loop === THREE.LoopRepeat ? 'LoopRepeat' : action.loop === THREE.LoopOnce ? 'LoopOnce' : String(action.loop),
          running: action.isRunning(),
        };
      },
      isSleepOwningMovement: () => sleepControllerRef.current.isOwningMovement(),
      updateFSM: (context) => fsmRef.current.update(context),
    });

    ic.init(
      mixer,
      actions,
      () => currentActionRef.current,
      () => fsmRef.current.getCurrentAnimationName(),
      () => flightControllerRef.current.isActive(),
      ((_restoreAnimName) => {
        // ── Viewer is the single restore authority ──────────────────────────
        // After an interaction finishes, restore the correct locomotion:
        //   Flight mode → Flight locomotion (200xx)
        //   Ground mode → Ground locomotion (000xx via FSM)
        // Both paths go through handlePlayAnimation. The callback argument is
        // intentionally ignored — Viewer queries the correct source directly.
        releaseAnimationOwner('InteractionController');
        if (flightControllerRef.current.isActive()) {
          flightControllerRef.current.notifyInteractionComplete();
          sleepControllerRef.current.notifyActivity();
          const flightAnim = flightControllerRef.current.getFlightRestoreAnimation();
          if (flightAnim) {
            handlePlayAnimation(flightAnim, 'FlightFSM', 'Flight Locomotion', 'Interaction complete restore', false, false);
          }
        } else {
          const groundAnim = fsmRef.current.getCurrentAnimationName();
          sleepControllerRef.current.notifyActivity();
          if (groundAnim) {
            const role = fsmRef.current.getCurrentState() === CharacterState.Idle ? 'Ground Idle' : 'Ground Locomotion';
            handlePlayAnimation(groundAnim, 'GroundFSM', role, 'Interaction complete restore', false, false);
          }
        }
        setInteractionDebug(ic.getDebugInfo());
      }),
      { provider: getGroundInteractionPool, loopChecker: isGroundLoop },
      { provider: getFlightInteractionPool, loopChecker: isFlightLoop },
      () => sleepControllerRef.current.isOwningMovement(),
      // onInteractionStart: sync currentActionRef to the interaction action
      // immediately, so it never points to a stale locomotion action.
      (action) => {
        currentActionRef.current = action;
        currentOwnerRef.current = 'InteractionController';
        sleepControllerRef.current.notifyActivity();
        const clip = action.getClip();
        if (clip) {
          setCurrentAnimationName(clip.name);
          setAnimationDuration(clip.duration);
        }
        console.log(`[Owner] currentActionRef → interaction "${clip?.name ?? '?'}"`);
      },
      () => flightControllerRef.current.getPhase() !== FlightPhase.Inactive && flightControllerRef.current.getPhase() !== FlightPhase.Flying,
      () => document.hidden
    );

    // Initialize SleepController with mixer, actions, and head tracking
    // Pass null for head tracking when feature flag is off — SleepController null-guards all calls
    sleepControllerRef.current.init(
      mixer,
      actions,
      ENABLE_HEAD_TRACKING ? headTrackingRef.current : null,
      {
        onWakeComplete: () => {
          releaseAnimationOwner('SleepController');
          sleepControllerRef.current.notifyActivity();
          const idleName = fsmRef.current.getCurrentAnimationName();
          if (idleName) {
            handlePlayAnimation(idleName, 'GroundFSM', 'Ground Idle', 'Wake complete', false, false);
          }
          // Dequeue event if any
          interactionControllerRef.current.checkQueuedEvent();
        },
        isFlightActive: () => flightControllerRef.current.isActive(),
        isInteractionActive: () => interactionControllerRef.current.isInteractionActive(),
        isFSMIdle: () => fsmRef.current.getCurrentState() === CharacterState.Idle,
        isMoving: () => {
          const fsmState = fsmRef.current.getCurrentState();
          return fsmState === CharacterState.Walk
            || fsmState === CharacterState.Run
            || fsmState === CharacterState.Turn
            || fsmState === CharacterState.Transition;
        },
        playAnimation: (name, owner, role, reason, gated, restoreOnly, crossfadeDuration) => {
          handlePlayAnimation(name, owner as any, role, reason, gated, restoreOnly, crossfadeDuration);
        },
      }
    );
  }, [handlePlayAnimation]);

  const handlePause = useCallback(() => {
    if (currentActionRef.current) {
      currentActionRef.current.paused = true;
      setIsPlaying(false);
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (currentActionRef.current) {
      currentActionRef.current.paused = false;
      setIsPlaying(true);
    }
  }, []);

  const handleReset = useCallback(() => {
    const currentAction = currentActionRef.current;
    if (currentAction) {
      currentAction.stop();
      currentAction.reset();
      currentAction.play();
      setIsPlaying(true);
    }
  }, []);

  // Expose API and register page visibility listener
  useEffect(() => {
    const ic = interactionControllerRef.current;

    // Expose the public API under window.CharizardAPI strictly
    const WebsiteEvent = {
      NAVIGATION_HOVER: 'NAVIGATION_HOVER',
      PROJECT_HOVER: 'PROJECT_HOVER',
      PROJECT_OPEN: 'PROJECT_OPEN',
      CERTIFICATION_OPEN: 'CERTIFICATION_OPEN',
      CONTACT_SUCCESS: 'CONTACT_SUCCESS',
      RESUME_CLICK: 'RESUME_CLICK',
      DOWNLOAD_COMPLETE: 'DOWNLOAD_COMPLETE',
      PORTFOLIO_FINISHED: 'PORTFOLIO_FINISHED',
    } as const;

    (window as any).CharizardAPI = {
      playNotice: () => ic.playNotice(),
      playGlad: () => ic.playGlad(),
      triggerWebsiteInteraction: (event: string) => ic.triggerWebsiteInteraction(event),
      WebsiteEvent,
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        ic.checkQueuedEvent();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      ic.destroy();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      delete (window as any).CharizardAPI;
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-2">Failed to load model</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const hoverClipName = getFlightHoverIdle() || '';
  const walkClipName = getFlightMovementAnimations().walk || '';
  const runClipName = getFlightMovementAnimations().run || '';

  const hoverAction = actionsRef.current ? actionsRef.current[hoverClipName] : null;
  const walkAction = actionsRef.current ? actionsRef.current[walkClipName] : null;
  const runAction = actionsRef.current ? actionsRef.current[runClipName] : null;

  const hoverWeight = hoverAction ? hoverAction.getEffectiveWeight() : 0;
  const walkWeight = walkAction ? walkAction.getEffectiveWeight() : 0;
  const runWeight = runAction ? runAction.getEffectiveWeight() : 0;

  const hoverRunning = hoverAction ? hoverAction.isRunning() : false;
  const walkRunning = walkAction ? walkAction.isRunning() : false;
  const runRunning = runAction ? runAction.isRunning() : false;

  const hoverEnabled = hoverAction ? hoverAction.enabled : false;
  const walkEnabled = walkAction ? walkAction.enabled : false;
  const runEnabled = runAction ? runAction.enabled : false;

  const hoverTime = hoverAction ? hoverAction.time : 0;
  const walkTime = walkAction ? walkAction.time : 0;
  const runTime = runAction ? runAction.time : 0;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[40]">
      <Canvas
        shadows
        camera={{ position: [5, 3, 5], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1, alpha: true }}
        onError={(e) => setError(String(e))}
      >
        <fog attach="fog" args={['#000000', 10, 30]} />

        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />

        <Suspense fallback={null}>
          <ModelWithControls
            onAnimationsLoaded={handleAnimationsLoaded}
            onMixerReady={handleMixerReady}
            onInteractionReady={handleInteractionReady}
            setDebugInfo={setDebugInfo}
            setInteractionDebug={setInteractionDebug}
            setFlightDebug={setFlightDebug}
            getInteractionDebug={() => interactionControllerRef.current.getDebugInfo()}
            fsm={fsmRef.current}
            playAnimation={handlePlayAnimation}
            mixerRef={mixerRef}
            actionsRef={actionsRef}
            flightControllerRef={flightControllerRef}
            interactionControllerRef={interactionControllerRef}
            groupRef={groupRef}
            targetPositionRef={targetPositionRef}
            autoFlightTriggeredRef={autoFlightTriggeredRef}
            headTrackingRef={headTrackingRef}
            sleepControllerRef={sleepControllerRef}
            setHeadTrackingDebug={setHeadTrackingDebug}
            initializeLocomotionState={initializeLocomotionState}
            currentActionRef={currentActionRef}
            onCharizardClick={handleCharizardClick}
            onCharizardDoubleClick={handleCharizardDoubleClick}
            bubbleRef={bubbleRef}
          />
        </Suspense>

        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.6}
          scale={10}
          blur={2}
          far={4}
        />

        <Environment preset="city" />
      </Canvas>

      {/* Floating Control Buttons */}
      <div
        className="absolute bottom-6 right-6 flex items-center gap-3 z-50 pointer-events-auto select-none"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            const flight = flightControllerRef.current;
            if (flight.isActive()) {
              flight.requestGroundMode();
            }
          }}
          disabled={!flightControllerRef.current.isActive()}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border backdrop-blur-md cursor-pointer ${!flightControllerRef.current.isActive()
            ? 'bg-[#FAF5EF]/90 border-[#e9b15d] text-[#120c08] shadow-[0_4px_20px_rgba(233,177,93,0.35)] font-bold font-mono'
            : 'bg-black/30 hover:bg-black/60 border-white/10 text-white/70 hover:text-white font-mono'
            }`}
        >
          Ground
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const flight = flightControllerRef.current;
            if (!flight.isActive() && groupRef.current) {
              const pos = groupRef.current.position;
              const target = targetPositionRef.current;
              if (flight.requestTakeoff(target, pos, 'Button')) {
                setFlightMode('Flight');
                autoFlightTriggeredRef.current = false;
              }
            }
          }}
          disabled={flightControllerRef.current.isActive()}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border backdrop-blur-md cursor-pointer ${flightControllerRef.current.isActive()
            ? 'bg-[#FAF5EF]/90 border-[#e9b15d] text-[#120c08] shadow-[0_4px_20px_rgba(233,177,93,0.35)] font-bold font-mono'
            : 'bg-black/30 hover:bg-black/60 border-white/10 text-white/70 hover:text-white font-mono'
            }`}
        >
          Flight
        </button>
      </div>

      {/* CSS style keyframes for floating emojis */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUpEmoji {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          15% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.8);
            opacity: 0;
          }
        }
      `}} />

      {/* Floating Emojis */}
      <div className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden select-none">
        {emojis.map((emoji) => (
          <div
            key={emoji.id}
            style={{
              position: 'absolute',
              left: `${emoji.x}px`,
              top: `${emoji.y}px`,
              '--dx': `${emoji.dx}px`,
              '--dy': `${emoji.dy}px`,
              animation: 'floatUpEmoji 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
            } as React.CSSProperties}
            className="text-xl md:text-2xl pointer-events-none select-none"
          >
            {emoji.text}
          </div>
        ))}
      </div>

      {/* Speech Bubble */}
      {bubbleText && (
        <div
          ref={bubbleRef}
          style={{
            position: 'fixed',
            transform: 'translate(-50%, -130%)',
            zIndex: 99999,
          }}
          className="bg-black/90 text-white border border-[#e9b15d] px-4 py-2 rounded-xl shadow-[0_4px_20px_rgba(233,177,93,0.4)] pointer-events-none text-xs font-semibold whitespace-nowrap backdrop-blur-sm select-none font-mono"
        >
          {bubbleText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90" />
        </div>
      )}
    </div>
  );
}


interface ModelWithControlsProps {
  onAnimationsLoaded: (animations: THREE.AnimationClip[]) => void;
  onMixerReady: (mixer: THREE.AnimationMixer, actions: Record<string, THREE.AnimationAction>) => void;
  onInteractionReady: (
    mixer: THREE.AnimationMixer,
    actions: Record<string, THREE.AnimationAction>,
    movementNames: (string | null)[]
  ) => void;
  setDebugInfo: React.Dispatch<React.SetStateAction<{
    speed: number;
    state: string;
    previousState: string;
    distance: number;
    targetX: number;
    targetZ: number;
    positionX: number;
    positionZ: number;
    transitionReason: string;
    movementMode: string;
    role: string;
    flightAnim: string;
    flightThreshold: number;
    requestedAnim: string;
    previousAnim: string;
    activeOwner: string;
  }>>;
  setInteractionDebug: React.Dispatch<React.SetStateAction<InteractionDebugInfo>>;
  setFlightDebug: React.Dispatch<React.SetStateAction<FlightDebugInfo>>;
  getInteractionDebug: () => InteractionDebugInfo;
  fsm: StateMachine;
  playAnimation: (name: string, owner: AnimationOwnerName, role: string, reason: string, gated?: boolean, restoreOnly?: boolean) => void;
  mixerRef: React.MutableRefObject<THREE.AnimationMixer | null>;
  actionsRef: React.MutableRefObject<Record<string, THREE.AnimationAction>>;
  flightControllerRef: React.MutableRefObject<FlightController>;
  interactionControllerRef: React.MutableRefObject<InteractionController>;
  groupRef: React.MutableRefObject<THREE.Group | null>;
  targetPositionRef: React.MutableRefObject<THREE.Vector3>;
  autoFlightTriggeredRef: React.MutableRefObject<boolean>;
  headTrackingRef: React.MutableRefObject<HeadTrackingController>;
  sleepControllerRef: React.MutableRefObject<SleepController>;
  setHeadTrackingDebug: React.Dispatch<React.SetStateAction<HeadTrackingDebugInfo>>;
  initializeLocomotionState: (mode: 'Ground' | 'Flight') => void;
  currentActionRef: React.MutableRefObject<THREE.AnimationAction | null>;
  onCharizardClick: (x: number, y: number) => void;
  onCharizardDoubleClick: (x: number, y: number) => void;
  bubbleRef: React.RefObject<HTMLDivElement | null>;
}

function ModelWithControls({
  onAnimationsLoaded,
  onMixerReady,
  onInteractionReady,
  setDebugInfo,
  setInteractionDebug,
  setFlightDebug,
  getInteractionDebug,
  fsm,
  playAnimation,
  mixerRef,
  actionsRef,
  flightControllerRef,
  interactionControllerRef,
  groupRef,
  targetPositionRef,
  autoFlightTriggeredRef,
  headTrackingRef,
  sleepControllerRef,
  setHeadTrackingDebug,
  initializeLocomotionState,
  currentActionRef,
  onCharizardClick,
  onCharizardDoubleClick,
  bubbleRef,
}: ModelWithControlsProps) {
  const group = groupRef; // Use shared ref so Viewer buttons can access position
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, mixer } = useAnimations(animations, group);

  // Local mixer/actions refs — sync from useAnimations into the passed-in refs
  // so the parent (Viewer) and its controllers can access them.
  useEffect(() => {
    mixerRef.current = mixer ?? null;
  }, [mixer, mixerRef]);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const valid: Record<string, THREE.AnimationAction> = {};
      Object.entries(actions).forEach(([name, action]) => {
        if (action) valid[name] = action;
      });
      actionsRef.current = valid;
    }
  }, [actions, actionsRef]);

  // Movement refs - no allocations per frame
  const mousePosition = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const targetPosition = targetPositionRef; // Use shared ref so Viewer buttons can access

  const animNames = useRef<{ idle: string | null; walk: string | null; run: string | null }>({
    idle: null,
    walk: null,
    run: null,
  });

  // Idle variation timer — plays a random idle variation every 15-25 seconds
  const idleVariationTimer = useRef(0);
  const idleVariationInterval = useRef(15 + Math.random() * 10); // seconds
  const idleVariationActive = useRef(false);

  // Track mouse globally
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Detect animation names and initialize FSM
  useEffect(() => {
    if (animations.length > 0) {
      onAnimationsLoaded(animations);
      console.log('Animations loaded:', animations.length);
      console.table(
        animations.map((anim) => ({
          Name: anim.name,
          Duration: anim.duration.toFixed(2) + 's',
          Tracks: anim.tracks.length,
        }))
      );

      // Validate loaded animations against both manifests
      const actionNames = Object.keys(actions);
      const clips = animations.map(a => ({ name: a.name, duration: a.duration }));
      validateAgainstGroundManifest(clips);
      validateAgainstFlightManifest(clips);

      // Ground flight transition animations (000xx) — takeoff/landing
      const flightAnims = getFlightTransitionAnimations();
      flightControllerRef.current!.setAnimations(
        flightAnims.takeoff,
        flightAnims.fly,
        flightAnims.landingBegin,
        flightAnims.landingLoop,
        flightAnims.landingFinish
      );

      // Flight hover idle (200xx) — used while airborne
      const hoverIdle = getFlightHoverIdle();
      flightControllerRef.current!.setFlyHoverAnimation(hoverIdle);

      // Movement animations — exact 000xx names from manifest
      const movAnims = getMovementAnimations();
      animNames.current.idle = movAnims.idleLoop ?? actionNames[0];
      animNames.current.walk = movAnims.walk ?? animNames.current.idle;
      animNames.current.run = movAnims.run ?? animNames.current.walk;

      // Initialize FSM with animation names
      fsm.setAnimationNames(animNames.current);

      // Play initial idle loop
      initializeLocomotionState('Ground');

      // Subscribe to FSM state changes — gated so one-shots/sleep/flight aren't interrupted
      const unsubscribe = fsm.onStateChange((result) => {
        if (result.success && result.animationName) {
          const role = result.toState === CharacterState.Idle ? 'Ground Idle' :
            result.toState === CharacterState.Walk ? 'Ground Walk' : 'Ground Run';
          playAnimation(result.animationName, 'GroundFSM', role, `FSM state transition: ${result.toState}`, true);
        }
      });

      return unsubscribe;
    }
  }, [animations, actions, onAnimationsLoaded, fsm, playAnimation]);

  useEffect(() => {
    if (mixer && actions && Object.keys(actions).length > 0) {
      const validActions: Record<string, THREE.AnimationAction> = {};
      Object.entries(actions).forEach(([name, action]) => {
        if (action) validActions[name] = action;
      });
      if (Object.keys(validActions).length > 0) {
        onMixerReady(mixer, validActions);
        onInteractionReady(mixer, validActions, [
          animNames.current.idle,
          animNames.current.walk,
          animNames.current.run,
        ]);
      }
    }
  }, [mixer, actions, onMixerReady, onInteractionReady, animNames]);

  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    // Discover neck + head bones once for procedural head tracking (Phase 5)
    if (ENABLE_HEAD_TRACKING) headTrackingRef.current!.discoverBones(scene);
  }, [scene]);

  // Reusable vectors for frame updates
  const direction = useRef(new THREE.Vector3());
  const intersectPoint = useRef(new THREE.Vector3());
  const targetInitialized = useRef(false);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Clamp delta to avoid huge jumps after tab switch / pause
    const dt = Math.min(delta, 0.05);

    const { camera } = state;

    const flight = flightControllerRef.current!;
    const isNavbarOrbit = flight.isActive() && flight.getTriggerSource() === 'Button';
    if (isNavbarOrbit) {
      const t = state.clock.getElapsedTime();
      const speed = 0.6; // speed in rad/sec
      const theta = -t * speed; // clockwise rotation

      const Y_center = 0.82; // Centered near the top
      const RX = 0.75;      // Expanded width of the navbar orbit in NDC to cover full glass card
      const RY = 0.18;      // Height of the navbar orbit in NDC

      const ndcX = RX * Math.cos(theta);
      const ndcY = Y_center + RY * Math.sin(theta);

      raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hit = raycaster.current.ray.intersectPlane(groundPlane.current, intersectPoint.current);
      if (hit) {
        targetPosition.current.set(intersectPoint.current.x, 0, intersectPoint.current.z);
        targetInitialized.current = true;
      }
    } else {
      // Get world target from mouse — only update when ray actually hits the plane
      raycaster.current.setFromCamera(mousePosition.current, camera);
      const hit = raycaster.current.ray.intersectPlane(groundPlane.current, intersectPoint.current);
      if (hit) {
        targetPosition.current.set(intersectPoint.current.x, 0, intersectPoint.current.z);
        targetInitialized.current = true;
      }
    }

    // ── Auto-flight trigger ──────────────────────────────────────────────
    // If cursor Y is ~40px above Charizard's head AND grounded, auto-trigger flight.
    // Fires only once per ground-to-flight transition.
    if (flight.isFlightSystemEnabled()) {
      if (!flight.isActive() && !autoFlightTriggeredRef.current && group.current) {
        const charizardScreenPos = group.current.position.clone();
        charizardScreenPos.y += 2; // approximate head height
        const screenPos = charizardScreenPos.clone().project(camera);
        const cursorYPixels = ((1 - mousePosition.current.y) / 2) * window.innerHeight;
        const charizardHeadY = ((1 - screenPos.y) / 2) * window.innerHeight;
        if (cursorYPixels < charizardHeadY - 40) {
          autoFlightTriggeredRef.current = true;
          flight.requestTakeoff(targetPosition.current, group.current.position, 'Cursor');
        }
      }
    }

    const position = group.current.position;
    const quaternion = group.current.quaternion;

    const mixer = mixerRef.current;
    const actions = actionsRef.current;

    // 1. Sleep Update
    sleepControllerRef.current!.update(
      dt,
      mousePosition.current.x,
      mousePosition.current.y,
      state.camera,
      position,
      quaternion
    );
    const sleepFrozen = sleepControllerRef.current!.isOwningMovement();
    const interactionFrozen = interactionControllerRef.current.isInteractionActive();

    // Freeze flight/movement while interaction is active
    flight.setMovementFrozen(interactionFrozen);

    // Calculate camera facing quaternion (projected on XZ plane)
    const toCamera = new THREE.Vector3().subVectors(state.camera.position, position);
    toCamera.y = 0;
    let cameraFacingQuat: THREE.Quaternion | null = null;
    if (toCamera.lengthSq() > 0.001) {
      toCamera.normalize();
      const targetYaw = Math.atan2(toCamera.x, toCamera.z);
      cameraFacingQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw);
    }

    // Determine if all conditions are met to face camera
    const horizontalSpeed = flight.isActive()
      ? flight.getDebugInfo().horizontalSpeed
      : flight.getGroundSpeed();
    const isSpeedIdle = horizontalSpeed <= 0.1;

    const dirToTarget = new THREE.Vector3().subVectors(targetPosition.current, position);
    dirToTarget.y = 0;
    const distanceToTarget = dirToTarget.length();
    const isMovementComplete = flight.isActive()
      ? flightControllerRef.current.getLocomotionArrived()
      : (distanceToTarget <= MovementConfig.stoppingDistance);

    const isTransitionOrTakeoffOrLanding = flight.isActive() && flight.getPhase() !== FlightPhase.Flying;

    const isIdleFacingActive =
      isSpeedIdle &&
      isMovementComplete &&
      !interactionFrozen &&
      !isTransitionOrTakeoffOrLanding &&
      !sleepFrozen;

    // Apply facing rotation in Ground Mode
    if (isIdleFacingActive && !flight.isActive() && cameraFacingQuat) {
      quaternion.slerp(cameraFacingQuat, 1 - Math.exp(-3.5 * dt));
    }

    // 2. Main Locomotion Update (Ground & Flight movement)
    flight.update(
      dt,
      targetPosition.current,
      position,
      quaternion,
      mixer,
      actions || {},
      (isIdleFacingActive && flight.isActive()) ? cameraFacingQuat : null
    );

    // ── Inactive Locomotion Cleanup Pass ──────────────────────────────────────
    // After a crossfade completes, stop and disable any inactive animation actions 
    // that have reached zero weight. This ensures they do not consume resources or 
    // blend with the active clip.
    if (actions && currentActionRef.current) {
      const activeAction = currentActionRef.current;
      for (const [, action] of Object.entries(actions)) {
        if (action && action !== activeAction && action.isRunning()) {
          if (action.getEffectiveWeight() <= 0.001) {
            action.stop();
            action.enabled = false;
          }
        }
      }
    }

    // 3. Play Idle Variations
    if (
      fsm.getCurrentState() === CharacterState.Idle &&
      !interactionControllerRef.current.isInteractionActive() &&
      !flight.isActive() &&
      !idleVariationActive.current &&
      !sleepFrozen
    ) {
      idleVariationTimer.current += dt;
      if (idleVariationTimer.current >= idleVariationInterval.current) {
        idleVariationTimer.current = 0;
        idleVariationInterval.current = 15 + Math.random() * 10;

        const movAnims = getMovementAnimations();
        const variations = [movAnims.idleVariation1, movAnims.idleVariation2].filter(Boolean) as string[];
        if (variations.length > 0) {
          const pick = variations[Math.floor(Math.random() * variations.length)];
          const varAction = actions?.[pick];
          if (varAction) {
            idleVariationActive.current = true;
            const clip = varAction.getClip();
            varAction.reset();
            varAction.setLoop(THREE.LoopOnce, 1);
            varAction.clampWhenFinished = true;

            playAnimation(pick, 'GroundFSM', 'Idle Variation', 'Idle variation trigger', false, false);

            const restoreDuration = clip.duration + 0.5;
            setTimeout(() => {
              idleVariationActive.current = false;
              if (animNames.current.idle) {
                playAnimation(animNames.current.idle, 'GroundFSM', 'Ground Idle', 'Restore after idle variation', false, false);
              }
            }, restoreDuration * 1000);
          }
        }
      }
    } else if (
      fsm.getCurrentState() !== CharacterState.Idle ||
      interactionControllerRef.current.isInteractionActive() ||
      flight.isActive()
    ) {
      idleVariationTimer.current = 0;
    }

    // Calculate distance and direction for debug and tracking
    direction.current.subVectors(targetPosition.current, position);
    direction.current.y = 0;
    const distance = direction.current.length();

    // 4. Head Tracking Update
    if (ENABLE_HEAD_TRACKING) {
      let htSuppress: SuppressReason = 'none';
      if (interactionFrozen) {
        htSuppress = 'interaction';
      } else if (sleepFrozen) {
        htSuppress = 'sleep-start';
      } else if (flight.isActive()) {
        const flightPhase = flight.getPhase();
        if (flightPhase === 'Takeoff' || flightPhase === 'PreLaunch') {
          htSuppress = 'takeoff';
        } else if (flightPhase === 'LandingBegin') {
          htSuppress = 'landing-begin';
        } else if (flightPhase === 'LandingLoop') {
          htSuppress = 'landing-loop';
        } else if (flightPhase === 'LandingFinish') {
          htSuppress = 'landing-finish';
        }
      }

      if (htSuppress !== 'none') {
        headTrackingRef.current!.setSuppressed(htSuppress);
      } else {
        headTrackingRef.current!.clearSuppression();
        if (flight.isActive()) {
          headTrackingRef.current!.setLocomotionContext('flight');
        } else {
          const fsmState = fsm.getCurrentState();
          let htCtx: LocomotionContext = 'idle';
          if (fsmState === CharacterState.Run) htCtx = 'run';
          else if (fsmState === CharacterState.Walk || fsmState === CharacterState.Turn) htCtx = 'walk';
          headTrackingRef.current!.setLocomotionContext(htCtx);
        }
      }

      headTrackingRef.current!.setInteractionActive(interactionFrozen);
      headTrackingRef.current!.update(dt, targetPosition.current, position, quaternion, camera);
    }

    // 5. Throttled Debug Updates
    if (Math.random() < 0.1) {
      const fsmDebug = fsm.getDebugInfo();
      const fd = flight.enrichDebugInfo(
        flight.getDebugInfo(),
        position,
        targetPosition.current
      );
      const idRef = getInteractionDebug();
      const charizardScreenPos2 = position.clone(); charizardScreenPos2.y += 2;
      const sp2 = charizardScreenPos2.clone().project(camera);
      const cursorYPx = ((1 - mousePosition.current.y) / 2) * window.innerHeight;
      const headYPx = ((1 - sp2.y) / 2) * window.innerHeight;
      const enriched: typeof fd = {
        ...fd,
        cursorHeight: cursorYPx,
        headHeight: headYPx,
        aboveThreshold: cursorYPx < headYPx - 40,
        autoFlightTriggered: autoFlightTriggeredRef.current,
        interactionPool: idRef.mode === 'Flight' ? 'Flight' : 'Ground',
        poolSize: idRef.poolSize,
      };

      const speedVal = flight.isActive()
        ? fd.horizontalSpeed
        : flight.getGroundSpeed();

      setDebugInfo(prev => ({
        ...prev,
        speed: speedVal,
        state: fsmDebug.currentState,
        previousState: fsmDebug.previousState,
        distance: distance,
        targetX: targetPosition.current.x,
        targetZ: targetPosition.current.z,
        positionX: position.x,
        positionZ: position.z,
        transitionReason: fsmDebug.lastTransitionReason,
        movementMode: flight.isActive() ? fd.mode : (speedVal > 0.1 ? (distance > MovementConfig.runDistanceThreshold ? 'Run' : 'Walk') : 'Idle'),
        flightAnim: enriched.currentFlightAnimation,
      }));
      setFlightDebug(enriched);
      setInteractionDebug(idRef);
      if (ENABLE_HEAD_TRACKING) setHeadTrackingDebug(headTrackingRef.current!.getDebugInfo());
    }

    // Speech Bubble screen tracking
    if (bubbleRef.current && group.current) {
      const charizardScreenPos = group.current.position.clone();
      charizardScreenPos.y += flightControllerRef.current.isActive() ? 0.8 : 1.6;
      const screenPos = charizardScreenPos.clone().project(camera);
      const x = ((screenPos.x + 1) / 2) * window.innerWidth;
      const y = ((1 - screenPos.y) / 2) * window.innerHeight;
      bubbleRef.current.style.left = `${x}px`;
      bubbleRef.current.style.top = `${y}px`;
    }
  });

  return (
    <group 
      ref={group} 
      scale={0.45}
      onClick={(e) => {
        e.stopPropagation();
        const charizardScreenPos = group.current?.position.clone() || new THREE.Vector3();
        charizardScreenPos.y += flightControllerRef.current.isActive() ? 0.8 : 1.6;
        const screenPos = charizardScreenPos.clone().project(e.camera);
        const x = ((screenPos.x + 1) / 2) * window.innerWidth;
        const y = ((1 - screenPos.y) / 2) * window.innerHeight;
        onCharizardClick(x, y);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        const charizardScreenPos = group.current?.position.clone() || new THREE.Vector3();
        charizardScreenPos.y += flightControllerRef.current.isActive() ? 0.8 : 1.6;
        const screenPos = charizardScreenPos.clone().project(e.camera);
        const x = ((screenPos.x + 1) / 2) * window.innerWidth;
        const y = ((1 - screenPos.y) / 2) * window.innerHeight;
        onCharizardDoubleClick(x, y);
      }}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
