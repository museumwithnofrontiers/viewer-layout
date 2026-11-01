<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import RecordView from '../views/RecordView.vue'
import MediaGallery from '../content/MediaGallery.vue'
import PartnerMap from '../content/PartnerMap.vue'
import RecordLanguages from '../content/RecordLanguages.vue'
import SmartLink from '../content/SmartLink.vue'

// The standalone family's partner profile, legacy's `pm_partner.php`, which
// Discover Islamic Art, Discover Baroque Art and Sharing History share: the
// record's languages on the band; the ways back; the name over "city,
// country" in italics; the About | Contact | Logo | homepage pill beside the
// pill to the partner's items; the pictures beside the open tab; then, for a
// museum with coordinates, the map across the page under its heading. It is
// `RecordView` with an empty sheet, so the record's language, its load and
// the not-found case stay the platform's.
//
//   view:   (record, text) => viewer-core's `partnerView` view-model
//   back:   [{ label: entry, to | href, history: true }], or (record) => that list
//   items:  (record) => { label: entry, to } | null   // "View Objects" / "View Monuments"
//   map:    (record) => boolean                       // default: a museum
//   about:  (record, text) => boolean                 // whether the About tab is listed (default: always)
//   bands:  (record) => boolean                       // whether the band of the record's languages shows
//                                                     // (default: a museum; legacy offered an institution none)
//   labels: the product's words, as entry names: about, contact, logo,
//           homepage, addresses, phone, fax, map
//   links:  print the partner's further links after its homepage (legacy's
//           url2), where the product's legacy did
const props = defineProps({
  id: { type: String, required: true },
  view: { type: Function, required: true },
  back: { type: [Array, Function], default: () => [] },
  items: { type: Function, default: () => null },
  map: { type: Function, default: (record) => record?.type === 'museum' },
  about: { type: Function, default: () => true },
  bands: { type: Function, default: (record) => record?.type === 'museum' },
  labels: { type: Object, default: () => ({}) },
  links: { type: Boolean, default: false },
})

const { t, locale } = useI18n()
const uid = useId()

const spec = {
  entity: 'partners',
  fields: [],
  shortDescription: false,
  media: () => [],
  citation: false,
  related: false,
}

const LABELS = {
  about: 'partner.info.about',
  contact: 'partner.info.contact',
  logo: 'partner.info.logo',
  homepage: 'partner.nav.homepage',
  addresses: 'partner.info.addresses',
  phone: 'partner.info.phone',
  fax: 'partner.info.fax',
  map: 'partner.map.map',
}
const word = (key) => t(props.labels[key] ?? LABELS[key])

function backLinks(record) {
  const list = typeof props.back === 'function' ? props.back(record) ?? [] : props.back
  return list.map((link) => ({ ...link, label: t(link.label) }))
}

function goBack() {
  window.history.back()
}

// Legacy's tabs: About unless the product says otherwise, Contact when the
// partner has any contact, Logo when it has a logo; the homepage closes the
// pill. Legacy opened About whether or not it was listed.
function tabsOf(view, record, text) {
  const list = []
  if (props.about(record, text)) list.push('about')
  if (view.hasContact) list.push('contact')
  if (view.logos.length) list.push('logo')
  return list
}

const active = ref('about')
watch(() => props.id, () => { active.value = 'about' })

