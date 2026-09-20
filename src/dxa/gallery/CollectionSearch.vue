<script setup>
import { computed } from 'vue'
import { I18nText, useFacets } from '@museumwnf/viewer-core'
import SearchFormView from '../../views/SearchFormView.vue'
import { items, FACETS, FACET_CATEGORIES, FACET_LABEL_KEYS } from './data.js'

// The collection entrance (epic #1731, from carpets/amulets — byte-
// identical), on the platform's composed search form (`mode: 'facets'`):
// legacy's shape — one dropdown per facet, over the *whole* member
// universe, choosing one navigates straight to the results — is the view's
// own `immediate` behaviour for this mode, and the from/to year buckets are
// its `dates: 'buckets'`. What stays here is only what those two engines
// need fed in: the options, and which categories the gallery's data
// actually has anything to offer for.
//
// No `howTo` on the spec: `gallery.collection.intro` already ends with its
// own "[How to search](#/how-to-search)" link, so adding the view's own
// would duplicate it.
const options = useFacets(items, FACETS)
const visibleFacets = computed(() => FACET_CATEGORIES.filter((c) => (options.value[c] ?? []).length > 0))

const collectionSearchSpec = computed(() => ({
  mode: 'facets',
  target: 'collection-results',
  dates: 'buckets',
  facets: [
    { key: 'country', label: 'catalogue.facet.selectCountry', options: options.value.country },
    ...visibleFacets.value.map((category) => ({ key: category, label: FACET_LABEL_KEYS[category], options: options.value[category] })),
  ],
}))
</script>

<template>
  <div class="mwnf-dxa-collection-search">
    <SearchFormView :spec="collectionSearchSpec">
      <template #before>
        <div class="mwnf-dxa-dropdown-label">{{ $t('catalogue.facet.filterBy') }}</div>
      </template>
    </SearchFormView>

    <!-- Legacy hardcoded this copy in English and named the gallery in the
         middle of the first sentence. It is a shared entry now, and it names
         "this Gallery" instead: a text takes nothing inserted into it, and
         the three internal links are Markdown links to the same hash
         routes. -->
    <I18nText id="mwnf-dxa-collection-search-description" class="mwnf-dxa-description mwnf-prose" dir="auto" keypath="gallery.collection.intro" />
  </div>
</template>
