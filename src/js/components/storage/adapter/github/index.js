var Item = require('../../../model/item');
var Config = require('../../../../config');

var token = Config.github.token || localStorage.getItem('github_token');

module.exports = {
    extends: require('../base'),
    events: {
        'load-items': function (tree) {
            if (token) {
                this.$http.get(
                    this.url('https://api.github.com/repos/' + this.config.username + '/' + this.config.repository + '/contents/' + (tree.item ? tree.item.id : '')),
                    {
                        headers: {
                            Authorization: 'token ' + token
                        }
                    }
                ).then(
                    function(response) {
                        tree.items = response.data.map(function (file) {
                            file.id = file.path.replace(/^\/+/, '');
                            return new Item(file);
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
                var fingerprint = 'netresearch-assetpicker-github',
                    url = 'https://api.github.com/authorizations',
                    options = {
                        headers: {
                            Authorization: 'Basic ' + btoa(username + ':' + password)
                        }
                    },
                    createAuthorization = (function () {
                        this.$http.post(
                            this.url(url),
                            {
                                note: 'Repository access for ' + this.t('header.title'),
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

                this.$http.get(this.url(url), options).then(
                    (function(response) {
                        for (var i = 0, l = response.data.length; i < l; i++) {
                            if (response.data[i].fingerprint === fingerprint) {
                                this.$http.delete(this.url(response.data[i].id, url), options).then(createAuthorization);
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
