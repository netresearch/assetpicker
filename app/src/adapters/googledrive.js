import { createItem } from '../models/item.js';
import { createHttpClient } from '../http/client.js';
import { loadScript } from '../util/load-script.js';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

// Escape a value for a Drive API query string literal: backslash first (so it
// cannot re-enable the quote escape), then the single quote.
function escapeDriveValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Google Drive adapter — lists files via the Drive v3 REST API.
 *
 * Auth is modernised: the legacy adapter used `gapi.auth2` (the Google
 * Sign-In platform library), which Google **shut down in 2023**. This uses
 * Google Identity Services (GIS) token client to obtain an OAuth access token
 * (browser flow, requires a `client_id` from a Google Cloud project). The GIS
 * flow needs a live browser + credentials; the Drive listing/mapping below is
 * transport-testable independently.
 *
 * @param {{ key: string, label?: string, client_id?: string, api_key?: string, access_token?: string }} storage
 * @param {{ onLoading?: Function, thumbnails?: string, fetch?: typeof fetch }} [ctx]
 */
export function createGoogledriveAdapter(storage, ctx = {}) {
  const http = createHttpClient({
    // Drive's default quota is ~1000 req / 100 s — keep 100 ms between calls.
    defaults: { base: 'https://www.googleapis.com/drive/v3', throttle: 100 },
    onLoading: ctx.onLoading,
    fetch: ctx.fetch,
  });
  let accessToken = storage.access_token || null;

  async function authorize() {
    if (accessToken) {
      return accessToken;
    }
    if (!storage.client_id) {
      throw new Error('Google Drive adapter requires a client_id (Google Cloud OAuth)');
    }
    await loadScript('https://accounts.google.com/gsi/client');
    accessToken = await new Promise((resolve, reject) => {
      const client = globalThis.google.accounts.oauth2.initTokenClient({
        client_id: storage.client_id,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response) => (response.access_token ? resolve(response.access_token) : reject(new Error('Google authorization failed'))),
      });
      client.requestAccessToken();
    });
    return accessToken;
  }

  function mapFile(file) {
    const type = file.mimeType === FOLDER_MIME ? 'dir' : 'file';
    return createItem(
      {
        id: file.id,
        storage: storage.key,
        name: file.name,
        type,
        extension: file.fileExtension,
        thumbnail: file.thumbnailLink,
        mediaType: file.iconLink ? { icon: file.iconLink } : undefined,
        links: { download: file.webContentLink, open: file.webViewLink },
        data: file,
      },
      ctx.thumbnails,
    );
  }

  async function query(driveQuery) {
    if (!accessToken) {
      await authorize();
    }
    const params = new URLSearchParams({
      q: driveQuery,
      fields: 'files(id,name,mimeType,fileExtension,iconLink,thumbnailLink,webContentLink,webViewLink),kind',
    });
    if (storage.api_key) {
      params.set('key', storage.api_key);
    }
    const response = await http.get(`files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const files = response.data?.files || [];
    const items = files.map(mapFile);
    return { items, total: items.length };
  }

  return {
    key: storage.key,
    label: storage.label,
    authorize,
    list(item) {
      const parent = item ? item.id : 'root';
      return query(`'${parent}' in parents and trashed = false`);
    },
    search(word) {
      return query(`name contains '${escapeDriveValue(word)}' and trashed = false`);
    },
  };
}
