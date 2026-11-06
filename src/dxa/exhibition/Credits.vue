<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'

// An exhibition's credits as legacy's CreditsPage (exhibitions-client,
// inventory-app#2379): Back, then the text in a centred column half the page
// wide at 20px. Legacy's text was HTML, a blank line a `<br>`: each blank
// line of the text stays a line (`blank-lines`).
defineProps({
  bodyKey: { type: String, required: true },
})
</script>

<template>
  <div class="mwnf-dxa-exhibition-credits">
    <BackLink />
    <I18nText class="mwnf-dxa-exhibition-credits__body" dir="auto" :keypath="bodyKey" blank-lines />
  </div>
</template>
