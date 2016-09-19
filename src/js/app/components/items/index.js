module.exports = {
    template: require('./index.html'),
    directives: {infiniteScroll: require('vue-infinite-scroll').infiniteScroll},
    props: {
        layout: {
            type: String,
            default: 'grid'
        }
    },
    data: function () {
        var selection = require('../../model/selection');
        var storages = require('../../config').storages;
        var keys = Object.keys(storages);
        return {
            selection: selection,
            storage: keys.length > 1 ? null : keys[0],
            storages: storages,
            numStorages: keys.length
        }
    },
    events: {
        'select-item': function (item) {
            this.storage = item.storage;
            return true;
        }
    },
    watch: {
        'selection.search': function (sword) {
            this.$nextTick(function () {
                if (sword) {
                    this.storage = undefined;
                }
            });
        },
        'selection.items': function (items) {
            this.storage = items.storage;
            this.$nextTick(function () {
                if ((!this.search || this.storage) && items && !items.loading && items.total && items.length < items.total) {
                    this.$dispatch('items-set');
                }
            })
        }
    },
    methods: {
        loadMore: function () {
            this.$root.$broadcast('load-more-items', this.selection.items);
        },
        selectStorage: function (storage) {
            this.storage = storage;
            this.selection.items = this.$get('selection.results.' + storage);
        }
    },
    components: {
        grid: require('./grid')
    }
};
