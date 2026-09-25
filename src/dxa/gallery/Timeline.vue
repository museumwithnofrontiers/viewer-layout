<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import TimelineResultsView from '../../views/TimelineResultsView.vue'
import { timelineResults } from './data.js'

// The timeline entrance: the country and period controls, their validation
// and the navigation to the results are the composed view's, over the same
// spec the results page renders, `entrance: true` here. Beside it, the
// shared introduction, whose three project links and contact address are
// Markdown links inside the entry.
const spec = { ...timelineResults, entrance: true }
</script>

<template>
  <div class="mwnf-dxa-timeline">
    <TimelineResultsView :spec="spec" class="mwnf-dxa-timeline__form" />
    <I18nText class="mwnf-prose mwnf-dxa-timeline__intro" dir="auto" keypath="gallery.timeline.intro" />
  </div>
</template>
