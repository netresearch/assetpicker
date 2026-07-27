import { joinUrl, buildProxyUrl } from './url.js';

const BODYLESS = new Set(['GET', 'DELETE', 'HEAD']);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function toResult(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.text();
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    url: response.url,
    data,
  };
}

/**
 * A small fetch-based HTTP client replacing vue-resource.
 *
 * @param {object} [clientOptions]
 * @param {{ url: string }|false} [clientOptions.proxy] route requests through a proxy
 * @param {object} [clientOptions.defaults] default per-request options (headers, credentials, throttle, base)
 * @param {(delta: 1|-1) => void} [clientOptions.onLoadingChange] loading-counter hook (replaces the vue-resource interceptor)
 * @param {typeof fetch} [clientOptions.fetch] fetch implementation (injectable for tests)
 */
export function createHttpClient(clientOptions = {}) {
  const { proxy = false, defaults = {}, onLoadingChange, fetch: fetchImpl } = clientOptions;
  const doFetch = fetchImpl ?? globalThis.fetch;
  let lastRequestTime = 0;

  async function request(method, url, options = {}) {
    const merged = { ...defaults, ...options };
    const targetUrl = buildProxyUrl(joinUrl(url, merged.base), proxy);

    if (merged.throttle) {
      const now = Date.now();
      const remaining = lastRequestTime ? merged.throttle - (now - lastRequestTime) : 0;
      if (remaining > 0) {
        await wait(remaining);
      }
      lastRequestTime = Date.now();
    }

    const init = {
      method,
      headers: { ...(merged.headers || {}) },
    };
    if (merged.credentials !== undefined) {
      init.credentials = merged.credentials;
    }
    if (merged.body !== undefined && !BODYLESS.has(method)) {
      if (merged.body !== null && typeof merged.body === 'object' && !(merged.body instanceof FormData)) {
        init.body = JSON.stringify(merged.body);
        init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
      } else {
        init.body = merged.body;
      }
    }

    onLoadingChange?.(1);
    try {
      return await toResult(await doFetch(targetUrl, init));
    } finally {
      onLoadingChange?.(-1);
    }
  }

  const api = {
    request,
    get: (url, options) => request('GET', url, options),
    delete: (url, options) => request('DELETE', url, options),
    head: (url, options) => request('HEAD', url, options),
    post: (url, body, options) => request('POST', url, { ...options, body }),
    put: (url, body, options) => request('PUT', url, { ...options, body }),
    patch: (url, body, options) => request('PATCH', url, { ...options, body }),
  };
  return api;
}
