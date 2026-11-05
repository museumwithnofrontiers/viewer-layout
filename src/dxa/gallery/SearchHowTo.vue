<script setup>
import TextPage from './TextPage.vue'

// Editorial page, shared by every gallery (epic #1731, from carpets/amulets).
// The essay is about MySQL boolean full-text operators, which is why the
// collection composable implements that grammar rather than a plain
// substring match. Back goes through history, as legacy's did; a visitor who
// opened this page first goes to the collection entrance, the only page that
// links here. Drawn as legacy's SearchHowTo.vue (TextPage.vue).
</script>

<template>
  <TextPage kind="how-to" body="catalogue.search.howToEssay" :back="{ name: 'collection' }" />
</template>
