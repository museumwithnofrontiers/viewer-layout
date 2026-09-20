<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@museumwnf/viewer-core'
import RecordLanguages from '../../content/RecordLanguages.vue'
import MediaGallery from '../../content/MediaGallery.vue'
import PartnerMap from '../../content/PartnerMap.vue'
import BackLink from '../../content/BackLink.vue'
import RecordView from '../../views/RecordView.vue'
import { partnerObjectsRoute, labelOf, md, partnerSheet } from './data.js'

// The gallery partner profile (epic #1731, from carpets/amulets — byte-
// identical), on the platform's composed record view: the language, the
// loads, the glossary and the "not found" fallback are the view's, from
// `partnerSheet` (dxa/gallery/data.js). Legacy's own tab strip
// (About/Contact/Logo/homepage) is not a sheet of labelled fields, so it
// fills the `header` slot in place of the default title, and its panels
// fill `before-sheet`; the photo carousel and its lightbox are the layout's
// `MediaGallery`, the map its `PartnerMap`.
const props = defineProps({ id: { type: String, required: true } })

// Also handed down through the `header` slot, on every composed record view
// — bound here too so `npx viewer-i18n-check` can tell a bare `t(...)` in
// the template is the text lookup and not some other function of the same
// name, exactly as the item sheet's own RecordView page already does.
const { t } = useI18n()

const tab = ref('description')

const contacts = (record) => [record?.contact_person_1, record?.contact_person_2].filter(Boolean)
const hasContact = (record, text) =>
  Boolean(text.address || text.phone || text.email || text.website || contacts(record).length)

function website(text) {
  const url = text.website
  if (!url) return null
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}
</script>

<template>
  <RecordView :spec="partnerSheet" :id="props.id" class="mwnf-dxa-partner-profile">
    <template #header="{ record, text, languages, language, select, ready }">
      <div class="mwnf-dxa-profile-languages">
        <RecordLanguages :languages="languages" :language="language" @select="select" />
      </div>

      <BackLink />

      <div v-if="!ready" class="mwnf-loader">{{ t('core.status.loading') }}</div>
      <template v-else>
        <p class="mwnf-dxa-partner-name">{{ labelOf('partners', record.id) }}</p>
        <p class="mwnf-dxa-partner-location">
          <span v-if="text.city">{{ text.city }}, </span>{{ labelOf('countries', record.country_id) }}
        </p>

        <div class="mwnf-dxa-profile-links-container">
          <div class="mwnf-dxa-profile-links">
            <button :class="{ 'mwnf-dxa-profile-tab--active': tab === 'description' }" @click="tab = 'description'">{{ t('partner.info.about') }}</button>
            <template v-if="hasContact(record, text)">
              <span class="mwnf-dxa-profile-divider">|</span>
              <button :class="{ 'mwnf-dxa-profile-tab--active': tab === 'contact' }" @click="tab = 'contact'">{{ t('partner.info.contact') }}</button>
            </template>
            <template v-if="record.logos?.length">
              <span class="mwnf-dxa-profile-divider">|</span>
              <button :class="{ 'mwnf-dxa-profile-tab--active': tab === 'logo' }" @click="tab = 'logo'">{{ t('partner.info.logo') }}</button>
            </template>
            <template v-if="website(text)">
              <span class="mwnf-dxa-profile-divider">|</span>
              <a :href="website(text)" target="_blank" rel="noopener">↗ {{ t('partner.nav.homepage') }}</a>
            </template>
          </div>
          <div class="mwnf-dxa-profile-objects-link" v-if="record.item_count">
            <RouterLink class="mwnf-button" :to="partnerObjectsRoute(record)">{{ t('gallery.partner.viewObjects') }}</RouterLink>
          </div>
        </div>
      </template>
    </template>

    <template #before-sheet="{ record, text, language, ready }">
      <div v-if="ready" class="mwnf-dxa-profile-photo-wrapper">
        <MediaGallery
          v-if="record.images?.length"
          class="mwnf-dxa-profile-photo"
          :images="record.images.map((p) => ({
            url: p.url,
            alt: labelOf('partners', record.id),
            caption: p.captions?.[language] ?? p.captions?.en ?? '',
            photographer: p.photographer ?? '',
            copyright: p.copyright ?? '',
          }))"
        />

        <div class="mwnf-dxa-profile-info">
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
        </div>
      </div>
    </template>

    <template #after-sheet="{ record }">
      <!-- 2.10.0's `PartnerMap` names its own three entries by default
           (`partner.map.map`, `.mapOf`, `.openInOpenStreetMap`); this page
           does not override them. -->
      <PartnerMap
        :latitude="record.latitude"
        :longitude="record.longitude"
        :zoom="record.map_zoom"
        :label="labelOf('partners', record.id)"
      />
    </template>
  </RecordView>
</template>
