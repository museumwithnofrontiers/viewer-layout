<script setup>
import { reactive } from 'vue'

// The standalone family's Timeline entrance, legacy's hcr_home.php: in the
// middle third of the page, the country list ("Select a Country", then "All
// countries", then the countries), the start and end dates side by side,
// and Go. Go checks what legacy's frmSubmit1() checked and says it as
// legacy did, in its alert; otherwise it emits what was chosen, `none` for
// a list left on its first entry, and the website writes its query.
//
//   labels: { selectCountry, allCountries, startDate, endDate, go }
//   alerts: { country, countryOrDates, startDate, endDate, period }   // legacy's own messages
//   countries / starts / ends: [{ value, label }]
const props = defineProps({
  labels: { type: Object, required: true },
  alerts: { type: Object, default: () => ({}) },
  countries: { type: Array, default: () => [] },
  starts: { type: Array, default: () => [] },
  ends: { type: Array, default: () => [] },
})
const emit = defineEmits(['search'])

const form = reactive({ country: 'none', start: 'none', end: 'none' })

// Legacy's frmSubmit1(): a country, or all countries and both dates in order.
function problem() {
  if (form.country === 'none') return props.alerts.country
  if (form.country !== '') return ''
  if (form.start === 'none' && form.end === 'none') return props.alerts.countryOrDates
  if (form.start === 'none') return props.alerts.startDate
  if (form.end === 'none') return props.alerts.endDate
  if (Number(form.start) > Number(form.end)) return props.alerts.period
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
      <select v-model="form.country" :aria-label="labels.selectCountry">
        <option value="none">{{ labels.selectCountry }}</option>
        <option value="">{{ labels.allCountries }}</option>
        <option v-for="country in countries" :key="country.value" :value="country.value">{{ country.label }}</option>
      </select>
    </p>
    <p class="mwnf-standalone-tle__date">
      <select v-model="form.start" :aria-label="labels.startDate">
        <option value="none">{{ labels.startDate }}</option>
        <option v-for="option in starts" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    </p>
    <p class="mwnf-standalone-tle__date">
      <select v-model="form.end" :aria-label="labels.endDate">
        <option value="none">{{ labels.endDate }}</option>
        <option v-for="option in ends" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    </p>
    <p class="mwnf-standalone-tle__go"><button type="submit">{{ labels.go }}</button></p>
  </form>
</template>
