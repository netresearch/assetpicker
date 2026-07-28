# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-07-28

First release since 1.3.4 (2016-10-20). The picker was rebuilt on Vue 3 and
both published surfaces — the npm entry point and the PHP proxy — changed.
There is no in-place upgrade path from 1.3.4; read BREAKING first.

### BREAKING

- PHP requirement raised from unconstrained (1.3.4 declared no `php`
  constraint and resolved against jenssegers/proxy 2.2.1, Symfony
  HttpFoundation 2.8, Guzzle 5) to `php: ^8.4`, `symfony/http-client: ^8.0`,
  `symfony/http-foundation: ^8.0`. Installing on PHP < 8.4 fails.
- `Netresearch\AssetPicker\Proxy` no longer extends `\Proxy\Proxy`, and the
  inherited fluent API is gone. Migration:
  `$proxy->forward($request)->to($target)` becomes
  `$proxy->forward($request, $target): Symfony\Component\HttpFoundation\Response`.
  `addResponseFilter()` and the other inherited methods no longer exist.
  Forwarding behaviour is otherwise unchanged (hop-by-hop header strip, no
  redirect following, `Location` rewrite).
- The script-tag embed API is removed: `new AssetPicker(config, options)`, the
  `AssetPickerApp` bundle, the `[rel="assetpicker"]` auto-registration with its
  `data-limit` / `data-exts` / `data-types` overrides, the `distUrl` and
  `modal.*` options, and the iframe + `postMessage` transport. Migration:
  mount the component — `createAssetPickerApp({ el, config, onFinish })`.
- The event API is replaced by one callback. `on('pick', fn)` becomes
  `onFinish(result, false)`; a cancel is `onFinish(null, true)`. The `ready`
  and `resize` events have no successor.
- The npm entry point moved from `src/js/picker/index.js` to
  `app/src/main.js`, and the package is ESM-only (`"type": "module"`).
  `require('assetpicker')` no longer works.
- Committed build artefacts are gone and are no longer published:
  `dist/js/picker.js`, `dist/js/app.js`, `dist/js/adapter/*.js`,
  `dist/css/*.css`, `dist/font/glyph.svg`. `dist/` and `docs/` are gitignored
  and built in CI. Existing CDN URLs pinned to `assetpicker@1.3.4` keep
  working; there is no equivalent URL at this tag. Migration: build from
  source in your own project.
- Config keys `adapters` (the map of lazily fetched adapter script URLs) and
  `debug` are removed. Migration: `registerAdapter(type, factory)` at build
  time. `config.picker.*` is now `config.pick.*`.

### Added

- Vue 3.5 application under `app/`, built with Vite, written as single-file
  components (`App.vue`, `FolderTree`, `Sidebar`, `Stage`, `ItemGrid`,
  `ItemCard`, `ResizeHandle`, `LoginForm`).
- Public API: `createAssetPickerApp`, `registerAdapter`, `createItem`,
  `createHttpClient`.
- Adapter registry so a custom adapter is registered in the host bundle
  instead of fetched from a URL.
- Reworked authentication for the external adapters: GitHub Contents API with
  a Personal Access Token bearer header (the OAuth Authorizations API was
  removed by GitHub in 2020), Google Drive v3 with Google Identity Services
  (gapi.auth2 shut down in 2023), EnterMediaDB mediadb services API. The
  response-to-item mapping of all three is unit-tested; the live auth flows
  have not been exercised against real credentials.
- Vitest suite (53 cases) covering the config resolution, pick model,
  utilities, HTTP layer, components and adapter response mapping.
- PHPUnit suite for the PHP proxy.
- GitHub Pages deployment from CI, plus node-audit and secret-scanning
  workflows.

### Changed

- The PHP proxy is implemented on symfony/http-client instead of
  jenssegers/proxy + Guzzle.
- Symfony components to ^8.0, PHPUnit to ^13.0, PHP floor to ^8.4 (platform
  default 8.5).
- Event handling uses mitt instead of Vue 1 `$dispatch`/`$broadcast`;
  translations use vue-i18n instead of vue-i18n-mixin; HTTP uses a
  fetch-based client instead of vue-resource.
- Build pipeline: gulp + browserify replaced by Vite; the SCSS tree replaced
  by `app/src/style.css`.
- Package manager: npm replaced by bun (`bun.lock`).
- Container setup: `docker-compose.yml` replaced by `compose.yml` plus
  `docker-bake.hcl`. The container serves the PHP proxy only; it no longer
  hosts the picker.
- Runtime dependencies reduced from nine to four: fecha, mitt, vue, vue-i18n.
- README rewritten for the mountable-app model. Both package descriptions
  corrected — they advertised Amazon S3 and Dropbox adapters that never
  existed.

### Removed

- `src/js/` in its entirety (picker, modal, messaging, UI widget).
- The post-selection assets widget and its `ui.enabled` / `ui.readonly` /
  `ui.unique` options, with no replacement.
- `Netresearch\AssetPicker` and its `getDistPath()`, which returned a path to
  the no longer shipped `dist/`.
- `bower.json` (Bower is EOL; it referenced files that no longer exist).
- Dropped dependencies: vue-resource, vue-i18n-mixin, vue-infinite-scroll,
  escape-string-regexp, extend, insert-css, gulp and its plugins, sass,
  jenssegers/proxy, guzzle.

### Fixed

- A partial config threw on the first pick: the models read `config.pick.*`
  unguarded, so a caller passing only `storages` — which the documented
  default column allows — hit a `TypeError`. The documented defaults are now
  merged in `createPicker`.
- `Pick.isAllowed` never filtered by type: an operator-precedence bug bound
  `> -1` to the whole OR expression.
- Media-type detection was case-sensitive, so `photo.JPG` was not treated as
  an image.
- The EnterMediaDB `isfolder` to item-type mapping was inverted.
- Folders open on a single click; files select on click and confirm on double
  click.
- The demo pointed at rawgit.com, shut down in 2019; the demo is now
  same-origin and served from the Pages build.

### Security

- Prototype-pollution and property-injection hardening in the utility layer;
  `util/params.js` removed after a CodeQL remote-property-injection finding.
- Incomplete string escaping fixed in the Google Drive search query
  (backslash escaped before quote).
- `bun audit` and `composer audit` advisories cleared (Guzzle 5 removed,
  brace-expansion and immutable overrides raised).

### Dependencies

- 110 automated Renovate/Dependabot updates across the range (Vue 3.5.40,
  ESLint 10, Vite 8, Vitest 4, jsdom 30, and transitive bumps).

[2.0.0]: https://github.com/netresearch/assetpicker/compare/1.3.4...2.0.0
