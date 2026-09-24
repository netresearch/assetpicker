<script setup>
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { PICKER } from '../use-picker.js';
import ItemGrid from './ItemGrid.vue';

// The main stage. Was components/items + items/index.html (v-infinite-scroll,
// $get/$broadcast). Renders one of three states from the store: search
// results, the open storage's items, or the storage overview.
const picker = inject(PICKER);
const { t } = useI18n();
const store = picker.store;

const search = computed(() => store.selection.search);
const storage = computed(() => store.selection.storage);
const items = computed(() => store.selection.items || []);
const results = computed(() => store.selection.results || {});
const config = store.config;

function visible(item) {
  return item.type !== 'file' || store.pick.isAllowed(item);
}
const nothingFound = computed(
  () => !store.ui.loading && Object.values(results.value).every((list) => list.filter(visible).length === 0),
);
</script>

<template>
  <div class="items-container">
    <div v-if="search" class="items-search">
      <template v-for="(list, key) in results" :key="key">
        <template v-if="list.filter(visible).length">
          <h5>{{ config.storages[key].label || key }}</h5>
          <ItemGrid :items="list.filter(visible)" />
        </template>
      </template>
      <div v-if="nothingFound" class="feedback">{{ t('stage.nothingFound') }}</div>
    </div>

    <div v-else-if="storage">
      <div v-if="!store.ui.loading && items.filter(visible).length === 0" class="feedback">{{ t('stage.noItems') }}</div>
      <ItemGrid :items="items.filter(visible)" />
    </div>

    <div v-else class="storage-overview">
      <button
        v-for="(cfg, key) in config.storages"
        :key="key"
        type="button"
        class="storage"
        @click="picker.openStorage(key)"
      >
        <span class="storage-icon">📁</span>
        <span class="storage-label">{{ cfg.label || key }}</span>
      </button>
    </div>
  </div>
</template>
