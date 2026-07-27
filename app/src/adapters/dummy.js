import { createItem } from '../models/item.js';

/**
 * Self-contained demo adapter — generates random folders and files with a
 * short delay, no network needed. Was src/js/adapter/dummy (an `events:`
 * Vue 1 component); now a plain factory implementing the adapter contract:
 *
 *   { key, label, list(item) -> {items,total}, search(word) -> {items,total} }
 *
 * @param {{ key: string, label?: string }} storage
 * @param {{ onLoading?: (delta: 1|-1) => void, thumbnails?: 'url'|'data' }} [ctx]
 */
export function createDummyAdapter(storage, ctx = {}) {
  const { onLoading, thumbnails } = ctx;
  const extensions = ['txt', 'pdf', 'xls', 'doc', 'pot', 'jpeg', 'zip', 'mp3', 'avi', 'html', 'any'];
  let lastId = 1;

  function makeItem(extension, thumbnail) {
    const id = String(lastId++);
    return createItem(
      {
        id,
        storage: storage.key,
        type: extension ? 'file' : 'dir',
        extension,
        name: `Random ${extension || 'directory'}${thumbnail ? ' with thumb' : ''} ${id}`,
        thumbnail,
      },
      thumbnails,
    );
  }

  function makeBatch() {
    const items = [makeItem()];
    for (const ext of extensions) {
      items.push(makeItem(ext));
    }
    // picsum.photos replaces the long-dead lorempixel.com used by the legacy adapter.
    items.push(makeItem('jpeg', 'https://picsum.photos/160/200'));
    items.push(makeItem('jpeg', 'https://picsum.photos/200/160'));
    items.total = 10 * items.length;
    return items;
  }

  async function withLoading(producer) {
    onLoading?.(1);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return producer();
    } finally {
      onLoading?.(-1);
    }
  }

  return {
    key: storage.key,
    label: storage.label,
    exhausted() {
      return lastId >= 1400;
    },
    async list() {
      if (this.exhausted()) {
        return { items: [], total: 0 };
      }
      const items = await withLoading(makeBatch);
      return { items, total: items.total };
    },
    async search() {
      const items = await withLoading(makeBatch);
      return { items, total: items.total };
    },
  };
}
