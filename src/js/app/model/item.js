module.exports = function (data) {
    if (typeof data === 'function') {
        data = data();
    }
    if (!data.id) {
        throw 'Item requires an ID';
    }
    if (!data.storage) {
        throw 'Item requires the storage ID';
    }
    return item = {
        id: data.id,
        storage: data.storage,
        name: data.name,
        type: data.type,
        extension: data.extension || (data.name.match(/\.([0-9a-z]+)$/i) || []).pop(),
        thumbnail: data.thumbnail,
        list: data.list,
        query: data.query
    };
};
