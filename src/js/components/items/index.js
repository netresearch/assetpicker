module.exports = {
    template: require('./index.html'),
    directives: {infiniteScroll: require('vue-infinite-scroll').infiniteScroll},
    props: {
        layout: {
            type: String,
            default: 'grid'
        },
        search: String
    },
    data: function () {
        var selection = require('../../model/selection');
        var keys = Object.keys(selection.results);
        return {
            selection: selection,
            storage: keys.length > 1 ? null : keys[0],
            loadedMore: false
        }
    },
    computed: {
        isSingleStorage: function () {
            return Object.keys(this.selection.results).length === 1;
        }
    },
    events: {
        'select-item': function (item) {
            this.search = null;
            this.storage = item.storage;
            return true;
        }
    },
    watch: {
        search: function (sword) {
            this.$nextTick(function () {
                if (sword) {
                    this.$root.$broadcast('deselect-items');
                }
                if (this.isSingleStorage) {
                    this.$root.$broadcast('search', this.storage, sword, this.selection.items);
                } else {
                    var keys = Object.keys(this.selection.results);
                    for (var i = 0, l = keys.length; i < l; i++) {
                        this.selection.results[keys[i]] = [];
                        this.$root.$broadcast('search', keys[i], sword, this.selection.results[keys[i]]);
                    }
                }
            });
        },
        'selection.items': function (items) {
            this.storage = items.storage;
            this.$nextTick(function () {
                if ((!this.search || isSingleStorage) && items && !items.loading && items.total && items.length < items.total) {
                    this.$dispatch('items-set');
                }
            })
        }
    },
    methods: {
        loadMore: function (results) {
            this.$root.$broadcast('load-more-items', results || this.selection.items);
        }
    },
    components: {
        grid: require('./grid')
    }
};
