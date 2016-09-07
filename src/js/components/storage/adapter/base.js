var Vue = require('vue');

Vue.http.interceptors.push(function(options, next) {
    next(function(response) {
        response.options = options;
    });
});

module.exports = {
    template: '<div><tree></tree></div>',
    props: {
        config: {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            loginDone: false,
            currentLogin: null
        }
    },
    computed: {
        url: function () {
            var proxyUrl, $proxy, config = require('../../../config');
            if (this.config.proxy || config.proxy.all && this.config.proxy !== false) {
                proxyUrl = (typeof this.config.proxy === 'object' ? this.config : config).proxy.url;
                $proxy = new Vue({
                    data: { url: null }
                });
            }
            return function (url, base) {
                if (base) {
                    url = (base + '').replace(/\/+$/, '') + '/' + (url + '').replace(/^\/+/, '');
                }
                if ($proxy) {
                    $proxy.url = encodeURIComponent(url);
                    return $proxy.$interpolate(proxyUrl);
                }
                return url;
            }
        },
        http: function() {
            if (this.$options.http && typeof  this.$options.http === 'function') {
                this.$options.http = this.$options.http.call(this);
            }
            var api = {},
                config = require('../../../config'),
                base = this.$options.http ? this.$options.http.base : null,
                request = (function (options) {
                    if (!options.keepUrl) {
                        options.url = this.url(options.url, base);
                        options.keepUrl = true;
                    }
                    return this.$promise(function (resolve) {
                        this.$http(options).then((function(response) {
                            if (response.options.validate) {
                                response.reload = function () {
                                    return request(options).then(resolve);
                                };
                                response.isValid = function (isValid) {
                                    if (isValid === false) {
                                        throw 'Invalid response';
                                    } else {
                                        resolve(response);
                                    }
                                };
                                response.options.validate.call(this, response, resolve);
                            } else {
                                resolve(response);
                            }
                        }).bind(this));
                    });
                }).bind(this);

            ['get', 'delete', 'head', 'jsonp'].forEach(function(method) {
                api[method] = function (url, options) {
                    options = options || {};
                    options.method = method.toUpperCase();
                    options.url = url;
                    return request(options);
                }
            });

            ['post', 'put', 'patch'].forEach(function(method) {
                api[method] = function (url, data, options) {
                    options = options || {};
                    options.method = method.toUpperCase();
                    options.url = url;
                    options.body = data;
                    return request(options);
                }
            });
            return api;
        }
    },
    methods: {
        login: function(authenticate) {
            if (!this.currentLogin) {
                if (this.loginDone) {
                    throw 'Login already done';
                }
                var open = this.$parent.open;
                this.$parent.open = true;
                var Login = this.$options.components['login'];
                var login = new Login({
                    el: this.$el.appendChild(document.createElement('div')),
                    parent: this
                });
                this.currentLogin = login.login(authenticate.bind(this)).then((function () {
                    this.loginDone = true;
                    this.$parent.open = open;
                }).bind(this));
            }
            return this.currentLogin;
        }
    },
    components: {
        login: require('../../login')
    }
};