import { describe, it, expect } from 'vitest';
import { resolveConfig, DEFAULT_CONFIG } from '../src/config.js';
import { createPicker } from '../src/use-picker.js';
import { createItem } from '../src/models/item.js';

describe('resolveConfig', () => {
  it('fills in the documented defaults for an empty config', () => {
    expect(resolveConfig()).toEqual(DEFAULT_CONFIG);
  });

  it('merges pick and proxy one level deep', () => {
    const resolved = resolveConfig({ pick: { limit: 5 }, proxy: { all: true } });
    expect(resolved.pick).toEqual({ limit: 5, types: ['file'], extensions: [] });
    expect(resolved.proxy).toEqual({ url: 'proxy.php?to={{url}}', all: true });
  });

  it('never inherits storages the caller did not configure', () => {
    expect(resolveConfig({}).storages).toEqual({});
    expect(resolveConfig({ storages: { a: { adapter: 'dummy' } } }).storages).toEqual({ a: { adapter: 'dummy' } });
  });
});

describe('createPicker with a partial config', () => {
  // Regression: the models read config.pick.* unguarded, so a caller passing
  // only `storages` (as the README's default column implies is allowed) used to
  // hit a TypeError on the first pick.
  it('can pick a file when the caller omitted `pick` entirely', () => {
    const picker = createPicker({ storages: { demo: { adapter: 'dummy', label: 'Demo' } } });
    const item = createItem({ id: '1', storage: 'demo', type: 'file', name: 'a.png' });

    expect(() => picker.togglePick(item)).not.toThrow();
    expect(picker.store.pick.items).toHaveLength(1);
    expect(picker.store.pick.export()).toMatchObject({ id: '1' });
  });
});
