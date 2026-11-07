<script setup>
import { RouterLink } from 'vue-router'
import BackLink from '../../content/BackLink.vue'
import LegacyPages from '../LegacyPages.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import ObjectGrid from './ObjectGrid.vue'
import { legacyPaging, timelineGallery } from './data.js'

// The member items whose dates overlap the timeline search's country and
// period (epic #1731, from carpets/amulets — byte-identical), on the
// platform's composed results view: the join, the date rule, the tiles and
// the pages are the view's, from `timelineGallery` (dxa/gallery/data.js).
// What fills the slots: the back link and the "back to events" link above
// the tiles; legacy's pages (PagesComponent) above and below them.
</script>

<template>
  <CatalogueResultsView :spec="{ ...timelineGallery, ...legacyPaging }" class="mwnf-dxa-timeline-gallery">
    <template #before>
      <BackLink />
    </template>

    <template #actions="{ filters, pageInfo, goToPage }">
      <p class="mwnf-dxa-back-to-events">
        <RouterLink :to="{ name: 'timeline-results', query: { country: filters.country, begin: filters.begin, end: filters.end } }">
          ➤ {{ $t('timeline.nav.backToEvents') }}
        </RouterLink>
      </p>
      <LegacyPages family="gallery" class="mwnf-dxa-gallery-pages--top" :page-info="pageInfo" @navigate="goToPage" />
    </template>

    <template #records="{ rows, empty }">
      <ObjectGrid v-if="rows.length" :rows="rows" />
      <p v-else class="mwnf-record-grid__empty">{{ empty }}</p>
    </template>

    <template #pagination="{ pageInfo, goToPage }">
      <LegacyPages family="gallery" :page-info="pageInfo" @navigate="goToPage" />
    </template>
  </CatalogueResultsView>
</template>
