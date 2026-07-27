import { describe, it, expect } from 'vitest';
import { isReactive, watch, nextTick } from 'vue';
import { createAppStore } from '../src/store.js';

const config = () => ({ pick: { types: ['file'], extensions: [], limit: 1 } });
const file = { id: '1', storage: 's', type: 'file', extension: 'png' };

describe('createAppStore', () => {
  it('returns a reactive store with the domain models wired to config', () => {
    const store = createAppStore(config());
    expect(isReactive(store)).toBe(true);
    expect(store.pick.items).toEqual([]);
    expect(store.selection).toMatchObject({ storage: null, items: [] });
    expect(store.ui.loading).toBe(0);
  });

  it('scopes state per instance (no leakage between pickers)', () => {
    const a = createAppStore(config());
    const b = createAppStore(config());
    a.pick.add(file);
    a.ui.loading = 3;
    expect(b.pick.items).toHaveLength(0);
    expect(b.ui.loading).toBe(0);
  });

  it('tracks pick mutations reactively', async () => {
    const store = createAppStore(config());
    const seen = [];
    watch(() => store.pick.items.length, (n) => seen.push(n));
    store.pick.add(file);
    await nextTick();
    expect(seen).toEqual([1]);
  });
});
