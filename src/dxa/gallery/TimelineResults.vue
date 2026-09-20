<script setup>
import BackLink from '../../content/BackLink.vue'
import TimelineResultsView from '../../views/TimelineResultsView.vue'
import { timelineResults } from './data.js'

// Timeline results (epic #1731, from carpets/amulets — byte-identical), on
// the platform's composed timeline view: the filters in the URL, the
// country and period controls, the events list, its pagination and the
// "See gallery" cross-link are the view's, from `timelineResults`
// (dxa/gallery/data.js). What fills the one slot this page needs: the back
// link.
</script>

<template>
  <TimelineResultsView :spec="timelineResults" class="mwnf-dxa-timeline-results">
    <template #before>
      <BackLink />
    </template>
  </TimelineResultsView>
</template>
