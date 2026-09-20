<script setup>
import { RouterLink } from 'vue-router'
import BackLink from '../../content/BackLink.vue'
import Pagination from '../../content/Pagination.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import { timelineGallery } from './data.js'

// The member items whose dates overlap the timeline search's country and
// period (epic #1731, from carpets/amulets — byte-identical), on the
// platform's composed results view: the join, the date rule, the tiles and
// the pages are the view's, from `timelineGallery` (dxa/gallery/data.js).
// What fills the slots: the back link and the "back to events" link above
// the tiles, and a second pagination beside it.
</script>

<template>
  <CatalogueResultsView :spec="timelineGallery" class="mwnf-dxa-timeline-gallery">
    <template #before>
      <BackLink />
    </template>

    <template #actions="{ filters, pageInfo, goToPage }">
      <p class="mwnf-dxa-back-to-events">
        <RouterLink :to="{ name: 'timeline-results', query: { country: filters.country, begin: filters.begin, end: filters.end } }">
          ➤ {{ $t('timeline.nav.backToEvents') }}
        </RouterLink>
      </p>
      <Pagination class="mwnf-dxa-pages" :page-info="pageInfo" jump @navigate="goToPage" />
    </template>
  </CatalogueResultsView>
</template>
