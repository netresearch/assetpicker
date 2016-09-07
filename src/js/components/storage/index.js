var selectedStorage;
var selectedItem;

module.exports = {
    template: require('./template.html'),
    props: {
        storage: Object,
        open: Boolean,
        selected: Boolean
    },
    data: function () {
        return {
            items: null,
            selection: require('../model/selection')
        };
    },
    events: {
        'select-item': function(item) {
            if (selectedStorage && selectedStorage !== this) {
                selectedStorage.selected = false;
            }
            selectedItem = item;
            this.selected = false;
            this.open = true;
            this.selection.items = item.items;
        }
    },
    components: {
        github: require('./adapter/github'),
        entermediadb: require('./adapter/entermediadb')
    },
    methods: {
        select: function () {
            this.selected = true;
            if (selectedStorage && selectedStorage !== this) {
                selectedStorage.selected = false;
            }
            if (selectedItem) {
                selectedItem.selected = false;
            }
            selectedStorage = this;
            this.$nextTick(function () {
                this.$broadcast('select-storage');
            });
            if (this.items === null) {
                this.$nextTick(function () {
                    this.$broadcast('load-items', this);
                });
            } else {
                this.selection.items = this.items;
            }
        }
    },
    watch: {
        items: function (items) {
            this.$nextTick(function () {
                if (this.selected) {
                    this.selection.items = this.items;
                }
            });
        }
    }
};