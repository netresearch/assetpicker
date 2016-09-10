var selection = require('../../model/selection'),
    config = require('../../config');

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
                    picked: selection.picked
                }
            },
            computed: {
                selected: function() {
                    return this.picked.contains(this.item);
                }
            },
            detached: function() {
                var picked = this.picked;
                if (picked.contains(this.item)) {
                    picked.remove(this.item);
                }
            },
            methods: {
                select: function() {
                    var picked = this.picked;
                    if (picked.contains(this.item)) {
                        picked.remove(this.item);
                    } else {
                        if (!config.picker.multiple && picked.length) {
                            picked.clear();
                        }
                        picked.push(this.item);
                    }
                },
                open: function() {
                    this.$root.$broadcast('select-item', this.item);
                }
            }
        }
    }
};