function onKey(event, tabs) {
  const at = tabs.indexOf(active.value)
  const next = { ArrowRight: (at + 1) % tabs.length, ArrowLeft: (at - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key]
  if (next === undefined || !tabs.length) return
  event.preventDefault()
  active.value = tabs[next]
  nextTick(() => document.getElementById(`${uid}-tab-${tabs[next]}`)?.focus())
}

// The pictures as legacy's slider showed them: the picture and its thumbs,
// no caption under them (legacy's caption was the picture's alt text).
const pictures = (view) => view.pictures.map((picture) => ({ url: picture.url, alt: picture.alt }))
const links = (view) => [
  ...(view.contact.website ? [view.contact.website] : []),
  ...(props.links ? view.contact.links : []),
]
const hasAddressBlock = (view) =>
  Boolean(view.contact.address || view.contact.phone || view.contact.fax || view.contact.email || view.contact.website)

const mapLanguage = computed(() => String(locale.value || 'en'))
</script>

<template>
  <RecordView :spec="spec" :id="id" class="mwnf-standalone-partner">
    <template #header="{ record, languages, language, select }">
      <div v-if="bands(record)" class="mwnf-standalone-item__top">
        <RecordLanguages :languages="languages" :language="language" @select="select" />
      </div>
      <!-- An empty slot would draw RecordView's own header (the way back, the languages, the title). -->
      <div v-else hidden></div>
    </template>

    <template #before-sheet="{ record, text, dir }">
      <template v-for="view in [props.view(record, text)]" :key="record.id">
        <p v-if="backLinks(record).length" class="mwnf-standalone-item__back mwnf-standalone-partner__back">
          <template v-for="link in backLinks(record)" :key="link.label">
            <button v-if="link.history" type="button" class="mwnf-standalone-item__back-link" @click="goBack">{{ link.label }}</button>
            <SmartLink v-else class="mwnf-standalone-item__back-link" :to="link.to" :href="link.href">{{ link.label }}</SmartLink>
          </template>
        </p>

        <div class="mwnf-standalone-partner__heading">
          <h3 class="mwnf-standalone-partner__name" :dir="dir || undefined" v-html="view.name"></h3>
          <h4 v-if="view.location" class="mwnf-standalone-partner__location"><i>{{ view.location }}</i></h4>
        </div>

        <div class="mwnf-standalone-partner__bar">
          <div class="mwnf-standalone-partner__bar-start">
            <ul role="tablist" class="mwnf-standalone-partner__tabs" :aria-label="view.plainName" @keydown="onKey($event, tabsOf(view, record, text))">
              <li v-for="(tab, index) in tabsOf(view, record, text)" :key="tab" role="presentation">
                <button
                  :id="`${uid}-tab-${tab}`"
                  type="button"
                  role="tab"
                  class="mwnf-standalone-partner__tab"
                  :class="{ 'mwnf-standalone-partner__tab--active': active === tab }"
                  :aria-selected="active === tab ? 'true' : 'false'"
                  :aria-controls="`${uid}-panel-${tab}`"
                  :tabindex="active === tab ? 0 : -1"
                  @click="active = tab"
                >&nbsp;{{ word(tab) }}</button><span v-if="index < tabsOf(view, record, text).length - 1 || view.contact.website" class="mwnf-standalone-partner__divider" aria-hidden="true">&nbsp;|</span>
              </li>
              <li v-if="view.contact.website">
                <a class="mwnf-standalone-partner__homepage" :href="view.contact.website.url" target="_blank" rel="noopener">&nbsp;{{ word('homepage') }}</a>
              </li>
            </ul>
          </div>
          <div class="mwnf-standalone-partner__bar-end">
            <SmartLink v-if="items(record)" class="mwnf-standalone-partner__items" :to="items(record).to">{{ t(items(record).label) }}</SmartLink>
          </div>
        </div>

        <div class="mwnf-standalone-partner__body">
          <div class="mwnf-standalone-partner__pictures">
            <MediaGallery v-if="view.pictures.length" :images="pictures(view)" />
          </div>
          <div class="mwnf-standalone-partner__panels">
            <div
              v-show="active === 'about'"
              :id="`${uid}-panel-about`"
              class="mwnf-standalone-partner__panel mwnf-standalone-partner__about"
              role="tabpanel"
              :aria-labelledby="`${uid}-tab-about`"
              :dir="dir || undefined"
              v-html="view.description"
            ></div>
            <div
              v-if="view.hasContact"
              v-show="active === 'contact'"
              :id="`${uid}-panel-contact`"
              class="mwnf-standalone-partner__panel mwnf-standalone-partner__contact"
              role="tabpanel"
              :aria-labelledby="`${uid}-tab-contact`"
            >
              <template v-if="hasAddressBlock(view)">
                <p>
                  <b>{{ word('addresses') }}</b><br />
                  <template v-if="view.contact.address"><span class="mwnf-standalone-partner__address" v-html="view.contact.address"></span><br /></template>
                  <template v-if="view.contact.phone">{{ word('phone') }} {{ view.contact.phone }}<br /></template>
                  <template v-if="view.contact.fax">{{ word('fax') }} {{ view.contact.fax }}<br /></template>
                  <template v-if="view.contact.email"><a :href="`mailto:${view.contact.email}`">{{ view.contact.email }}</a><br /></template>
                </p>
                <p v-if="links(view).length">
                  <template v-for="(link, index) in links(view)" :key="link.url">
                    <template v-if="index">&nbsp;|&nbsp;</template><a :href="link.url" target="_blank" rel="noopener">{{ link.label }}</a>
                  </template>
                </p>
              </template>
              <p v-for="(person, index) in view.persons" :key="index">
                <template v-if="person.title"><strong>{{ person.title }}</strong><br /></template>
                <template v-if="person.name">{{ person.name }}<br /></template>
                <template v-if="person.phone">{{ word('phone') }} {{ person.phone }}<br /></template>
                <template v-if="person.fax">{{ word('fax') }} {{ person.fax }}<br /></template>
                <template v-if="person.email"><a :href="`mailto:${person.email}`">{{ person.email }}</a><br /></template>
              </p>
            </div>
            <div
              v-if="view.logos.length"
              v-show="active === 'logo'"
              :id="`${uid}-panel-logo`"
              class="mwnf-standalone-partner__panel mwnf-standalone-partner__logos"
              role="tabpanel"
              :aria-labelledby="`${uid}-tab-logo`"
            >
              <img v-for="logo in view.logos" :key="logo.url" :src="logo.url" alt="" />
            </div>
          </div>
        </div>
      </template>
    </template>

    <template #after="{ record, text }">
      <section v-if="map(record) && props.view(record, text)?.map" class="mwnf-standalone-partner__map">
        <h3 class="mwnf-standalone-partner__map-heading">{{ word('map') }}</h3>
        <PartnerMap
          provider="google"
          :latitude="props.view(record, text).map.latitude"
          :longitude="props.view(record, text).map.longitude"
          :zoom="props.view(record, text).map.zoom"
          :label="props.view(record, text).map.label"
          :language="mapLanguage"
        />
      </section>
    </template>
  </RecordView>
</template>
