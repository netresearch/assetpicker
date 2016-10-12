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
    },
    /**
     * Load a script
     *
     * @param {string} url
     * @param {function} callback
     */
    loadScript: function (url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    },
    /**
     * Get image data uri
     *
     * @param {string} url
     * @param {function} callback
     */
    getImageDataUri: function (url, callback) {
        var image = new Image();

        image.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
            canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

            canvas.getContext('2d').drawImage(this, 0, 0);

            callback(canvas.toDataURL('image/png'));
        };

        image.src = url;
    }
};