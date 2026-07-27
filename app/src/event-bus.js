import mitt from 'mitt';

/**
 * App-wide event bus (mitt) replacing the Vue 1 tree event system
 * (`$dispatch` / `$broadcast` / `events: {}`). Provided at the app root and
 * injected where components need to reach across the tree.
 *
 * Prefer plain props/emits for direct parent-child communication; use the bus
 * only for genuinely cross-tree signals:
 *  - 'resize'         layout/viewport changed (was `$broadcast('resize')`)
 *  - 'config-loaded'  initial configuration resolved (was `$dispatch('config-loaded')`)
 *  - 'finish-pick'    user confirmed the selection (was `$dispatch('finish-pick')`)
 *  - 'handle-move'    the resize handle was dragged (was `$dispatch('handle-move')`)
 */
export const EVENT_BUS = Symbol('assetpicker.eventBus');

export function createEventBus() {
  return mitt();
}
