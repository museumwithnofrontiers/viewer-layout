<script setup>
import { computed } from 'vue'
import { I18nText } from '@museumwnf/viewer-core'
import TimelineResultsView from '../../views/TimelineResultsView.vue'
import { timelineSpec } from './data.js'

// The timeline entrance: the exhibition's timeline spec (local or country
// scope) as the composed timeline view's form alone, `entrance: true`,
// validating before it navigates to the results.
//
// With both chronology flags false the menu offers no Timeline and nothing
// links here, yet the page stays reachable by address, as legacy's did, so
// it has to make sense to a visitor who arrives with no link.
const spec = computed(() => ({ ...timelineSpec.value, entrance: true }))
</script>

<template>
  <TimelineResultsView :spec="spec">
    <template #after>
      <I18nText class="mwnf-prose mwnf-dxa-timeline__intro" dir="auto" keypath="exhibition.timeline.intro" />
    </template>
  </TimelineResultsView>
</template>
