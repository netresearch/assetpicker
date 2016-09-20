var Vue = require('vue');
Vue.http.interceptors.push(function(options, next) {
    this.$root.loading++;
    next(function(response) {
        this.$root.loading--;
    });
});