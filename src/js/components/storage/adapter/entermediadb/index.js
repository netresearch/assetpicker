var Item = require('../../../model/item');
var Vue = require('vue');

module.exports = {
    template: require('./template.html'),
    extends: require('../base'),
    http: function() {
        var options = {
            base: this.config.url.replace(/\/+$/, '') + '/assets/mediadb/services',
            validate: function (response) {
                response.data = response.json();
                if (response.data.response.status !== 'ok') {
                    this.login(function(username, password, callback) {
                        this.http.post('authentication/login', {id: username, password: password}, {validate: function (response) {
                            response.data = response.json();
                            response.isValid(response.data.response.status === 'ok');
                        }}).then(
                            function (response) {
                                callback(response.data.results.status !== 'invalidlogin');
                            }
                        );
                    }).then(response.reload);
                } else {
                    response.isValid();
                }
            }
        };
        return options;
    },
    data: function () {
        return {
            category: null,
            search: null,
            selection: require('../../../model/selection'),
            items: null
        }
    },
    methods: {
        getThumbnail: function (asset) {
            return this.url(
                '/assets/emshare/views/modules/asset/downloads/preview/thumb/' +
                encodeURI(asset.sourcepath) + '/thumb.jpg',
                this.config.url
            );
        },
        loadAssets: function () {
            terms = [];
            if (this.category) {
                terms.push({
                    field: 'category',
                    operator: 'exact',
                    value: this.category.id
                });
            }
            if (this.search) {
                terms.push({
                    field: 'description',
                    operator: 'freeform',
                    value: this.search
                })
            }
            if (!terms.length) {
                terms.push({
                    field: 'id',
                    operator: 'matches',
                    value: '*'
                });
            }
            return this.http.post(
                'module/asset/search',
                {
                    hitsperpage: '20',
                    query: {
                        terms: terms
                    }
                }
            ).then(function(response) {
                response.items = response.data.results.map((function (asset) {
                    return Item({
                        id: asset.id,
                        type: 'file',
                        name: asset.primaryfile || asset.name,
                        title: asset.assettitle,
                        thumbnail: this.getThumbnail(asset)
                    });
                }).bind(this));
                return response;
            });
        }
    },
    events: {
        'select-item': function (item) {
            if (item === 'entrypoint') {
                if (this.items === null) {
                    this.category = null;
                    this.search = null;
                    this.loadAssets().then((function(response) {
                        this.items = response.items;
                        this.$parent.$dispatch('select-item', this);
                    }).bind(this));
                } else {
                    this.$parent.$dispatch('select-item', this);
                }
            } else {
                return true;
            }
        },
        'search': function (sword, results) {
            this.search = sword;
            if (sword) {
                this.loadAssets().then(function (response) {
                    results.push.apply(results, response.items);
                });
            }
        },
        'category-load-items': function (tree) {
            this.http.post(
                'lists/search/category',
                {
                    hitsperpage: '100',
                    query: {
                        terms: [
                            {
                                field: 'parentid',
                                operator: 'exact',
                                value: tree.item ? tree.item.id : 'index'
                            }
                        ]
                    }
                }
            ).then(function (response) {
                tree.items = response.data.results.map(function(category) {
                    category.type = 'dir';
                    return new Item(category);
                });
            });
        },
        'category-select-item': function (tree) {
            this.$dispatch('select-item', tree);
            this.category = tree.item;
            this.loadAssets().then(function (response) {
                if (tree.selected) {
                    this.selection.items = response.items;
                }
            });
        }
    }
};