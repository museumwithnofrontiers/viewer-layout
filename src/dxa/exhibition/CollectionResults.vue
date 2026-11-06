<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { I18nText, renderInline, useI18n, yearBuckets } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import FacetSelect from '../../content/FacetSelect.vue'
import FilterPanel from '../../content/FilterPanel.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import ObjectGrid from '../gallery/ObjectGrid.vue'
import Pages from './Pages.vue'
import {
  items, itemById, labelOf, tr, defaultLang, collectionResults, itemRoute, legacyPaging, projectName,
} from './data.js'
import { useThemeFilter } from './themeFilter.js'

// An exhibition's collection results as legacy's (exhibitions-client
// CollectionResults.vue, inventory-app#2379): Back; "Collection | <choices>"
// and "<n> result(s) out of <total> items"; the tile grid with, on its right,
// once a filter is set, "Filter by Theme:" over the theme and its
// sub-themes, then "Filter by:" (or "Filter further by:") over the theme
// (first search only), the country, the type, the material and the dates,
// each rebuilt from the records that survive the filters, and "Reset
// filters"; the pages above and below the grid only when there is more than
// one. Legacy's link to the timeline is commented out. Choosing a theme
// keeps no other filter, choosing a sub-theme keeps only its theme, and "All
// Themes" is every record again. Legacy wrote every word here in English on
// every language's page; they are the exhibition's own entries.
const { t, locale } = useI18n()
const { themeOptions, subThemeOptions, scopeFor } = useThemeFilter(locale)

// Below 500px legacy folded the filters behind a pen, opening them over the
// page with a cross to close them; a new search closes them.
// Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com
// License - https://fontawesome.com/license/free (Icons: CC BY 4.0)
const PEN = { viewBox: '0 0 512 512', path: 'M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z' }
const XMARK = { viewBox: '0 0 384 512', path: 'M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z' }
const phoneQuery = typeof window !== 'undefined' ? window.matchMedia('(max-width: 499px)') : null
const phone = ref(Boolean(phoneQuery?.matches))
const onPhone = (event) => { phone.value = event.matches }
phoneQuery?.addEventListener('change', onPhone)
onBeforeUnmount(() => phoneQuery?.removeEventListener('change', onPhone))
const showFilters = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { showFilters.value = false })

const NAMES = { type: 'exhibition.collection.typeOfObject', material: 'exhibition.collection.material' }
const CATEGORIES = ['type', 'material']
const ERA_WORDS = { 'catalogue.era.ad': 'exhibition.era.ad', 'catalogue.era.bc': 'exhibition.era.bc' }
const eraT = (key) => t(ERA_WORDS[key] ?? key)
const allYears = computed(() => yearBuckets(items.value ?? [], eraT))
const total = computed(() => itemById.value.size)

// Legacy cut a date longer than eighty characters.
const shortDate = (text) => (text && text.length > 80 ? `${text.slice(0, 80)}...` : (text ?? ''))

const spec = {
  ...collectionResults,
  ...legacyPaging,
  keys: [...collectionResults.keys, 'theme', 'subtheme'],
  match: (item, filters) => {
    const scope = scopeFor(filters.theme, filters.subtheme)
    return !scope || scope.has(item.id)
  },
  summary: () => [],
  record: (item) => {
    const text = tr('items', item.id, defaultLang)
    return {
      id: item.id,
      image: item.images?.[0]?.url ?? '',
      imageAlt: labelOf('items', item.id),
      name: renderInline(text.name ?? item.internal_name ?? ''),
      date: shortDate(text.dates),
      partner: labelOf('partners', item.partner_id),
      place: [text.location, labelOf('countries', item.country_id)].filter(Boolean).join(', '),
      project: projectName(item, defaultLang) ?? '',
      to: itemRoute(item),
    }
  },
}

const isFirstSearch = (filters) => spec.keys.every((k) => !filters[k])

function themeLabel(filters) {
  const theme = themeOptions.value.find((o) => o.value === String(filters.theme))?.label ?? filters.theme
  const sub = filters.subtheme ? subThemeOptions(filters.theme).find((o) => o.value === String(filters.subtheme))?.label : ''
  return sub ? `${theme} ▪ ${sub}` : theme
}

// Legacy's "Collection | …" line: each choice as its dropdown shows it,
// joined with " & ", a date marked "(Start)" or "(End)"; with none, "All
// Items", or "No Results" when nothing matches.
function choices(filters, options, matching) {
  const shown = (key) => (options[key] ?? []).find((o) => String(o.value) === String(filters[key]))?.label ?? filters[key]
  const year = (value) => allYears.value.find((o) => String(o.value) === String(value))?.label ?? value
  const parts = []
  if (filters.theme) parts.push(themeLabel(filters))
  if (filters.country) parts.push(shown('country'))
  for (const key of CATEGORIES) if (filters[key]) parts.push(shown(key))
  if (filters.from) parts.push(`${t('exhibition.collection.start')} ${year(filters.from)}`)
  if (filters.to) parts.push(`${t('exhibition.collection.end')} ${year(filters.to)}`)
  if (parts.length) return parts.join(' & ')
  return matching.length ? t('exhibition.collection.allItems') : t('exhibition.collection.none')
}

function chooseTheme(apply, reset, value) {
  if (value === 'all') return reset()
  const cleared = Object.fromEntries(spec.keys.map((k) => [k, '']))
  apply({ ...cleared, theme: value })
}

