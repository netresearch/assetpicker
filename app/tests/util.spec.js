import { describe, it, expect } from 'vitest';
import { formatTime } from '../src/util/format.js';

describe('formatTime', () => {
  it('pads to HH:MM:SS', () => {
    expect(formatTime(0)).toBe('00:00:00');
    expect(formatTime(65)).toBe('00:01:05');
    expect(formatTime(3661)).toBe('01:01:01');
  });

  it('coerces non-numeric input to zero', () => {
    expect(formatTime('nope')).toBe('00:00:00');
  });
});
