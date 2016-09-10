var Vue = require('vue');
var escapeRegExp = require('escape-string-regexp');

var selected;

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
            default: function () {
                return [];
            }
        }
    },
    data: function () {
        return {
            search: this.$parent.search || {
                sword: null,
                results: null
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
            this.search.sword = sword;
            this.search.results = results;
            this.doSearch();
            return true;
        },
        'select-item': function (item) {
            if (item instanceof Vue) {
                if (item.entryPoint) {
                    this.$nextTick(function () {
                        this.$broadcast('select-item', 'entrypoint');
                    });
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
            } else if (item) {
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
        '_open': function () {
            this.open = true;
            return true;
        },
        'deselect-items': function () {
            this.selected = false;
            return true;
        }
    },
    methods: {
        doSearch: function () {
            if (this.search.sword) {
                var regex = new RegExp(escapeRegExp(this.search.sword), 'i');
                for (var i = 0, l = this.items.length; i < l ; i++) {
                    if (regex.test(this.items[i].name)) {
                        this.search.results.push(this.items[i]);
                    }
                }
            }
        },
        select: function (doSwitch) {
            if (doSwitch !== false) {
                if (selected && selected !== this) {
                    selected.selected = false;
                }
                selected = this;
            }
            this.selected = true;
            (this.entryPoint ? this : this.$parent).$dispatch(this.prefix + 'select-item', this);
            this.$parent.$dispatch('_open');
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
