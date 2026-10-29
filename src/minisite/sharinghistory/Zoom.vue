<script setup>
// The zoom window (zoom.php), opened from an item panel's picture or the
// introduction's: the picture alone. It shows only a picture the exhibition
// itself places, on its pages or its introduction.
import { computed } from 'vue'
import { useSharingHistoryExhibition } from './exhibition.js'

const props = defineProps({ image: { type: String, default: '' } })
const { pages, root, slots } = useSharingHistoryExhibition()

const shown = computed(() => {
  const known = [
    ...(root.value?.items ?? []).map((entry) => entry.image_url),
    ...pages.value.flatMap((p) => slots(p.node).flatMap((slot) => slot.variants.map((v) => v.image_url))),
  ]
  return props.image && known.includes(props.image) ? props.image : ''
})
</script>

<template>
  <img v-if="shown" :src="shown" alt="">
</template>
