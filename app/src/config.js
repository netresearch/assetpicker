/**
 * Default configuration, matching the table documented in the README.
 *
 * A consumer may pass a partial config (e.g. only `storages`); every key the
 * README lists a default for must still be present downstream, because the
 * models read them unguarded (`this.config.pick.types`).
 */
export const DEFAULT_CONFIG = {
  storages: {},
  pick: { limit: 1, types: ['file'], extensions: [] },
  proxy: { url: 'proxy.php?to={{url}}', all: false },
  thumbnails: 'url',
  language: 'auto',
};

/**
 * Merge a caller config onto the defaults. Only the known nested option groups
 * (`pick`, `proxy`) are merged one level deep; `storages` is taken as given so
 * a caller can never inherit a storage it did not configure.
 *
 * @param {object} [config]
 * @returns {object} the resolved config
 */
export function resolveConfig(config = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    pick: { ...DEFAULT_CONFIG.pick, ...(config.pick || {}) },
    proxy: { ...DEFAULT_CONFIG.proxy, ...(config.proxy || {}) },
    storages: config.storages || {},
  };
}
