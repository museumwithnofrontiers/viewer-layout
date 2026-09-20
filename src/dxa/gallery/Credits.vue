<script setup>
import { computed } from 'vue'
import TextPageView from '../../views/TextPageView.vue'

// The gallery Credits page (epic #1731, from carpets/amulets). Every gallery
// names its own curators, photographers and translators, so — unlike About,
// which overloads a shared entry — `body` is the one genuinely per-site
// string this family's `standardRoutes('gallery', config)` threads through
// as `config.creditsBody` (e.g. `'carpets.credits.body'`).
const props = defineProps({
  bodyKey: { type: String, required: true },
})

const creditsSpec = computed(() => ({
  body: props.bodyKey,
  back: true,
}))
</script>

<template>
  <TextPageView :spec="creditsSpec" class="mwnf-dxa-editorial" />
</template>
