<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'
import SheetSection from './SheetSection.vue'

// A record's audio and video: the package's `media` entries, each a link to
// where it plays, opening elsewhere. With `language`, the entries in that
// language when there are any, and every entry otherwise; without it, every
// entry.
const props = defineProps({
  /** The record's `media`: `{ type, title, description, url, language }`. */
  media: { type: Array, default: () => [] },
  language: { type: String, default: '' },
  /** Show each entry's description under its title. */
  descriptions: { type: Boolean, default: true },
  heading: { type: String, default: 'record.related.audioVideo' },
  dir: { type: String, default: '' },
})
const { t } = useI18n()

const entries = computed(() => {
  const all = props.media.filter((entry) => entry?.url)
  if (!props.language) return all
  const inLanguage = all.filter((entry) => entry.language === props.language)
  return inLanguage.length ? inLanguage : all
})
</script>

<template>
  <SheetSection v-if="entries.length" :heading="heading ? t(heading) : ''" :dir="dir" class="mwnf-related-media">
    <div v-for="entry in entries" :key="entry.url" class="mwnf-related-media__entry">
      <a :href="entry.url" target="_blank" rel="noopener" class="mwnf-related-media__link">↗ {{ entry.title || entry.url }}</a>
      <p v-if="descriptions && entry.description" class="mwnf-related-media__description">{{ entry.description }}</p>
    </div>
  </SheetSection>
</template>
