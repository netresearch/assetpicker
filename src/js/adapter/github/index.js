module.exports = {
    translations: {
        description: {
            en: 'Repository {{config.username}}/{{config.repository}} on GitHub',
            de: 'Repository {{config.username}}/{{config.repository}} auf GitHub'
        }
    },
    http: {
        base: 'https://api.github.com'
    },
    data: function() {
        return {
            // this.appConfig is not yet available here, so have to initialize it on created
            token: null
        };
    },
    created: function () {
        this.token = this.appConfig.github.token || localStorage.getItem('github_token')
    },
    watch: {
        token: function (token) {
            if (token) {
                localStorage.setItem('github_token', token);
            } else if (localStorage.getItem('github_token')) {
                localStorage.removeItem('github_token')
            }
        }
    },
    events: {
        'load-items': function (tree) {
            if (this.token) {
                this.http.get(
                    'repos/' + this.config.username + '/' + this.config.repository + '/contents/' + (tree.item ? tree.item.id : ''),
                    {
                        headers: {
                            Authorization: 'token ' + this.token
                        }
                    }
                ).then(
                    function(response) {
                        var items = response.data.map((function (file) {
                            return this.createItem({
                                id: file.path.replace(/^\/+/, ''),
                                name: file.name,
                                type: file.type,
                                data: file,
                                links: {
                                    open: file.html_url
                                }
                            });
                        }).bind(this));
                        tree.items = items.sort(function (a, b) {
                            if (a.type === 'dir' && b.type !== 'dir') {
                                return -1;
                            } else if (a.type !== 'dir' && b.type === 'dir') {
                                return 1;
                            }
                            var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                            if (nameA < nameB)
                                return -1;
                            if (nameA > nameB)
                                return 1;
                            return 0;
                        });
                    },
                    (function () {
                        this.token = null;
                        this.$dispatch('load-items', tree);
                    }).bind(this)
                );
            } else {
                this.createToken().then((function () {
                    this.$dispatch('load-items', tree);
                }).bind(this));
            }
        }
    },
    methods: {
        createToken: function () {
            return this.login(function (username, password, callback) {
                var baseUrl = document.location.protocol + '//' + document.location.host,
                    fingerprint = 'netresearch-assetpicker-github-' + baseUrl,
                    options = {
                        headers: {
                            Authorization: 'Basic ' + btoa(username + ':' + password)
                        }
                    },
                    createAuthorization = function () {
                        this.http.post(
                            'authorizations',
                            {
                                note: 'Repository access for ' + this.t('header.title') + ' at ' + baseUrl,
                                scopes: ['public_repo', 'repo'],
                                fingerprint: fingerprint
                            },
                            options
                        ).then(
                            function (response) {
                                this.token = response.data.token;
                                if (!this.token) {
                                    throw 'Could not find expected this.token';
                                }
                                callback(true);
                            }.bind(this)
                        )
                    }.bind(this);

                this.http.get('authorizations', options).then(
                    (function(response) {
                        for (var i = 0, l = response.data.length; i < l; i++) {
                            if (response.data[i].fingerprint === fingerprint) {
                                this.http.delete('authorizations/' + response.data[i].id, options).then(createAuthorization);
                                return;
                            }
                        }
                        createAuthorization();
                    }).bind(this),
                    function () {
                        callback(false);
                    }
                );
            });
        }
    }
};
