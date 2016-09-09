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
        terms.hash = field + ' ' + operator + ' "' + value + '";';
    };
    return terms;
};

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
            selection: require('../../../../model/selection'),
            items: null,
            results: {}
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
        loadAssets: function (more) {
            var terms = new Terms();
            if (this.category) {
                terms.push('category', 'exact', this.category.id);
            }
            if (this.search) {
                terms.push('description', 'freeform', this.search);
            }
            var result = this.results[terms.hash];
            if (result && (!more || result.page === result.pages)) {
                return this.$promise(function (resolve) {
                    resolve(result);
                });
            } else if (!result) {
                result = {page: 0, pages: 0, total: 0, items: []};
                this.results[terms.hash] = result;
            }

            return this.http.post(
                'module/asset/search',
                {
                    page: '' + (result.page + 1),
                    hitsperpage: '20',
                    query: {
                        terms: terms
                    }
                }
            ).then(function(response) {
                result.page = parseInt(response.data.response.page);
                result.pages = parseInt(response.data.response.pages);
                result.total = parseInt(response.data.response.totalhits);
                response.data.results.forEach((function (asset) {
                    result.items.push(
                        new Item({
                            id: asset.id,
                            type: 'file',
                            name: asset.primaryfile || asset.name,
                            title: asset.assettitle,
                            thumbnail: this.getThumbnail(asset)
                        })
                    );
                }).bind(this));
                return result;
            });
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
            this.loadAssets(true).then((function (response) {
                if (results && results.source === this) {
                    results.push.apply(results, response.items.slice(results.length));
                } else {
                    this.selection.items = response.items;
                }
            }));
        },
        'search': function (sword, results) {
            this.search = sword;
            results.source = this;
            if (sword) {
                this.loadAssets().then(function (response) {
                    results.total = response.total;
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