<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { I18nText, useI18n, yearBuckets } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import FacetSelect from '../../content/FacetSelect.vue'
import FilterPanel from '../../content/FilterPanel.vue'
import LegacyPages from '../LegacyPages.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import ObjectGrid from './ObjectGrid.vue'
import {
  items, labelOf, timelines, GALLERY_ERA_WORDS, GALLERY_FACET_CATEGORIES, collectionResults, countryIdForCode, legacyPaging,
} from './data.js'

// The collection's results as legacy's (dxa-client CollectionResults.vue,
// inventory-app#2423): Back; "Collection | <choices>" and "<n> result(s) out
// of <total> objects"; legacy's tile grid with, on its right, "Filter by:"
// (or "Filter further by:" once a filter is set) over the dropdowns, each
// rebuilt from the items that survive the current filters, "Reset filters",
// and the timeline of the chosen country; the pages above and below the
// grid only when there is more than one. The filters in the address, the
// options, the date rule, the order and the pages are the composed view's,
// from `collectionResults` (dxa/gallery/data.js). Legacy wrote every word
// here in English on every language's page; they are the gallery's own
// entries. Its dropdowns had no artist.
const { t } = useI18n()

const NAMES = {
  type: 'gallery.collection.type',
  dynasty: 'gallery.collection.periodDynasty',
  subject: 'gallery.collection.subject',
  material: 'gallery.collection.material',
}
const eraT = (key) => t(GALLERY_ERA_WORDS[key] ?? key)
const allYears = computed(() => yearBuckets(items.value ?? [], eraT))
const total = computed(() => (items.value ?? []).length)

const KEYS = collectionResults.keys
const isFirstSearch = (filters) => KEYS.every((k) => !filters[k])

// Legacy's "Collection | …" line: each choice as its dropdown shows it,
// joined with " & ", a date marked "(Start)" or "(End)"; with none, "All
// Objects", or "No Results" when nothing matches.
function choices(filters, options, matching) {
  const shown = (key) => (options[key] ?? []).find((o) => String(o.value) === String(filters[key]))?.label ?? filters[key]
  const year = (value) => allYears.value.find((o) => String(o.value) === String(value))?.label ?? value
  const parts = []
  if (filters.country) parts.push(shown('country'))
  for (const key of GALLERY_FACET_CATEGORIES) if (filters[key]) parts.push(shown(key))
  if (filters.from) parts.push(`${t('gallery.collection.start')} ${year(filters.from)}`)
  if (filters.to) parts.push(`${t('gallery.collection.end')} ${year(filters.to)}`)
  if (parts.length) return parts.join(' & ')
  return matching.length ? t('gallery.collection.allObjects') : t('gallery.collection.none')
}

// "Timeline for this Search": legacy offered it whenever the chosen country
// has a chronology.
const timelineCountryIds = computed(() => new Set((timelines.value ?? []).map((tl) => tl.country_id)))
function showTimelineLink(filters) {
  const id = countryIdForCode(filters.country)
  return Boolean(id && timelineCountryIds.value.has(id))
}
</script>

<template>
  <div class="mwnf-dxa-gallery-results">
    <CatalogueResultsView :spec="{ ...collectionResults, ...legacyPaging, summary: () => [] }" class="mwnf-dxa-collection-results">
      <template #before="{ filters, options, matching, pageInfo }">
        <BackLink />
        <div class="mwnf-dxa-gallery-results__info">
          <p>{{ t('gallery.collection.heading') }} | <span class="mwnf-dxa-gallery-results__choices">{{ choices(filters, options, matching) }}</span></p>
          <p>{{ pageInfo.total }} {{ t('gallery.collection.resultsOutOf') }} {{ total }} {{ t('gallery.collection.objects') }}</p>
        </div>
      </template>

      <template #actions="{ pageInfo, goToPage }">
        <LegacyPages family="gallery" class="mwnf-dxa-gallery-pages--top" :page-info="pageInfo" @navigate="goToPage" />
      </template>

      <template #records="{ rows }">
        <ObjectGrid v-if="rows.length" :rows="rows" />
        <I18nText v-else class="mwnf-dxa-gallery-results__none" keypath="gallery.collection.noResults" />
      </template>

      <template #pagination="{ pageInfo, goToPage }">
        <LegacyPages v-if="pageInfo.lastPage > 1" family="gallery" :page-info="pageInfo" @navigate="goToPage" />
        <div v-else class="mwnf-dxa-gallery-results__end"></div>
      </template>

      <template #aside="{ filters, apply, reset, matching, options }">
        <FilterPanel
          mode="immediate"
          :title="isFirstSearch(filters) ? t('gallery.collection.filterBy') : t('gallery.collection.filterFurtherBy')"
          :reset-label="t('gallery.collection.resetFilters')"
          :disabled="matching.length === 0"
          @reset="reset()"
        >
          <FacetSelect
            :model-value="filters.country"
            :options="options.country"
            :placeholder="t('gallery.collection.selectCountry')"
            @update:model-value="apply({ country: $event })"
          />
          <FacetSelect
            v-for="category in GALLERY_FACET_CATEGORIES"
            :key="category"
            :model-value="filters[category]"
            :options="options[category]"
            :placeholder="t(NAMES[category])"
            hide-empty
            @update:model-value="apply({ [category]: $event })"
          />
          <div class="mwnf-dxa-date-wrapper">
            <FacetSelect :model-value="filters.from" :options="yearBuckets(matching, eraT)" :placeholder="t('gallery.collection.startDate')" @update:model-value="apply({ from: $event })" />
            <FacetSelect :model-value="filters.to" :options="yearBuckets(matching, eraT)" :placeholder="t('gallery.collection.endDate')" @update:model-value="apply({ to: $event })" />
          </div>
        </FilterPanel>

        <div v-if="showTimelineLink(filters)" class="mwnf-dxa-timeline-link-box">
          <div class="mwnf-dxa-options-label">{{ t('gallery.collection.timelineForSearch') }}</div>
          <p class="mwnf-dxa-gallery-results__timeline">
            <span class="mwnf-dxa-gallery-results__share" aria-hidden="true">➦</span><RouterLink :to="{ name: 'timeline-results', query: { country: filters.country, begin: filters.from, end: filters.to } }">{{ t('gallery.collection.timeline') }} | {{ labelOf('countries', countryIdForCode(filters.country)) }}</RouterLink>
          </p>
        </div>
      </template>
    </CatalogueResultsView>
  </div>
</template>
