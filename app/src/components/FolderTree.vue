<script setup>
import { ref, inject } from 'vue';
import { PICKER } from '../use-picker.js';

// Recursive folder node in the sidebar. Was components/tree (Vue 1 recursion
// with a module-global `selected`, prefix-namespaced $dispatch/$broadcast and
// prop mutation). Now: local expand state, children loaded lazily via the
// adapter, selection routed through the store controller.
const props = defineProps({
  storageKey: { type: String, required: true },
  item: { type: Object, default: null }, // null → the storage root node
  label: { type: String, default: '' },
});
const picker = inject(PICKER);

const open = ref(false);
const loading = ref(false);
const children = ref(null); // null = not loaded yet

const isSelected = () =>
  picker.store.selection.storage === props.storageKey &&
  (props.item ? picker.store.selection.items?.storage === props.item.id : !picker.store.selection.items?.storage);

async function toggle() {
  if (children.value === null) {
    loading.value = true;
    try {
      const { items } = await picker.adapters[props.storageKey].list(props.item);
      children.value = items.filter((entry) => entry.type === 'dir');
    } finally {
      loading.value = false;
    }
  }
  open.value = !open.value;
}

function select() {
  picker.openStorage(props.storageKey, props.item);
}
</script>

<template>
  <div class="tree-node">
    <span class="tree-toggle" :class="{ open, loading }" @click="toggle">{{ open ? '▾' : '▸' }}</span>
    <span class="tree-label" :class="{ selected: isSelected() }" @click="select">
      <span class="tree-icon">📁</span>
      {{ item ? item.name : label }}
    </span>
    <ul v-show="open" v-if="children && children.length" class="tree-children">
      <li v-for="child in children" :key="child.id">
        <FolderTree :storage-key="storageKey" :item="child" />
      </li>
    </ul>
  </div>
</template>
