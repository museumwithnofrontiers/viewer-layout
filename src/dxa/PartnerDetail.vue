<script setup>
import { computed } from 'vue'
import { NotFoundView, useI18n } from '@museumwnf/viewer-core'
import BackLink from '../content/BackLink.vue'
import PartnerMap from '../content/PartnerMap.vue'
import PartnerPanel from '../content/PartnerPanel.vue'
import RecordLanguages from '../content/RecordLanguages.vue'
import SmartLink from '../content/SmartLink.vue'
import RecordView from '../views/RecordView.vue'

// The partner page of both DXA families — one page (decision D4,
// inventory-app#2034) where the gallery and the exhibition each had their
// own `PartnerProfile`. The legacy's separate InstitutionProfile existed
// only because its API read museums and institutions from two tables; here
// the `institution` route renders this same page with `variant:
// 'institution'`, which only changes two labels.
//
// `RecordView` carries the record's language, its load and the not-found
// case; the page's body is `PartnerPanel`'s `full` variant (tabs, D2): the
// name and location, About · Contact · Logo · homepage, the pictures, the
// map. What differs by family arrives in `family` — each family's
// `partnerDetail` (dxa/<family>/data.js), handed over by `standardRoutes`:
//
//   { spec,                       the RecordView spec (no media: the
//                                 pictures are the panel's)
//     visible(id),                false for a partner with no page (the
//                                 exhibitions' hidden rule)
//     view(partner, text),        viewer-core's partnerView() with the
//                                 family's routes, over its English text
//     labels: { partner, institution? }  → { objects, homepage } entries
//     className,                  the family's own class on the page
//     media,                      the pictures' strip (PartnerPanel's `media`)
//     legacyMap: { label },       legacy's map instead of the panel's: under
//                                 its label (an entry name), Google's, the
//                                 page's whole width, as the exhibitions
//                                 drew it }

const props = defineProps({
  id: { type: String, required: true },
  family: { type: Object, required: true },
  variant: { type: String, default: 'partner' },
})

// Bound here as well as handed down by the slots, so `viewer-i18n-check`
// reads a bare `t(...)` below as the text lookup.
const { t } = useI18n()

const labels = computed(() => props.family.labels?.[props.variant] ?? props.family.labels?.partner ?? {})
</script>

<template>
  <RecordView v-if="family.visible(id)" :spec="family.spec" :id="id" class="mwnf-dxa-partner-profile" :class="family.className">
    <template #header="{ languages, language, select }">
      <div class="mwnf-dxa-profile-languages">
        <RecordLanguages :languages="languages" :language="language" :from="family.legacyMap ? 1 : 2" @select="select" />
      </div>
      <BackLink />
    </template>

    <!-- Drawn as soon as the record is: the family's view reads the English
         the family loads up front under the record's own language, so the
         name and location show at once and switch when that language
         arrives, as the family's pages always did. -->
    <template #before-sheet="{ record, text, dir }">
      <PartnerPanel
        variant="full"
        :partner="family.view(record, text)"
        :heading="1"
        :homepage-label="labels.homepage ?? 'partner.nav.homepage'"
        :media="family.media ?? {}"
        :show="family.legacyMap ? { map: false } : {}"
        :dir="dir"
      >
        <template #actions="{ partner }">
          <SmartLink v-if="partner.objectsRoute" class="mwnf-button" :to="partner.objectsRoute">
            {{ t(labels.objects ?? 'partner.action.viewObjects') }}
          </SmartLink>
        </template>
        <template v-if="family.legacyMap" #after="{ partner }">
          <template v-if="partner.map">
            <p class="mwnf-dxa-profile-map-label">{{ t(family.legacyMap.label) }}</p>
            <PartnerMap
              class="mwnf-dxa-profile-map"
              provider="google"
              :latitude="partner.map.latitude"
              :longitude="partner.map.longitude"
              :zoom="partner.map.zoom"
              :label="partner.map.label"
            />
          </template>
          <p v-else class="mwnf-dxa-profile-no-map"></p>
        </template>
      </PartnerPanel>
    </template>
  </RecordView>
  <NotFoundView v-else />
</template>
