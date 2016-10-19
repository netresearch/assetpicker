var auth2, numInstances;

module.exports = {
    translations: {
        description: {
            en: 'Google Drive ({{config.email || "Not connected"}})',
            de: 'Google Drive ({{config.email || "Nicht verbunden"}})'
        },
        'document': {
            en: 'Doc',
            de: 'Doc'
        },
        'spreadsheet': {
            en: 'Spreadsheet',
            de: 'Tabelle'
        },
        'presentation': {
            en: 'Presentation',
            de: 'Präsentation'
        },
        'map': {
            en: 'My Maps',
            de: 'My Maps'
        },
        'form': {
            en: 'Form',
            de: 'Formular'
        },
        'drawing': {
            en: 'Drawing',
            de: 'Zeichnung'
        },
        'folder': {
            en: 'Folder',
            de: 'Ordner'
        },
        'script': {
            en: 'App Script',
            de: 'App Script'
        }
    },
    http: {
        base: 'https://content.googleapis.com/drive/v3',
        http: {
            // Google web services by default have a limit of 1000 Requests / 100 seconds
            // So keep 100ms meantime between all requests
            throttle: 100
        }
    },
    created: function () {
        if (this.config.hosted_domain && numInstances) {
            require('vue').console.warn('hosted_domain is a global option for Google Auth - can not have multiple storages based on that');
        }
        if (this.auth) {
            this.config.email = this.auth.email;
        }
        numInstances++;
    },
    stored: {
        auth: true
    },
    methods: {
        loadAuth2: function() {
            return this.$promise(function(resolve) {
                if (auth2) {
                    resolve();
                } else {
                    this.util.loadScript('https://apis.google.com/js/platform.js', function() {
                        gapi.load('auth2', function() {
                            var options = {
                                client_id: this.config.client_id,
                                scope: 'https://www.googleapis.com/auth/drive.readonly'
                            };
                            if (this.config.hosted_domain) {
                                options.hosted_domain = this.config.hosted_domain;
                            }
                            gapi.auth2.init(options).then(function(a) {
                                auth2 = a;
                                resolve();
                            });
                        }.bind(this));
                    }.bind(this));
                }
            });
        },
        signIn: function () {
            return this.$promise(function(resolve) {
                this.loadAuth2().then(function() {
                    if (auth2.isSignedIn.get()) {
                        resolve(auth2.currentUser.get());
                    } else {
                        var open = this.$parent.open;
                        this.$parent.open = true;
                        var div = this.$el.appendChild(document.createElement('div'));
                        div.className = 'panel panel-default';
                        var button = div.appendChild(document.createElement('div'));
                        button.className = 'btn btn-default btn-block';
                        button.innerHTML = this.t('login.login');

                        auth2.attachClickHandler(button, {}, function(currentUser) {
                            this.$parent.open = open;
                            this.$el.removeChild(div);
                            resolve(currentUser);
                        }.bind(this));
                    }
                }.bind(this));
            });
        },
        setupToken: function() {
            return this.$promise(function(resolve) {
                var setup = function() {
                    this.$options.http.params = {key: this.config.api_key };
                    this.$options.http.headers = {Authorization: 'Bearer ' + this.auth.token};
                    resolve();
                }.bind(this);
                if (this.auth && this.auth.expires_at < Date.now()) {
                    this.auth = null;
                }
                if (this.auth) {
                    setup();
                } else {
                    this.signIn().then(function(user) {
                        this.auth = {
                            token: user.getAuthResponse().access_token,
                            expires_at: user.getAuthResponse().expires_at,
                            email: user.getBasicProfile().getEmail()
                        };
                        setup();
                    }.bind(this));
                }
            });
        },
        loadItems: function() {
            return this.$promise(function(resolve) {
                this.setupToken().then(function (token) {
                    this.http.get('files', {params: {key: this.config.api_key, q: '\'root\' in parents'}});
                }.bind(this));
            });
        }
    },
    events: {
        'load-items': function (tree) {
            this.setupToken().then(function (token) {
                this.http.get(
                    'files',
                    {
                        params: {
                            key: this.config.api_key,
                            q: '\'' + (tree.item ? tree.item.id : 'root') + '\' in parents and trashed = false',
                            fields: 'files,kind'
                        }
                    }
                ).then(function(response) {
                    tree.items = this.sortItems(
                        JSON.parse(response.data).files.map(function(item) {
                            var type = item.mimeType === 'application/vnd.google-apps.folder' ? 'dir' : 'file';
                            var typeLabel, googleType;
                            if (item.mimeType.indexOf('/vnd.google-apps.') > 0) {
                                googleType = item.mimeType.split('.').pop();
                                typeLabel = 'Google ' + (this.t(googleType) || googleType[0].toUpperCase() + googleType.substr(1));
                            }
                            return this.createItem({
                                id: item.id,
                                name: item.name,
                                type: type,
                                mediaType: {
                                    icon: item.iconLink,
                                    iconBig: (type === 'file' && item.iconLink) ? item.iconLink.replace(/\/icon_[0-9]+_([^_]+)_[^\/]+/, '/mediatype/icon_1_$1_x128.png') : undefined,
                                    label: typeLabel
                                },
                                links: {
                                    download: item.webContentLink,
                                    open: item.webViewLink
                                },
                                extension: item.fileExtension,
                                thumbnail: item.thumbnailLink,
                                data: item
                            });
                        }.bind(this))
                    );
                });
            }.bind(this));
        }
    }
};
