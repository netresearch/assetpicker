var fecha = require('fecha');
var util = require('../../util');

module.exports = {
    template: require('./grid.html'),
    props: {
        items: Array,
        storage: String,
        limit: Number
    },
    data: function() {
        return {
            containerClass: null
        }
    },
    events: {
        'resize': function() {
            this.updateLayoutClass();
        }
    },
    attached: function() {
        this.updateLayoutClass();
    },
    methods: {
        updateLayoutClass: function() {
            var itemMinWidth = this.getItemMinWidth(), availableWidth = this.$el.offsetWidth;
            if (itemMinWidth) {
                var availableColumns = Math.floor(availableWidth / itemMinWidth);
                var itemPercentWidth = Math.round(100 / availableColumns * 1000) / 1000;
                for (var i = 0, l = this.$children.length; i < l; i++) {
                    this.$children[i].$el.style.width = itemPercentWidth + '%';
                }
            }
        },
        getItemMinWidth: function () {
            if (this.itemWidth === undefined && this.$children.length) {
                var item = this.$children[0].$el;
                this.itemMinWidth = null;
                var css = window.getComputedStyle(item).getPropertyValue('min-width');
                if (!css || !css.match(/px$/)) {
                    console.warn('.' + item.className.replace(/ /, '.') + ' is supposed to have a min-width css property in px');
                    return;
                }
                this.itemMinWidth = parseInt(css.replace(/^([0-9]+)px$/, '$1'));
            }
            return this.itemMinWidth;
        }
    },
    watch: {
        items: function() {
            this.$nextTick(this.updateLayoutClass);
        }
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
                title: function () {
                    var fields = {}, item = this.item;
                    fields.type = item.mediaType.label || (item.type === 'file' && item.extension ? item.extension.toUpperCase() + '-' : '') + this.t('types.' + item.type);
                    if (item.id.split('/').pop() === item.name) {
                        fields.path = ('/' + item.id).replace(/^\/+/, '/');
                    } else {
                        fields.id = item.id;
                    }
                    if (item.created) {
                        fields.created = fecha.format(item.created, this.t('date.full'));
                    }
                    if (item.modified && (!item.created || item.modified > item.created)) {
                        fields.modified = fecha.format(item.modified, this.t('date.full'));
                    }
                    if (item.data) {
                        if (parseInt(item.data.width) && parseInt(item.data.height)) {
                            fields.dimensions = item.data.width + ' x ' + item.data.height;
                        }
                        if (parseInt(item.data.length)) {
                            fields.length = util.formatTime(item.data.length);
                        }
                        if (parseInt(item.data.pages)) {
                            fields.pages = item.data.pages;
                        }
                    }

                    var lines = [this.item.name];
                    for (var key in fields) {
                        if (fields.hasOwnProperty(key)) {
                            lines.push(this.t('descriptor.' + key) + ': ' + fields[key]);
                        }
                    }
                    return lines.join('\n');
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
