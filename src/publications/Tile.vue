<script setup>
// A book's tile, as legacy's home, category and results pages drew it
// (`homepage-book-container`, `category-book-container`,
// `results-book-container`): the cover — "Image Coming Soon" without one —
// with the language codes beside it, then the country, the project, the
// title, the subtitle, on a category page the authors, and the formats. A
// hover tooltip says "See Book Details". The availability line legacy
// printed under the formats reads a stock flag the package does not carry.
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import { truncate } from './rules.js'

const props = defineProps({
  tile: { type: Object, required: true },
  /** home | category | results: which page's tile (and class names) this is. */
  variant: { type: String, default: 'home' },
})
const { t } = useI18n()

// The home page shortened a subtitle to 55 characters; the lists did not.
const subtitle = computed(() => (props.variant === 'home' ? truncate(55, props.tile.subtitle) : props.tile.subtitle))
</script>

<template>
  <div class="mwnf-books-tile" :class="`mwnf-books-tile--${variant}`">
    <RouterLink class="mwnf-books-tile__link" :to="tile.to">
      <span class="mwnf-books-tile__tooltip" role="tooltip">{{ t('publications.card.hover') }}</span>
      <span class="mwnf-books-tile__media">
        <span v-if="tile.cover" class="mwnf-books-tile__cover"><img :src="tile.cover" alt="" loading="lazy"></span>
        <span v-else class="mwnf-books-tile__cover mwnf-books-tile__cover--none">{{ t('publications.card.imageComingSoon') }}</span>
        <span class="mwnf-books-tile__languages">
          <span v-for="code in tile.languages.shown" :key="code" class="mwnf-books-tile__language">{{ code.toUpperCase() }}</span>
          <span v-if="tile.languages.more" class="mwnf-books-tile__language">+</span>
        </span>
      </span>
      <span class="mwnf-books-tile__info">
        <span v-if="tile.country" class="mwnf-books-tile__country">{{ tile.country }}</span>
        <span v-if="tile.project" class="mwnf-books-tile__project">{{ tile.project }}</span>
        <span class="mwnf-books-tile__title">{{ tile.title }}</span>
        <span v-if="subtitle" class="mwnf-books-tile__subtitle">{{ subtitle }}</span>
        <span v-if="variant === 'category' && tile.author" class="mwnf-books-tile__author">{{ t('publications.edition.authors') }}: {{ tile.author }}</span>
        <span v-if="tile.formats" class="mwnf-books-tile__formats">{{ tile.formats }}</span>
      </span>
    </RouterLink>
  </div>
</template>
