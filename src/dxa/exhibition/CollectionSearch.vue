<script setup>
import { computed } from 'vue'
import { I18nText, useFacets } from '@museumwnf/viewer-core'
import SearchFormView from '../../views/SearchFormView.vue'
import { items, FACETS, FACET_CATEGORIES, FACET_LABEL_KEYS } from './data.js'

// The collection entrance (epic #1731, from colours/water-in-islam — byte-
// identical), on the platform's composed search form (`mode: 'facets'`):
// legacy's shape — one dropdown per facet, over the *whole* member
// universe, choosing one navigates straight to the results — is the view's
// own `immediate` behaviour for this mode, and the from/to year buckets are
// its `dates: 'buckets'`. What stays here is only what those two engines
// need fed in.
const options = useFacets(items, FACETS)
const visibleFacets = computed(() => FACET_CATEGORIES.filter((c) => (options.value[c] ?? []).length > 0))

const collectionSearchSpec = computed(() => ({
  mode: 'facets',
  target: 'collection-results',
  dates: 'buckets',
  howTo: 'search-how-to',
  facets: [
    { key: 'country', label: 'catalogue.facet.selectCountry', options: options.value.country },
    ...visibleFacets.value.map((category) => ({ key: category, label: FACET_LABEL_KEYS[category], options: options.value[category] })),
  ],
}))
</script>

<template>
  <div class="mwnf-dxa-collection-search">
    <SearchFormView :spec="collectionSearchSpec">
      <template #intro>
        <!-- A shared entry, not this exhibition's own: the only thing that
             made the old `txtCollection` exhibition-specific was an absolute
             URL to its own Themes page, which is `#/themes` now. -->
        <I18nText id="mwnf-dxa-collection-search-description" class="mwnf-dxa-description mwnf-prose" dir="auto" keypath="exhibition.collection.intro" />
      </template>
    </SearchFormView>
  </div>
</template>
