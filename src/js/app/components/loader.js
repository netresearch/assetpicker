var Vue = require('vue');
var progressLoader = document.getElementById('app-progress'), progressLoaderClass = progressLoader.className;
Vue.http.interceptors.push(function(options, next) {
    this.$root.loading++;
    progressLoader.className = progressLoaderClass + ' active';
    next(function(response) {
        this.$root.loading--;
        if (!this.$root.loading) {
            progressLoader.className = progressLoaderClass;
        }
    });
});