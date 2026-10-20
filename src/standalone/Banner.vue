<script setup>
// The inner pages' banner of the standalone family: legacy's `banner_inside`
// picture as a band, with the section's title over it
// (`<section class="banner banner_inside"><h2><span>…`).
defineProps({
  image: { type: String, default: '' },
  title: { type: String, default: '' },
})
</script>

<template>
  <div class="mwnf-standalone-banner" :style="image ? { backgroundImage: `url(${JSON.stringify(image)})` } : undefined">
    <h1 v-if="title" class="mwnf-standalone-banner__title"><span>{{ title }}</span></h1>
  </div>
</template>
