<script setup>
// The band over a trail's and an itinerary's pages (`exDetailsmenuListing`,
// `exDetails`, `seeAlsoCurver`): the trail's title, subtitle and region, on
// an itinerary's page "ITINERARY <n>: <its title>"; the trail's book — its
// cover, a link to the book's page on the Publications site in the page's
// language — under "Relevant MWNF Travel Book"; then "See Also" and the
// page's tabs. `tabs`: [{ key, label, tip, to, active }].
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import { bookLink } from './rules.js'

const props = defineProps({
  trail: { type: Object, required: true },
  text: { type: Object, default: () => ({}) },
  itinerary: { type: Object, default: null },
  tabs: { type: Array, default: () => [] },
})
const { t, locale } = useI18n()

const href = computed(() => bookLink(props.trail, locale.value))
const cover = computed(() => props.trail.images?.[0]?.url ?? null)
</script>

<template>
  <div class="mwnf-travels-detail-band">
    <div class="mwnf-travels-detail-band__texts">
      <div v-if="text.title" class="mwnf-travels-detail-band__line"><strong>{{ text.title }}</strong></div>
      <div v-if="text.extra?.subtitle" class="mwnf-travels-detail-band__line"><strong>{{ text.extra.subtitle }}</strong></div>
      <div v-if="text.extra?.region_territory" class="mwnf-travels-detail-band__line"><b>{{ t('travels.trail.region') }}:</b>&nbsp;<strong>{{ text.extra.region_territory }}</strong></div>
      <div v-if="itinerary" class="mwnf-travels-detail-band__line mwnf-travels-detail-band__itinerary">
        {{ t('travels.itinerary.label').toUpperCase() }}&nbsp;{{ itinerary.number }}:&nbsp;{{ itinerary.title }}
      </div>
    </div>
    <div class="mwnf-travels-detail-band__book">
      <template v-if="cover">
        <a v-if="href" :href="href" target="_blank" rel="noopener"><img :src="cover" alt=""></a>
        <img v-else :src="cover" alt="">
      </template>
      <span class="mwnf-travels-detail-band__book-label">{{ t('travels.trail.travelBook') }}</span>
    </div>
  </div>
  <div class="mwnf-travels-see-also">
    <div class="mwnf-travels-see-also__heading">{{ t('travels.trail.seeAlso') }}</div>
    <div class="mwnf-travels-see-also__tabs">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="mwnf-travels-see-also__tab"
        :class="{ 'mwnf-travels-see-also__tab--active': tab.active }"
      >
        <RouterLink :to="tab.to" :title="tab.tip || undefined" :aria-current="tab.active ? 'page' : undefined">{{ tab.label }}</RouterLink>
      </div>
    </div>
  </div>
</template>
