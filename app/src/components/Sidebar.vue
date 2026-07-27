<script setup>
import { inject } from 'vue';
import { PICKER } from '../use-picker.js';
import FolderTree from './FolderTree.vue';

const picker = inject(PICKER);
const config = picker.store.config;
</script>

<template>
  <ul class="tree">
    <li v-for="key in picker.storageKeys" :key="key">
      <FolderTree :storage-key="key" :label="config.storages[key].label || config.storages[key].adapter" />
    </li>
  </ul>
</template>
