import { createApp } from 'vue';
import App from './App.vue';

export function createAssetPickerApp(options = {}) {
  const app = createApp(App, options.props ?? {});
  if (options.el) {
    app.mount(options.el);
  }
  return app;
}

// Auto-mount when a #app root exists (the demo/standalone entry).
if (typeof document !== 'undefined' && document.getElementById('app')) {
  createAssetPickerApp({ el: '#app' });
}
