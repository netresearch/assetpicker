import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// The SFC app lives under app/ and builds with Vite. The built site is NOT
// committed — the Pages workflow (.github/workflows/pages.yml) builds it in CI
// and deploys it, so the source is the single source of truth.
export default defineConfig({
  root: 'app',
  // Relative base so the built demo works at the GitHub Pages sub-path
  // (netresearch.github.io/assetpicker/) same-origin — no CDN, no document.write.
  base: './',
  plugins: [vue()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    root: '.',
    environment: 'jsdom',
    include: ['app/tests/**/*.spec.js'],
    globals: true,
  },
});
