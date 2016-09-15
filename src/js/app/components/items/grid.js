module.exports = {
    template: require('./grid.html'),
    props: {
        items: Array,
        storage: String,
        limit: Number
    },
    components: {
        item: {
            props: {
                item: Object
            },
            data: function () {
                return {
                    picked: require('../../model/pick')
                }
            },
            computed: {
                selected: function() {
                    return this.picked.contains(this.item);
                },
                visible: function () {
                    return this.item.type !== 'file' || this.picked.isAllowed(this.item);
                }
            },
            detached: function() {
                if (this.picked.contains(this.item)) {
                    this.picked.remove(this.item);
                }
            },
            methods: {
                select: function() {
                    this.picked.toggle(this.item);
                },
                open: function() {
                    if (this.item.type === 'file' && this.picked.isAllowed(this.item)) {
                        this.picked.add(this.item);
                        this.$dispatch('finish-pick');
                    } else {
                        this.$root.$broadcast('select-item', this.item);
                    }
                }
            }
        }
    }
};
