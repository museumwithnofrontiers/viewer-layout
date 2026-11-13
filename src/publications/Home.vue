<script setup>
// Legacy's home page (HomePage.vue): one band per category, in the menu's
// order — its name, "See All" to its list, the first page of its books as
// tiles, and "See All" again under them. A category with no book draws no
// band (legacy's "NEW" list reads a flag the package does not carry; a site
// may say which books are new with `publications.categories`).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import { usePublications } from './data.js'
import { homeLimit, inCategory, PAGE_SIZE } from './rules.js'
import Tile from './Tile.vue'

const { t } = useI18n()
const data = usePublications()

// Legacy kept a band on one line: as many tiles as the window's width holds
// (assignBooks), the first page's on a wide screen.
const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1400)
const resize = () => { width.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', resize))
onBeforeUnmount(() => window.removeEventListener('resize', resize))

const bands = computed(() => data.categories.value
  .map((entry) => ({
    entry,
    tiles: data.inCategory(entry, inCategory).slice(0, Math.min(PAGE_SIZE, homeLimit(width.value))).map((publication) => data.tile(publication)),
  }))
  .filter((band) => band.tiles.length))
</script>

<template>
  <div class="mwnf-books-home">
    <section v-for="band in bands" :key="band.entry.slug" class="mwnf-books-home__band">
      <h2 class="mwnf-books-home__label">
        {{ t(band.entry.label) }}
        <RouterLink class="mwnf-books-home__see-all" :to="{ name: 'category', params: { category: band.entry.slug } }">{{ t('publications.home.seeAll') }} &rsaquo;</RouterLink>
      </h2>
      <div class="mwnf-books-home__tiles">
        <Tile v-for="tile in band.tiles" :key="tile.id" :tile="tile" variant="home" />
      </div>
      <RouterLink class="mwnf-books-home__see-all-below" :to="{ name: 'category', params: { category: band.entry.slug } }">{{ t('publications.home.seeAll') }} &rsaquo;</RouterLink>
    </section>
  </div>
</template>
