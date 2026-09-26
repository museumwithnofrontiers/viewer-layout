<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useKeywordIndex } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import { loadEnglish, PAGE_SIZE, haystack, tile } from './data.js'

// The header search bar's results (epic #1731, from carpets/amulets — byte-
// identical), on the platform's composed results view. Legacy ran MySQL
// boolean full-text search server-side; viewer-core runs the same operator
// grammar over a client-side index of the gallery's haystack —
// `all-objects` is legacy's sentinel for an empty submission, matched by
// `narrow` below rather than by the index.
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
  sort: false,
  narrow: (list, filters) => {
    if (!ready.value) return []
    return isAllObjects(filters.q) ? list : index.search(filters.q)
  },
  pageSize: PAGE_SIZE,
  variant: 'grid',
  recordRoute: 'item',
  actionLabel: 'catalogue.results.seeDatabaseEntry',
  record: (item, { t }) => tile(item, t),
  pagination: { jump: true },

  summary: ({ filters, pageInfo, t, total }) => [
    { label: t('core.section.database'), value: isAllObjects(filters.q) ? t('catalogue.results.allObjects') : `“${filters.q}”` },
    { count: pageInfo.total, value: `${t('catalogue.results.outOf')} ${total} ${t('catalogue.results.objects')}` },
  ],
}))
</script>

<template>
  <CatalogueResultsView :spec="searchResultsSpec" class="mwnf-dxa-search-results">
    <template #before>
      <BackLink />
    </template>

    <!-- No auto-rendered `controls`: legacy's box is one field with a button
         beside it, not the generic labelled row the platform's own control
         types build, so it is composed here instead. Submitting re-runs the
         search on THIS page rather than returning to the header's box. -->
    <template #filters="{ apply }">
      <form class="mwnf-dxa-refine-search" @submit.prevent="apply({ q: refineTerm || 'all-objects' })">
        <input v-model="refineTerm" type="text" class="mwnf-dxa-refine-search-input" :placeholder="$t('catalogue.search.keywordPlaceholder')" />
        <button type="submit" class="mwnf-dxa-refine-search-submit">{{ $t('catalogue.search.submit') }}</button>
      </form>
      <p class="mwnf-dxa-how-to"><RouterLink :to="{ name: 'search-how-to' }">{{ $t('catalogue.search.howTo') }} ›</RouterLink></p>
    </template>

    <!-- Was one sentence with two links threaded through it. The message
         stands on its own and the two ways out are links beside it. -->
    <template #empty>
      <p class="mwnf-dxa-no-results">
        {{ $t('catalogue.results.noResultsSearch') }}
        <RouterLink :to="{ name: 'search-how-to' }">{{ $t('catalogue.search.howTo') }}</RouterLink>
        <span class="mwnf-dxa-no-results-divider">|</span>
        <RouterLink :to="{ name: 'collection' }">{{ $t('core.section.collection') }}</RouterLink>
      </p>
    </template>
  </CatalogueResultsView>
</template>
