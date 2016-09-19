module.exports = {
    template: require('./template.html'),
    props: {
        failure: Boolean,
        username: String,
        hint: String
    },
    data: function() {
        return {
            password: null
        }
    },
    methods: {
        submit: function (username, password) {
            this.$dispatch('login-submit', username, password);
        },
        login: function (authenticate) {
            return this.$promise(function (resolve) {
                this.$on('login-submit', (function (username, password) {
                    authenticate(username, password, (function (result) {
                        if (result) {
                            this.$remove().$destroy();
                            resolve();
                        } else {
                            this.failure = true;
                        }
                    }).bind(this));
                }).bind(this));
            });
        }
    }
};