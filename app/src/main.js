import { createApp } from 'vue';
import App from './App.vue';
import { createAppI18n } from './i18n/index.js';
import './style.css';

/**
 * Mount an AssetPicker into a host element. This is the API a consuming app
 * uses: open it (e.g. in a modal), get `onFinish(result, cancelled)` back.
 *
 * @param {{ el: string|Element, config: object, onFinish?: (result: any, cancelled: boolean) => void }} options
 * @returns {import('vue').App}
 */
export function createAssetPickerApp(options) {
  const app = createApp(App, {
    config: options.config,
    onFinish: options.onFinish ?? null,
  });
  app.use(createAppI18n(options.config?.language));
  app.mount(options.el);
  return app;
}

// ---------------------------------------------------------------------------
// Demo page host: wire the landing page's "Try it" button to open the picker
// in a modal and show what was picked. A real consumer mounts it the same way
// and uses the returned asset.
// ---------------------------------------------------------------------------

const DEMO_CONFIG = {
  title: 'AssetPicker',
  language: 'auto',
  pick: { limit: 1, types: ['file'], extensions: [] },
  thumbnails: 'url',
  storages: {
    demo: { adapter: 'dummy', label: 'Demo storage' },
    more: { adapter: 'dummy', label: 'More files' },
  },
};

function initDemo() {
  const tryItButton = document.getElementById('try-it');
  const overlay = document.getElementById('picker-overlay');
  const mount = document.getElementById('picker-mount');
  const result = document.getElementById('result');
  if (!tryItButton || !overlay || !mount) {
    return;
  }

  let picker = null;

  function close() {
    if (picker) {
      picker.unmount();
      picker = null;
    }
    overlay.hidden = true;
  }

  function showResult(picked) {
    const items = Array.isArray(picked) ? picked : [picked];
    result.textContent = '';
    const label = document.createElement('strong');
    label.textContent = items.length === 1 ? 'Picked: ' : `Picked ${items.length} assets: `;
    result.append(label, document.createTextNode(items.map((item) => item.name).join(', ')));
    const withThumb = items.find((item) => item.thumbnail);
    if (withThumb) {
      const img = document.createElement('img');
      img.src = withThumb.thumbnail;
      img.alt = '';
      result.append(img);
    }
    result.hidden = false;
  }

  function open() {
    overlay.hidden = false;
    picker = createAssetPickerApp({
      el: mount,
      config: DEMO_CONFIG,
      onFinish(picked, cancelled) {
        close();
        if (!cancelled && picked) {
          showResult(picked);
        }
      },
    });
  }

  tryItButton.addEventListener('click', open);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) {
      close();
    }
  });
}

if (typeof document !== 'undefined') {
  initDemo();
}
