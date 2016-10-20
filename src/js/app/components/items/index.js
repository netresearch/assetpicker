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
        var config = require('../../config');
        var keys = Object.keys(config.storages);
        return {
            selection: selection,
            storage: keys.length > 1 ? null : keys[0],
            config: config,
            picked: require('../../model/pick')
        }
    },
    calculated: {
        numStorages: function () {
            return Object.keys(this.config.storages).length;
        }
    },
    events: {
        'select-item': function (item) {
            this.storage = item.storage;
            return true;
        },
        'resize': function() {
            this.invalidateLayout();
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
            this.$nextTick(this.invalidateLayout);
        },
        'config.storages': function (storages) {
            var keys = Object.keys(storages);
            if (this.selection.search || this.storage && keys.indexOf(this.storage) === -1) {
                this.$nextTick(function () {
                    this.$root.$broadcast('select-item', {storage: keys.length === 1 ? keys[0] : undefined})
                });
            }
        }
    },
    methods: {
        invalidateLayout: function() {
            var items = this.selection.items;
            if ((!this.selection.search || this.storage) && items && !items.loading && items.total && items.length < items.total) {
                this.$dispatch('items-set');
            }
        },
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
