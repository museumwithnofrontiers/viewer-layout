<script setup>
// The credits window (generic_credits.php), opened from the home page: the
// exhibition's title and its credits, as the exhibition's record holds them.
import { computed } from 'vue'
import { useExhibition } from './exhibition.js'

const { data, root, text, title } = useExhibition()
const credits = computed(() => (root.value ? data.md(text(root.value.id).extra?.credits) : ''))
</script>

<template>
  <div class="mwnf-minisite-credits">
    <h1>{{ title }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
    <div v-html="credits" />
  </div>
</template>
