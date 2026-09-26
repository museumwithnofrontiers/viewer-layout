<script setup>
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n, yearBuckets } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import FacetSelect from '../../content/FacetSelect.vue'
import FilterPanel from '../../content/FilterPanel.vue'
import Pagination from '../../content/Pagination.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import {
  labelOf, timelines, FACET_CATEGORIES, collectionResults, countryIdForCode, useFacetLabels,
} from './data.js'

// Results plus "filter further by" (epic #1731, from carpets/amulets —
// byte-identical), on the platform's composed results page: the filters in
// the URL, the dependent options, the date rule, the tiles and the pages
// are the view's, from `collectionResults` (dxa/gallery/data.js). What
// fills the view's slots: the panel composed in the aside where legacy put
// it — every dropdown rebuilt from the items that survive the current
// filter set — with the timeline link under it, a reset that is the
// entrance again, and a second pagination above the tiles.
const router = useRouter()
const { t } = useI18n()
const labels = useFacetLabels()

const KEYS = collectionResults.keys
const isFirstSearch = (filters) => KEYS.filter((k) => filters[k]).length <= 1

function resetFilters() {
  router.push({ name: 'collection' })
}

// "Timeline for this Search" — legacy offered it whenever the chosen
// country actually has a chronology.
const timelineCountryIds = computed(() => new Set((timelines.value ?? []).map((tl) => tl.country_id)))
function showTimelineLink(filters) {
  const id = countryIdForCode(filters.country)
  return Boolean(id && timelineCountryIds.value.has(id))
}
</script>

<template>
  <CatalogueResultsView :spec="collectionResults" class="mwnf-dxa-collection-results">
    <template #before>
      <BackLink />
    </template>

    <template #actions="{ pageInfo, goToPage }">
      <Pagination class="mwnf-dxa-pages" :page-info="pageInfo" jump @navigate="goToPage" />
    </template>

    <template #empty>
      {{ $t('catalogue.results.noResults') }}
      <button class="mwnf-dxa-linkish" @click="resetFilters()">{{ $t('catalogue.results.resetFilters') }}</button>
    </template>

    <template #aside="{ filters, apply, matching, options }">
      <FilterPanel
        mode="immediate"
        :title="isFirstSearch(filters) ? $t('catalogue.facet.filterBy') : $t('catalogue.facet.filterFurtherBy')"
        :reset-label="$t('catalogue.results.resetFilters')"
        :disabled="matching.length === 0"
        @reset="resetFilters()"
      >
        <FacetSelect
          :model-value="filters.country"
          :options="options.country"
          :placeholder="$t('catalogue.facet.selectCountry')"
          @update:model-value="apply({ country: $event })"
        />
        <FacetSelect
          v-for="category in FACET_CATEGORIES"
          :key="category"
          :model-value="filters[category]"
          :options="options[category]"
          :placeholder="labels[category]"
          hide-empty
          @update:model-value="apply({ [category]: $event })"
        />
        <div class="mwnf-dxa-date-wrapper">
          <FacetSelect :model-value="filters.from" :options="yearBuckets(matching, t)" :placeholder="$t('catalogue.facet.startDate')" @update:model-value="apply({ from: $event })" />
          <FacetSelect :model-value="filters.to" :options="yearBuckets(matching, t)" :placeholder="$t('catalogue.facet.endDate')" @update:model-value="apply({ to: $event })" />
        </div>
      </FilterPanel>

      <div class="mwnf-dxa-timeline-link-box" v-if="showTimelineLink(filters)">
        <div class="mwnf-dxa-options-label">{{ $t('catalogue.results.timelineForSearch') }}</div>
        <p>
          ➤
          <RouterLink :to="{ name: 'timeline-results', query: { country: filters.country, begin: filters.from, end: filters.to } }">
            {{ $t('core.section.timeline') }} | {{ labelOf('countries', countryIdForCode(filters.country)) }}
          </RouterLink>
        </p>
      </div>
    </template>
  </CatalogueResultsView>
</template>
