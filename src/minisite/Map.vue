<script setup>
// The map window (generic_map.php), opened from the introduction: legacy's map
// of the exhibition in the page language (`minisite.map.picture`), and the
// further maps an exhibition with several has (`count`). A language legacy
// drew no map for shows none.
import { computed } from 'vue'
import { useExhibition } from './exhibition.js'

const { lang, settings, picture } = useExhibition()

const pictures = computed(() => {
  const map = settings.map
  if (!map) return []
  const first = picture(map.picture(lang.value))
  const more = Array.from({ length: Math.max((map.count ?? 1) - 1, 0) }, (_, i) => picture(map.picture(lang.value, i + 2)))
  return [first, ...more].filter(Boolean)
})
</script>

<template>
  <div class="mwnf-minisite-map">
    <template v-for="(src, i) in pictures" :key="src">
      <br v-if="i > 0">
      <img :src="src" alt="" width="800" height="418">
    </template>
  </div>
</template>
