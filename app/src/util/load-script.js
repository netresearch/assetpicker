/**
 * Append a <script> to the document head and resolve once it has loaded.
 *
 * @param {string} url
 * @returns {Promise<void>}
 */
export function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load script: ${url}`));
    document.head.appendChild(script);
  });
}
