<script setup>
import { computed, reactive, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { withEraWords, yearBucketsFromRange } from '@museumwnf/viewer-core'
import TimelineResultsView from '../../views/TimelineResultsView.vue'
import BackLink from '../../content/BackLink.vue'
import Pages from './Pages.vue'
import { timelineSpec } from './data.js'

// The timeline results as legacy's TimelineResults (exhibitions-client,
// inventory-app#2379): a band on the contrast colour — "Timeline | <start>
// to <end> | <n> Results" over the start and end dates, the country when the
// chronology is by country, Go and Reset —; Back; legacy's pager above and
// below; "Date" and "Description" over the events, each its year on a rule
// of the contrast colour beside its text; on the right, in the contrast
// colour, "RELATED CONTENT" with See Gallery when the period holds items of
// the exhibition. The filters, the events and the pages are the composed
// view's, over the exhibition's timeline spec. Legacy wrote the words here
// in English on every language's page; they are the exhibition's own
// entries. Legacy's "Download → All Events" read its API, which the package
// has no counterpart for.
const ERA_WORDS = { 'catalogue.era.ad': 'exhibition.era.ad', 'catalogue.era.bc': 'exhibition.era.bc' }
const years = ({ years: range, t }) => yearBucketsFromRange(range.min, range.max, withEraWords(t, ERA_WORDS))

const spec = computed(() => ({
  ...timelineSpec.value,
  pageSize: 20,
  controls: timelineSpec.value.controls.map((control) => (control.options ? { ...control, options: years } : control)),
}))
const byCountry = computed(() => timelineSpec.value.scope === 'country')

// The form edits a draft of the address's filters; Go applies it, Reset is
// the whole timeline again.
const route = useRoute()
const draft = reactive({ country: '', begin: '', end: '' })
watch(() => route.query, (query) => {
  draft.country = String(query.country ?? '')
  draft.begin = String(query.begin ?? '')
  draft.end = String(query.end ?? '')
}, { immediate: true })

const label = (options, value) => (options ?? []).find((o) => String(o.value) === String(value))?.label ?? value

// Legacy printed the event's first year as it stood, minus sign and all,
// then the era.
function eventYear(event, t) {
  const year = event?.year_from
  if (!Number.isFinite(year)) return ''
  return `${year} ${t(year < 0 ? 'exhibition.era.bc' : 'exhibition.era.ad')}`
}
</script>

<template>
  <div class="mwnf-dxa-exhibition-timeline-results">
    <TimelineResultsView :spec="spec" class="mwnf-dxa-timeline-results">
      <template #form="slot">
        <div class="mwnf-dxa-exhibition-timeline-results__band">
          <p class="mwnf-dxa-exhibition-timeline-results__current">
            {{ slot.t('exhibition.timeline.heading') }} | {{ label(slot.options.begin, slot.filters.begin) }} {{ slot.t('exhibition.timeline.to') }} {{ label(slot.options.end, slot.filters.end) }} |
            <span v-if="byCountry && slot.filters.country">{{ label(slot.countries, slot.filters.country) }} | </span>
            <span>{{ slot.pageInfo?.total ?? 0 }} {{ slot.t('exhibition.timeline.results') }}</span>
          </p>
          <div class="mwnf-dxa-exhibition-timeline-results__fields">
            <span>{{ slot.t('exhibition.collection.startDate') }}</span>
            <select v-model="draft.begin" :aria-label="slot.t('exhibition.collection.startDate')">
              <option disabled value="">{{ slot.t('exhibition.collection.startDate') }}</option>
              <option v-for="option in slot.options.begin ?? []" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
            </select>
            <span>{{ slot.t('exhibition.collection.endDate') }}</span>
            <select v-model="draft.end" :aria-label="slot.t('exhibition.collection.endDate')">
              <option disabled value="">{{ slot.t('exhibition.collection.endDate') }}</option>
              <option v-for="option in slot.options.end ?? []" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
            </select>
            <template v-if="byCountry">
              <span>{{ slot.t('exhibition.timeline.country') }}</span>
              <select v-model="draft.country" :aria-label="slot.t('exhibition.timeline.selectCountry')">
                <option disabled value="">{{ slot.t('exhibition.timeline.selectCountry') }}</option>
                <option v-for="country in slot.countries" :key="country.value" :value="country.value">{{ country.label }}</option>
              </select>
            </template>
            <button type="button" @click="slot.apply({ ...draft })">{{ slot.t('core.action.go') }}</button>
            <button type="button" @click="slot.reset()">{{ slot.t('exhibition.search.reset') }}</button>
          </div>
        </div>
      </template>

      <template #summary="{ pageInfo, goToPage }">
        <BackLink />
        <Pages class="mwnf-dxa-exhibition-timeline-results__pages" :page-info="pageInfo" @navigate="goToPage" />
      </template>

      <template #gallery></template>

      <template #event="{ pageInfo, rows, gallery, t }">
        <div class="mwnf-dxa-exhibition-timeline-results__body">
          <div v-if="rows.length" class="mwnf-dxa-exhibition-timeline-results__list">
            <div class="mwnf-dxa-exhibition-timeline-results__labels">
              <div>{{ t('exhibition.timeline.date') }}</div>
              <div>{{ t(byCountry && draft.country ? 'exhibition.timeline.countryDescription' : 'exhibition.timeline.description') }}</div>
            </div>
            <div v-for="(row, index) in rows" :key="row.id" class="mwnf-dxa-exhibition-timeline-results__event">
              <div class="mwnf-dxa-exhibition-timeline-results__year"><span>{{ eventYear(pageInfo.rows[index], t) }}</span></div>
              <div class="mwnf-dxa-exhibition-timeline-results__text">
                <div v-if="byCountry && draft.country && row.caption" class="mwnf-dxa-exhibition-timeline-results__country" v-html="row.caption"></div>
                <div class="mwnf-dxa-exhibition-timeline-results__description" v-html="row.description"></div>
              </div>
            </div>
          </div>
          <div v-else class="mwnf-dxa-exhibition-timeline-results__none">{{ t('exhibition.timeline.noResults') }}</div>
          <div v-if="rows.length && gallery" class="mwnf-dxa-exhibition-timeline-results__related">
            <p class="mwnf-dxa-exhibition-timeline-results__related-header">{{ t('exhibition.timeline.relatedContent') }}</p>
            <p><span aria-hidden="true">➦</span> <RouterLink :to="gallery.to">{{ t('exhibition.timeline.seeGallery') }}</RouterLink></p>
          </div>
        </div>
      </template>

      <template #pagination="{ pageInfo, goToPage }">
        <Pages v-if="pageInfo.lastPage > 1" :page-info="pageInfo" @navigate="goToPage" />
        <div v-else class="mwnf-dxa-exhibition-timeline-results__end"></div>
      </template>
    </TimelineResultsView>
  </div>
</template>
