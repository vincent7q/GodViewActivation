export type GodViewState = 'exploring' | 'transitioning' | 'godview' | 'returning';
export type GodViewEvent = 'enterStart' | 'settled' | 'exitStart' | 'returned';

// The single owner of app mode. Camera flight, audio crossfade, grading
// and quote display all subscribe to its events; nothing else mutates
// the mode.
export class GodViewMode {
  private currentState: GodViewState = 'exploring';
  private readonly listeners = new Map<GodViewEvent, Array<() => void>>();

  get state(): GodViewState {
    return this.currentState;
  }

  on(event: GodViewEvent, handler: () => void): void {
    const handlers = this.listeners.get(event) ?? [];
    handlers.push(handler);
    this.listeners.set(event, handlers);
  }

  /** GodView button: enter from exploring, leave from godview.
   *  Ignored mid-flight to keep transitions clean. */
  toggle(): void {
    if (this.currentState === 'exploring') {
      this.setState('transitioning', 'enterStart');
    } else if (this.currentState === 'godview') {
      this.setState('returning', 'exitStart');
    }
  }

  /** ESC or tap: exits from godview, or aborts the outbound flight. */
  requestExit(): void {
    if (this.currentState === 'godview' || this.currentState === 'transitioning') {
      this.setState('returning', 'exitStart');
    }
  }

  /** Called by the camera transition when its tween finishes. */
  notifyTransitionComplete(): void {
    if (this.currentState === 'transitioning') {
      this.setState('godview', 'settled');
    } else if (this.currentState === 'returning') {
      this.setState('exploring', 'returned');
    }
  }

  private setState(state: GodViewState, event: GodViewEvent): void {
    this.currentState = state;
    for (const handler of this.listeners.get(event) ?? []) handler();
  }
}
