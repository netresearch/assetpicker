<script setup>
import { ref, provide, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { createPicker, PICKER } from './use-picker.js';
import Sidebar from './components/Sidebar.vue';
import Stage from './components/Stage.vue';
import ResizeHandle from './components/ResizeHandle.vue';

const props = defineProps({
  config: { type: Object, required: true },
  onFinish: { type: Function, default: null },
});

const { t } = useI18n();
const picker = createPicker(props.config, { onFinish: props.onFinish });
provide(PICKER, picker);
const store = picker.store;

const sidebarWidth = ref(240);
const searchTerm = ref('');
let searchTimer;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => picker.search(searchTerm.value), 400);
}

const numStorages = computed(() => picker.storageKeys.length);
const pickedCount = computed(() => store.pick.items.length);
const itemCount = computed(() => {
  if (store.selection.search) {
    return Object.values(store.selection.results || {}).reduce((sum, list) => sum + list.length, 0);
  }
  return (store.selection.items || []).length;
});

onMounted(() => {
  store.ui.loaded = true;
});
</script>

<template>
  <div class="assetpicker" :class="{ loaded: store.ui.loaded, maximized: store.ui.maximized }">
    <header class="ap-navbar">
      <a class="ap-brand" href="#" @click.prevent="picker.home()">{{ config.title || t('header.title') }}</a>
      <input
        v-model="searchTerm"
        type="search"
        class="ap-search"
        :placeholder="t('header.search')"
        :aria-label="t('header.search')"
        @input="onSearchInput"
      />
      <button type="button" class="ap-icon" :title="t(store.ui.maximized ? 'header.minimize' : 'header.maximize')" @click="picker.toggleMaximize()">⤢</button>
      <button type="button" class="ap-icon" :title="t('footer.cancel')" @click="picker.cancel()">×</button>
      <div class="ap-progress" :class="{ active: store.ui.loading }"></div>
    </header>

    <div class="ap-main">
      <aside class="ap-sidebar" :style="{ width: sidebarWidth + 'px' }"><Sidebar /></aside>
      <ResizeHandle class="ap-handle" @move="(x) => (sidebarWidth = Math.max(120, x))" />
      <section class="ap-stage">
        <div v-if="!numStorages" class="ap-warning">No storages configured</div>
        <Stage v-else />
      </section>
    </div>

    <footer class="ap-footer">
      <span class="ap-status">
        <template v-if="store.ui.loading">{{ t('footer.loading') }}</template>
        <template v-else-if="itemCount">{{ t('footer.items', { count: itemCount }, itemCount) }}</template>
      </span>
      <span v-if="pickedCount" class="ap-picked">{{ t('footer.picked', { count: pickedCount }, pickedCount) }}</span>
      <span class="ap-spacer"></span>
      <button type="button" class="ap-btn ap-btn-primary" :disabled="!pickedCount" @click="picker.finish()">{{ t('footer.pick') }}</button>
      <button type="button" class="ap-btn" @click="picker.cancel()">{{ t('footer.cancel') }}</button>
    </footer>
  </div>
</template>

<style scoped>
.assetpicker {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: system-ui, sans-serif;
  color: #222;
  background: #fff;
}
.ap-navbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #2f99a4 0%, #257880 100%);
  color: #fff;
  position: relative;
}
.ap-brand {
  font-weight: 600;
  color: #fff;
  text-decoration: none;
}
.ap-search {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 4px;
}
.ap-icon {
  background: transparent;
  border: 0;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
}
.ap-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, #2f99a4, transparent);
  opacity: 0;
  transition: opacity 0.2s;
}
.ap-progress.active {
  opacity: 1;
  animation: ap-progress 1s linear infinite;
}
@keyframes ap-progress {
  from { background-position: -200px 0; }
  to { background-position: 200px 0; }
}
.ap-main {
  flex: 1;
  display: flex;
  min-height: 0;
}
.ap-sidebar {
  overflow: auto;
  padding: 0.5rem;
  border-right: 1px solid #ddd;
  flex: none;
}
.ap-handle {
  width: 5px;
  cursor: col-resize;
  background: #eee;
}
.ap-stage {
  flex: 1;
  overflow: auto;
  padding: 0.75rem;
}
.ap-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #ddd;
  background: #f7f7f7;
}
.ap-spacer { flex: 1; }
.ap-btn {
  padding: 0.3rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}
.ap-btn-primary {
  background: #2f99a4;
  border-color: #257880;
  color: #fff;
}
.ap-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
