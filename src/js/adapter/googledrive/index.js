var auth2, requests = 0, second;

module.exports = {
    http: {
        base: 'https://content.googleapis.com/drive/v3'
    },
    created: function () {
        if (this.auth) {
            this.config.email = this.auth.email;
        }
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
                            gapi.auth2.init({
                                client_id: this.config.client_id,
                                scope: 'https://www.googleapis.com/auth/drive.readonly'
                            }).then(function(a) {
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
                            console.log(currentUser.getAuthResponse());
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
                            q: '\'' + (tree.item ? tree.item.id : 'root') + '\' in parents'
                        }
                    }
                ).then(function(response) {
                    console.log(response);
                    tree.items = JSON.parse(response.data).files.map(function(item) {
                        return this.createItem({
                            id: item.id,
                            name: item.name,
                            type: item.mimeType === 'application/vnd.google-apps.folder' ? 'dir' : 'file',
                            data: item
                        });
                    }.bind(this));
                    console.log(tree.items);
                });
            }.bind(this));
        }
    }
};
