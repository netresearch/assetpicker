import { createApp } from 'vue';
import App from './App.vue';
import { createAppI18n } from './i18n/index.js';
import './style.css';

/**
 * Mount an AssetPicker app.
 *
 * @param {{ el?: string|Element, config: object, onFinish?: (result: any, cancelled: boolean) => void }} options
 * @returns {import('vue').App}
 */
export function createAssetPickerApp(options) {
  const app = createApp(App, {
    config: options.config,
    onFinish: options.onFinish ?? null,
  });
  app.use(createAppI18n(options.config?.language));
  if (options.el) {
    app.mount(options.el);
  }
  return app;
}

// Demo / standalone entry: auto-mount when a #app root is present.
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

if (typeof document !== 'undefined' && document.getElementById('app')) {
  createAssetPickerApp({
    el: '#app',
    config: DEMO_CONFIG,
    onFinish: (result, cancelled) => {
      // eslint-disable-next-line no-console
      console.log(cancelled ? '[assetpicker] cancelled' : '[assetpicker] picked', result);
    },
  });
}
