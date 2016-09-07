var Item = require('../../../model/item');

module.exports = {
    template: '<tree></tree>',
    extends: require('../base'),
    events: {
        'load-items': function (tree) {
            var url = this.url(
                'https://api.github.com/repos/' +
                this.config.username + '/' +
                this.config.repository + '/contents/' +
                (tree.item ? tree.item.id : '')
            );
            this.$http.get(url).then(
                function(response) {
                    tree.items = response.data.map(function (file) {
                        file.id = file.path.replace(/^\/+/, '');
                        return new Item(file);
                    });
                }
            );
        }
    },
    http: function () {
        var options = {headers:{}};
        if (this.config.auth) {
            if (this.config.auth.token) {
                options.headers.Authorization = 'token ' + this.config.auth.token;
            } else if (this.config.auth.username && this.config.auth.password) {
                options.headers.Authorization = 'Basic ' + btoa(auth.username + ':' + auth.password);
            }
        }
        return options;
    }
};
