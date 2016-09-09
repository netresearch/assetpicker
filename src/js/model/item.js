module.exports = function (data) {
    if (typeof data === 'function') {
        data = data();
    }
    return item = {
        id: data.id,
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