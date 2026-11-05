<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import Pagination from '../../content/Pagination.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import BackLink from '../../content/BackLink.vue'
import ObjectGrid from './ObjectGrid.vue'
import { legacyPaging, partnerById, partnerDetail, partnerRoute, tr, defaultLang, partnerObjects } from './data.js'

// The member items one partner holds, as legacy's PartnerObjects.vue
// (inventory-app#2423): Back, the partner's name and, in italics, where it
// is; legacy's tile grid (ObjectGrid.vue) beside the way to the partner's
// page; the pages above and below the grid only when there is more than
// one. The join, the sort and the pages are the composed view's, from
// `partnerObjects` (dxa/gallery/data.js), `scope` added here over the
// route's own id.
const route = useRoute()
const partner = computed(() => partnerById.value.get(route.params.id) ?? null)
const spec = computed(() => ({
  ...partnerObjects,
  ...legacyPaging,
  scope: (item) => item.partner_id === route.params.id,
}))

const view = computed(() => (partner.value ? partnerDetail.view(partner.value, tr('partners', partner.value.id, defaultLang)) : null))
const place = computed(() => [view.value?.city, view.value?.country].filter(Boolean).join(', '))
</script>

<template>
  <div v-if="partner" class="mwnf-dxa-partner-objects mwnf-dxa-gallery-objects">
    <CatalogueResultsView :spec="spec">
      <template #before>
        <BackLink />
        <div class="mwnf-dxa-gallery-objects__header">
          <p class="mwnf-dxa-gallery-objects__name" v-html="view.name"></p>
          <p v-if="place" class="mwnf-dxa-gallery-objects__place">{{ place }}</p>
        </div>
      </template>

      <template #actions="{ pageInfo, goToPage }">
        <Pagination v-if="pageInfo.lastPage > 1" class="mwnf-dxa-pages" :page-info="pageInfo" jump @navigate="goToPage" />
      </template>

      <template #records="{ rows }">
        <ObjectGrid :rows="rows" />
      </template>

      <template #pagination="{ pageInfo, goToPage }">
        <Pagination v-if="pageInfo.lastPage > 1" class="mwnf-dxa-pages" :page-info="pageInfo" jump @navigate="goToPage" />
        <div v-else class="mwnf-dxa-gallery-objects__end"></div>
      </template>

      <template #aside>
        <RouterLink class="mwnf-dxa-gallery-objects__profile" :to="partnerRoute(partner)"><span class="mwnf-dxa-gallery-objects__profile-arrow" aria-hidden="true">➦</span>{{ $t('partner.action.partnerProfile') }}</RouterLink>
      </template>
    </CatalogueResultsView>
  </div>
</template>
