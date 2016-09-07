module.exports = {
    template: require('./grid.html'),
    data: function () {
        return {
            selection: require('../model/selection')
        }
    },
    methods: {
        openItem: function (item) {
            if (item.type === 'dir') {
                this.$root.$dispatch('tree-select', item);
            }
        }
    }
};