import { CharacterState, StateEvent } from './CharacterState';

/**
 * Valid state transitions
 * Format: [fromState, toState] -> valid transition
 */
const VALID_TRANSITIONS = new Map<CharacterState, Set<CharacterState>>([
  [CharacterState.Idle, new Set<CharacterState>([CharacterState.Walk, CharacterState.Run, CharacterState.Turn])],
  [CharacterState.Walk, new Set<CharacterState>([CharacterState.Idle, CharacterState.Run, CharacterState.Turn])],
  [CharacterState.Run, new Set<CharacterState>([CharacterState.Idle, CharacterState.Walk, CharacterState.Turn])],
  [CharacterState.Turn, new Set<CharacterState>([CharacterState.Walk, CharacterState.Run, CharacterState.Idle])],
  [CharacterState.Transition, new Set<CharacterState>([CharacterState.Idle, CharacterState.Walk, CharacterState.Run])],
]);

/**
 * Check if a transition is valid
 */
export function isValidTransition(from: CharacterState, to: CharacterState): boolean {
  if (from === to) return false;

  const allowedTransitions = VALID_TRANSITIONS.get(from);
  if (!allowedTransitions) return false;

  return allowedTransitions.has(to);
}

/**
 * Events that can trigger state changes
 */
const EVENT_TRANSITIONS: Map<StateEvent, { from: CharacterState; to: CharacterState }[]> = new Map([
  [StateEvent.MovementStarted, [
    { from: CharacterState.Idle, to: CharacterState.Turn },
    { from: CharacterState.Idle, to: CharacterState.Walk },
  ]],
  [StateEvent.MovementStopped, [
    { from: CharacterState.Walk, to: CharacterState.Idle },
    { from: CharacterState.Run, to: CharacterState.Idle },
    { from: CharacterState.Turn, to: CharacterState.Idle },
  ]],
  [StateEvent.RotationFinished, [
    { from: CharacterState.Turn, to: CharacterState.Walk },
    { from: CharacterState.Turn, to: CharacterState.Run },
  ]],
  [StateEvent.DistanceThresholdCrossed, [
    { from: CharacterState.Walk, to: CharacterState.Run },
    { from: CharacterState.Run, to: CharacterState.Walk },
  ]],
]);

/**
 * Get target state for an event from current state
 */
export function getStateForEvent(event: StateEvent, currentState: CharacterState): CharacterState | null {
  const transitions = EVENT_TRANSITIONS.get(event);
  if (!transitions) return null;

  const transition = transitions.find(t => t.from === currentState);
  return transition ? transition.to : null;
}
