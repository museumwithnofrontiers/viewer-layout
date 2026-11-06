<script setup>
import { computed } from 'vue'
import { I18nText, withEraWords, yearBucketsFromRange } from '@museumwnf/viewer-core'
import TimelineResultsView from '../../views/TimelineResultsView.vue'
import { timelineSpec } from './data.js'

// The timeline entrance as legacy's TimelinePage (exhibitions-client,
// inventory-app#2379): the form — a country list opening on "Select a
// Country" when the exhibition's chronology is by country, the start and end
// dates side by side in A.D./B.C., and a round Go — beside the exhibition's
// text. The lists and the navigation are the composed view's, over the
// exhibition's timeline spec; the rule is legacy's: no country is every
// country, and a date left unset is the first or last one on offer. Legacy
// wrote the words here in English on every language's page; they are the
// exhibition's own entries.
//
// With both chronology flags false the menu offers no Timeline and nothing
// links here, yet the page stays reachable by address, as legacy's did.
const ERA_WORDS = { 'catalogue.era.ad': 'exhibition.era.ad', 'catalogue.era.bc': 'exhibition.era.bc' }
const years = ({ years: range, t }) => yearBucketsFromRange(range.min, range.max, withEraWords(t, ERA_WORDS))

const spec = computed(() => ({
  ...timelineSpec.value,
  entrance: true,
  controls: timelineSpec.value.controls.map((control) => (control.options ? { ...control, options: years } : control)),
}))
const byCountry = computed(() => timelineSpec.value.scope === 'country')

function go({ filters, options, go: navigate }) {
  const begins = options.begin ?? []
  const ends = options.end ?? []
  navigate({
    ...(byCountry.value && filters.country ? { country: filters.country } : {}),
    begin: filters.begin || begins[0]?.value,
    end: filters.end || ends.at(-1)?.value,
  })
}
</script>

<template>
  <div class="mwnf-dxa-timeline mwnf-dxa-exhibition-timeline">
    <TimelineResultsView :spec="spec" class="mwnf-dxa-timeline__form">
      <template #form="slot">
        <div class="mwnf-dxa-timeline__entrance">
          <select
            v-if="byCountry && slot.countries?.length"
            class="mwnf-dxa-timeline__country"
            :value="slot.filters.country"
            :aria-label="slot.t('exhibition.timeline.selectCountry')"
            @change="slot.filters.country = $event.target.value"
          >
            <option disabled value="">{{ slot.t('exhibition.timeline.selectCountry') }}</option>
            <option v-for="country in slot.countries" :key="country.value" :value="country.value">{{ country.label }}</option>
          </select>
          <div class="mwnf-dxa-timeline__dates">
            <select
              :value="slot.filters.begin"
              :aria-label="slot.t('exhibition.collection.startDate')"
              @change="slot.filters.begin = $event.target.value"
            >
              <option disabled value="">{{ slot.t('exhibition.collection.startDate') }}</option>
              <option v-for="option in slot.options.begin ?? []" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <select
              :value="slot.filters.end"
              :aria-label="slot.t('exhibition.collection.endDate')"
              @change="slot.filters.end = $event.target.value"
            >
              <option disabled value="">{{ slot.t('exhibition.collection.endDate') }}</option>
              <option v-for="option in slot.options.end ?? []" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          <div class="mwnf-dxa-timeline__go">
            <button type="button" @click="go(slot)">{{ slot.t('core.action.go') }}</button>
          </div>
        </div>
      </template>
    </TimelineResultsView>
    <I18nText class="mwnf-dxa-timeline__intro" dir="auto" keypath="exhibition.timeline.intro" />
  </div>
</template>
