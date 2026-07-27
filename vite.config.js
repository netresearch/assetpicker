import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Phase 0 of the Vue 3 rewrite. The new SFC app lives under app/ and builds
// with Vite; the legacy gulp/esbuild pipeline still builds the old dist/ until
// the migration reaches parity (then the legacy build is removed).
export default defineConfig({
  root: 'app',
  // Relative base so the built demo works at the GitHub Pages sub-path
  // (netresearch.github.io/assetpicker/) same-origin — no CDN, no document.write.
  base: './',
  plugins: [vue()],
  build: {
    // Build straight into the Pages source (main:/docs) so merging ships a
    // working, self-contained demo.
    outDir: '../docs',
    emptyOutDir: true,
  },
  test: {
    root: '.',
    environment: 'jsdom',
    include: ['app/tests/**/*.spec.js'],
    globals: true,
  },
});
