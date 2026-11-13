<script setup>
// Legacy's trail page (travel_et_trailDetail.php, `/trail/<id>`): the
// breadcrumbs, the trail's band, and one of its tabs (`?tab=`, legacy's
// `fl`): "View Itineraries" (`its`, the default) — each itinerary's picture,
// "Itinerary <n>: <title> >>", its main locations and "View Image Gallery
// >>" — "About this Exhibition Trail" (`desc`, the description) and
// "Curators and Photographers" (`cur`). Each tab's heading has "<< Back".
// Legacy's "Related Tours" tab is not rebuilt (the tours are out,
// inventory-app#2515); its "Starting point" line was commented out in
// legacy, and is not drawn.
import { computed } from 'vue'
import { renderBlock, useI18n } from '@museumwnf/viewer-core'
import Crumbs from './Crumbs.vue'
import { useTravels } from './data.js'
import { itineraryNumber, itineraryPicture, lines, TRAIL_TABS } from './rules.js'
import TrailHeader from './TrailHeader.vue'

const props = defineProps({
  id: { type: String, required: true },
  tab: { type: String, default: 'its' },
})
const { t } = useI18n()
const data = useTravels()

const trail = computed(() => data.collectionById.value.get(props.id) ?? null)
const text = computed(() => data.text(trail.value))
const current = computed(() => (TRAIL_TABS.includes(props.tab) ? props.tab : 'its'))

const tabs = computed(() => [
  { key: 'desc', label: t('travels.trail.about') },
  { key: 'its', label: t('travels.trail.itineraries'), tip: t('travels.trail.itinerariesTip') },
  { key: 'cur', label: t('travels.trail.curators') },
].map((tab) => ({ ...tab, active: tab.key === current.value, to: { name: 'trail', params: { id: props.id }, query: { tab: tab.key } } })))

const crumbs = computed(() => [
  { text: t('travels.nav.home'), to: { name: 'home' } },
  { text: t('travels.nav.exhibitionTrails'), to: { name: 'home' } },
  { text: data.countryName(trail.value?.country_id), to: { name: 'trails', query: { country: trail.value?.country_id } } },
  { text: text.value.title ?? '' },
])

const itineraries = computed(() => data.itineraries(trail.value).map((itinerary) => ({
  id: itinerary.id,
  number: itineraryNumber(itinerary),
  title: data.text(itinerary).title ?? '',
  picture: itineraryPicture(data.collections.value, itinerary, data.itemById.value),
  locations: data.locations(itinerary).map((location) => data.text(location).title).filter(Boolean),
})))

const html = (value) => (value ? renderBlock(String(value), { breaks: true }) : '')
function back() {
  if (typeof window !== 'undefined') window.history.back()
}
</script>

<template>
  <div class="mwnf-travels-trail">
    <p v-if="!trail" class="mwnf-travels__empty">{{ t('core.detail.notFound') }}</p>
    <template v-else>
      <div class="mwnf-travels-banner">
        <Crumbs :crumbs="crumbs" />
        <TrailHeader :trail="trail" :text="text" :tabs="tabs" />
      </div>
      <div class="mwnf-travels-content">
        <div class="mwnf-travels-content__head">
          <h2 v-if="current === 'desc'">{{ t('travels.trail.description') }}</h2>
          <h2 v-else-if="current === 'cur'">{{ t('travels.trail.curators') }}</h2>
          <h2 v-else>{{ t('travels.trail.itineraries') }}</h2>
          <a href="#" class="mwnf-travels-content__back" @click.prevent="back"><b>&lt;&lt; {{ t('travels.action.back') }}</b></a>
        </div>

        <div v-if="current === 'desc'" class="mwnf-travels-content__prose" v-html="html(text.description)"></div>

        <div v-else-if="current === 'cur'" class="mwnf-travels-content__prose">
          <strong>{{ t('travels.trail.curatedBy') }}</strong>
          <div v-for="(line, i) in lines(text.extra?.curated_by)" :key="`c${i}`">{{ line }}</div>
          <template v-if="lines(text.extra?.photo_by).length">
            <br>
            <strong>{{ t('travels.trail.photographers') }}</strong>
            <div v-for="(line, i) in lines(text.extra?.photo_by)" :key="`p${i}`">{{ line }}</div>
          </template>
        </div>

        <template v-else>
          <div v-for="itinerary in itineraries" :key="itinerary.id" class="mwnf-travels-itinerary-row">
            <div class="mwnf-travels-itinerary-row__picture">
              <img v-if="itinerary.picture" :src="itinerary.picture" :alt="itinerary.title" :title="t('travels.picture.enlarge')" loading="lazy">
            </div>
            <div class="mwnf-travels-itinerary-row__text">
              <b>{{ t('travels.itinerary.label') }}&nbsp;{{ itinerary.number }} :</b>
              <strong><RouterLink :to="{ name: 'itinerary', params: { id: itinerary.id }, query: { tab: 'des' } }">{{ itinerary.title }}&nbsp;&gt;&gt;</RouterLink></strong>
              <br>
              <template v-if="itinerary.locations.length">
                <b>{{ t('travels.trail.mainLocations') }}:</b> <strong>{{ itinerary.locations.join(', ') }}</strong>
                <br>
              </template>
              <strong><RouterLink :to="{ name: 'itinerary', params: { id: itinerary.id }, query: { tab: 'vl' } }">{{ t('travels.itinerary.gallery') }}&nbsp;&gt;&gt;</RouterLink></strong>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
