/**
 * Character States
 * All possible states the companion can be in
 */
export enum CharacterState {
  Idle = 'Idle',
  Walk = 'Walk',
  Run = 'Run',
  Turn = 'Turn',
  Transition = 'Transition',
}

/**
 * Events that trigger state transitions
 */
export enum StateEvent {
  DestinationChanged = 'DestinationChanged',
  MovementStarted = 'MovementStarted',
  MovementStopped = 'MovementStopped',
  RotationFinished = 'RotationFinished',
  AnimationFinished = 'AnimationFinished',
  StateChanged = 'StateChanged',
  SpeedChanged = 'SpeedChanged',
  DistanceThresholdCrossed = 'DistanceThresholdCrossed',
}

/**
 * State transition result
 */
export interface TransitionResult {
  success: boolean;
  fromState: CharacterState;
  toState: CharacterState;
  reason: string;
  animationName: string | null;
}

/**
 * State context - data available to states
 */
export interface StateContext {
  currentSpeed: number;
  targetSpeed: number;
  distanceToTarget: number;
  rotationComplete: boolean;
  animationComplete: boolean;
}
