<script setup>
import { ref, onMounted } from 'vue';

// Draggable column divider between the sidebar and the stage. Replaces the
// Vue 1 `handle` component: emits `move` (was `$dispatch('handle-move')`) and
// exposes the current x position (the parent read `$refs.handle.x`).
const emit = defineEmits(['move']);

const root = ref(null);
const x = ref(undefined);

function startDrag() {
  const parent = root.value.parentNode;
  const defaultCursor = parent.style.cursor;
  parent.style.cursor = 'col-resize';

  const drag = (event) => {
    x.value = event.pageX;
    emit('move', event.pageX);
  };
  const stop = () => {
    parent.style.cursor = defaultCursor;
    parent.removeEventListener('mousemove', drag);
    document.body.removeEventListener('mouseleave', stop);
    document.body.removeEventListener('mouseup', stop);
  };

  parent.addEventListener('mousemove', drag);
  document.body.addEventListener('mouseleave', stop);
  document.body.addEventListener('mouseup', stop);
}

onMounted(() => {
  root.value.addEventListener('mousedown', startDrag);
});

defineExpose({ x });
</script>

<template>
  <div ref="root" class="handle"></div>
</template>
