var Vue = require('vue');

module.exports = {
    template: require('./template.html'),
    props: {
        storage: Object,
        open: Boolean,
        id: String
    },
    data: function () {
        return {
            items: null,
            selection: require('../../model/selection'),
            pick: require('../../model/pick'),
            fetch: false
        };
    },
    ready: function () {
        if (this.open) {
            this.$children[0].select();
        }
    },
    events: {
        'select-item': function(item) {
            this.selection.search = null;
            if (item instanceof Vue) {
                // Triggered from sidebar
                item.items.storage = this.id;
                this.selection.items = item.items;
                this.pick.candidate(item.item);
            } else {
                // Triggered from stage
                if (item.storage === this.id) {
                    this.open = true;
                    this.$nextTick(function () {
                        this.$broadcast('select-item', item);
                    });
                } else {
                    this.$broadcast('deselect-items');
                }
            }
        },
        'load-more-items': function (results) {
            if (results.storage === this.id) {
                this.$broadcast('load-more-items', results);
            }
        }
    },
    watch: {
        'selection.search': function (sword) {
            if (sword) {
                this.pick.candidate(null);
                this.$broadcast('deselect-items');
                this.$set('selection.results.' + this.id, []);
                var results = this.$get('selection.results.' + this.id);
                results.storage = this.id;
                this.fetch = true;
                this.$nextTick(function() {
                    this.$broadcast('search', sword, results);
                });
            }
        }
    },
    components: {
        github: require('./adapter/github'),
        entermediadb: require('./adapter/entermediadb')
    }
};
