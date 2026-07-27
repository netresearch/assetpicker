/**
 * The current browse/search state shown in the picker.
 *
 * - `storage`: the active storage id (or null on the storage overview)
 * - `search`: the active search term (or null when browsing)
 * - `items`:   the items of the active storage/folder
 * - `results`: per-storage search results, keyed by storage id
 *
 * @returns {{ storage: string|null, search: string|null, items: object[], results: Record<string, object[]> }}
 */
export function createSelection() {
  return {
    storage: null,
    search: null,
    items: [],
    results: {},
  };
}
