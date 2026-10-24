<script setup>
import { computed } from 'vue'
import { md, mdInline } from '@museumwnf/viewer-core'
import { useI18n } from '@museumwnf/viewer-core/i18n'
import MediaGallery from './MediaGallery.vue'
import SheetSection from './SheetSection.vue'

// A monument's special features: the sub-details the data package embeds on
// the monument as `details` (never items of their own, as legacy never showed
// them apart from their monument). Each one: its name, its location, dates
// and artists, its description as Markdown with the record's glossary terms,
// its pictures in a row. `DynastyList`'s shape: the raw entries, and `tr` to
// reach each one's translation.
const props = defineProps({
  /** The record's `details`: `{ id, internal_name, display_order, images, artist_names }`. */
  features: { type: Array, default: () => [] },
  /**
   * A feature → its translation in the record's language: `name`, `location`, `dates`,
   * `description`, and `artist`, the artist line as that language prints it (Markdown).
   */
  tr: { type: Function, default: () => ({}) },
  /** The record's language, for the pictures' captions. */
  language: { type: String, default: '' },
  /** `RecordView`'s `glossary`: the record's terms, highlighted in the descriptions as in the sheet. */
  glossary: { default: undefined },
  heading: { type: String, default: 'sheet.field.specialFeatures' },
  dir: { type: String, default: '' },
  /** At most this many pictures per feature (legacy's pages showed 6); 0 shows them all. */
  pictureLimit: { type: Number, default: 0 },
})
const { t } = useI18n()

const rows = computed(() =>
  [...props.features]
    .sort((a, b) => (a.display_order ?? Infinity) - (b.display_order ?? Infinity))
    .map((feature) => {
      const text = props.tr(feature) ?? {}
      return {
        id: feature.id,
        name: mdInline(text.name ?? feature.internal_name ?? feature.id),
        meta: [text.location, text.dates].filter(Boolean),
        // The language's own artist line, or none: legacy printed nothing for a language
        // without one, and `artist_names` merges every language's names.
        artist: mdInline(text.artist ?? ''),
        description: md(text.description, { glossary: props.glossary }),
        images: (feature.images ?? [])
          .slice(0, props.pictureLimit > 0 ? props.pictureLimit : undefined)
          .map((image) => ({ url: image.url, alt: image.captions?.[props.language] ?? '' })),
      }
    }),
)
</script>

<template>
  <SheetSection v-if="rows.length" :heading="heading ? t(heading) : ''" :dir="dir" class="mwnf-special-features">
    <div v-for="row in rows" :key="row.id" class="mwnf-special-features__item">
      <h3 class="mwnf-special-features__name" v-html="row.name"></h3>
      <p v-for="(line, i) in row.meta" :key="i" class="mwnf-special-features__meta">{{ line }}</p>
      <p v-if="row.artist" class="mwnf-special-features__meta" v-html="row.artist"></p>
      <div v-if="row.description" class="mwnf-special-features__description mwnf-sheet__block" v-html="row.description"></div>
      <MediaGallery v-if="row.images.length" :images="row.images" variant="row" />
    </div>
  </SheetSection>
</template>
