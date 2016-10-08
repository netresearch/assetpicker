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
function MediaType(fileType, extension, mediaType) {
    if (fileType === 'file') {
        for (var key in docTypes) {
            if (docTypes.hasOwnProperty(key)) {
                if (docTypes[key].indexOf(extension) > -1) {
                    this.name = key;
                    break;
                }
            }
        }
    } else {
        this.name = 'folder';
    }
    if (mediaType) {
        this.icon = mediaType.icon;
        this.iconBig = mediaType.iconBig;
        this.label = mediaType.label;
    }
}
MediaType.prototype.toString = function() {
    return this.name || '';
};

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
    var ext = data.type === 'file' ? (data.hasOwnProperty('extension') ? data.extension : (data.name.match(/\.([0-9a-z]+)$/i) || []).pop()) : undefined;
    return item = {
        id: data.id,
        storage: data.storage,
        query: data.query,
        name: data.name,
        type: data.type,
        extension: ext,
        thumbnail: data.thumbnail,
        mediaType: new MediaType(data.type, ext, data.mediaType),
        created: data.created,
        modified: data.modified,
        data: data.data
    };
};
