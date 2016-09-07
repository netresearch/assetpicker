var selected;

require('vue').component('tree', {
    template: require('./tree.html'),
    props: {
        item: Object,
        open: Boolean,
        name: String,
        selected: Boolean,
        deSelectable: Boolean
    },
    computed: {
        prefix: function () {
            return this.name ? this.name + '-' : '';
        }
    },
    data: function() {
        return {
            items: []
        };
    },
    created: function () {
        this.$dispatch(this.prefix + 'load-items', this);
        this.$root.$on('tree-select', (function (item) {
            if (this.item && item.id === this.item.id) {
                this.select();
                this.open = true;
            }
            for (var i = 0, l = this.items.length; i < l; i++) {
                if (this.items[i].id === item.id) {
                    if (!this.open) {
                        this.open = true;
                        this.$nextTick(function () {
                            this.$root.$dispatch('tree-select', item);
                        });
                    }
                    break;
                }
            }
        }).bind(this));
    },
    methods: {
        select: function () {
            if (selected && selected !== this) {
                selected.selected = false;
            }
            selected = this;
            this.selected = true;
            this.$dispatch(this.prefix + 'select-item', this);
        }
    },
    watch: {
        items: function () {
            if (this.selected) {
                this.$nextTick(function () {
                    this.$dispatch(this.prefix + 'select-item', this);
                });
            }
        }
    }
});