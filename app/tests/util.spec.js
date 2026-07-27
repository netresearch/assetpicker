import { describe, it, expect } from 'vitest';
import { formatTime } from '../src/util/format.js';
import { getQueryParams, getQueryParam } from '../src/util/params.js';

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

describe('getQueryParams', () => {
  it('parses key/value pairs and decodes them', () => {
    expect(getQueryParams('?a=1&b=hello%20world')).toEqual({ a: '1', b: 'hello world' });
  });

  it('returns an empty null-prototype object for no query', () => {
    const params = getQueryParams('');
    expect(Object.getPrototypeOf(params)).toBeNull();
    expect(Object.keys(params)).toHaveLength(0);
  });

  it('drops prototype-polluting keys', () => {
    const params = getQueryParams('__proto__=x&constructor=y&safe=z');
    expect(params.safe).toBe('z');
    expect(Object.keys(params)).toEqual(['safe']);
    expect({}.polluted).toBeUndefined();
  });

  it('getQueryParam reads a single value', () => {
    expect(getQueryParam('to', '?to=https%3A%2F%2Fexample.com')).toBe('https://example.com');
  });
});
