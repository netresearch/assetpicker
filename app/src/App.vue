<script setup>
import { ref } from 'vue';

// Phase 0 scaffold. Real components (tree, storage, items, grid, handle,
// login) and the adapter/i18n/HTTP layers land in the following phases.
const heading = ref('AssetPicker');
</script>

<template>
  <main class="assetpicker">
    <h1>{{ heading }}</h1>
    <p>Vue 3 rewrite scaffold.</p>
  </main>
</template>

<style scoped>
.assetpicker {
  font-family: system-ui, sans-serif;
}
</style>
