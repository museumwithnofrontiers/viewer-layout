<script setup>
import { computed, useSlots } from 'vue'
import { pictureCredits, picturesInLanguage, renderPlain, useI18n } from '@museumwnf/viewer-core'
import RecordView from '../views/RecordView.vue'
import MediaGallery from '../content/MediaGallery.vue'
import RecordLanguages from '../content/RecordLanguages.vue'
import SmartLink from '../content/SmartLink.vue'
import RelatedContent from './RelatedContent.vue'
import { limitPictures } from '../views/pictureLimit.js'

// The standalone family's item sheet, `database_item.php` in its three
// columns: the way back and the pictures; the sheet; the coloured Related
// Content column. It is `RecordView` with the site's spec, laid out by the
// family's stylesheet, so the field engine, the record's languages, the
// short-description toggle, the credits and the citation stay the platform's.
//
//   spec: RecordView's spec. Its pictures move to the left column.
//   back: [{ label: entry, to | href, history: true }]   // legacy's breadcrumbs; `history` goes back one page
//   related: { heading: entry, groups: [{ heading: entry, type }], download: { heading: entry, print: entry } }
//
// Slots: `sidebar` (the site's own blocks in the Related Content column,
// after the related records), `before-sheet` and every slot RecordView hands
// to the sheet (a `custom` row's key, `after-sheet`, `source`, `after`).
const props = defineProps({
  spec: { type: Object, required: true },
  id: { type: String, required: true },
  back: { type: Array, default: () => [] },
  related: { type: Object, default: () => ({}) },
})
const { t } = useI18n()
const slots = useSlots()

// RecordView draws no pictures here: the left column does.
const sheetSpec = computed(() => ({ ...props.spec, media: () => [], source: false }))

function imagesOf(ctx) {
  return limitPictures(allImagesOf(ctx), props.spec.pictureLimit, ctx)
}

function allImagesOf({ record, text, language }) {
  if (props.spec.media) return props.spec.media(record, { record, text, language })
  const name = renderPlain(String(text?.name ?? record?.internal_name ?? ''))
  // Only the pictures with a row in the page's language, as legacy listed them.
  return picturesInLanguage(record?.images, language).map((image) => ({
    url: image.url,
    alt: image.captions?.[language] ?? name,
    caption: image.captions?.[language] ?? '',
    ...pictureCredits(image, language),
  }))
}

const backLinks = computed(() => props.back.map((link) => ({ ...link, label: t(link.label) })))

const OWN = new Set(['header', 'before-sheet', 'related', 'sidebar', 'aside', 'source'])
const passed = computed(() => Object.keys(slots).filter((name) => !OWN.has(name)))

function goBack() {
  window.history.back()
}
</script>

<template>
  <RecordView :spec="sheetSpec" :id="id" class="mwnf-standalone-item">
    <template #header="{ languages, language, select }">
      <div class="mwnf-standalone-item__top">
        <RecordLanguages :languages="languages" :language="language" @select="select" />
      </div>
    </template>

    <template #before-sheet="ctx">
      <div class="mwnf-standalone-item__left">
        <p v-if="backLinks.length" class="mwnf-standalone-item__back">
          <template v-for="link in backLinks" :key="link.label">
            <button v-if="link.history" type="button" class="mwnf-standalone-item__back-link" @click="goBack">{{ link.label }}</button>
            <SmartLink v-else class="mwnf-standalone-item__back-link" :to="link.to" :href="link.href">{{ link.label }}</SmartLink>
          </template>
        </p>
        <MediaGallery :images="imagesOf(ctx)" />
      </div>
      <slot name="before-sheet" v-bind="ctx" />
    </template>

    <template #related="ctx">
      <RelatedContent
        :heading="related.heading ?? 'record.related.title'"
        :records="ctx.records"
        :groups="related.groups ?? []"
        :download="related.download ?? null"
      >
        <slot name="sidebar" v-bind="ctx" />
      </RelatedContent>
    </template>

    <!-- Legacy's sheet printed no source address: only a site's own `source` slot draws one. -->
    <template v-if="$slots.source" #source="ctx">
      <slot name="source" v-bind="ctx" />
    </template>

    <template v-for="name in passed" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </RecordView>
</template>
