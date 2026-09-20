<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { NotFoundView, useI18n } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import PartnerMap from '../../content/PartnerMap.vue'
import RecordLanguages from '../../content/RecordLanguages.vue'
import RecordView from '../../views/RecordView.vue'
import { labelOf, md, partnerObjectsRoute, visiblePartnerById, partnerSheetSpec } from './data.js'

// Legacy has two page templates for the same record — PartnerProfile for a
// museum, InstitutionProfile for a monument's owning institution — because
// it has one endpoint each. A data package has neither, so this is one
// component (epic #1731, from colours/water-in-islam — byte-identical) and
// `variant` supplies the two entries that actually differ; `standardRoutes
// ('exhibition', config)` registers the `institution` route against this
// same component with `props: { variant: 'institution' }` — no separate
// file, as colours'/water-in-islam's own (now retired) `InstitutionProfile
// .vue` already reduced to.
//
// The record's language, its load, the media gallery and its lightbox are
// the composed `RecordView`'s (`partnerSheetSpec`, dxa/exhibition/data.js)
// — this page tracks none of that itself. What it owns is the
// Description/Contact/Logo tab strip, which is three different shapes
// (Markdown, an address block, a bare image) and so is built over `text`/
// `record` directly rather than forced through the sheet's rows.
const props = defineProps({
  variant: { type: String, default: 'partner' },
})

const { t } = useI18n()
const isInstitutionView = computed(() => props.variant === 'institution')
const homepageLabel = computed(() =>
  isInstitutionView.value ? t('exhibition.action.institutionHomepage') : t('partner.nav.homepage'),
)
const itemsLabel = computed(() =>
  isInstitutionView.value ? t('exhibition.action.viewItems') : t('exhibition.action.viewObjects'),
)

const route = useRoute()
const id = computed(() => String(route.params.id))

const tab = ref('description')

function hasContact(text, record) {
  return Boolean(
    text.address || text.phone || text.email || text.website
      || record.contact_person_1 || record.contact_person_2,
  )
}

function website(text) {
  const url = text.website
  if (!url) return null
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function contacts(record) {
  return [record.contact_person_1, record.contact_person_2].filter(Boolean)
}
</script>

<template>
  <RecordView v-if="visiblePartnerById(id)" :spec="partnerSheetSpec" :id="id" class="mwnf-dxa-partner-profile">
    <template #header="{ record, text, languages, language, select }">
      <div class="mwnf-dxa-profile-languages">
        <RecordLanguages :languages="languages" :language="language" @select="select" />
      </div>
      <BackLink />

      <div class="mwnf-dxa-profile-links-container">
        <div class="mwnf-dxa-profile-links">
          <button :class="{ 'mwnf-dxa-profile-tab--active': tab === 'description' }" @click="tab = 'description'">{{ $t('partner.info.about') }}</button>
          <template v-if="hasContact(text, record)">
            <span class="mwnf-dxa-profile-divider">|</span>
            <button :class="{ 'mwnf-dxa-profile-tab--active': tab === 'contact' }" @click="tab = 'contact'">{{ $t('partner.info.contact') }}</button>
          </template>
          <template v-if="record.logos?.length">
            <span class="mwnf-dxa-profile-divider">|</span>
            <button :class="{ 'mwnf-dxa-profile-tab--active': tab === 'logo' }" @click="tab = 'logo'">{{ $t('partner.info.logo') }}</button>
          </template>
          <template v-if="website(text)">
            <span class="mwnf-dxa-profile-divider">|</span>
            <a :href="website(text)" target="_blank" rel="noopener">{{ homepageLabel }}</a>
          </template>
        </div>
        <div class="mwnf-dxa-profile-objects-link" v-if="record.item_count">
          <RouterLink class="mwnf-button" :to="partnerObjectsRoute(record)">{{ itemsLabel }}</RouterLink>
        </div>
      </div>
    </template>

    <template #before-sheet="{ record, text }">
      <div class="mwnf-prose" v-if="tab === 'description'" v-html="md(text.description)"></div>

      <div v-else-if="tab === 'contact'">
        <p class="mwnf-dxa-contact-header">{{ $t('partner.info.addresses') }}</p>
        <div class="mwnf-prose" v-html="md(text.address)"></div>
        <p v-if="text.phone">{{ $t('partner.info.phone') }} {{ text.phone }}</p>
        <p v-if="text.email"><a :href="`mailto:${text.email}`">{{ text.email }}</a></p>
        <p v-if="website(text)"><a :href="website(text)" target="_blank" rel="noopener">{{ text.website }}</a></p>
        <div class="mwnf-dxa-contact-person" v-for="person in contacts(record)" :key="person.name ?? person.email">
          <p class="mwnf-dxa-contact-title" v-if="person.title">{{ person.title }}</p>
          <p v-if="person.name">{{ person.name }}</p>
          <p v-if="person.phone">{{ $t('partner.info.phone') }} {{ person.phone }}</p>
          <p v-if="person.fax">{{ $t('partner.info.fax') }} {{ person.fax }}</p>
          <p v-if="person.email"><a :href="`mailto:${person.email}`">{{ person.email }}</a></p>
        </div>
        <div class="mwnf-dxa-additional-urls" v-if="record.additional_urls?.length">
          <p v-for="entry in record.additional_urls" :key="entry.url">
            <a :href="entry.url" target="_blank" rel="noopener">{{ entry.url }}</a>
          </p>
        </div>
      </div>

      <div class="mwnf-dxa-partner-logos" v-else-if="tab === 'logo'">
        <img v-for="logo in record.logos" :key="logo.url" :src="logo.url" :alt="labelOf('partners', record.id)" />
      </div>

      <!-- No entry props passed: PartnerMap's label for the OpenStreetMap
           link defaults to partner.map.openInOpenStreetMap since
           viewer-layout 2.10.0. -->
      <PartnerMap
        :latitude="record.latitude"
        :longitude="record.longitude"
        :zoom="record.map_zoom"
        :label="labelOf('partners', record.id)"
      />
    </template>
  </RecordView>
  <NotFoundView v-else />
</template>
