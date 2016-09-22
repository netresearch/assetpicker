var Vue = require('vue');

var Item = require('../model/item');

var extend = require('extend');
var fecha = require('fecha');

Vue.http.interceptors.push(function(options, next) {
    next(function(response) {
        response.options = options;
    });
});

var UrlClass = function(url) {
    this.raw = url;
};
UrlClass.prototype.toString = function () {
    return encodeURIComponent(this.raw);
};

module.exports = {
    template: '<div><tree :fetch="fetch"></tree></div>',
    props: {
        config: {
            type: Object,
            required: true
        },
        fetch: Boolean,
        storage: {
            type: String,
            required: true
        }
    },
    data: function() {
        return {
            loginDone: false,
            currentLogin: null,
            appConfig: require('../config')
        }
    },
    computed: {
        proxy: function () {
            if (this.config.proxy || this.appConfig.proxy.all && this.config.proxy !== false) {
                return (typeof this.config.proxy === 'object' ? this.config : this.appConfig).proxy;
            }
            return false;
        },
        url: function () {
            var proxyUrl, $proxy;
            if (this.proxy) {
                proxyUrl = this.proxy.url;
                $proxy = new Vue({
                    data: { url: null }
                });
            }
            return function (url, base) {
                if (base) {
                    url = (base + '').replace(/\/+$/, '') + '/' + (url + '').replace(/^\/+/, '');
                }
                if ($proxy) {
                    $proxy.url = new UrlClass(url);
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
                base = this.$options.http ? this.$options.http.base : null,
                request = (function (options) {
                    if (!options.keepUrl) {
                        options.url = this.url(options.url, base);
                        options.keepUrl = true;
                    }
                    if (this.proxy && this.proxy.credentials !== options.credentials) {
                        options.credentials = this.proxy.credentials;
                    }
                    return this.$promise(function (resolve, reject) {
                        this.$http(options).then(
                            function(response) {
                                if (response.options.validate) {
                                    response.reload = function () {
                                        return request(options).then(resolve, reject);
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
                            }.bind(this),
                            reject
                        );
                    });
                }).bind(this);

            ['get', 'delete', 'head', 'jsonp'].forEach(function(method) {
                api[method] = function (url, options) {
                    options = extend({}, options);
                    options.method = method.toUpperCase();
                    options.url = url;
                    return request(options);
                }
            });

            ['post', 'put', 'patch'].forEach(function(method) {
                api[method] = function (url, data, options) {
                    options = extend({}, options);
                    options.method = method.toUpperCase();
                    options.url = url;
                    options.body = data;
                    return request(options);
                }
            });
            return api;
        }
    },
    dateFormat: undefined,
    methods: {
        parseDate: function (date) {
            if (date) {
                return fecha.parse(date, this.$options.dateFormat);
            }
        },
        createItem: function (data) {
            data.storage = this.storage;
            return new Item(data);
        },
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
                if (this.config.loginHint) {
                    login.hint = this.config.loginHint;
                }
                this.currentLogin = login.login(authenticate.bind(this)).then((function () {
                    this.loginDone = true;
                    this.$parent.open = open;
                }).bind(this));
            }
            return this.currentLogin;
        }
    },
    components: {
        login: require('../components/login')
    }
};
