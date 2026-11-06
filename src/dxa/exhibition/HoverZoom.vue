<script setup>
import { ref } from 'vue'

// Legacy's ZoomComponent (exhibitions-client, after vue-zoom-on-hover): the
// picture fitted to its box; under the pointer, the same picture at its own
// size, moved so the point under the pointer stays under it.
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
})

const box = ref(null)
const normal = ref(null)
const zoom = ref(null)
const zoomed = ref(false)

function move(event) {
  const frame = box.value?.getBoundingClientRect()
  if (!frame || !normal.value || !zoom.value) return
  const fx = (event.clientX - frame.left) / normal.value.offsetWidth
  const fy = (event.clientY - frame.top) / normal.value.offsetHeight
  zoom.value.style.left = `${-fx * (zoom.value.offsetWidth - normal.value.offsetWidth)}px`
  zoom.value.style.top = `${-fy * (zoom.value.offsetHeight - normal.value.offsetHeight)}px`
}
</script>

<template>
  <div ref="box" class="mwnf-hover-zoom" @mouseenter="zoomed = true" @mouseleave="zoomed = false" @mousemove="move">
    <img ref="normal" class="mwnf-hover-zoom__normal" :style="{ opacity: zoomed ? 0 : 1 }" :src="src" :alt="alt" />
    <img ref="zoom" class="mwnf-hover-zoom__zoom" :style="{ opacity: zoomed ? 1 : 0 }" :src="src" alt="" aria-hidden="true" />
  </div>
</template>
