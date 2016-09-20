var Item = require('../../../../model/item');
var Vue = require('vue');


module.exports = {
    template: require('./template.html'),
    extends: require('../base'),
    http: function() {
        var options = {
            base: this.config.url.replace(/\/+$/, '') + '/mediadb/services',
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
            items: null,
            results: {},
            extensions: null
        }
    },
    watch: {
        'appConfig.pick': {
            handler: function (config) {
                // Reload latest items when extensions have changed
                var oldTerms = this.assembleTerms();
                this.extensions = config.extensions;
                var newTerms = this.assembleTerms();
                if (oldTerms.hash !== newTerms.hash && this.results[oldTerms.hash]) {
                    var items = this.results[oldTerms.hash].items;
                    while (items.length > 0) {
                        items.pop();
                    }
                    this.loadAssets(items);
                }
            },
            immediate: true
        }
    },
    dateFormat: 'YYYY-MM-DDTHH:mm:ss',
    methods: {
        assembleTerms: function () {
            var terms = [],
                pushTerm = function (field, operator, value) {
                    terms.push({field: field, operator: operator, value: value});
                };
            if (this.category) {
                pushTerm('category', 'exact', this.category.id);
            }
            if (this.search) {
                pushTerm('description', 'freeform', this.search);
            }
            if (this.extensions && this.extensions.length) {
                pushTerm('fileformat', 'matches', this.extensions.join('|'))
            }
            if (!terms.length) {
                pushTerm('id', 'matches', '*');
            }
            return terms;
        },
        loadAssets: function (items) {
            var terms = this.assembleTerms();
            var query = JSON.stringify(terms);
            var result = this.results[query];
            if (!result) {
                result = {page: 0, pages: 0, items: items || []};
                result.items.total = result.items.total || result.items.length;
                this.results[query] = result;
            } else {
                if (items && result.items !== items) {
                    Array.prototype.push.apply(items, result.items);
                    items.total = result.items.total;
                    items.loading = result.items.loading;
                    items.query = query;
                    result.items = items;
                }
                if (result.page === result.pages) {
                    return this.$promise(function (resolve) {
                        resolve(result);
                    });
                }
            }

            result.items.loading = true;
            result.items.query = query;

            return this.http.post(
                'module/asset/search',
                {
                    page: '' + (result.page + 1),
                    hitsperpage: '20',
                    query: {
                        terms: terms
                    }
                }
            ).then((function(response) {
                if (result.items.query === query) {
                    result.page = parseInt(response.data.response.page);
                    result.pages = parseInt(response.data.response.pages);
                    result.items.total = parseInt(response.data.response.totalhits);
                    result.items.loading = false;
                    response.data.results.forEach((function (asset) {
                        var item = this.createItem({
                            id: asset.id,
                            query: query,
                            type: asset.isfolder ? 'file' : 'dir',
                            name: asset.assettitle || asset.name || asset.primaryfile,
                            title: asset.assettitle,
                            extension: asset.fileformat.id,
                            created: this.parseDate(asset.assetcreationdate || asset.assetaddeddate),
                            modified: this.parseDate(asset.assetmodificationdate),
                            thumbnail: this.url(
                                '/emshare/views/modules/asset/downloads/preview/thumb/' +
                                encodeURI(asset.sourcepath) + '/thumb.jpg',
                                this.config.url
                            ),
                            data: asset
                        });
                        result.items.push(item);
                    }).bind(this));
                }
                return result;
            }).bind(this));
        }
    },
    events: {
        'select-item': function (item) {
            if (item === 'entrypoint') {
                this.category = null;
                this.search = null;
                this.loadAssets().then((function(response) {
                    this.items = response.items;
                    this.$parent.$dispatch('select-item', this);
                }).bind(this));
            } else {
                return true;
            }
        },
        'load-more-items': function (results) {
            this.loadAssets(results);
        },
        'search': function (sword, results) {
            this.search = sword;
            this.loadAssets(results);
            return true;
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
                tree.items = response.data.results.map((function(category) {
                    return this.createItem({
                        id: category.id,
                        name: category.name,
                        type: 'category',
                        data: category
                    });
                }).bind(this));
            });
        },
        'category-select-item': function (tree) {
            this.category = tree.item;
            this.search = null;
            this.loadAssets(tree.items).then(function (response) {
                if (tree.selected) {
                    this.$dispatch('select-item', tree);
                }
            }.bind(this));
        }
    }
};
