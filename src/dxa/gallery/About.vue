<script setup>
import TextPageView from '../../views/TextPageView.vue'

// The gallery About page (epic #1731, from carpets/amulets — byte-identical
// on `origin/main`): `gallery.about.body` is a shared entry every gallery
// receives, holding the generic *MWNF Galleries* text; a site overloads it
// in its own `locales/en.json` with its own. `back` is `true`: browser
// history when there is one, the view's own generic fallback otherwise.
const aboutSpec = {
  body: 'gallery.about.body',
  back: true,
}
</script>

<template>
  <TextPageView :spec="aboutSpec" class="mwnf-dxa-editorial" />
</template>
