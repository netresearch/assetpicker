module.exports = {
    storage: null,
    item: null,
    items: [],
    results: {}
};

Object.keys(require('../config').storages).forEach(function (key) {
    module.exports.results[key] = [];
});