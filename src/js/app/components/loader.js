var Vue = require('vue');
var progressLoader = document.getElementById('app-progress'), progressLoaderClass = progressLoader.className;
Vue.http.interceptors.push(function(options, next) {
    progressLoader.className = progressLoaderClass + ' active';
    next(function(response) {
        progressLoader.className = progressLoaderClass;
    });
});