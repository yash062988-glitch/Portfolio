import { CharacterState, StateContext } from './CharacterState';
import { MovementConfig } from '../Config';

/**
 * State Definition
 * Describes the behavior and properties of each state
 */
export interface StateDefinition {
  name: CharacterState;
  animationMapping: {
    idle: string | null;
    walk: string | null;
    run: string | null;
  };
  canTransitionFrom: CharacterState[];
  /**
   * Calculate optimal animation speed multiplier
   */
  getAnimationSpeed: (context: StateContext) => number;
  /**
   * Determine if this state should transition based on context
   */
  shouldTransition: (context: StateContext) => { shouldTransition: boolean; targetState: CharacterState; reason: string } | null;
}

/**
 * State definitions
 * Each state knows:
 * - Which animation to play
 * - How to calculate animation speed
 * - When it should transition
 */
export const StateDefinitions: Record<CharacterState, StateDefinition> = {
  [CharacterState.Idle]: {
    name: CharacterState.Idle,
    animationMapping: { idle: null, walk: null, run: null },
    canTransitionFrom: [CharacterState.Walk, CharacterState.Run, CharacterState.Turn],
    getAnimationSpeed: () => 1.0,
    shouldTransition: (context: StateContext) => {
      // Idle transitions to movement when speed increases
      if (context.currentSpeed > 0.1) {
        const targetState = context.distanceToTarget > MovementConfig.runDistanceThreshold
          ? CharacterState.Run
          : CharacterState.Walk;
        return {
          shouldTransition: true,
          targetState,
          reason: 'Movement started - character needs to move',
        };
      }
      return null;
    },
  },

  [CharacterState.Walk]: {
    name: CharacterState.Walk,
    animationMapping: { idle: null, walk: null, run: null },
    canTransitionFrom: [CharacterState.Idle, CharacterState.Run, CharacterState.Turn],
    getAnimationSpeed: (context: StateContext) => {
      // Scale animation speed with movement speed
      return Math.min(context.currentSpeed / MovementConfig.walkSpeed, 1.5);
    },
    shouldTransition: (context: StateContext) => {
      // Walk transitions to run if distance is large
      if (context.distanceToTarget > MovementConfig.runDistanceThreshold && context.currentSpeed > MovementConfig.walkSpeed * 0.5) {
        return {
          shouldTransition: true,
          targetState: CharacterState.Run,
          reason: 'Distance threshold crossed - switching to run',
        };
      }
      // Walk transitions to idle if stopped
      if (context.currentSpeed < 0.1) {
        return {
          shouldTransition: true,
          targetState: CharacterState.Idle,
          reason: 'Movement stopped - returning to idle',
        };
      }
      return null;
    },
  },

  [CharacterState.Run]: {
    name: CharacterState.Run,
    animationMapping: { idle: null, walk: null, run: null },
    canTransitionFrom: [CharacterState.Idle, CharacterState.Walk, CharacterState.Turn],
    getAnimationSpeed: (context: StateContext) => {
      return Math.min(context.currentSpeed / MovementConfig.runSpeed, 1.5);
    },
    shouldTransition: (context: StateContext) => {
      // Run transitions to walk if close enough
      if (context.distanceToTarget <= MovementConfig.runDistanceThreshold) {
        return {
          shouldTransition: true,
          targetState: CharacterState.Walk,
          reason: 'Within walking distance - slowing down',
        };
      }
      // Run transitions to idle if stopped
      if (context.currentSpeed < 0.1) {
        return {
          shouldTransition: true,
          targetState: CharacterState.Idle,
          reason: 'Movement stopped - returning to idle',
        };
      }
      return null;
    },
  },

  [CharacterState.Turn]: {
    name: CharacterState.Turn,
    animationMapping: { idle: null, walk: null, run: null },
    canTransitionFrom: [CharacterState.Idle, CharacterState.Walk, CharacterState.Run],
    getAnimationSpeed: () => 1.0,
    shouldTransition: (context: StateContext) => {
      // Turn transitions to movement when rotation complete
      if (context.rotationComplete) {
        const targetState = context.distanceToTarget > MovementConfig.runDistanceThreshold
          ? CharacterState.Run
          : CharacterState.Walk;
        return {
          shouldTransition: true,
          targetState,
          reason: 'Rotation complete - starting movement',
        };
      }
      return null;
    },
  },

  [CharacterState.Transition]: {
    name: CharacterState.Transition,
    animationMapping: { idle: null, walk: null, run: null },
    canTransitionFrom: [CharacterState.Idle, CharacterState.Walk, CharacterState.Run, CharacterState.Turn],
    getAnimationSpeed: () => 1.0,
    shouldTransition: (context: StateContext) => {
      // Transition state is temporary - always move to final state
      if (context.animationComplete) {
        return {
          shouldTransition: true,
          targetState: CharacterState.Idle,
          reason: 'Transition animation complete',
        };
      }
      return null;
    },
  },
};

/**
 * Get the animation name for a state
 * Animation names are set externally by the animation system
 */
export function getAnimationNameForState(state: CharacterState, animationNames: { idle: string | null; walk: string | null; run: string | null }): string | null {
  switch (state) {
    case CharacterState.Idle:
      return animationNames.idle;
    case CharacterState.Walk:
      return animationNames.walk;
    case CharacterState.Run:
      return animationNames.run;
    case CharacterState.Turn:
      // Turn uses idle animation while rotating
      return animationNames.idle;
    case CharacterState.Transition:
      return null;
    default:
      return null;
  }
}
