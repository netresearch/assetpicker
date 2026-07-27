/**
 * Load an image URL and return its PNG data URI.
 *
 * @param {string} url
 * @returns {Promise<string>}
 */
export function getImageDataUri(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      canvas.getContext('2d').drawImage(this, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error(`Could not load image: ${url}`));
    image.src = url;
  });
}
