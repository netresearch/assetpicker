# AssetPicker

AssetPicker is a free asset or file picker designed to be easily included into web application interfaces. It has a file abstraction layer allowing adapters to connect to any remote storage, be it cloud storages like Amazon S3, Google Drive or Dropbox or assets from a custom web application server. In opposite to other file managers or pickers, AssetPicker is suitable for hierarchical as well as associative file storages.

## How it works
AssetPicker consists of two bundles: The picker (`AssetPicker` in `picker.min.js`) and the app (`AssetPickerApp` in `app.min.js`). The picker is a lightweight script without any dependencies that will add it's listeners to elements matching the configured [selector](options). When one of these was clicked it'll setup a modal from a template, inject the styles for it into the header (both, template and style are [customizable](options)), loads the app into and iframe in the modal and passes it the [config](config). The communication with the iframe is done with [cross window messaging](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) so it is CORS aware.
 
 Unless you want to customize the app itself, the picker will be the only API you'll have to use. 

## Installation

### CDN

The easiest way to integrate AssetPicker is to use include the picker script from a CDN:
 
```html
<script src="https://cdn.rawgit.com/netresearch/assetpicker/1.0.0/dist/js/picker.min.js"></script>

<script>
    new AssetPicker(config, options);
</script>

<button rel="assetpicker">Select a file</button>
```

It doesn't matter if you include the script in head or at footer - it will register on dom ready anyway.

If you don't want to use a CDN, you can download the [dist](https://github.com/netresearch/assetpicker/tree/master/dist) directory to a web server and include the `picker-min.js` from there (the other files from dist must be available).

### npm

You can happily install AssetPicker using npm:
```bash
npm install --save assetpicker
```

```javascript
var AssetPicker = require('assetpicker');
new AssetPicker(
    config,
    {
        modal: {
            src: 'node_modules/assetpicker/dist'
        }
    }
);
```

See more on setting AssetPicker with npm below.

## Configuration
The `AssetPicker` constructor takes two arguments: `config` (required) and `options` (both of type `object`). `config` is the configuration that will be passed to the `AssetPickerApp` and `options` can contain options for the picker and the modal.

```javascript
new AssetPicker(config); /* or */ new AssetPicker(config, options);
```

### config

key | type | default | description
--- | --- | --- | ---
**title** | string | `"AssetPicker"` | The title that will be shown in the navigation header
**storages** | object | - | The storages that should be available, each entry must be an object, which will be passed to the [storage adapter](Adapters)
**storages.xyz.adapter** | string | - | Required: name of the adapter to use (currently `github` and `entermediadb` possible)
**storages.xyz.label** | string | key of storage | Optional: Label for the storage in navigation bar and search results 
**storages.xyz.proxy** | bool|object | - | Controls proxy configuration for this storage (true: Use proxy with global configuration, false: disable the proxy - even when enabled for all storages, object: Use proxy with custom configuration)
**proxy** | object | {} | Global proxy configuration
**proxy.url** | string | `"proxy.php?to={{url}}"` | Url to the proxy - the string is interpolated by vue, so you can use filters and JS expressions. Use `{{url}}` for a urlencoded version of the target url and `{{url.raw}}` for the unencoded target url
**proxy.all** | bool | `false` | Whether to enable the proxy for all storages (unless they disable it)
**language** | string | `"auto"` | Language for the interface - use "auto" to detect the language from the browser. Possible languages are `de` and `en` for now.
**debug** | boolean | `false` | En-/disables Vue.config.debug
**github.token** | string | - | Optional token for the [GitHub adapter](GitHub)

## Adapters
### GitHub
The GitHub adapter utilizes the GitHub API to provide files and folders in a GitHub repository to AssetPicker. For this to work, you either need an GitHub API token or the user will need a GitHub account.
 
#### Authentication
In case you don't provide an API token, the user will be asked for his GitHub credentials. Those credentials will then only be used to create a [personal access token](https://github.com/settings/tokens) which will be stored in his browsers local storage. From then on this personal token will be used for authentication with GitHub. **The users login and password won't be stored in any way**.

#### Configuration
```javascript
new AssetPicker({
    storages: {
        somegithubrepo: {
            adapter: 'github',
            // Owner of the repository, required:
            username: 'netresearch',
            // The repository name, required:
            repository: 'assetpicker'
        }
    },
    github: {
        // Token for authentication with GitHub API, optional (see above):
        token: '29782sdwhd2eu2e823jdjhw9832ijs92'
    }
});
```

### EnterMediaDB
The EnterMediaDB adapter utilizes the [EnterMediaDB](http://entermediadb.org) API to provide categories and assets to AssetPicker.

### Authentication
Authentication with EnterMediaDB API is session based and requires the user to provide his credentials to authenticate with the API. Thus you have to make sure, that the users using AssetPicker have the [permissions](http://entermediadb.org/knowledge/roles-and-permissions/) to use the API inside EnterMediaDB.

#### Configuration
EnterMediaDB currently doesn't provide [CORS](https://de.wikipedia.org/wiki/Cross-Origin_Resource_Sharing) support and thus, if AssetPicker is served from a different host, protocol or port than EnterMediaDB, you'll likely need a proxy.
```javascript
new AssetPicker({
    storages: {
        somegithubrepo: {
            adapter: 'entermediadb',
            // URL to the catalogue, required:
            url: 'http://em9.entermediadb.org/openinstitute',
            // Proxy is likely required 
            proxy: true
        }
    }
});
```

### Register your own adapter
Coming soon

## Roadmap
- Adapters
    - Google Drive
    - Amazon S3
    - Dropbox
- Symfony Bundle
- github:
    - Two Factor Auth
    - Branch selector
    - Deal with submodules and symlinks
- Management features like upload, renaming, moving etc.