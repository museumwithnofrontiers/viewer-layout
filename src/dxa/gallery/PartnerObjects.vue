<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import Pagination from '../../content/Pagination.vue'
import PartnerPanel from '../../content/PartnerPanel.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import BackLink from '../../content/BackLink.vue'
import { partnerById, partnerDetail, partnerRoute, tr, defaultLang, partnerObjects } from './data.js'

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

// The page's head is the partner's `summary` (inventory-app#2034): the name,
// linked to its page, and "city, country".
const view = computed(() => (partner.value ? partnerDetail.view(partner.value, tr('partners', partner.value.id, defaultLang)) : null))
</script>

<template>
  <div class="mwnf-dxa-partner-objects" v-if="partner">
    <CatalogueResultsView :spec="spec">
      <template #before>
        <BackLink />
        <PartnerPanel class="mwnf-dxa-partner-objects-header" variant="summary" :heading="1" :partner="view" />
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
