import { beforeEach, describe, expect, test } from 'vitest';
import { GodViewMode, type GodViewEvent } from '../src/godview/GodViewMode';

describe('GodViewMode', () => {
  let mode: GodViewMode;
  let events: GodViewEvent[];

  beforeEach(() => {
    mode = new GodViewMode();
    events = [];
    for (const name of ['enterStart', 'settled', 'exitStart', 'returned'] as const) {
      mode.on(name, () => events.push(name));
    }
  });

  test('starts in exploring', () => {
    expect(mode.state).toBe('exploring');
  });

  test('toggle from exploring starts the transition', () => {
    mode.toggle();
    expect(mode.state).toBe('transitioning');
    expect(events).toEqual(['enterStart']);
  });

  test('transition completion settles into godview', () => {
    mode.toggle();
    mode.notifyTransitionComplete();
    expect(mode.state).toBe('godview');
    expect(events).toEqual(['enterStart', 'settled']);
  });

  test('toggle from godview starts the return', () => {
    mode.toggle();
    mode.notifyTransitionComplete();
    mode.toggle();
    expect(mode.state).toBe('returning');
    expect(events).toEqual(['enterStart', 'settled', 'exitStart']);
  });

  test('return completion lands back in exploring', () => {
    mode.toggle();
    mode.notifyTransitionComplete();
    mode.toggle();
    mode.notifyTransitionComplete();
    expect(mode.state).toBe('exploring');
    expect(events).toEqual(['enterStart', 'settled', 'exitStart', 'returned']);
  });

  test('toggle is ignored mid-flight', () => {
    mode.toggle();
    mode.toggle();
    expect(mode.state).toBe('transitioning');
    expect(events).toEqual(['enterStart']);
  });

  test('requestExit leaves godview but is a no-op elsewhere', () => {
    mode.requestExit();
    expect(mode.state).toBe('exploring');

    mode.toggle();
    mode.requestExit();
    expect(mode.state).toBe('transitioning');

    mode.notifyTransitionComplete();
    mode.requestExit();
    expect(mode.state).toBe('returning');
    expect(events).toEqual(['enterStart', 'settled', 'exitStart']);
  });

  test('notifyTransitionComplete is ignored in stable states', () => {
    mode.notifyTransitionComplete();
    expect(mode.state).toBe('exploring');
    expect(events).toEqual([]);
  });
});
