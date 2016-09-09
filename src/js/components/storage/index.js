var Vue = require('vue');

module.exports = {
    template: require('./template.html'),
    props: {
        storage: Object,
        open: Boolean,
        search: String,
        id: String
    },
    data: function () {
        return {
            items: null,
            selection: require('../../model/selection')
        };
    },
    events: {
        'select-item': function(item, storageId) {
            if (item instanceof Vue) {
                // Triggered from sidebar
                this.selection.storage = this;
                this.selection.items = item.items;
            } else {
                // Triggered from stage
                if (storageId === this.id || this.selection.storage === this) {
                    this.open = true;
                    this.selection.storage = this;
                    this.$nextTick(function () {
                        this.$broadcast('select-item', item);
                    });
                } else {
                    this.$broadcast('deselect-items');
                }
            }
        },
        'load-more-items': function (results) {
            if (this.selection.storage === this || this.search && results) {
                return true;
            }
        },
        'search': function (storageId, sword, items) {
            if (storageId === this.id) {
                this.$broadcast('search', sword, items);
            }
        }
    },
    components: {
        github: require('./adapter/github'),
        entermediadb: require('./adapter/entermediadb')
    }
};