import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Phase 0 of the Vue 3 rewrite. The new SFC app lives under app/ and builds
// with Vite; the legacy gulp/esbuild pipeline still builds the old dist/ until
// the migration reaches parity (then the legacy build is removed).
export default defineConfig({
  root: 'app',
  plugins: [vue()],
  build: {
    outDir: '../dist-vue3',
    emptyOutDir: true,
  },
  test: {
    root: '.',
    environment: 'jsdom',
    include: ['app/tests/**/*.spec.js'],
    globals: true,
  },
});
