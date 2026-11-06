<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { I18nText } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import ObjectGrid from '../gallery/ObjectGrid.vue'
import Pages from './Pages.vue'
import {
  visiblePartnerById, partnerRoute, tr, defaultLang, labelOf, legacyPaging, legacyTile,
} from './data.js'

// The items one partner holds, as legacy's PartnerObjects
// (exhibitions-client, inventory-app#2379): Back; the partner's name at
// 20px and, in italics, "location, country" as its first record gives
// them; legacy's pager above and below; the exhibition's tile grid with,
// on its right, "➦ Partner Profile". Twenty a page in legacy's order. One
// component for a museum and an institution (legacy's
// InstitutionMonuments), which `variant` names; `texts` carries the
// family's entries for the empty page and the profile link.
const props = defineProps({
  variant: { type: String, default: 'partner' },
  texts: { type: Object, required: true },
})

const isInstitutionView = computed(() => props.variant === 'institution')

const route = useRoute()
const partner = computed(() => visiblePartnerById(route.params.id))

const spec = computed(() => ({
  entity: 'items',
  scope: (item) => item.partner_id === partner.value?.id,
  ...legacyPaging,
  summary: () => [],
  record: legacyTile,
}))

// Legacy's header read its first record: the holder's name, and that
// record's location and country.
function header(rows) {
  const first = rows[0]
  if (!first) return null
  const text = tr('items', first.id, defaultLang)
  return {
    name: labelOf('partners', partner.value?.id),
    place: [text.location, labelOf('countries', first.country_id)].filter(Boolean).join(', '),
  }
}
</script>

<template>
  <div v-if="partner" class="mwnf-dxa-exhibition-partner-objects">
    <CatalogueResultsView :spec="spec" class="mwnf-dxa-partner-objects">
      <template #before="{ matching, pageInfo, goToPage }">
        <BackLink />
        <div v-if="header(matching)" class="mwnf-dxa-exhibition-partner-objects__header">
          <p class="mwnf-dxa-exhibition-partner-objects__name">{{ header(matching).name }}</p>
          <p class="mwnf-dxa-exhibition-partner-objects__place">{{ header(matching).place }}</p>
        </div>
        <Pages class="mwnf-dxa-exhibition-pages--top" :page-info="pageInfo" @navigate="goToPage" />
      </template>

      <template #records="{ rows }">
        <div class="mwnf-dxa-exhibition-partner-objects__content">
          <div class="mwnf-dxa-exhibition-partner-objects__grid">
            <ObjectGrid v-if="rows.length" :rows="rows" family="exhibition" />
            <I18nText v-else :keypath="isInstitutionView ? texts.emptyInstitution : texts.emptyPartner" />
          </div>
          <div class="mwnf-dxa-exhibition-partner-objects__profile">
            <RouterLink :to="partnerRoute(partner)">
              <span aria-hidden="true">➦</span> {{ $t(isInstitutionView ? texts.institutionProfileLabel : texts.partnerProfileLabel) }}
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
