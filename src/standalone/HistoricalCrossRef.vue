<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import StandaloneWindow from './Window.vue'

// The standalone family's Historical Cross Referencing window, legacy's
// hcr.php ("Timeline for this item"), opened from an item sheet at 790 by
// 600: the window's band; under it the years, fourteen half-centuries
// around the period with the period's own marked; then, left, the country
// and the time range, whose change shows that country and century, and the
// item (its picture, name, date and dynasty, holder and place); right, the
// country and period in words over that country's events of the period.
// Which events, which lists and every word are the website's.
//
//   labels: { heading, close, country, range }
//   texts: a product's label set (`islamicart`): the labels are then its
//     `<texts>.tl.title`, `<texts>.hcr.*` and `record.glossary.close`, unless given
//   start, end: the period shown (the year scale reads them as legacy did)
//   countries / ranges: [{ value, label }]
//   item: { image, name, lines: [text] }   // name: rendered (HTML); lines: legacy's paragraph, '' for its blank line
//   events: [{ id, date, html }]
const props = defineProps({
  labels: { type: Object, default: null },
  texts: { type: String, default: '' },
  start: { type: Number, required: true },
  end: { type: Number, required: true },
  countries: { type: Array, default: () => [] },
  country: { type: String, default: '' },
  ranges: { type: Array, default: () => [] },
  range: { type: [String, Number], default: '' },
  item: { type: Object, default: null },
  heading: { type: String, default: '' },
  events: { type: Array, default: () => [] },
  dir: { type: String, default: '' },
})
const emit = defineEmits(['change'])

const t = props.texts ? useI18n().t : (key) => key
const words = computed(() => props.labels ?? {
  heading: t(`${props.texts}.tl.title`),
  close: t('record.glossary.close'),
  country: t(`${props.texts}.hcr.country`),
  range: t(`${props.texts}.hcr.range`),
})

// Legacy's scale: from two half-centuries before the period's, fourteen of
// them (at most up to 2000: from 1350), each in the period marked.
const years = computed(() => {
  let year = (Math.floor(props.start / 50) - 2) * 50
  if (year + 700 > 2050) year = 1350
  return Array.from({ length: 14 }, (_, i) => {
    const value = year + 50 * i
    return { value, active: value >= props.start && value < props.end }
  })
})
</script>

<template>
  <StandaloneWindow class="mwnf-standalone-hcr" :heading="words.heading" :close-label="words.close" :dir="dir">
    <template #before>
      <section class="mwnf-standalone-hcr__scale" aria-hidden="true">
        <div class="mwnf-standalone-hcr__years">
          <span v-for="year in years" :key="year.value" :class="{ 'mwnf-standalone-hcr__year--active': year.active }">{{ year.value }}</span>
        </div>
        <div class="mwnf-standalone-hcr__lines"></div>
      </section>
    </template>

    <div class="mwnf-standalone-hcr__body">
      <div class="mwnf-standalone-hcr__left">
        <p class="mwnf-standalone-hcr__title">{{ words.country }}</p>
        <select :value="country" :aria-label="words.country" @change="emit('change', { key: 'country', value: $event.target.value })">
          <option v-for="option in countries" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <p class="mwnf-standalone-hcr__title">{{ words.range }}</p>
        <select :value="String(range)" :aria-label="words.range" @change="emit('change', { key: 'start', value: $event.target.value })">
          <option v-for="option in ranges" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
        </select>
        <template v-if="item">
          <div v-if="item.image" class="mwnf-standalone-hcr__image"><img :src="item.image" :alt="item.name" /></div>
          <p v-if="item.name"><strong v-html="item.name"></strong></p>
          <p v-if="item.lines?.length">
            <template v-for="(line, index) in item.lines" :key="index">{{ line }}<br /></template>
          </p>
        </template>
      </div>
      <div class="mwnf-standalone-hcr__main">
        <h3>{{ heading }}</h3>
        <div v-for="event in events" :key="event.id" class="mwnf-standalone-hcr__event">
          <p><b>{{ event.date }}</b></p>
          <div class="mwnf-standalone-hcr__text" v-html="event.html"></div>
        </div>
      </div>
    </div>
  </StandaloneWindow>
</template>
