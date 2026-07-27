import { reactive } from 'vue';
import { Pick } from './models/pick.js';
import { createSelection } from './models/selection.js';

/**
 * Injection key for the per-picker reactive store.
 *
 * The app is embedded per picker (in its own iframe), so state must be scoped
 * to the instance — a global store (Pinia) would leak state between pickers.
 * The root provides this store; components inject it instead of reaching
 * through `$parent`/`$children` or the Vue 1 `$dispatch`/`$broadcast` tree.
 */
export const STORE = Symbol('assetpicker.store');

/**
 * Build the reactive store for one picker instance.
 *
 * @param {object} config resolved picker configuration
 * @returns {{
 *   config: object,
 *   pick: import('./models/pick.js').Pick,
 *   selection: ReturnType<typeof createSelection>,
 *   ui: { loading: number, isLogin: boolean, maximized: boolean, loaded: boolean },
 * }}
 */
export function createAppStore(config) {
  return reactive({
    config,
    pick: new Pick(config),
    selection: createSelection(),
    ui: {
      loading: 0,
      isLogin: false,
      maximized: false,
      loaded: false,
    },
  });
}
