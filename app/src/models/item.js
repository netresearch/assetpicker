import { getImageDataUri } from '../util/image.js';

const DOC_TYPES = {
  text: ['txt', 'md', 'rst', 'rtf', 'odt', 'ott'],
  pdf: ['pdf'],
  word: ['doc', 'docx', 'dot', 'dotx'],
  excel: ['xls', 'xlsx', 'xlt', 'xltx'],
  powerpoint: ['ppt', 'pptx', 'pot', 'potx'],
  image: ['bmp', 'jpg', 'jpeg', 'png', 'gif', 'eps', 'psd', 'ai', 'tiff', 'svg'],
  archive: ['tar', 'tar.gz', 'tar.bz', 'tgz', 'bz2', 'cab', 'zip', 'zipx', 'rar', 'jar', '7z'],
  audio: ['3pg', 'aac', 'aiff', 'flac', 'm4a', 'mp3', 'ogg', 'wav', 'wma'],
  video: ['webm', 'flv', 'avi', 'mov', 'wmv', 'mp4', 'm4v', 'mpg', 'mpeg'],
  code: ['aspx', 'json', 'jsp', 'js', 'htm', 'html', 'php', 'phtml', 'inc', 'go', 'pl', 'asp', 'py', 'rdf', 'xml', 'svg', 'css', 'scss', 'bat', 'sh', 'c', 'h', 'rb', 'cmd', 'wsdl', 'vb', 'xslt', 'hs', 'coffee', 'yml', 'yaml', 'ini'],
};

export class MediaType {
  constructor(fileType, extension, mediaType) {
    if (fileType === 'file') {
      const ext = extension === undefined || extension === null ? '' : String(extension).toLowerCase();
      this.name = Object.keys(DOC_TYPES).find((key) => DOC_TYPES[key].includes(ext)) ?? undefined;
    } else {
      this.name = 'folder';
    }
    if (mediaType) {
      this.icon = mediaType.icon;
      this.iconBig = mediaType.iconBig;
      this.label = mediaType.label;
    }
  }

  toString() {
    return this.name || '';
  }
}

function deriveExtension(data) {
  if (data.type !== 'file') {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(data, 'extension')) {
    return data.extension;
  }
  return (data.name.match(/\.([0-9a-z]+)$/i) || []).pop();
}

/**
 * Build a normalized item from raw adapter data.
 *
 * @param {object|Function} data raw item data (or a factory returning it)
 * @param {'url'|'data'} [thumbnailMode] when 'data', the thumbnail is fetched
 *   and replaced by a PNG data URI asynchronously.
 * @returns {object}
 */
export function createItem(data, thumbnailMode) {
  const raw = typeof data === 'function' ? data() : data;
  if (!raw.id) {
    throw new Error('Item requires an ID');
  }
  if (!raw.storage) {
    throw new Error('Item requires the storage ID');
  }

  const extension = deriveExtension(raw);
  const item = {
    id: raw.id,
    storage: raw.storage,
    query: raw.query,
    name: raw.name,
    type: raw.type,
    extension,
    thumbnail: raw.thumbnail,
    mediaType: new MediaType(raw.type, extension, raw.mediaType),
    links: raw.links,
    created: raw.created,
    modified: raw.modified,
    data: raw.data,
  };

  if (thumbnailMode === 'data' && raw.thumbnail) {
    item.thumbnail = undefined;
    getImageDataUri(raw.thumbnail).then((dataUri) => {
      item.thumbnail = dataUri;
    });
  }

  return item;
}
