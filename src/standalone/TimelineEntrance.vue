<script setup>
import { computed, reactive } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'

// The standalone family's Timeline entrance, legacy's hcr_home.php: in the
// middle third of the page, the country list ("Select a Country", then "All
// countries", then the countries), the start and end dates side by side,
// and Go. Go checks what legacy's frmSubmit1() checked and says it as
// legacy did, in its alert; otherwise it emits what was chosen, `none` for
// a list left on its first entry, and the website writes its query.
//
//   labels: { selectCountry, allCountries, startDate, endDate, go }
//   alerts: { country, countryOrDates, startDate, endDate, period }   // legacy's own messages
//   texts: a product's label set (`islamicart`): the labels and alerts are then
//     its `<texts>.tl.*` and `<texts>.db.go` entries, unless given
//   countries / starts / ends: [{ value, label }]
const props = defineProps({
  labels: { type: Object, default: null },
  texts: { type: String, default: '' },
  alerts: { type: Object, default: null },
  countries: { type: Array, default: () => [] },
  starts: { type: Array, default: () => [] },
  ends: { type: Array, default: () => [] },
})
const emit = defineEmits(['search'])

// Texts are read only for a product's label set: a page that passes its labels
// needs no text runtime.
const t = props.texts ? useI18n().t : (key) => key
const inSet = (key) => t(`${props.texts}.${key}`)
const words = computed(() => props.labels ?? {
  selectCountry: inSet('tl.selectCountry'),
  allCountries: inSet('tl.allCountries'),
  startDate: inSet('tl.startDate'),
  endDate: inSet('tl.endDate'),
  go: inSet('db.go'),
})
const warnings = computed(() => props.alerts ?? (props.texts ? {
  country: inSet('tl.alertCountry'),
  countryOrDates: inSet('tl.alertCountryOrDates'),
  startDate: inSet('tl.alertStartDate'),
  endDate: inSet('tl.alertEndDate'),
  period: inSet('tl.alertPeriod'),
} : {}))

const form = reactive({ country: 'none', start: 'none', end: 'none' })

// Legacy's frmSubmit1(): a country, or all countries and both dates in order.
function problem() {
  if (form.country === 'none') return warnings.value.country
  if (form.country !== '') return ''
  if (form.start === 'none' && form.end === 'none') return warnings.value.countryOrDates
  if (form.start === 'none') return warnings.value.startDate
  if (form.end === 'none') return warnings.value.endDate
  if (Number(form.start) > Number(form.end)) return warnings.value.period
  return ''
}

function go() {
  const message = problem()
  if (message) {
    window.alert(message)
    return
  }
  emit('search', { ...form })
}
</script>

<template>
  <form class="mwnf-standalone-tle" @submit.prevent="go">
    <p class="mwnf-standalone-tle__country">
      <select v-model="form.country" :aria-label="words.selectCountry">
        <option value="none">{{ words.selectCountry }}</option>
        <option value="">{{ words.allCountries }}</option>
        <option v-for="country in countries" :key="country.value" :value="country.value">{{ country.label }}</option>
      </select>
    </p>
    <p class="mwnf-standalone-tle__date">
      <select v-model="form.start" :aria-label="words.startDate">
        <option value="none">{{ words.startDate }}</option>
        <option v-for="option in starts" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    </p>
    <p class="mwnf-standalone-tle__date">
      <select v-model="form.end" :aria-label="words.endDate">
        <option value="none">{{ words.endDate }}</option>
        <option v-for="option in ends" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    </p>
    <p class="mwnf-standalone-tle__go"><button type="submit">{{ words.go }}</button></p>
  </form>
</template>
