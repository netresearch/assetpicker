module.exports = {
    template: require('./grid.html'),
    props: {
        items: Array,
        storage: String,
        limit: Number
    },
    methods: {
        openItem: function (item) {
            this.$root.$broadcast('select-item', item, this.storage)
        }
    }
};