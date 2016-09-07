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

var params;

window.getParams = function () {
    if (params === undefined) {
        params = {};
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
    }
    return params;
};
window.getParam = function (name) {
    return window.getParams()[name];
};