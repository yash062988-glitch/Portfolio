/**
 * Character Brain FSM Module
 *
 * Finite State Machine for controlling character behavior.
 * Completely independent from rendering.
 * Movement and Animation communicate through the FSM.
 */

export { CharacterState, StateEvent } from './CharacterState';
export type { StateContext, TransitionResult } from './CharacterState';
export { isValidTransition, getStateForEvent } from './TransitionRules';
export { StateDefinitions, getAnimationNameForState } from './StateDefinitions';
export type { StateDefinition } from './StateDefinitions';
export { StateMachine, getStateMachine, resetStateMachine } from './StateMachine';
