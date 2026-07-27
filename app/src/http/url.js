/**
 * Join a URL onto an optional base, collapsing the slash at the seam.
 *
 * @param {string} url
 * @param {string} [base]
 * @returns {string}
 */
export function joinUrl(url, base) {
  if (!base) {
    return String(url);
  }
  return `${String(base).replace(/\/+$/, '')}/${String(url).replace(/^\/+/, '')}`;
}

/**
 * Route a target URL through the configured proxy.
 *
 * Replaces the legacy Vue 1 `$interpolate` of `proxy.url`: `{{url}}` is the
 * URL-encoded target, `{{url.raw}}` the raw target. Returns the target
 * unchanged when no proxy is configured.
 *
 * @param {string} target
 * @param {{ url: string }|false|null|undefined} proxy
 * @returns {string}
 */
export function buildProxyUrl(target, proxy) {
  if (!proxy || !proxy.url) {
    return String(target);
  }
  return proxy.url
    .replace(/\{\{\s*url\.raw\s*\}\}/g, String(target))
    .replace(/\{\{\s*url\s*\}\}/g, encodeURIComponent(String(target)));
}
