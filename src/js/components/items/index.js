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
        return {
            selection: require('../../model/selection')
        }
    },
    computed: {
        isSingleStorage: function () {
            return Object.keys(this.selection.results).length === 1;
        },
        storage: function () {
            return this.isSingleStorage ? Object.keys(this.selection.results)[0] : null;
        }
    },
    watch: {
        'selection.storage': function (storage) {
            if (storage) {
                this.search = null;
            }
        },
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
        'selection.items': function () {
            this.$nextTick(function () {
                if (!this.search || this.isSingleStorage) {
                    this.$dispatch('items-set');
                }
            })
        }
    },
    methods: {
        loadMore: function (results) {
            this.$root.$broadcast('load-more-items', results);
        }
    },
    components: {
        grid: require('./grid')
    }
};