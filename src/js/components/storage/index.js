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
            fetch: false
        };
    },
    events: {
        'select-item': function(item) {
            if (item instanceof Vue) {
                // Triggered from sidebar
                item.items.storage = this.id;
                this.selection.items = item.items;
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
        },
        'search': function (storageId, sword, items) {
            if (storageId === this.id) {
                this.fetch = true;
                this.$nextTick(function() {
                    this.$broadcast('search', sword, items);
                });
            }
        }
    },
    components: {
        github: require('./adapter/github'),
        entermediadb: require('./adapter/entermediadb')
    }
};
