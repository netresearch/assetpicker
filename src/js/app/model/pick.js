var pick = [], candidate;
var config = require('../config');

pick.isAllowed = function (item) {
    var conf = config.pick;
    return (!conf.types || !conf.types.length || conf.types.indexOf(item.type)) > -1 && (!conf.extensions || !conf.extensions.length || conf.extensions.indexOf(item.extension) > -1);
};
pick.contains = function (item) {
    for (var i = 0, l = pick.length; i < l; i++) {
        if (pick[i].id === item.id && pick[i].storage === item.storage) {
            return true;
        }
    }
};
pick.candidate = function (item) {
    if (item) {
        this.add(item);
    }
    candidate = item;
};
pick.toggle = function (item) {
    if (this.contains(item)) {
        this.remove(item);
    } else {
        this.add(item);
    }
};
pick.add = function (item) {
    if (!this.contains(item) && this.isAllowed(item)) {
        if (candidate && item !== candidate && this.contains(candidate)) {
            this.remove(candidate);
        }
        while (config.pick.limit && this.length >= config.pick.limit) {
            this.shift();
        }
        this.push(item);
    }
};
pick.remove = function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
        var next = this.shift();
        if (next.id !== item.id || next.storage !== item.storage) {
            pick.push(next);
        }
    }
    if (!pick.length && candidate && item !== candidate && this.isAllowed(candidate)) {
        this.push(candidate);
    }
};
pick.clear = function () {
    while (this.length) {
        this.pop();
    }
};
pick.export = function () {
    return config.pick.limit === 1 ? this[0] : this.slice(0);
};

module.exports = pick;
