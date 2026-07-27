import { describe, it, expect, vi } from 'vitest';
import { createGithubAdapter } from '../src/adapters/github.js';
import { createGoogledriveAdapter } from '../src/adapters/googledrive.js';
import { createEntermediadbAdapter } from '../src/adapters/entermediadb.js';

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

describe('github adapter', () => {
  it('maps the contents API to sorted items and sends the Bearer token', async () => {
    const fetch = vi.fn().mockResolvedValue(
      jsonResponse([
        { path: 'README.md', name: 'README.md', type: 'file', html_url: 'h2' },
        { path: 'src', name: 'src', type: 'dir', html_url: 'h1' },
      ]),
    );
    const adapter = createGithubAdapter({ key: 'gh', username: 'a', repository: 'b', token: 't' }, { fetch });

    const { items } = await adapter.list();

    expect(items.map((i) => [i.name, i.type])).toEqual([
      ['src', 'dir'],
      ['README.md', 'file'],
    ]);
    expect(items[0].links.open).toBe('h1');

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.github.com/repos/a/b/contents/');
    expect(init.headers.Authorization).toBe('Bearer t');
  });
});

describe('googledrive adapter', () => {
  it('maps Drive files (folder → dir) using the access token', async () => {
    const fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        files: [
          { id: '1', name: 'Folder', mimeType: 'application/vnd.google-apps.folder' },
          { id: '2', name: 'photo.jpg', mimeType: 'image/jpeg', fileExtension: 'jpg', thumbnailLink: 'tl', webViewLink: 'wv' },
        ],
      }),
    );
    const adapter = createGoogledriveAdapter({ key: 'gd', access_token: 'tok', api_key: 'k' }, { fetch });

    const { items } = await adapter.list();

    expect(items[0]).toMatchObject({ id: '1', type: 'dir', name: 'Folder' });
    expect(items[1]).toMatchObject({ id: '2', type: 'file', thumbnail: 'tl' });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain('/drive/v3/files?');
    expect(init.headers.Authorization).toBe('Bearer tok');
  });

  it('fully escapes backslash and quote in the search query', async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ files: [] }));
    const adapter = createGoogledriveAdapter({ key: 'gd', access_token: 't' }, { fetch });

    await adapter.search("a'b\\c");

    const q = new URL(`https://x/${fetch.mock.calls[0][0]}`).searchParams.get('q');
    expect(q).toContain("a\\'b\\\\c");
  });
});

describe('entermediadb adapter', () => {
  it('maps asset search results (isfolder → dir) with totals and thumbnails', async () => {
    const fetch = vi.fn().mockResolvedValue(
      jsonResponse({
        response: { totalhits: '2', page: '1', pages: '1' },
        results: [
          { id: 'a1', isfolder: false, assettitle: 'Asset One', fileformat: { id: 'jpg' }, sourcepath: 'p/one' },
          { id: 'a2', isfolder: true, name: 'Folder', fileformat: { id: '' }, sourcepath: 'p/two' },
        ],
      }),
    );
    const adapter = createEntermediadbAdapter({ key: 'em', url: 'https://emdb.test/' }, { fetch });

    const { items, total } = await adapter.list();

    expect(total).toBe(2);
    expect(items[0]).toMatchObject({ id: 'a1', name: 'Asset One', type: 'file', extension: 'jpg' });
    expect(items[1]).toMatchObject({ id: 'a2', type: 'dir' });
    expect(items[0].thumbnail).toContain('/emshare/');
    const [url] = fetch.mock.calls[0];
    expect(url).toBe('https://emdb.test/mediadb/services/module/asset/search');
  });

  it('reports login success from the API status', async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ response: { status: 'ok' } }));
    const adapter = createEntermediadbAdapter({ key: 'em', url: 'https://emdb.test' }, { fetch });
    expect(await adapter.login('admin', 'pw')).toBe(true);
  });
});
