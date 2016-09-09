module.exports = {
    template: require('./grid.html'),
    props: {
        items: Array,
        storage: String
    },
    methods: {
        openItem: function (item) {
            this.$dispatch('open-item', item, this.storage);
        }
    }
};