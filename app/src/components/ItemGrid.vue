<script setup>
import ItemCard from './ItemCard.vue';

// Responsive grid of item tiles. The legacy grid.js computed per-item pixel
// widths imperatively via $children/$el; a CSS grid does that declaratively.
defineProps({ items: { type: Array, default: () => [] } });
</script>

<template>
  <div class="items-grid">
    <ItemCard v-for="item in items" :key="`${item.storage}:${item.id}`" :item="item" />
  </div>
</template>
