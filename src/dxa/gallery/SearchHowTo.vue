<script setup>
import TextPageView from '../../views/TextPageView.vue'

// Editorial page, shared by every gallery (epic #1731, from carpets/amulets
// — byte-identical). The essay is about MySQL boolean full-text operators,
// which is why the collection composable implements that grammar rather
// than a plain substring match. `back` points at the collection entrance,
// the only page that links here — the view's `back` is a fixed
// destination, not `router.back()`, so there is no page-agnostic answer.
const searchHowToSpec = {
  body: 'catalogue.search.howToEssay',
  back: { label: 'core.action.back', to: { name: 'collection' } },
}
</script>

<template>
  <TextPageView :spec="searchHowToSpec" class="mwnf-dxa-editorial" />
</template>
