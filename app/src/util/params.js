/**
 * Parse a URL query string into a null-prototype object.
 *
 * Uses Object.create(null) and skips prototype-polluting keys so that
 * user-controlled query keys can never reach Object.prototype.
 *
 * @param {string} [search] defaults to the current location's query string
 * @returns {Record<string, string>}
 */
export function getQueryParams(search) {
  const query = (search ?? (typeof window !== 'undefined' ? window.location.search : '')).replace(/^\?/, '');
  const params = Object.create(null);
  if (!query) {
    return params;
  }
  for (const pair of query.split('&')) {
    if (!pair) {
      continue;
    }
    const [rawKey, rawValue = ''] = pair.split('=');
    const key = decodeURIComponent(rawKey);
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    params[key] = decodeURIComponent(rawValue);
  }
  return params;
}

/**
 * Read a single query parameter.
 *
 * @param {string} name
 * @param {string} [search]
 * @returns {string|undefined}
 */
export function getQueryParam(name, search) {
  return getQueryParams(search)[name];
}
