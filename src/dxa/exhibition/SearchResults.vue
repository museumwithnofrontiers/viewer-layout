<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useKeywordIndex } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import { itemById, loadEnglish, PAGE_SIZE, haystack, tile } from './data.js'

// The header search bar's results (epic #1731, from colours/water-in-islam
// — byte-identical), on the platform's composed results view. Legacy ran
// MySQL boolean full-text search server-side; viewer-core runs the same
// operator grammar over a client-side index of the exhibition's haystack.
//
// The index reads every record of the entity; `scope` keeps the same
// renderable-subset rule the collection results page uses (`itemById`'s own
// rule, in dxa/exhibition/data.js), and `narrow` runs the keyword search
// over what `scope` already narrowed to — the "members intersection" legacy
// kept with its own `ids.has()` check.
const index = useKeywordIndex('items', { grammar: 'boolean', haystack })
const ready = ref(false)
loadEnglish().then(() => { ready.value = true })

function isAllObjects(term) {
  return !term || term === 'all-objects'
}

const refineTerm = ref('')

const searchResultsSpec = computed(() => ({
  entity: 'items',
  keys: ['q'],
  scope: (item) => itemById.value.has(item.id),
  sort: false,
  narrow: (list, filters) => {
    if (!ready.value) return []
    if (isAllObjects(filters.q)) return list
    const ids = new Set(list.map((i) => i.id))
    return index.search(filters.q).filter((i) => ids.has(i.id))
  },
  pageSize: PAGE_SIZE,
  variant: 'grid',
  recordRoute: 'item',
  actionLabel: 'exhibition.action.seeDatabaseEntry',
  record: (item, { t }) => tile(item, t),
  pagination: { jump: true },

  summary: ({ filters, pageInfo, t }) => [
    { label: t('exhibition.section.database'), value: isAllObjects(filters.q) ? t('catalogue.results.allObjects') : `“${filters.q}”` },
    { count: pageInfo.total, value: `${t('catalogue.results.outOf')} ${itemById.value.size} ${t('catalogue.results.objects')}` },
  ],
}))
</script>

<template>
  <CatalogueResultsView :spec="searchResultsSpec" class="mwnf-dxa-search-results">
    <template #before>
      <BackLink />
    </template>

    <template #filters="{ apply }">
      <form class="mwnf-dxa-refine-search" @submit.prevent="apply({ q: refineTerm || 'all-objects' })">
        <input v-model="refineTerm" type="text" class="mwnf-dxa-refine-search-input" :placeholder="$t('catalogue.search.keywordPlaceholder')" />
        <button type="submit" class="mwnf-dxa-refine-search-submit">{{ $t('catalogue.search.submit') }}</button>
      </form>
      <p class="mwnf-dxa-how-to"><RouterLink :to="{ name: 'search-how-to' }">{{ $t('catalogue.search.howTo') }} ›</RouterLink></p>
    </template>

    <template #empty>
      <p class="mwnf-dxa-no-results">
        {{ $t('catalogue.results.noResultsSearch') }}
        <RouterLink :to="{ name: 'search-how-to' }">{{ $t('catalogue.search.howTo') }}</RouterLink>
        <span class="mwnf-dxa-no-results-divider">|</span>
        <RouterLink :to="{ name: 'collection' }">{{ $t('exhibition.section.collection') }}</RouterLink>
      </p>
    </template>
  </CatalogueResultsView>
</template>
