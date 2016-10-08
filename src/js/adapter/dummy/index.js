module.exports = {
    translations: {
        description: {
            en: 'Dummy adapter',
            de: 'Dummy-Adapter'
        }
    },
    data: function() {
        return {
            lastId: 1
        }
    },
    events: {
        'load-items': function (tree) {
            if (this.lastId >= 1400) {
                return;
            }
            this.mockLoad(function() {
                tree.items = this.createItems();
            });
        },
        'load-more-items': function (items) {
            if (this.lastId >= 1400) {
                return;
            }
            this.mockLoad(function() {
                this.createItems().forEach(function(item) {
                    items.push(item);
                });
            });
        }
    },
    methods: {
        mockLoad: function(callback) {
            this.$root.loading++;
            window.setTimeout(function() {
                callback.call(this);
                this.$root.loading--;
            }.bind(this), 500);
        },
        item: function(extension, thumbnail) {
            return this.createItem({
                id: '' + (this.lastId++),
                type: extension ? 'file' : 'dir',
                extension: extension,
                name: 'Random ' + (extension || ' directory') + (thumbnail ? ' with thumb' : '') + ' ' + this.lastId,
                thumbnail: thumbnail
            });
        },
        createItems: function () {
            var items = [],
                extensions = ['txt', 'pdf', 'xls', 'doc', 'pot', 'jpeg', 'zip', 'mp3', 'avi', 'html', 'any'];
            items.push(this.item());
            for (var i = 0, l = extensions.length; i < l; i++) {
                items.push(this.item(extensions[i]));
            }
            items.push(this.item('jpeg', 'http://lorempixel.com/nature/160/200'));
            items.push(this.item('jpeg', 'http://lorempixel.com/nature/200/160'));
            items.total = 10 * items.length;
            return items;
        }
    }
};
