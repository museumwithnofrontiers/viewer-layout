<script setup>
import TextPage from './TextPage.vue'

// The gallery About page (epic #1731, from carpets/amulets): `gallery.about.body`
// is a shared entry every gallery receives, holding the generic *MWNF
// Galleries* text; a site overloads it in its own `locales/en.json` with its
// own. Drawn as legacy's AboutPage.vue (TextPage.vue).
</script>

<template>
  <TextPage kind="about" body="gallery.about.body" />
</template>
