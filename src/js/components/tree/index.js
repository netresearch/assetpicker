var Vue = require('vue');
var escapeRegExp = require('escape-string-regexp');

var selected;
var lastSearch = {
    sword: null,
    results: null
};

Vue.component('tree', {
    template: require('./tree.html'),
    props: {
        item: Object,
        open: Boolean,
        name: String,
        selected: Boolean,
        fetch: Boolean,
        entryPoint: String,
        main: Boolean,
        items: {
            type: Array,
            twoWay: true,
            default: function () {
                return [];
            }
        }
    },
    computed: {
        prefix: function () {
            return this.name ? this.name + '-' : '';
        }
    },
    created: function () {
        if (!this.entryPoint) {
            this.$dispatch(this.prefix + 'load-items', this);
        }
    },
    events: {
        'search': function (sword, results) {
            lastSearch.sword = sword;
            lastSearch.results = results;
            this.doSearch();
            return true;
        },
        'select-item': function (item) {
            if (item instanceof Vue) {
                if (item.entryPoint) {
                    this.$broadcast('select-item', 'entrypoint');
                    return false;
                }
                item = item.item;
                if (!item) {
                    return true;
                }
            }
            if (item === 'entrypoint' && !this.item && !this.entryPoint) {
                this.select(false);
                return false;
            }
            if (item && this.item && item.id === this.item.id) {
                this.select();
                return false;
            } else {
                for (var i = 0, l = this.items.length; i < l; i++) {
                    if (this.items[i].id === item.id) {
                        if (!this.open && !this.entryPoint) {
                            this.open = true;
                            this.$nextTick(function () {
                                this.$broadcast('select-item', item);
                            });
                            return false;
                        }
                        break;
                    }
                }
            }
            return true;
        },
        'deselect-items': function () {
            this.selected = false;
            return true;
        }
    },
    methods: {
        doSearch: function () {
            if (lastSearch.sword) {
                var regex = new RegExp(escapeRegExp(lastSearch.sword), 'i');
                for (var i = 0, l = this.items.length; i < l ; i++) {
                    console.log(this.items[i].name, escapeRegExp(lastSearch.sword), regex.test(this.items[i].name));
                    if (regex.test(this.items[i].name)) {
                        lastSearch.results.push(this.items[i]);
                    }
                }
            }
        },
        select: function (notify) {
            if (notify !== false) {
                if (selected && selected !== this) {
                    selected.selected = false;
                }
                selected = this;
            }
            this.selected = true;
            this.$parent.$dispatch(this.prefix + 'select-item', this);
        }
    },
    watch: {
        items: function (items) {
            if (this.selected) {
                this.$nextTick(function () {
                    this.$parent.$dispatch(this.prefix + 'select-item', this);
                });
            }
            this.$nextTick(function () {
                this.doSearch();
            })
        }
    },
    components: []
});