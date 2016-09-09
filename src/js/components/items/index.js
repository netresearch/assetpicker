module.exports = {
    template: require('./index.html'),
    props: {
        layout: {
            type: String,
            default: 'grid'
        },
        search: String
    },
    data: function () {
        return {
            selection: require('../model/selection')
        }
    },
    events: {
        'open-item': function (item, storage) {
            this.$root.$broadcast('select-item', item, storage);
        }
    },
    watch: {
        'selection.storage': function (storage) {
            if (storage) {
                this.search = null;
            }
        },
        search: function (sword) {
            if (sword) {//
                this.$nextTick(function () {
                    this.$root.$broadcast('deselect-items');
                });
            }
        }
    },
    components: {
        grid: require('./grid')
    }
};