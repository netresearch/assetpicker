import { describe, it, expect, vi } from 'vitest';
import { joinUrl, buildProxyUrl } from '../src/http/url.js';
import { createHttpClient } from '../src/http/client.js';

describe('joinUrl', () => {
  it('collapses the slash at the seam', () => {
    expect(joinUrl('/a', 'http://h/')).toBe('http://h/a');
    expect(joinUrl('a', 'http://h')).toBe('http://h/a');
  });
  it('returns the url unchanged without a base', () => {
    expect(joinUrl('http://h/a')).toBe('http://h/a');
  });
});

describe('buildProxyUrl', () => {
  const proxy = { url: 'proxy.php?to={{url}}' };
  it('url-encodes the target into {{url}}', () => {
    expect(buildProxyUrl('http://x/a b', proxy)).toBe('proxy.php?to=' + encodeURIComponent('http://x/a b'));
  });
  it('supports the raw target via {{url.raw}}', () => {
    expect(buildProxyUrl('http://x/a', { url: 'p?to={{url.raw}}' })).toBe('p?to=http://x/a');
  });
  it('returns the target unchanged without a proxy', () => {
    expect(buildProxyUrl('http://x/a', false)).toBe('http://x/a');
  });
});

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    url: 'u',
    headers: { get: () => 'application/json' },
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

describe('createHttpClient', () => {
  it('GETs the built (proxied) URL and parses JSON', async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ hello: 'world' }));
    const client = createHttpClient({ proxy: { url: 'proxy.php?to={{url}}' }, fetch });

    const res = await client.get('/items', { base: 'http://api' });

    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('proxy.php?to=' + encodeURIComponent('http://api/items'));
    expect(init.method).toBe('GET');
    expect(res.data).toEqual({ hello: 'world' });
  });

  it('serializes an object body to JSON with a content-type', async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = createHttpClient({ fetch });

    await client.post('http://api/x', { a: 1 });

    const [, init] = fetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('drives the loading hook +1/-1 around the request', async () => {
    const deltas = [];
    const fetch = vi.fn().mockResolvedValue(jsonResponse({}));
    const client = createHttpClient({ fetch, onLoadingChange: (d) => deltas.push(d) });

    await client.get('http://api/x');

    expect(deltas).toEqual([1, -1]);
  });

  it('decrements the loading hook even when fetch rejects', async () => {
    const deltas = [];
    const fetch = vi.fn().mockRejectedValue(new Error('network'));
    const client = createHttpClient({ fetch, onLoadingChange: (d) => deltas.push(d) });

    await expect(client.get('http://api/x')).rejects.toThrow('network');
    expect(deltas).toEqual([1, -1]);
  });
});
