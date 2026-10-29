<script setup>
// The zoom window (zoom.php), opened from an item panel's picture: the
// picture alone. It shows only a picture of the exhibition's own pages.
import { computed } from 'vue'
import { useSharingHistoryExhibition } from './exhibition.js'

const props = defineProps({ image: { type: String, default: '' } })
const { pages, slots } = useSharingHistoryExhibition()

const shown = computed(() => {
  const known = pages.value.flatMap((p) => slots(p.node).flatMap((slot) => slot.variants.map((v) => v.image_url)))
  return known.includes(props.image) ? props.image : ''
})
</script>

<template>
  <img v-if="shown" :src="shown" alt="">
</template>
