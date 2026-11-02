<script setup>
import { computed, reactive, useSlots } from 'vue'

// The standalone family's Database entrance, legacy's database.php: three
// keyword rows, each searched in a category, the second and third joined by
// "and"/"or"; the century range; the search language; Go; then the link to
// the portal's complete listing. Legacy's Bootstrap row (col-md-1, col-md-2
// for the joins and the labels, col-md-6 for the form, col-md-3) is laid out
// as a grid, mirrored right to left. What each word says, the fields, the
// years and the languages are the website's; Go emits what was entered and
// the website writes the query its results page reads.
//
//   labels: { criteria, keywords, category, in, and, or, date, from, to, language, go, listing, listingTooltip }
//   fields: [{ value, label }]       languages: [{ code, name }]
//   slots: `aside` (the last column's link, Islamic Art's Glossary & Spelling),
//          `options` (a row under the language, Islamic Art's Explore opt-in)
const props = defineProps({
  labels: { type: Object, required: true },
  fields: { type: Array, default: () => [] },
  fromYears: { type: Array, default: () => [] },
  toYears: { type: Array, default: () => [] },
  languages: { type: Array, default: () => [] },
  listingHref: { type: String, default: '' },
})
const language = defineModel('language', { type: String, default: '' })
const emit = defineEmits(['search'])
const slots = useSlots()

const rows = reactive([
  { keyword: '', field: props.fields[0]?.value ?? '', cond: 'AND' },
  { keyword: '', field: props.fields[0]?.value ?? '', cond: 'AND' },
  { keyword: '', field: props.fields[0]?.value ?? '', cond: 'AND' },
])
const dates = reactive({ from: '', to: '' })
const options = computed(() => Boolean(slots.options))

function go() {
  emit('search', {
    rows: rows.map((row) => ({ ...row, keyword: row.keyword.trim() })),
    from: dates.from,
    to: dates.to,
  })
}
</script>

<template>
  <form class="mwnf-standalone-db" :class="{ 'mwnf-standalone-db--options': options }" @submit.prevent="go">
    <h3 class="mwnf-standalone-db__criteria">{{ labels.criteria }}</h3>
    <p class="mwnf-standalone-db__head mwnf-standalone-db__head--keywords">{{ labels.keywords }}</p>
    <p class="mwnf-standalone-db__head mwnf-standalone-db__head--category">{{ labels.category }}</p>
    <p v-if="$slots.aside" class="mwnf-standalone-db__aside"><slot name="aside" /></p>

    <template v-for="(row, index) in rows" :key="index">
      <select
        v-if="index"
        v-model="row.cond"
        class="mwnf-standalone-db__cond"
        :class="`mwnf-standalone-db__row-${index + 1}`"
        :aria-label="`${labels.and} / ${labels.or}`"
      >
        <option value="AND">{{ labels.and }}</option>
        <option value="OR">{{ labels.or }}</option>
      </select>
      <input
        v-model="row.keyword"
        type="text"
        class="mwnf-standalone-db__keyword"
        :class="`mwnf-standalone-db__row-${index + 1}`"
        :aria-label="labels.keywords"
      />
      <label class="mwnf-standalone-db__field" :class="`mwnf-standalone-db__row-${index + 1}`">
        <span>{{ labels.in }}</span>
        <select v-model="row.field">
          <option v-for="field in fields" :key="field.value" :value="field.value">{{ field.label }}</option>
        </select>
      </label>
    </template>

    <span class="mwnf-standalone-db__label mwnf-standalone-db__label--date">{{ labels.date }}</span>
    <p class="mwnf-standalone-db__dates">
      <select v-model="dates.from" :aria-label="`${labels.date} ${labels.from}`">
        <option value="">{{ labels.from }}</option>
        <option v-for="year in fromYears" :key="year" :value="year">{{ year }}</option>
      </select>
      <select v-model="dates.to" :aria-label="`${labels.date} ${labels.to}`">
        <option value="">{{ labels.to }}</option>
        <option v-for="year in toYears" :key="year" :value="year">{{ year }}</option>
      </select>
    </p>

    <span class="mwnf-standalone-db__label mwnf-standalone-db__label--language">{{ labels.language }}</span>
    <p class="mwnf-standalone-db__language">
      <select v-model="language" :aria-label="labels.language">
        <option value=""></option>
        <option v-for="option in languages" :key="option.code" :value="option.code">{{ option.name }}</option>
      </select>
    </p>

    <p v-if="options" class="mwnf-standalone-db__options"><slot name="options" /></p>
    <p class="mwnf-standalone-db__go"><button type="submit">{{ labels.go }}</button></p>
    <p v-if="listingHref" class="mwnf-standalone-db__listing">
      <a :href="listingHref" :title="labels.listingTooltip">{{ labels.listing }}</a>
    </p>
  </form>
</template>
