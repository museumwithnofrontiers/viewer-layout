<script setup>
// Legacy's two windows over an exhibition: its curators (credits.php) and its
// cover image (coverImage.php), each the exhibition's title, a heading and
// the exhibition's own text (`curated_by`, `cover_images`).
import { computed } from 'vue'
import { useSharingHistoryExhibition } from './exhibition.js'

const props = defineProps({
  // "curators" or "coverImage".
  kind: { type: String, required: true },
})

const { data, label, root, text, title } = useSharingHistoryExhibition()
const FIELDS = { curators: 'curated_by', coverImage: 'cover_images' }
const body = computed(() => (root.value ? data.md(text(root.value.id).extra?.[FIELDS[props.kind]] ?? '') : ''))
</script>

<template>
  <div>
    <h3>{{ title }}</h3>
    <p>{{ label(`windows.${kind}`) }}</p><br>
    <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
    <div v-html="body" />
  </div>
</template>
