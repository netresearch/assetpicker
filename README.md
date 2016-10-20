# AssetPicker

AssetPicker is a free asset or file picker designed to be easily included into web application interfaces. It has a file abstraction layer allowing adapters to connect to any remote storage, be it cloud storages like Amazon S3, Google Drive or Dropbox or assets from a custom web application server. In opposite to other file managers or pickers, AssetPicker is suitable for hierarchical as well as associative file storages.

### [Try the demo](https://netresearch.github.io/assetpicker)

**Manual**
* [How it works](#how-it-works)
* [Browser compatibility](#browser-compatibility)
* [Installation](#installation)
    * [CDN](#cdn)
    * [Docker](#docker)
    * [Composer](#composer)
    * [npm](#npm)
* [Configuration](#configuration)
    * [config](#config)
    * [options](#options)
    * [Buttons](#buttons)
* [API](#api)
    * [Methods](#methods)
    * [Events](#events)
* [Adapters](#adapters)
    * [Google Drive](#googledrive)
        * [Authentication](#authentication)
        * [Configuration](#configuration-1)
    * [GitHub](#github)
        * [Authentication](#authentication-1)
        * [Configuration](#configuration-2)
    * [EnterMediaDB](#entermediadb)
        * [Authentication](#authentication-2)
        * [Configuration](#configuration-3)
    * [Register your own adapter](#register-your-own-adapter)
* [Customize the app](#customize-the-app)
* [Roadmap](#roadmap)

## How it works
AssetPicker consists of two bundles: The picker (`AssetPicker` in `picker.js`) and the app (`AssetPickerApp` in `app.js`). The picker is a lightweight script without any dependencies that will add it's listeners to elements matching the configured [selector](#options). When one of these was clicked it'll setup a modal from a template, inject the styles for it into the header (both, template and style are [customizable](#options)), loads the app into and iframe in the modal and passes it the [config](#config). The communication with the iframe is done with [cross window messaging](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) so it is CORS aware.

The app provides the actual user interface and functionality. It has a default configuration which will be merged with the configuration passed to the picker. The key part of this configuration are the storages, which will be mounted as top level entries on the navigation bar (and on the start screen when you use multiple storages). Each of the storages can have a separate configuration and use other adapters. It reads the storages and adapters from the config and loads the adapter source scripts into the iframe, when they are used by one of the storages - thus unneeded storages don't bloat the size of the app.

Both, app and adapters are [Vue.js](https://vuejs.org) components which allows for a modern and maintainable application structure.
 
 Unless you want to customize the app itself, the picker will be the only API you'll have to use. 

## Browser compatibility

Modern browsers (IE >= 10) - tested in Chrome 53, Firefox 35 - 47, IE 10 - 11, Edge

## Installation

### CDN

The easiest way to integrate AssetPicker is to use include the picker script from a CDN:
 
```html
<script src="https://cdn.rawgit.com/netresearch/assetpicker/1.3.3/dist/js/picker.js"></script>

<script>
    new AssetPicker(config, options);
</script>

<button rel="assetpicker">Select a file</button>
```

It doesn't matter if you include the script in head or at footer - it will register on dom ready anyway.

If you don't want to use a CDN, you can download the [dist](https://github.com/netresearch/assetpicker/tree/master/dist) directory to a web server and include the `picker-min.js` from there (the other files from dist must be available).

### Docker

The best way to host AssetPicker on your own is to use it with docker or even easier with docker-compose:

```bash
git clone https://github.com/netresearch/assetpicker.git
cd assetpicker
docker-compose up -d
```

If you want to use the built in proxy, you'll need to run the following once:

```bash
docker exec -tiu www-data assetpicker_php '/bin/bash'
composer install
```

### Composer

You can include AssetPicker into your PHP application easily with composer (but you might need to make it's directory within the vendor directory available by linking it to an adequate public folder):

```bash
composer require netresearch/assetpicker
ln -s vendor/netresearch/assetpicker web/assetpicker
```

### Symfony Application

Feel free to use the [AssetPicker Bundle](https://github.com/netresearch/assetpicker-bundle).

### npm

You can happily install AssetPicker using npm:
```bash
npm install --save assetpicker
```

but you'll need to tell it the source of the app (please open an issue or PR if you find a way to workaround this):

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

Feel free to play around with some of the options on the [demo page](https://netresearch.github.io/assetpicker/#options). 

### config

key | type | default | description
--- | --- | --- | ---
**title** | string | `"AssetPicker"` | The title that will be shown in the navigation header
**storages** | object | - | The storages that should be available, each entry must be an object, which will be passed to the [storage adapter](#adapters)
**storages.xyz.adapter** | string | - | Required: name of the adapter to use (currently `github` and `entermediadb` possible)
**storages.xyz.label** | string | key of storage | Optional: Label for the storage in navigation bar and search results 
**storages.xyz.proxy** | bool|object | - | Controls proxy configuration for this storage (true: Use proxy with global configuration, false: disable the proxy - even when enabled for all storages, object: Use proxy with custom configuration)
**proxy** | object | {} | Global proxy configuration
**proxy.url** | string | `"proxy.php?to={{url}}"` | Url to the proxy - the string is interpolated by vue, so you can use filters and JS expressions. Use `{{url}}` for a urlencoded version of the target url and `{{url.raw}}` for the unencoded target url. The default value resolves to the included PHP proxy (which's dependencies must be installed with composer install before you can use it)
**proxy.all** | bool | `false` | Whether to enable the proxy for all storages (unless they disable it)
**language** | string | `"auto"` | Language for the interface - use "auto" to detect the language from the browser. Possible languages are `de` and `en` for now.
**debug** | boolean | `false` | En-/disables Vue.config.debug
**github.token** | string | - | Optional token for the [GitHub adapter](#github)
**picker** | object | {} | Default configuration to control what can be picked - overriden by [buttons attributes](#buttons)
**picker.limit** | number | `1` | Maximum of assets that can be picked (0 for unlimited)
**picker.types** | array | `['file']` | Asset types allowed to be picked
**picker.extensions** | array | `[]` | File extensions allowed to be picked (empty means all)
**adapters** | object | see [here](src/js/app/config.js#L29) | Sources of the possible adapters - here you can [register your own adapters](#register-your-own-adapter)
**adapters.xyz.src** | string | - | Required: The URL to the adapter script - relative to the app script (a leading / loads it relative from the modal src origin, use an absolute URL if the adapter source is not on the same origin as the app script or html file)
**adapers.xyz.name** | string | - | Required: Name of adapter object in global scope 
**thumbnails** | string | `"url"` | Way to deliver thumbnails in the resulting asset objects: "url" for the url, "data" for the data-uri (helpfull, when AssetPicker uses the proxy and your page doesn't)

### options

key | type | default | description
--- | --- | --- | ---
**selector** | string | `'[rel="assetpicker"]'` | CSS selector for the buttons you want to act as picker
**distUrl** | string | url of the picker script popped by two path parts (f.e. http://example.com/dist when picker script url is http://example.com/dist/js/picker.js) | Base URL of the AssetPicker dist directory
**modal** | object | {} | Options for the modal
**modal.src** | string | `distUrl + '/index.html'` | URL to the AssetPicker application
**modal.template** | string | see [here](src/js/picker/components/modal/index.html) | Template for the modal - requires an outer div with an iframe somewhere nested
**modal.css** | string | see [here](src/js/picker/components/modal/index.css) | CSS injected before any other CSS into head
**modal.openClassName** | string | `'assetpicker-modal-open'` | Class to add/remove to the modal template outer div on opening/closing
**ui.enabled** | bool | `true` | Whether to show a user interface for the selected assets
**ui.readonly** | bool | `false` | Whether to show add and delete buttons on the user interface
**ui.unique** | bool | `true` | Whether the UI should filter out duplicate assets after selection

### Buttons
Data attributes on the buttons can control what may be picked and what should happen after something was picked.

```
<button
    rel="assetpicker" 
    data-limit="0" 
    data-exts="jpeg,jpg,png">Select multiple images</button>
```

attribute | description
--- | ---
**data-limit** | Number of elements allowed to be picked (0 for no limit) - overrides [`config.picker.limit`](#config)
**data-exts** | Comma separated list of file extensions allowed to be picked (empty for any) - overrides [`config.picker.extensions`](#config)
**data-types** | Comma separated list of element types allowed to be picked (currently `dir`, `file` and `category` are supported by the adapters) - overrides [`config.picker.extensions`](#config)
**data-ui** | Overrides [`options.ui.enabled`](#options) (`<button ... data-ui>` or `<button ... data-ui="false">`)
**data-ro** | Overrides [`options.ui.readonly`](#options) (`<button ... data-ro>` or `<button ... data-ro="false">`)
**data-unique** | Overrides [`options.ui.readonly`](#options) (`<button ... data-unique>` or `<button ... data-unique="false">`)

## API

The `AssetPicker` provides a basic API including some methods and some events.

### Methods

method | description
--- | ---
`on(String event, Function listener)` | Register an event listener on an [event](#events)
`register(DomElement element)` | Register an element as AssetPicker button (will get the click event added).

### Events

The picker provides a simple events API with some events - the listeners will always be bound to the picker instance and receive arguments depending on the event. Register your events as follows:

```javascript
var picker = new AssetPicker(config);
picker.on('pick', function(picked) {
  console.log(picked, this.element);
});
```

event | description
--- | ---
**pick** | Triggered after assets were picked (and the picker was closed). Listeners receive the picked assets as first argument (single asset when limit is 1 or array of assets otherwise)
**ready** | Triggered when the picker application was loaded
**resize** | Triggered when user minimizes or maximizes the application window

## Adapters
### Google Drive
The Google Drive adapter utilizes the Google API to retrieve assets from the users drive account, which he will have to pick when he has multiple accounts. For this to work you'll need to register your project on [Google API Console](https://console.developers.google.com) and activate the Drive API for it. After that you'll need to create an API key and an OAuth client ID in the credentials area of the project.

#### Authentication
The Google Drive adapter uses [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web/) - this means that your users will have to authenticate with Google and authorize AssetPicker in a pop up window. AssetPicker will then receive a short-lived token to access the API for the user - no further information will be stored by AssetPicker. Thus it will likely occur that AssetPicker will have to reopen this window when the token expired - as pop up blockers will likely block automatic pop ups your users will have to click a button manually to do that until we found a better solution.

#### Configuration
```javascript
new AssetPicker({
    storages: {
        drive: {
            adapter: 'googledrive',
            // OAuth client id from API console, required
            client_id: 'xxx',
            // API key from API console, required
            api_key: 'xxx',
            // Google Apps Domain to which users must belong, optional
            hosted_domain: 'mycompany.com',
            // Requests to Google APIs are limited and AssetPicker requires some
            // of them to show the doc tree - use this to force start new requests
            // at least this amount of milliseconds after the last ones
            // (defaults for Google Drive adapter is 100), optional
            http: {
              throttle: 250
            }
        }
    }
});
```

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

#### Authentication
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

Adapters are actually vue components which's template will be rendered in the navigation bar. Loading of items is completely controlled by events. Have a look at the [existing adapters](src/js/adapter) to see details.

The standard way to do this, is to create a standalone script, that contains the adapter and reference it in the config. The script is required as standalone because it won't be loaded in
the same window as where the picker is included but from an iframe.

The following example shows a basic adapter, loading a hierarchical structure from an endpoint:
 
https://myapp.example.com/myadapter.js
```javascript
AssetPickerAdapterMine = {
    events: {
        'load-items': function(tree) {
            this.http.get(this.config.url + '/files/' + (tree.item ? tree.item.id : '')).then(
                function(response) {
                    tree.items = response.data.map(this.createItem);
                }
            );
        }
    }
}
```

https://myapp.example.com/index.html (where the picker is included)
```javascript
new AssetPicker({
    storages: {
        mystorage: {
            adapter: 'mine',
            url: 'https://example.com'
        }
    },
    adapters: {
        mine: 'https://myapp.example.com/myadapter.js'
    }
});
```

Also you can add custom adapters when you have installed the App with npm - see below for an example.

## Customize the app

Apart from simply forking this repository, you can also include the app into your project. For this you'll need a npm app built with browserify to customize the app. AssetPickerApp is using [Vue.js] - so you might consider reading it's [docs](http://vuejs.org/guide/) before.

1. Initialize the app

    ```bash
    npm init
    npm install --save assetpicker
    ```

2. Customize the AssertPickerApp or it's compontents
    
    src/app.js:
    ```javascript
    var Storage = require('assetpicker/src/js/app/components/storage');
    Storage.components.myadapter = require('./myadapter');
    
    var config  = require('assetpicker/src/js/app/config');
    config.storages = {
        myadapterstorage: {
            adapter: 'myadapter',
            label: 'My Adapter'
            // ... options for myadapter
        }
    }
    
    module.exports = require('assetpicker/src/js/app');
    ```
3. Build an HTML page for the app:

    app.html
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AssetPicker</title>
        <link rel="stylesheet" href="node_modules/assetpicker/dist/css/main.css"
    </head>
    <body>
    <div id="app"></div>
    <script src="dist/js/app.js"></script>
    <script>
       new AssetPickerApp({el: '#app'});
    </script>
    </body>
    </html>
    ```

4. Build a HTML page to which the picker should be included:
    
    index.html
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AssetPicker</title>
    </head>
    <body>
    <script src="node_modules/assetpicker/dist/js/picker.js"></script>
    <script>
       new AssetPicker(null, {
            modal: {
                 src: 'app.html'
            }
       });
    </script>
    <button rel="assetpicker">Pick an asset</button>
    </body>
    </html>
    ```

5. Setup gulp or any other build tool

    ```
    npm install -g gulp
    npm install -S browserify vinyl-source-stream
    ```
    
    gulp.js
    ```
    var gulp = require('gulp');
    var browserify = require('browserify');
    var source = require('vinyl-source-stream');
    
    gulp.task('js', function () {
        var b = browserify({
            entries: './src/app.js',
            standalone: 'AssetPickerApp',
            debug: true
        });
    
        return b.bundle()
            .pipe(source('app.js'))
            .pipe(gulp.dest('./dist/js/'));
    });
    ```
    
    ```
    gulp js
    ```

## Roadmap
- Adapters
    - Amazon S3
    - Dropbox
- Google Drive
    - IE compatibility
    - Reauthentication without user interaction required
- github:
    - Two Factor Auth
    - Branch selector
    - Deal with submodules and symlinks
- Management features like upload, renaming, moving etc.
