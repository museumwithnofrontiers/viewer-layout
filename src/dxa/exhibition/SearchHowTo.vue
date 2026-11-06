<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'

// The search tips as legacy's SearchHowTo (exhibitions-client,
// inventory-app#2379): Back, then the text at 20px in a column 60% of the
// page wide. The text is about MySQL boolean full-text operators, which is
// why the search runs that grammar rather than a plain substring match.
</script>

<template>
  <div class="mwnf-dxa-exhibition-how-to">
    <BackLink />
    <I18nText class="mwnf-dxa-exhibition-how-to__text" dir="auto" keypath="catalogue.search.howToEssay" />
  </div>
</template>
