import fecha from 'fecha';
import { createItem } from '../models/item.js';
import { createHttpClient } from '../http/client.js';

const EMDB_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

function parseDate(value) {
  if (!value) {
    return undefined;
  }
  try {
    return fecha.parse(value, EMDB_DATE_FORMAT) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * EnterMediaDB adapter — searches assets via the mediadb services API.
 *
 * @param {{ key: string, label?: string, url: string }} storage
 * @param {{ onLoading?: Function, thumbnails?: string, fetch?: typeof fetch }} [ctx]
 */
export function createEntermediadbAdapter(storage, ctx = {}) {
  const root = String(storage.url).replace(/\/+$/, '');
  const emshare = `${root}/emshare`;
  const http = createHttpClient({
    defaults: { base: `${root}/mediadb/services`, credentials: 'include' },
    onLoading: ctx.onLoading,
    fetch: ctx.fetch,
  });

  function mapAsset(asset) {
    return createItem(
      {
        id: asset.id,
        storage: storage.key,
        // NOTE: legacy mapped `isfolder ? 'file' : 'dir'` (inverted); corrected here.
        type: asset.isfolder ? 'dir' : 'file',
        name: asset.assettitle || asset.name || asset.primaryfile,
        extension: asset.fileformat?.id,
        created: parseDate(asset.assetcreationdate || asset.assetaddeddate),
        modified: parseDate(asset.assetmodificationdate),
        thumbnail: `${emshare}/views/modules/asset/downloads/preview/thumb/${encodeURI(asset.sourcepath || '')}/thumb.jpg`,
        links: {
          open: `${emshare}/views/modules/asset/editor/viewer/index.html?assetid=${asset.id}`,
          download: `${emshare}/views/activity/downloadassets.html?assetid=${asset.id}`,
        },
        data: asset,
      },
      ctx.thumbnails,
    );
  }

  async function searchAssets(terms) {
    const response = await http.post('module/asset/search', {
      page: '1',
      hitsperpage: '20',
      query: { terms },
    });
    const payload = response.data || {};
    const items = (payload.results || []).map(mapAsset);
    items.total = Number.parseInt(payload.response?.totalhits, 10) || items.length;
    return { items, total: items.total };
  }

  return {
    key: storage.key,
    label: storage.label,
    list() {
      return searchAssets([{ field: 'id', operator: 'matches', value: '*' }]);
    },
    search(word) {
      return searchAssets([{ field: 'description', operator: 'freeform', value: word }]);
    },
    async login(username, password) {
      const response = await http.post('authentication/login', { id: username, password });
      return response.data?.response?.status === 'ok';
    },
  };
}
