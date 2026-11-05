<script setup>
import TextPage from './TextPage.vue'

// The gallery Credits page (epic #1731, from carpets/amulets). Every gallery
// names its own curators, photographers and translators, so — unlike About,
// which overloads a shared entry — `body` is the one genuinely per-site
// string this family's `standardRoutes('gallery', config)` threads through
// as `config.creditsBody` (e.g. `'carpets.credits.body'`). Drawn as legacy's
// CreditsPage.vue (TextPage.vue).
defineProps({
  bodyKey: { type: String, required: true },
})
</script>

<template>
  <TextPage kind="credits" :body="bodyKey" />
</template>
