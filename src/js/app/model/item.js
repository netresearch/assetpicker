<<<<<<< e6c522987e030c882f029ef13f528e5e1f3df2b6
var util = require('../util');

module.exports = function (data, thumbnailConfig) {
=======
var docTypes = {
    text: ['txt', 'md', 'rst', 'rtf', 'odt', 'ott'],
    pdf: ['pdf'],
    word: ['doc', 'docx', 'dot', 'dotx'],
    excel: ['xls', 'xlsx', 'xlt', 'xltx'],
    powerpoint: ['ppt', 'pptx', 'pot', 'potx'],
    image: ['bmp', 'jpg', 'jpeg', 'png', 'gif', 'eps', 'psd', 'ai', 'tiff', 'svg'],
    archive: ['tar', 'tar.gz', 'tar.bz', 'tgz', 'bz2', 'cab', 'zip', 'zipx', 'rar', 'jar', '7z'],
    audio: ['3pg', 'aac', 'aiff', 'flac', 'm4a', 'mp3', 'ogg', 'wav', 'wma'],
    video: ['webm', 'flv', 'avi', 'mov', 'wmv', 'mp4', 'm4v', 'mpg', 'mpeg'],
    code: ['aspx', 'json', 'jsp', 'js', 'htm', 'html', 'php', 'phtml', 'inc', 'go', 'pl', 'asp', 'py', 'rdf', 'xml', 'svg', 'css', 'scss', 'bat', 'sh', 'c', 'h', 'rb', 'cmd', 'wsdl', 'vb', 'xslt', 'hs', 'coffee', 'go', 'yml', 'yaml', 'ini']
};
function getClass(extension) {
    for (var key in docTypes) {
        if (docTypes.hasOwnProperty(key)) {
            if (docTypes[key].indexOf(extension) > -1) {
                return key;
            }
        }
    }
}

module.exports = function (data) {
>>>>>>> Reworked grid layout
    if (typeof data === 'function') {
        data = data();
    }
    if (!data.id) {
        throw 'Item requires an ID';
    }
    if (!data.storage) {
        throw 'Item requires the storage ID';
    }
<<<<<<< e6c522987e030c882f029ef13f528e5e1f3df2b6
    if (thumbnailConfig === 'data') {
        util.getImageDataUri(data.thumbnail, function (dataUri) {
            item.thumbnail = dataUri;
        });
        delete data.thumbnail;
    }
    var item = {
=======
    var ext = data.type === 'file' ? (data.hasOwnProperty('extension') ? data.extension : (data.name.match(/\.([0-9a-z]+)$/i) || []).pop()) : undefined;
    return item = {
>>>>>>> Reworked grid layout
        id: data.id,
        storage: data.storage,
        query: data.query,
        name: data.name,
        type: data.type,
        extension: ext,
        class: data.type === 'file' ? getClass(ext) : 'folder',
        thumbnail: data.thumbnail,
        icon: data.icon,
        iconBig: data.iconBig,
        created: data.created,
        modified: data.modified,
        data: data.data
    };
    return item;
};
