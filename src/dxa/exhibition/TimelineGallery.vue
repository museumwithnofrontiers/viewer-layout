<script setup>
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import BackLink from '../../content/BackLink.vue'
import { timelineGallerySpec } from './data.js'

// The member items whose dates overlap the timeline search's country and
// period (epic #1731, from colours/water-in-islam — byte-identical), on the
// platform's composed results page. Legacy asked `/items` for this;
// `timelineGallerySpec` (dxa/exhibition/data.js) does the same join
// client-side. Overlap, not containment: a period is a window on the
// chronology, and an object made across its edge belongs in it.
</script>

<template>
  <CatalogueResultsView :spec="timelineGallerySpec" class="mwnf-dxa-timeline-gallery">
    <template #before>
      <BackLink />
    </template>
  </CatalogueResultsView>
</template>
