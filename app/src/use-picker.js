import { createAppStore } from './store.js';
import { createAdapter } from './adapters/index.js';
import { resolveConfig } from './config.js';

export const PICKER = Symbol('assetpicker.controller');

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build the picker controller: the reactive store plus the actions the
 * components call. Replaces the Vue 1 orchestration in app/index.js (config
 * loading, adapter registration, $dispatch/$broadcast selection flow).
 *
 * @param {object} callerConfig picker configuration; may be partial — the
 *   documented defaults are merged in here, since the models read options like
 *   `config.pick.types` unguarded.
 * @param {{ onFinish?: (result: any, cancelled: boolean) => void }} [hooks]
 */
export function createPicker(callerConfig, { onFinish } = {}) {
  const config = resolveConfig(callerConfig);
  const store = createAppStore(config);
  const adapters = {};
  const ctx = {
    onLoading: (delta) => {
      store.ui.loading += delta;
    },
    thumbnails: config.thumbnails,
    config,
  };
  for (const [key, storage] of Object.entries(config.storages || {})) {
    adapters[key] = createAdapter(storage.adapter, { key, ...storage }, ctx);
  }
  const storageKeys = Object.keys(config.storages || {});

  async function openStorage(key, item = null) {
    store.selection.search = null;
    store.selection.storage = key;
    const { items } = await adapters[key].list(item);
    store.selection.items = items;
  }

  function openItem(item) {
    if (item.type === 'file') {
      if (store.pick.isAllowed(item)) {
        store.pick.add(item);
        finish();
      }
    } else {
      openStorage(item.storage, item);
    }
  }

  function togglePick(item) {
    store.pick.toggle(item);
  }

  function home() {
    store.selection.search = null;
    store.selection.storage = null;
    store.selection.items = [];
    store.selection.results = {};
  }

  function finish() {
    onFinish?.(store.pick.export(), false);
  }

  function cancel() {
    store.pick.clear();
    onFinish?.(null, true);
  }

  async function search(word) {
    store.selection.search = word || null;
    store.selection.storage = null;
    if (!word) {
      store.selection.results = {};
      return;
    }
    const regex = new RegExp(escapeRegExp(word), 'i');
    store.selection.results = {};
    await Promise.all(
      Object.entries(adapters).map(async ([key, adapter]) => {
        const { items } = await adapter.search(word);
        store.selection.results[key] = items.filter((item) => regex.test(item.name));
      }),
    );
  }

  return {
    store,
    adapters,
    storageKeys,
    openStorage,
    openItem,
    togglePick,
    home,
    finish,
    cancel,
    search,
    toggleMaximize() {
      store.ui.maximized = !store.ui.maximized;
    },
  };
}
