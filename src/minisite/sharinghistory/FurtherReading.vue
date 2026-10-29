<script setup>
// Further Reading (bibliography.php): the exhibition's bibliography, in the
// page language, its entries in alphabetical order as legacy listed them.
import { computed } from 'vue'
import { useSharingHistoryExhibition } from './exhibition.js'

const { data, label, lang, root, settings, text, title } = useSharingHistoryExhibition()

// The importer keeps the bibliography by legacy's language code.
const entries = computed(() => {
  const bibliography = root.value ? text(root.value.id).extra?.bibliography ?? {} : {}
  const own = bibliography[lang.value] ?? bibliography.en ?? []
  return [...own].sort((a, b) => a.localeCompare(b))
})
</script>

<template>
  <div v-if="root" class="mwnf-sh-reading">
    <h1>{{ label('related.furtherReading') }}</h1>
    <nav class="mwnf-sh-reading__nav">
      <router-link :to="{ name: 'home' }">{{ label('nav.entrance') }}</router-link> |
      <a :href="`${settings.parent}/#/exhibitions`">{{ label('nav.allExhibitions') }}</a>
    </nav>
    <h3>{{ title }}</h3>
    <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
    <p v-for="entry in entries" :key="entry" v-html="data.mdInline(entry)" />
  </div>
</template>
