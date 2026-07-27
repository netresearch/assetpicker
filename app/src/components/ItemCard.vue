<script setup>
import { computed, inject } from 'vue';
import { PICKER } from '../use-picker.js';

// A single item tile. Was the inline-template `item` component inside grid.js
// (mixins/contextmenu, $dispatch('finish-pick'), $root.$broadcast). Now a
// plain SFC: click toggles the pick, double-click opens (drills into a folder
// or confirms a file), selection comes from the store.
const props = defineProps({ item: { type: Object, required: true } });
const picker = inject(PICKER);

const selected = computed(() => picker.store.pick.contains(props.item));
const mediaType = computed(() => String(props.item.mediaType));
const isDir = computed(() => props.item.type === 'dir');
</script>

<template>
  <div
    class="item"
    :class="{ selected, 'is-dir': isDir }"
    :title="item.name"
    @click="picker.togglePick(item)"
    @dblclick.prevent="picker.openItem(item)"
  >
    <div class="item-preview">
      <div
        v-if="item.thumbnail"
        class="item-thumbnail"
        :style="{ backgroundImage: `url(${item.thumbnail})` }"
      ></div>
      <span v-else class="file-type" :class="`file-type-${mediaType}`">{{ isDir ? '📁' : (item.extension || '·') }}</span>
    </div>
    <div class="item-title">{{ item.name }}</div>
  </div>
</template>
