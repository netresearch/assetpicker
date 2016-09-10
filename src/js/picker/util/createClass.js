module.exports = function(properties) {
    var result = properties.construct || function() { };
    Object.keys(properties).forEach(function(key) {
        if (key !== 'construct') {
            result.prototype[key] = properties[key];
        }
    });
    return result;
};
