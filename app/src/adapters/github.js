import { createItem } from '../models/item.js';
import { createHttpClient } from '../http/client.js';

/**
 * GitHub repository adapter — browses a repo's contents via the REST
 * Contents API.
 *
 * Auth is modernised: the legacy adapter used the OAuth Authorizations API
 * (`POST /authorizations` with Basic auth), which GitHub **removed in 2020**.
 * This uses a Personal Access Token (fine-grained or classic) supplied in
 * config as `storage.token` or the global `config.github.token`, sent as a
 * Bearer token — the current supported browser-side approach.
 *
 * @param {{ key: string, label?: string, username: string, repository: string, token?: string }} storage
 * @param {{ onLoading?: Function, thumbnails?: string, config?: object, fetch?: typeof fetch }} [ctx]
 */
export function createGithubAdapter(storage, ctx = {}) {
  const token = storage.token || ctx.config?.github?.token || null;
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const http = createHttpClient({
    defaults: { base: 'https://api.github.com', headers },
    onLoading: ctx.onLoading,
    fetch: ctx.fetch,
  });
  const contentsPath = `repos/${storage.username}/${storage.repository}/contents`;

  function mapEntry(entry) {
    return createItem(
      {
        id: String(entry.path).replace(/^\/+/, ''),
        storage: storage.key,
        name: entry.name,
        type: entry.type === 'dir' ? 'dir' : 'file',
        data: entry,
        links: entry.html_url ? { open: entry.html_url } : undefined,
      },
      ctx.thumbnails,
    );
  }

  function sortItems(items) {
    return items.sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
  }

  async function list(item) {
    const path = item ? item.id : '';
    const response = await http.get(`${contentsPath}/${path}`);
    const entries = Array.isArray(response.data) ? response.data : [];
    const items = sortItems(entries.map(mapEntry));
    return { items, total: items.length };
  }

  return {
    key: storage.key,
    label: storage.label,
    list,
    // The legacy adapter had no repository-wide search; browsing is via list().
    async search() {
      return { items: [], total: 0 };
    },
  };
}
