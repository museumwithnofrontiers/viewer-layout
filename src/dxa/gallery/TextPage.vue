<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'

// A gallery's text page — About, Credits, How to search — as legacy drew it
// (dxa-client's AboutPage.vue, CreditsPage.vue, SearchHowTo.vue,
// inventory-app#2423): a white panel inside the gallery's frame, the Back
// button at its top left, the text in a centred column half the page wide.
// Each page placed Back and padded the column its own way: `kind` names the
// page. Back goes through history; `back` is the fallback when there is none.
// Legacy's texts were HTML, a blank line a `<br>`, and the Credits put two
// where the rest put one: each blank line of the text stays a line
// (`blank-lines`, viewer-core 2.16.0).
defineProps({
  body: { type: String, required: true },
  kind: { type: String, required: true, validator: (v) => ['about', 'credits', 'how-to'].includes(v) },
  back: { type: [String, Object], default: null },
})
</script>

<template>
  <div class="mwnf-dxa-gallery-text" :class="`mwnf-dxa-gallery-text--${kind}`">
    <BackLink :to="back" />
    <I18nText class="mwnf-dxa-gallery-text__body" dir="auto" :keypath="body" blank-lines />
  </div>
</template>
