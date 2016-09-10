var picked = [];
picked.contains = function (item) {
    for (var i = 0, l = picked.length; i < l; i++) {
        if (picked[i].id === item.id && picked[i].storage === item.storage) {
            return true;
        }
    }
};
picked.pick = function (item) {
    if (!picked.contains(item)) {
        picked.push(item);
    }
};
picked.clear = function () {
    while (picked.length) {
        picked.pop();
    }
};
picked.remove = function (item) {
    for (var i = 0, l = picked.length; i < l; i++) {
        var next = picked.shift();
        if (next.id !== item.id || next.storage !== item.storage) {
            picked.push(next);
        }
    }
};

module.exports = {
    storage: null,
    items: [],
    results: {},
    picked: picked
};

Object.keys(require('../config').storages).forEach(function (key) {
    module.exports.results[key] = [];
    module.exports.results[key].storage = key;
    module.exports.results[key].loading = false;
    module.exports.results[key].total = 0;
});
