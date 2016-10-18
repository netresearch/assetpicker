module.exports = {
    addClass: function (element, className) {
        if (element.className) {
            if (element.className.split(' ').indexOf(className) === -1) {
                element.className += ' ' + className;
            }
        } else {
            element.className = className;
        }
    },
    removeClass: function (element, className) {
        if (element.className) {
            var classNames = element.className.split(' '), newClassNames = [];
            for (var i = 0, l = classNames.length; i < l; i++) {
                if (classNames[i] !== className) {
                    newClassNames.push(classNames[i]);
                }
            }
            element.className = newClassNames.join(' ');
        }
    },
    loadCss: function (file) {
        var link = document.createElement("link");
        link.href = file;
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";

        document.getElementsByTagName("head")[0].appendChild(link);
    }
};