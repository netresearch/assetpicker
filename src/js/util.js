var Vue = require('vue');
Vue.filter('encodeURI', function(data) {
    return encodeURI(data);
});
Vue.filter('encodeURIComponent', function(data) {
    return encodeURIComponent(data);
});

Array.prototype.filterBy = function (key, value) {
    return this.filter(function(arrayValue) {
        if (typeof arrayValue === "object") {
            return arrayValue[key] == value;
        }
        return false;
    });
};