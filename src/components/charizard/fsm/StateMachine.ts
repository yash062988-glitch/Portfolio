import { CharacterState, StateEvent, StateContext, TransitionResult } from './CharacterState';
import { isValidTransition, getStateForEvent } from './TransitionRules';
import { StateDefinitions, getAnimationNameForState } from './StateDefinitions';

type StateChangeListener = (result: TransitionResult) => void;
type EventListener = (event: StateEvent, data?: unknown) => void;

/**
 * Finite State Machine for Character Behavior
 *
 * Responsibilities:
 * - Manage state transitions
 * - Validate transitions
 * - Notify listeners of state changes
 * - Coordinate between movement and animation
 */
export class StateMachine {
  private currentState: CharacterState = CharacterState.Idle;
  private previousState: CharacterState = CharacterState.Idle;
  private animationNames: { idle: string | null; walk: string | null; run: string | null } = {
    idle: null,
    walk: null,
    run: null,
  };
  private lastTransitionReason: string = 'Initial state';
  private stateChangeListeners: StateChangeListener[] = [];
  private eventListeners: Map<StateEvent, EventListener[]> = new Map();

  constructor() {
    // Initialize event listeners map
    Object.values(StateEvent).forEach((event) => {
      this.eventListeners.set(event, []);
    });
  }

  /**
   * Set animation name mappings (called once when animations are loaded)
   */
  setAnimationNames(names: { idle: string | null; walk: string | null; run: string | null }): void {
    this.animationNames = { ...names };
  }

  /**
   * Get current state
   */
  getCurrentState(): CharacterState {
    return this.currentState;
  }

  /**
   * Get previous state
   */
  getPreviousState(): CharacterState {
    return this.previousState;
  }

  /**
   * Get last transition reason
   */
  getLastTransitionReason(): string {
    return this.lastTransitionReason;
  }

  /**
   * Get current animation name
   */
  getCurrentAnimationName(): string | null {
    return getAnimationNameForState(this.currentState, this.animationNames);
  }

  /**
   * Request a state change
   * Returns transition result with success status
   */
  requestStateChange(toState: CharacterState, reason: string = 'Requested'): TransitionResult {
    const result: TransitionResult = {
      success: false,
      fromState: this.currentState,
      toState,
      reason,
      animationName: null,
    };

    // Check if transition is valid
    if (!isValidTransition(this.currentState, toState)) {
      result.reason = `Invalid transition: ${this.currentState} -> ${toState}`;
      return result;
    }

    // Valid transition - execute it
    this.previousState = this.currentState;
    this.currentState = toState;
    this.lastTransitionReason = reason;

    result.success = true;
    result.animationName = getAnimationNameForState(toState, this.animationNames);

    // Notify listeners
    this.notifyStateChange(result);
    this.emit(StateEvent.StateChanged, result);

    return result;
  }

  /**
   * Handle an event that may trigger a state change
   */
  handleEvent(event: StateEvent, context?: StateContext): TransitionResult | null {
    this.emit(event, context);

    // Check for event-driven transitions first
    const targetState = getStateForEvent(event, this.currentState);
    if (targetState && isValidTransition(this.currentState, targetState)) {
      return this.requestStateChange(targetState, `Event: ${event}`);
    }

    // Check state-specific transition logic
    if (context) {
      const definition = StateDefinitions[this.currentState];
      const transition = definition.shouldTransition(context);
      if (transition && isValidTransition(this.currentState, transition.targetState)) {
        return this.requestStateChange(transition.targetState, transition.reason);
      }
    }

    return null;
  }

  /**
   * Update the FSM with current context
   * Called every frame to check for state transitions
   */
  update(context: StateContext): TransitionResult | null {
    const definition = StateDefinitions[this.currentState];
    const transition = definition.shouldTransition(context);

    if (transition && isValidTransition(this.currentState, transition.targetState)) {
      return this.requestStateChange(transition.targetState, transition.reason);
    }

    return null;
  }

  /**
   * Get animation speed multiplier for current state
   */
  getAnimationSpeed(context: StateContext): number {
    const definition = StateDefinitions[this.currentState];
    return definition.getAnimationSpeed(context);
  }

  /**
   * Add a state change listener
   */
  onStateChange(listener: StateChangeListener): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      const index = this.stateChangeListeners.indexOf(listener);
      if (index > -1) {
        this.stateChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add an event listener
   */
  on(event: StateEvent, listener: EventListener): () => void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }
    return () => {};
  }

  /**
   * Emit an event to listeners
   */
  private emit(event: StateEvent, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(event, data));
    }
  }

  /**
   * Notify all state change listeners
   */
  private notifyStateChange(result: TransitionResult): void {
    this.stateChangeListeners.forEach((listener) => listener(result));
  }

  /**
   * Get state info for debugging
   */
  getDebugInfo(): {
    currentState: CharacterState;
    previousState: CharacterState;
    animationName: string | null;
    lastTransitionReason: string;
  } {
    return {
      currentState: this.currentState,
      previousState: this.previousState,
      animationName: this.getCurrentAnimationName(),
      lastTransitionReason: this.lastTransitionReason,
    };
  }
}

/**
 * Singleton instance for global access
 */
let stateMachineInstance: StateMachine | null = null;

export function getStateMachine(): StateMachine {
  if (!stateMachineInstance) {
    stateMachineInstance = new StateMachine();
  }
  return stateMachineInstance;
}

export function resetStateMachine(): void {
  stateMachineInstance = new StateMachine();
}
