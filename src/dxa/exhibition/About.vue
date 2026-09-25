<script setup>
import Theme from './Theme.vue'

// Legacy's AboutPage is a one-line wrapper around ThemeComponent: /about is the
// About theme (display order 1) under the exhibition's own title and
// subtitle, which the theme page's `about-mode` carries. It is not
// `exhibition.json`'s `abouts` (legacy's `exhibition_i18n.about`, empty in the
// packages): the introduction a visitor reads is the About theme's
// presentation and its curated pictures.
</script>

<template>
  <div class="mwnf-dxa-about">
    <Theme about-mode />
  </div>
</template>
