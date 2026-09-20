<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import BackLink from '../../content/BackLink.vue'
import Pagination from '../../content/Pagination.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import {
  visiblePartnerById, partnerRoute, labelOf, tr, defaultLang, PAGE_SIZE, tile,
} from './data.js'

// The member items one partner holds (epic #1731, from colours/water-in-
// islam — byte-identical modulo the site-namespaced entry names below).
// Legacy split this into PartnerObjects and InstitutionMonuments, one per
// endpoint; here it is one component and `variant` supplies the count
// line's wording — `standardRoutes('exhibition', config)` registers the
// `institution-monuments` route against this same component with
// `props: { variant: 'institution' }`. The partner is a route param, not a
// filter the URL carries, so the spec is built per-route rather than kept
// as a static export like `collectionResults`.
//
// `texts` carries the five entry names this family's `PartnerObjects.vue`
// never shared across sites (colours' own were `colours.partnerObjects.
// emptyPartner`/`.emptyInstitution`, `colours.partner.monumentsInExhibition`,
// `colours.partnerObjects.partnerProfile`/`.institutionProfile`) — every
// other text here stays a literal shared entry. The partner-variant summary
// count reads the shared `partner.item.objectsInSite`, unaffected by `texts`.
const props = defineProps({
  variant: { type: String, default: 'partner' },
  texts: { type: Object, required: true },
})

const isInstitutionView = computed(() => props.variant === 'institution')

const route = useRoute()
const partner = computed(() => visiblePartnerById(route.params.id))

const city = computed(() => (partner.value ? tr('partners', partner.value.id, defaultLang).city ?? '' : ''))

const objectsSpec = computed(() => ({
  entity: 'items',
  scope: (item) => item.partner_id === partner.value?.id,
  sort: { undated: 'first' },
  pageSize: PAGE_SIZE,
  variant: 'grid',
  recordRoute: 'item',
  actionLabel: 'exhibition.action.seeDatabaseEntry',
  empty: isInstitutionView.value ? props.texts.emptyInstitution : props.texts.emptyPartner,
  record: (item, { t }) => tile(item, t),
  summary: ({ pageInfo, t }) => [
    { count: pageInfo.total, value: t(isInstitutionView.value ? props.texts.institutionSummary : 'partner.item.objectsInSite') },
  ],
}))
</script>

<template>
  <CatalogueResultsView v-if="partner" :spec="objectsSpec" class="mwnf-dxa-partner-objects">
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
        <RouterLink class="mwnf-dxa-profile-link" :to="partnerRoute(partner)">
          ➤ {{ isInstitutionView ? $t(props.texts.institutionProfileLabel) : $t(props.texts.partnerProfileLabel) }}
        </RouterLink>
      </div>
    </template>
  </CatalogueResultsView>
</template>
