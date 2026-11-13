<script setup>
// Legacy's itinerary page (travel_et_itenary.php, `/itinerary/<id>`): the
// breadcrumbs, the trail's band with "ITINERARY <n>: <title>", the
// "Previous Itinerary | Next Itinerary" links, and one of its tabs (`?tab=`,
// legacy's `fl`): "About this Itinerary" (`des`, the default: the
// description) or "View Image Gallery" (`vl`: the picture, its caption, and
// every picture of the itinerary's locations and monuments as thumbnails —
// hovering one shows it, as legacy's showImage() did). Legacy's other tabs
// (Related Tours, and the "AVAILABLE SOON" events, walks, accommodation,
// food and contacts) belong to the tours, which are not rebuilt.
import { computed, ref, watch } from 'vue'
import { renderBlock, useI18n } from '@museumwnf/viewer-core'
import Crumbs from './Crumbs.vue'
import { useTravels } from './data.js'
import { galleryOf, ITINERARY_TABS, itineraryNumber, neighbours } from './rules.js'
import TrailHeader from './TrailHeader.vue'

const props = defineProps({
  id: { type: String, required: true },
  tab: { type: String, default: 'des' },
})
const { t, locale } = useI18n()
const data = useTravels()

const itinerary = computed(() => data.collectionById.value.get(props.id) ?? null)
const trail = computed(() => (itinerary.value ? data.collectionById.value.get(itinerary.value.parent_id) ?? null : null))
const trailText = computed(() => data.text(trail.value))
const own = computed(() => data.text(itinerary.value))
const current = computed(() => (ITINERARY_TABS.includes(props.tab) ? props.tab : 'des'))
const heading = computed(() => ({ number: itineraryNumber(itinerary.value), title: own.value.title ?? '' }))

const tabs = computed(() => [
  { key: 'des', label: t('travels.itinerary.about') },
  { key: 'vl', label: t('travels.itinerary.gallery'), tip: t('travels.itinerary.galleryTip') },
].map((tab) => ({ ...tab, active: tab.key === current.value, to: { name: 'itinerary', params: { id: props.id }, query: { tab: tab.key } } })))

const crumbs = computed(() => [
  { text: t('travels.nav.home'), to: { name: 'home' } },
  { text: t('travels.nav.exhibitionTrails'), to: { name: 'home' } },
  { text: data.countryName(trail.value?.country_id), to: { name: 'trails', query: { country: trail.value?.country_id } } },
  { text: trailText.value.title ?? '', to: { name: 'trail', params: { id: trail.value?.id ?? '' }, query: { tab: 'its' } } },
  { text: `${t('travels.itinerary.label')} ${heading.value.number}` },
])

const around = computed(() => neighbours(data.itineraries(trail.value), props.id))
const link = (row) => (row ? { name: 'itinerary', params: { id: row.id }, query: { tab: current.value } } : null)

const captionOf = (image) => image?.captions?.[locale.value] ?? image?.captions?.en ?? image?.alt_text ?? ''
const pictures = computed(() => galleryOf(data.collections.value, itinerary.value, data.itemById.value, captionOf))
const shown = ref(0)
watch(() => props.id, () => { shown.value = 0 })
const picture = computed(() => pictures.value[shown.value] ?? pictures.value[0] ?? null)

const html = (value) => (value ? renderBlock(String(value), { breaks: true }) : '')
</script>

<template>
  <div class="mwnf-travels-itinerary">
    <p v-if="!itinerary || !trail" class="mwnf-travels__empty">{{ t('core.detail.notFound') }}</p>
    <template v-else>
      <div class="mwnf-travels-banner">
        <Crumbs :crumbs="crumbs" />
        <TrailHeader :trail="trail" :text="trailText" :itinerary="heading" :tabs="tabs" />
      </div>
      <div class="mwnf-travels-content">
        <div class="mwnf-travels-content__neighbours">
          <b v-if="around.previous"><RouterLink :to="link(around.previous)">&lt;&lt;&nbsp;{{ t('travels.itinerary.previous') }}</RouterLink></b>
          <template v-if="around.previous && around.next">&nbsp;|&nbsp;</template>
          <b v-if="around.next"><RouterLink :to="link(around.next)">{{ t('travels.itinerary.next') }}&nbsp;&gt;&gt;</RouterLink></b>
        </div>

        <template v-if="current === 'vl'">
          <h2>{{ t('travels.itinerary.galleryHeading') }}</h2>
          <div class="mwnf-travels-gallery">
            <div class="mwnf-travels-gallery__main">
              <a v-if="picture" :href="picture.url" target="_blank" rel="noopener" :title="t('travels.picture.enlarge')">
                <img :src="picture.url" :alt="picture.caption" class="mwnf-travels-gallery__picture">
              </a>
              <div v-if="picture?.caption" class="mwnf-travels-gallery__caption"><strong>{{ picture.caption }}</strong></div>
            </div>
            <div class="mwnf-travels-gallery__thumbs">
              <button
                v-for="(row, i) in pictures"
                :key="`${row.url}-${i}`"
                type="button"
                class="mwnf-travels-gallery__thumb"
                :class="{ 'mwnf-travels-gallery__thumb--current': i === shown }"
                :aria-label="row.caption || t('travels.picture.enlarge')"
                @mouseover="shown = i"
                @focus="shown = i"
                @click="shown = i"
              ><img :src="row.url" alt="" loading="lazy"></button>
            </div>
          </div>
        </template>

        <template v-else>
          <h2>{{ t('travels.trail.description') }}</h2>
          <div class="mwnf-travels-content__prose" v-html="html(own.description)"></div>
        </template>
      </div>
    </template>
  </div>
</template>