function chooseSubTheme(apply, filters, value) {
  const cleared = Object.fromEntries(spec.keys.map((k) => [k, '']))
  apply({ ...cleared, theme: filters.theme, subtheme: value })
}
</script>

<template>
  <div class="mwnf-dxa-gallery-results mwnf-dxa-exhibition-results">
    <CatalogueResultsView :spec="spec" class="mwnf-dxa-collection-results">
      <template #before="{ filters, options, matching, pageInfo }">
        <BackLink />
        <div class="mwnf-dxa-gallery-results__info">
          <p>{{ t('exhibition.collection.heading') }} | <span class="mwnf-dxa-gallery-results__choices">{{ choices(filters, options, matching) }}</span></p>
          <p>{{ pageInfo.total }} {{ t('exhibition.collection.resultsOutOf') }} {{ total }} {{ t('exhibition.collection.items') }}</p>
        </div>
        <Pages class="mwnf-dxa-exhibition-pages--top" :page-info="pageInfo" @navigate="goToPage" />
      </template>

      <template #records="{ rows }">
        <ObjectGrid v-if="rows.length" :rows="rows" family="exhibition" />
        <I18nText v-else class="mwnf-dxa-gallery-results__none" keypath="exhibition.collection.noResults" />
      </template>

      <!-- Legacy's pages run the page's width, above and below the grid and
           its filters. -->
      <template #pagination></template>

      <template #after="{ pageInfo, goToPage }">
        <Pages v-if="pageInfo.lastPage > 1" :page-info="pageInfo" @navigate="goToPage" />
        <div v-else class="mwnf-dxa-gallery-results__end"></div>
      </template>

      <template #aside="{ filters, apply, reset, matching, options }">
        <button
          v-if="phone"
          type="button"
          class="mwnf-dxa-exhibition-results__open"
          :aria-label="t('exhibition.collection.filterBy')"
          :aria-expanded="showFilters"
          @click="showFilters = true"
        >
          <svg :viewBox="PEN.viewBox" aria-hidden="true" focusable="false"><path :d="PEN.path" /></svg>
        </button>
        <div v-show="!phone || showFilters" class="mwnf-dxa-exhibition-results__refine">
        <button
          v-if="phone && showFilters"
          type="button"
          class="mwnf-dxa-exhibition-results__close"
          :aria-label="t('core.action.close')"
          @click="showFilters = false"
        >
          <svg :viewBox="XMARK.viewBox" aria-hidden="true" focusable="false"><path :d="XMARK.path" /></svg>
        </button>
        <div v-if="!isFirstSearch(filters)" class="mwnf-dxa-exhibition-results__themes">
          <div class="mwnf-dxa-options-label">{{ t('exhibition.collection.filterByTheme') }}</div>
          <div class="mwnf-dxa-exhibition-results__theme-selects">
          <select
            class="mwnf-facet__select"
            :aria-label="t('exhibition.collection.selectTheme')"
            :value="filters.theme || ''"
            :disabled="!matching.length"
            @change="chooseTheme(apply, reset, $event.target.value)"
          >
            <option disabled value="">{{ t('exhibition.collection.selectTheme') }}</option>
            <option value="all">{{ t('exhibition.collection.allThemes') }}</option>
            <option v-for="option in themeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select
            v-if="filters.theme && subThemeOptions(filters.theme).length"
            class="mwnf-facet__select"
            :aria-label="t('exhibition.themeGallery.select')"
            :value="filters.subtheme || ''"
            :disabled="!matching.length"
            @change="chooseSubTheme(apply, filters, $event.target.value)"
          >
            <option disabled value="">{{ t('exhibition.themeGallery.select') }}</option>
            <option v-for="option in subThemeOptions(filters.theme)" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          </div>
        </div>
        <FilterPanel
          mode="immediate"
          :title="isFirstSearch(filters) ? t('exhibition.collection.filterBy') : t('exhibition.collection.filterFurtherBy')"
          :reset-label="t('exhibition.collection.resetFilters')"
          :disabled="matching.length === 0"
          @reset="reset()"
        >
          <select
            v-if="isFirstSearch(filters)"
            class="mwnf-facet__select"
            :aria-label="t('exhibition.collection.selectTheme')"
            value=""
            :disabled="!matching.length"
            @change="chooseTheme(apply, reset, $event.target.value)"
          >
            <option disabled value="">{{ t('exhibition.collection.selectTheme') }}</option>
            <option value="all">{{ t('exhibition.collection.allThemes') }}</option>
            <option v-for="option in themeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <FacetSelect
            :model-value="filters.country"
            :options="options.country"
            :placeholder="t('exhibition.collection.selectCountry')"
            @update:model-value="apply({ country: $event })"
          />
          <FacetSelect
            v-for="category in CATEGORIES"
            :key="category"
            :model-value="filters[category]"
            :options="options[category]"
            :placeholder="t(NAMES[category])"
            hide-empty
            @update:model-value="apply({ [category]: $event })"
          />
          <div class="mwnf-dxa-date-wrapper">
            <FacetSelect :model-value="filters.from" :options="yearBuckets(matching, eraT)" :placeholder="t('exhibition.collection.startDate')" @update:model-value="apply({ from: $event })" />
            <FacetSelect :model-value="filters.to" :options="yearBuckets(matching, eraT)" :placeholder="t('exhibition.collection.endDate')" @update:model-value="apply({ to: $event })" />
          </div>
        </FilterPanel>
        </div>
      </template>
    </CatalogueResultsView>
  </div>
</template>
