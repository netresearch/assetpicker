var util = require('../util');

module.exports = function (data, thumbnailConfig) {
    if (typeof data === 'function') {
        data = data();
    }
    if (!data.id) {
        throw 'Item requires an ID';
    }
    if (!data.storage) {
        throw 'Item requires the storage ID';
    }
    if (thumbnailConfig === 'data') {
        util.getImageDataUri(data.thumbnail, function (dataUri) {
            item.thumbnail = dataUri;
        });
        delete data.thumbnail;
    }
    var item = {
        id: data.id,
        storage: data.storage,
        query: data.query,
        name: data.name,
        type: data.type,
        extension: data.type === 'file' ? data.extension || (data.name.match(/\.([0-9a-z]+)$/i) || []).pop() : undefined,
        thumbnail: data.thumbnail,
        created: data.created,
        modified: data.modified,
        data: data.data
    };
    return item;
};
