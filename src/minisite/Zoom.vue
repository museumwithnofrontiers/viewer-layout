<script setup>
// The zoom window (generic_zoom.php), opened from an exhibition page's picture:
// the picture alone, centred on black, inside a white border. It shows only a
// picture of the exhibition's own pages.
import { computed } from 'vue'
import { useExhibition } from './exhibition.js'

const props = defineProps({ image: { type: String, default: '' } })

const { pages, root, slots } = useExhibition()

const shown = computed(() => {
  const nodes = [root.value, ...pages.value.map((p) => p.node)].filter(Boolean)
  const known = nodes.flatMap((node) => slots(node).flatMap((slot) => slot.variants.map((v) => v.image)))
  return known.includes(props.image) ? props.image : ''
})
</script>

<template>
  <div class="mwnf-minisite-zoom">
    <img v-if="shown" :src="shown" alt="">
  </div>
</template>
