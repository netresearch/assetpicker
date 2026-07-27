import { createDummyAdapter } from './dummy.js';

// Adapter registry. Built-ins are registered here; external adapters
// (github/googledrive/entermediadb) register themselves when their bundle
// loads, mirroring the legacy dynamic-registration mechanism.
const FACTORIES = {
  dummy: createDummyAdapter,
};

export function registerAdapter(type, factory) {
  FACTORIES[type] = factory;
}

export function hasAdapter(type) {
  return Object.prototype.hasOwnProperty.call(FACTORIES, type);
}

/**
 * @param {string} type adapter type (storage.adapter)
 * @param {object} storage the storage config (incl. its `key`)
 * @param {object} ctx { onLoading, thumbnails, http, ... }
 */
export function createAdapter(type, storage, ctx) {
  const factory = FACTORIES[type];
  if (!factory) {
    throw new Error(`Unknown adapter: ${type}`);
  }
  return factory(storage, ctx);
}
