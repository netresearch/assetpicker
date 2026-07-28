# AssetPicker

AssetPicker is a free asset / file picker for web application interfaces. A file abstraction layer lets **adapters** connect to any remote storage — GitHub, Google Drive, EnterMediaDB, cloud storages, or a custom backend — and it handles hierarchical (folder) as well as associative (search/category) stores. You embed it in your app, the user picks an asset in a modal, and your app receives the picked asset.

### ▶ [Try the demo](https://netresearch.github.io/assetpicker)

- [How it works](#how-it-works)
- [Install & build](#install--build)
- [Usage](#usage)
- [Configuration](#configuration)
- [Adapters](#adapters)
- [Write your own adapter](#write-your-own-adapter)
- [PHP proxy](#php-proxy)
- [Development](#development)

## How it works

AssetPicker is a **Vue 3 single-page app** (`app/`, built with Vite). Your host app mounts it — typically into a modal overlay — with a `config` and an `onFinish` callback:

- The `config.storages` become the top-level entries; each storage names an **adapter**.
- An adapter is a small factory implementing `list(item)` / `search(word)`, returning normalized items. The sidebar tree is the folder navigation; single-click a folder to open it.
- The user clicks a file to select it and presses **Select**; `onFinish(result, cancelled)` fires with the picked asset (or an array, for `pick.limit ≠ 1`).

There is no CDN script tag and no cross-window iframe messaging anymore — you mount the component directly, so the returned asset is a plain callback in your own page.

> Migrated from a Vue 1.x code base. The public API is `createAssetPickerApp` + the adapter contract below.

## Install & build

Requires a modern browser (Vue 3 / ES2015+). Tooling uses [Bun](https://bun.sh) (npm also works).

```bash
git clone https://github.com/netresearch/assetpicker.git
cd assetpicker
bun install
bun run dev     # Vite dev server (the demo)
bun run build   # production build into dist/
bun run test    # Vitest unit tests
```

## Usage

Mount the picker into an element (e.g. a modal you show on a button click) and handle the result:

```js
import { createAssetPickerApp } from 'assetpicker';

const picker = createAssetPickerApp({
  el: '#picker-mount',
  config: {
    pick: { limit: 1, types: ['file'], extensions: [] },
    thumbnails: 'url',
    storages: {
      repo: { adapter: 'github', label: 'My repo', username: 'netresearch', repository: 'assetpicker' },
      demo: { adapter: 'dummy', label: 'Demo storage' },
    },
  },
  onFinish(result, cancelled) {
    picker.unmount();           // close your modal
    if (cancelled) return;
    // result is a single item (pick.limit === 1) or an item[]
    console.log('picked', result);
  },
});
```

`app/src/main.js` shows the full demo host (open on a button, render the picked asset). Each item is `{ id, storage, name, type: 'file' | 'dir', extension, thumbnail, links, mediaType, created, modified, data }`.

## Configuration

`config` passed to `createAssetPickerApp`:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `storages` | object | – | The available storages. Each entry is passed to its adapter. |
| `storages.<id>.adapter` | string | – | **Required.** Adapter name (`dummy`, `github`, `googledrive`, `entermediadb`, or a registered custom one). |
| `storages.<id>.label` | string | id | Label in the sidebar / search results. |
| `storages.<id>.proxy` | bool \| object | – | Per-storage proxy: `true` = use global proxy, `false` = disable, object = custom. |
| `pick.limit` | number | `1` | Max assets that can be picked (`0` = unlimited). |
| `pick.types` | string[] | `['file']` | Asset types allowed to be picked (`file`, `dir`, `category`). |
| `pick.extensions` | string[] | `[]` | Allowed file extensions (empty = all). |
| `proxy.url` | string | `"proxy.php?to={{url}}"` | Proxy URL template; `{{url}}` = URL-encoded target, `{{url.raw}}` = raw. |
| `proxy.all` | bool | `false` | Route all storages through the proxy unless a storage opts out. |
| `thumbnails` | `'url'` \| `'data'` | `'url'` | Deliver thumbnails as a URL, or fetch and inline as a data URI. |
| `language` | `'auto'` \| `'en'` \| `'de'` | `'auto'` | UI language; `auto` detects from the browser. |

## Adapters

Built-in: **`dummy`** (random files, no auth — the demo), **`github`**, **`googledrive`**, **`entermediadb`**.

> The three external adapters were modernized off dead auth APIs (GitHub removed the OAuth Authorizations API in 2020; Google shut down `gapi.auth2` in 2023). Their response→item mapping is unit-tested; the live auth flows need real credentials to exercise end to end.

### GitHub — `github`

Browses a repository's contents via the REST Contents API.

```js
repo: {
  adapter: 'github',
  username: 'netresearch',
  repository: 'assetpicker',
  token: 'github_pat_…', // a Personal Access Token (fine-grained or classic), sent as a Bearer token
}
```

The token may also be set globally as `config.github.token`. (A read-only PAT is required for private repos and to avoid the unauthenticated rate limit.)

### Google Drive — `googledrive`

Lists Drive files via the Drive v3 API; authenticates with **Google Identity Services** (needs an OAuth `client_id` from a Google Cloud project with the Drive API enabled).

```js
drive: {
  adapter: 'googledrive',
  client_id: 'xxx.apps.googleusercontent.com',
  api_key: 'xxx',
}
```

### EnterMediaDB — `entermediadb`

Searches assets via the mediadb services API; logs in through the built-in login form when the server requires it.

```js
media: { adapter: 'entermediadb', url: 'https://em.example.org/openinstitute' }
```

EnterMediaDB has no CORS headers, so set `proxy: true` (or `proxy.all`) when your app is on a different origin — see [PHP proxy](#php-proxy).

## Write your own adapter

An adapter is a factory returning `{ key, label, list, search }`. Register it before creating the picker:

```js
import { registerAdapter, createItem } from 'assetpicker';

registerAdapter('mysource', (storage, ctx) => ({
  key: storage.key,
  label: storage.label,
  // item === null for the storage root; return { items, total }
  async list(item) {
    const rows = await fetchMyFolder(item ? item.id : '/');
    const items = rows.map((row) => createItem({
      id: row.id, storage: storage.key, name: row.name,
      type: row.isFolder ? 'dir' : 'file', links: { open: row.url }, data: row,
    }, ctx.thumbnails));
    return { items, total: items.length };
  },
  async search(word) { /* … return { items, total } */ },
}));
```

`ctx` provides `{ onLoading, thumbnails, config }`. Use the fetch client (`createHttpClient`) for the built-in proxy URL building, throttle and loading indicator.

## PHP proxy

`proxy.php` (+ `src/php/`) is an optional PHP reverse proxy for CORS-restricted storages (built on `symfony/http-client`). Install its dependencies and run it behind your app:

```bash
composer install
```

A container setup is provided — build the image with Docker Bake and run it with Compose:

```bash
docker buildx bake        # build the php-fpm image
docker compose up -d      # nginx + php serving proxy.php
```

## Development

- App source: `app/src/` (SFCs, models, adapters, i18n, http).
- Tests: `app/tests/` (Vitest + @vue/test-utils) — `bun run test`.
- The demo (`app/index.html` + `app/src/main.js`) is deployed to GitHub Pages from CI (`.github/workflows/pages.yml`); the build output is not committed.

## License

MIT · © Netresearch DTT GmbH
