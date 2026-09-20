<script setup>
import TimelineResultsView from '../../views/TimelineResultsView.vue'
import BackLink from '../../content/BackLink.vue'
import { timelineSpec } from './data.js'

// Timeline results (epic #1731, from colours/water-in-islam — byte-
// identical), on the platform's composed timeline view: the "See Gallery"
// cross-link renders whenever the chosen country/period actually contains
// member items — `timelineSpec` (dxa/exhibition/data.js) is the one place
// that join lives, because an item's own shape is this exhibition's, not
// the package's.
</script>

<template>
  <TimelineResultsView :spec="timelineSpec" class="mwnf-dxa-timeline-results">
    <template #before>
      <BackLink />
    </template>
  </TimelineResultsView>
</template>
