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
            selection: require('../model/selection')
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
        }
    },
    components: {
        github: require('./adapter/github'),
        entermediadb: require('./adapter/entermediadb')
    },
    watch: {
        'search': function (sword) {
            this.$nextTick(function () {
                this.selection.results[this.id] = [];
                this.$broadcast('search', sword, this.selection.results[this.id]);
            });
        }
    }
};