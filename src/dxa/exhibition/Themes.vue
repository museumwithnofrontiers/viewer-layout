<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import SectionCards from '../../content/SectionCards.vue'
import { themes } from './data.js'
import { themeNodeRoute } from './themeSpecs.js'

// Legacy's ThemesPage — an accordion of the exhibition's themes, one card a
// theme, numbered in Roman and opening onto its sub-themes — as SectionCards'
// `accordion` variant. That variant renders a number, a title and child
// links only, so legacy's cover crop, presentation excerpt and "see gallery
// for Theme N" link are not drawn. "Overview" is the children's first entry,
// since the card itself links nowhere, so every theme is reachable from here
// with or without sub-themes. It starts after the About theme, which legacy
// renders at /about.
const { listedThemes, romanFor, themeText } = themes
const { t, locale } = useI18n()

const cards = computed(() =>
  listedThemes.value.map((theme) => ({
    title: themeText(theme, locale.value).title ?? theme.internal_name ?? '',
    number: romanFor(theme.display_order),
    children: [
      { title: t('exhibition.theme.overview'), to: themeNodeRoute(theme) },
      ...(theme.sub_themes ?? []).map((sub) => ({
        title: themeText(sub, locale.value).title ?? sub.internal_name ?? '',
        to: themeNodeRoute(sub),
      })),
    ],
  })),
)
</script>

<template>
  <div class="mwnf-dxa-themes">
    <div class="mwnf-dxa-themes__container">
      <SectionCards :cards="cards" variant="accordion" />
    </div>
  </div>
</template>
