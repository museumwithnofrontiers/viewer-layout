<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import Pagination from '../../content/Pagination.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import BackLink from '../../content/BackLink.vue'
import { partnerById, partnerRoute, labelOf, tr, defaultLang, partnerObjects } from './data.js'

// The member items one partner holds (epic #1731, from carpets/amulets —
// byte-identical), on the platform's composed results view: the join, the
// sort and the pages are the view's, from `partnerObjects`
// (dxa/gallery/data.js), `scope` added here over the route's own id —
// `CatalogueResultsView` takes no record id of its own, unlike `RecordView`.
const route = useRoute()
const partner = computed(() => partnerById.value.get(route.params.id) ?? null)
const spec = computed(() => ({
  ...partnerObjects,
  scope: (item) => item.partner_id === route.params.id,
}))

const city = computed(() => (partner.value ? tr('partners', partner.value.id, defaultLang).city ?? '' : ''))
</script>

<template>
  <div class="mwnf-dxa-partner-objects" v-if="partner">
    <CatalogueResultsView :spec="spec">
      <template #before>
        <BackLink />
        <div class="mwnf-dxa-partner-objects-header">
          <p class="mwnf-dxa-partner-name">{{ labelOf('partners', partner.id) }}</p>
          <p class="mwnf-dxa-partner-location">{{ [city, labelOf('countries', partner.country_id)].filter(Boolean).join(', ') }}</p>
        </div>
      </template>

      <template #actions="{ pageInfo, goToPage }">
        <Pagination class="mwnf-dxa-pages" :page-info="pageInfo" jump @navigate="goToPage" />
      </template>

      <template #after>
        <div class="mwnf-dxa-profile-link-container">
          <RouterLink class="mwnf-dxa-profile-link" :to="partnerRoute(partner)">➤ {{ $t('gallery.action.partnerProfile') }}</RouterLink>
        </div>
      </template>
    </CatalogueResultsView>
  </div>
</template>
