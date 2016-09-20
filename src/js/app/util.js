var Vue = require('vue');
Vue.filter('encodeURI', function(data) {
    return encodeURI(data);
});
Vue.filter('encodeURIComponent', function(data) {
    return encodeURIComponent(data);
});

Array.prototype.filterBy = function (key, value) {
    var values = value.indexOf ? value : [value];
    return this.filter(function(arrayValue) {
        if (typeof arrayValue === "object") {
            return values.indexOf(arrayValue[key]) > -1;
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

module.exports = {
    /**
     * Render seconds to HH:MM:SS format
     *
     * @param time
     * @returns {string}
     */
    formatTime: function (time) {
        // http://stackoverflow.com/a/6313008
        var sec_num = parseInt(time + '', 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes+':'+seconds;
    }
}