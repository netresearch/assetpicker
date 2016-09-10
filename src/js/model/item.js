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
        get type() {
            return data.type;
        },
        get extension() {
            var matches = this.name.match(/\.([0-9a-z]+)$/i);
            if (matches) {
                return matches.pop();
            }
        },
        thumbnail: data.thumbnail
    };
};
