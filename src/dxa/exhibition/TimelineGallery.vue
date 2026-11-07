<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n, withEraWords, yearBucketsFromRange } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import ObjectGrid from '../gallery/ObjectGrid.vue'
import Pages from '../LegacyPages.vue'
import { timelineGallerySpec, timelineSpec, legacyPaging, legacyTile, countryLabelFromCode } from './data.js'

// The items of a period as legacy's TimelineGallery (exhibitions-client,
// inventory-app#2379): Back; "Timeline | <start> to <end> | [<country> |]
// Gallery"; legacy's pager above and below; the exhibition's tile grid with,
// on its right, "➦ See Timeline" back to the same period. Twenty a page in
// legacy's order. The period's items are the exhibition's timeline gallery
// spec's; the words are the exhibition's own entries.
const { t } = useI18n()
const ERA_WORDS = { 'catalogue.era.ad': 'exhibition.era.ad', 'catalogue.era.bc': 'exhibition.era.bc' }

const spec = computed(() => ({
  ...timelineGallerySpec,
  ...legacyPaging,
  summary: () => [],
  record: legacyTile,
}))

// A bound as the timeline's own lists name it.
function yearLabel(value) {
  const n = Number(value)
  if (value === '' || value == null || !Number.isFinite(n)) return ''
  const buckets = yearBucketsFromRange(n, n, withEraWords(t, ERA_WORDS))
  return buckets.find((b) => Number(b.value) === n)?.label ?? buckets[0]?.label ?? String(value)
}
const byCountry = computed(() => timelineSpec.value.scope === 'country')
</script>

<template>
  <div class="mwnf-dxa-exhibition-partner-objects mwnf-dxa-exhibition-timeline-gallery">
    <CatalogueResultsView :spec="spec" class="mwnf-dxa-partner-objects">
      <template #before="{ filters, pageInfo, goToPage }">
        <BackLink />
        <div class="mwnf-dxa-exhibition-partner-objects__header">
          <p>
            {{ t('exhibition.timeline.heading') }} | {{ yearLabel(filters.begin) }} {{ t('exhibition.timeline.to') }} {{ yearLabel(filters.end) }} |
            <template v-if="byCountry && filters.country">{{ countryLabelFromCode(filters.country) }} | </template>{{ t('exhibition.timeline.gallery') }}
          </p>
        </div>
        <Pages class="mwnf-dxa-exhibition-pages--top" :page-info="pageInfo" @navigate="goToPage" />
      </template>

      <template #records="{ rows, filters }">
        <div class="mwnf-dxa-exhibition-partner-objects__content">
          <div class="mwnf-dxa-exhibition-partner-objects__grid">
            <ObjectGrid v-if="rows.length" :rows="rows" family="exhibition" />
          </div>
          <div class="mwnf-dxa-exhibition-partner-objects__profile">
            <RouterLink :to="{ name: 'timeline-results', query: { ...(filters.country ? { country: filters.country } : {}), begin: filters.begin, end: filters.end } }">
              <span aria-hidden="true">➦</span> {{ t('exhibition.timeline.seeTimeline') }}
            </RouterLink>
          </div>
        </div>
      </template>

      <template #pagination></template>

      <template #after="{ pageInfo, goToPage }">
        <Pages v-if="pageInfo.lastPage > 1" :page-info="pageInfo" @navigate="goToPage" />
        <div v-else class="mwnf-dxa-exhibition-partner-objects__end"></div>
      </template>
    </CatalogueResultsView>
  </div>
</template>
