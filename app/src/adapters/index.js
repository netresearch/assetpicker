import { createDummyAdapter } from './dummy.js';
import { createGithubAdapter } from './github.js';
import { createGoogledriveAdapter } from './googledrive.js';
import { createEntermediadbAdapter } from './entermediadb.js';

// Adapter registry. Each entry maps a storage's `adapter` type to a factory
// implementing the contract: { key, label, list(item)->{items,total},
// search(word)->{items,total} }.
const FACTORIES = {
  dummy: createDummyAdapter,
  github: createGithubAdapter,
  googledrive: createGoogledriveAdapter,
  entermediadb: createEntermediadbAdapter,
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
