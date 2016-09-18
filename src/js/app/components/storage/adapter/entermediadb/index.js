var Item = require('../../../../model/item');
var Vue = require('vue');

var Terms = function () {
    var terms = [{
            field: 'id',
            operator: 'matches',
            value: '*'
        }],
        termsSet = false;
    terms.hash = 'id matches "*"';
    terms.push = function (field, operator, value) {
        if (!termsSet) {
            terms.pop();
            termsSet = true;
            terms.hash = '';
        }
        Array.prototype.push.call(terms, {field: field, operator: operator, value: value});
        terms.hash += field + ' ' + operator + ' "' + value + '";';
    };
    return terms;
};

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
            selection: require('../../../../model/selection'),
            items: null,
            results: {},
            extensions: null
        }
    },
    watch: {
        'appConfig.pick': function (config) {
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
        }
    },
    methods: {
        assembleTerms: function () {
            var terms = new Terms();
            if (this.category) {
                terms.push('category', 'exact', this.category.id);
            }
            if (this.search) {
                terms.push('description', 'freeform', this.search);
            }
            if (this.extensions && this.extensions.length) {
                terms.push('fileformat', 'matches', this.extensions.join('|'))
            }
            return terms;
        },
        loadAssets: function (items) {
            var terms = this.assembleTerms();
            var result = this.results[terms.hash];
            if (!result) {
                result = {page: 0, pages: 0, items: items || []};
                result.items.total = result.items.total || result.items.length;
                this.results[terms.hash] = result;
            } else if (result.page === result.pages) {
                return this.$promise(function (resolve) {
                    resolve(result);
                });
            }

            result.items.loading = true;
            result.items.hash = terms.hash;

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
                if (result.items.hash === terms.hash) {
                    result.page = parseInt(response.data.response.page);
                    result.pages = parseInt(response.data.response.pages);
                    result.items.total = parseInt(response.data.response.totalhits);
                    result.items.loading = false;
                    response.data.results.forEach((function (asset) {
                        var item = this.createItem({
                            id: asset.id,
                            type: asset.isfolder ? 'file' : 'dir',
                            name: asset.primaryfile || asset.name,
                            title: asset.assettitle,
                            extension: asset.fileformat.id,
                            thumbnail: this.url(
                                '/emshare/views/modules/asset/downloads/preview/thumb/' +
                                encodeURI(asset.sourcepath) + '/thumb.jpg',
                                this.config.url
                            )
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
                    category.type = 'dir';
                    return this.createItem(category);
                }).bind(this));
            });
        },
        'category-select-item': function (tree) {
            this.category = tree.item;
            this.search = null;
            this.selection.items = [];
            this.loadAssets().then(function (response) {
                if (tree.selected) {
                    this.selection.items = response.items;
                }
            }.bind(this));
        }
    }
};
