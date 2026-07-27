import { describe, it, expect } from 'vitest';
import { createItem, MediaType } from '../src/models/item.js';
import { Pick } from '../src/models/pick.js';
import { createSelection } from '../src/models/selection.js';

// Raw adapter data for the createItem tests.
const raw = (over = {}) => ({ id: '1', storage: 's', type: 'file', name: 'a.png', ...over });
// A real item (derived extension/mediaType) as Pick receives it at runtime.
const file = (over = {}) => createItem(raw(over));

describe('createItem', () => {
  it('derives the extension and media type from a file name', () => {
    const item = createItem(raw({ name: 'photo.JPG' }));
    expect(item.extension).toBe('JPG');
    expect(String(item.mediaType)).toBe('image');
  });

  it('honours an explicit extension over the name', () => {
    expect(createItem(raw({ name: 'x', extension: 'pdf' })).extension).toBe('pdf');
  });

  it('marks folders as folder media type', () => {
    expect(String(createItem({ id: '1', storage: 's', type: 'folder', name: 'dir' }).mediaType)).toBe('folder');
  });

  it('requires id and storage', () => {
    expect(() => createItem({ storage: 's', type: 'file', name: 'a' })).toThrow(/ID/);
    expect(() => createItem({ id: '1', type: 'file', name: 'a' })).toThrow(/storage/);
  });

  it('MediaType stringifies to its name', () => {
    expect(new MediaType('file', 'mp3').toString()).toBe('audio');
    expect(new MediaType('file', 'unknownext').toString()).toBe('');
  });
});

describe('Pick', () => {
  const cfg = (over = {}) => ({ pick: { types: ['file'], extensions: [], limit: 1, ...over } });

  it('adds allowed items and enforces the limit', () => {
    const pick = new Pick(cfg({ limit: 2 }));
    pick.add(file({ id: '1' }));
    pick.add(file({ id: '2' }));
    pick.add(file({ id: '3' }));
    expect(pick.items.map((i) => i.id)).toEqual(['2', '3']);
  });

  it('rejects items whose type is not allowed (type filter now works)', () => {
    const pick = new Pick(cfg({ types: ['file'] }));
    pick.add(createItem({ id: '1', storage: 's', type: 'folder', name: 'dir' }));
    expect(pick.items).toHaveLength(0);
  });

  it('filters by extension when configured', () => {
    const pick = new Pick(cfg({ extensions: ['png'] }));
    pick.add(file({ id: 'ok', name: 'a.png' }));
    pick.add(file({ id: 'no', name: 'a.gif' }));
    expect(pick.items.map((i) => i.id)).toEqual(['ok']);
  });

  it('toggle adds then removes', () => {
    const pick = new Pick(cfg({ limit: 2 }));
    const item = file({ id: '1' });
    pick.toggle(item);
    expect(pick.contains(item)).toBe(true);
    pick.toggle(item);
    expect(pick.contains(item)).toBe(false);
  });

  it('export returns a single item at limit 1, else a copy', () => {
    const single = new Pick(cfg({ limit: 1 }));
    single.add(file({ id: '1' }));
    expect(single.export()).toEqual(expect.objectContaining({ id: '1' }));

    const multi = new Pick(cfg({ limit: 0 }));
    multi.add(file({ id: '1' }));
    multi.add(file({ id: '2' }));
    expect(Array.isArray(multi.export())).toBe(true);
    expect(multi.export()).toHaveLength(2);
  });

  it('clear empties the selection', () => {
    const pick = new Pick(cfg());
    pick.add(file({ id: '1' }));
    pick.clear();
    expect(pick.items).toHaveLength(0);
  });
});

describe('createSelection', () => {
  it('returns a fresh, independent state each call', () => {
    const a = createSelection();
    const b = createSelection();
    a.items.push(1);
    expect(b.items).toHaveLength(0);
    expect(a).toMatchObject({ storage: null, search: null, results: {} });
  });
});
