
var Config = require('../../../../config');

var token = Config.github.token || localStorage.getItem('github_token');

module.exports = {
    extends: require('../base'),
    http: {
        base: 'https://api.github.com'
    },
    events: {
        'load-items': function (tree) {
            if (token) {
                this.http.get(
                    'repos/' + this.config.username + '/' + this.config.repository + '/contents/' + (tree.item ? tree.item.id : ''),
                    {
                        headers: {
                            Authorization: 'token ' + token
                        }
                    }
                ).then(
                    function(response) {
                        var items = response.data.map((function (file) {
                            file.id = file.path.replace(/^\/+/, '');
                            return this.createItem(file);
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
                        localStorage.removeItem('github_token');
                        token = null;
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
                    createAuthorization = (function () {
                        this.http.post(
                            'authorizations',
                            {
                                note: 'Repository access for ' + this.t('header.title') + ' at ' + baseUrl,
                                scopes: ['public_repo', 'repo'],
                                fingerprint: fingerprint
                            },
                            options
                        ).then(function (response) {
                            token = response.data.token;
                            localStorage.setItem('github_token', token);
                            if (!token) {
                                throw 'Could not find expected token';
                            }
                            callback(true);
                        })
                    }).bind(this);

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
