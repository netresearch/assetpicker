<script setup>
import { computed, inject } from 'vue';
import { PICKER } from '../use-picker.js';

// A single item tile. Interaction like a native file dialog:
//  - folder: single click opens it (navigates in)
//  - file:   single click selects/deselects it, double click confirms the pick
const props = defineProps({ item: { type: Object, required: true } });
const picker = inject(PICKER);

const selected = computed(() => picker.store.pick.contains(props.item));
const mediaType = computed(() => String(props.item.mediaType));
const isDir = computed(() => props.item.type === 'dir');

function onClick() {
  if (isDir.value) {
    picker.openItem(props.item);
  } else {
    picker.togglePick(props.item);
  }
}

function onDblClick() {
  if (!isDir.value) {
    picker.openItem(props.item);
  }
}
</script>

<template>
  <div
    class="item"
    :class="{ selected, 'is-dir': isDir }"
    :title="isDir ? `Open ${item.name}` : item.name"
    @click="onClick"
    @dblclick.prevent="onDblClick"
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
