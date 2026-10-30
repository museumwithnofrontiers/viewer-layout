<script setup>
// The zoom window (exhibitions/BAR/generic_zoom.php, zoomImage.php), opened
// from an exhibition page's picture and the introduction's: the picture
// alone, centred on black, inside a white border. It shows only a picture of
// the exhibition's own pages, detail views included.
import { computed } from 'vue'
import { useBaroqueartExhibition } from './exhibition.js'

const props = defineProps({ image: { type: String, default: '' } })

const { pages, root, slots } = useBaroqueartExhibition()

const shown = computed(() => {
  const nodes = [root.value, ...pages.value.map((p) => p.node)].filter(Boolean)
  const known = nodes.flatMap((node) => slots(node).flatMap((slot) => slot.variants.map((v) => v.image)))
  return known.includes(props.image) ? props.image : ''
})
</script>

<template>
  <div class="mwnf-baroqueart-zoom">
    <img v-if="shown" :src="shown" alt="">
  </div>
</template>
