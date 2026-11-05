<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import TimelineResultsView from '../../views/TimelineResultsView.vue'
import { timelineResults } from './data.js'

// The timeline entrance, as legacy's TimelinePage.vue (inventory-app#2423):
// on a white panel, the form — a country list opening on "Select a Country"
// then "All Countries", the start and end dates side by side, and a round
// Go — beside the shared introduction. The lists and the navigation to the
// results are the composed view's, over the same spec the results page
// renders; the form and its checks are legacy's: a country is required, all
// countries need both dates, and a date left unset is the first or last one
// on offer.
const spec = { ...timelineResults, entrance: true }

function go({ filters, options, go: navigate, t }) {
  if (!filters.country) {
    window.alert(t('gallery.timeline.alertCountry'))
    return
  }
  if (filters.country === 'all' && (!filters.begin || !filters.end)) {
    window.alert(t('gallery.timeline.alertDates'))
    return
  }
  const begins = options.begin ?? []
  const ends = options.end ?? []
  navigate({
    country: filters.country,
    begin: filters.begin || begins[0]?.value,
    end: filters.end || ends.at(-1)?.value,
  })
}
</script>

<template>
  <div class="mwnf-dxa-timeline">
    <TimelineResultsView :spec="spec" class="mwnf-dxa-timeline__form">
      <template #form="slot">
        <div class="mwnf-dxa-timeline__entrance">
          <select
            class="mwnf-dxa-timeline__country"
            :value="slot.filters.country"
            :aria-label="slot.t('gallery.timeline.selectCountry')"
            @change="slot.filters.country = $event.target.value"
          >
            <option disabled value="">{{ slot.t('gallery.timeline.selectCountry') }}</option>
            <option v-for="country in slot.countries" :key="country.value" :value="country.value">{{ country.label }}</option>
          </select>
          <div class="mwnf-dxa-timeline__dates">
            <select
              :value="slot.filters.begin"
              :aria-label="slot.t('gallery.timeline.startDate')"
              @change="slot.filters.begin = $event.target.value"
            >
              <option disabled value="">{{ slot.t('gallery.timeline.startDate') }}</option>
              <option v-for="option in slot.options.begin ?? []" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <select
              :value="slot.filters.end"
              :aria-label="slot.t('gallery.timeline.endDate')"
              @change="slot.filters.end = $event.target.value"
            >
              <option disabled value="">{{ slot.t('gallery.timeline.endDate') }}</option>
              <option v-for="option in slot.options.end ?? []" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <div class="mwnf-dxa-timeline__go">
            <button type="button" @click="go(slot)">{{ slot.t('core.action.go') }}</button>
          </div>
        </div>
      </template>
    </TimelineResultsView>
    <I18nText class="mwnf-dxa-timeline__intro" dir="auto" keypath="gallery.timeline.intro" />
  </div>
</template>
