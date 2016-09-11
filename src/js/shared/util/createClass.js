module.exports = function(protoProps) {
    var result = function () {
        if (this.construct) {
            this.construct.apply(this, arguments);
        }
    };

    result.prototype = result;
    Object.keys(protoProps).forEach(function(key) {
        result.prototype[key] = protoProps[key];
    });

    return result;
};
