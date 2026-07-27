import { describe, it, expect } from 'vitest';
import { createEventBus } from '../src/event-bus.js';

describe('event bus', () => {
  it('delivers emitted events with their payload', () => {
    const bus = createEventBus();
    const calls = [];
    bus.on('resize', (p) => calls.push(p));
    bus.emit('resize', 42);
    expect(calls).toEqual([42]);
  });

  it('stops delivering after off()', () => {
    const bus = createEventBus();
    const calls = [];
    const handler = (p) => calls.push(p);
    bus.on('config-loaded', handler);
    bus.off('config-loaded', handler);
    bus.emit('config-loaded', {});
    expect(calls).toEqual([]);
  });
});
