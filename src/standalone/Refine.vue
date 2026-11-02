<script setup>
import { ref } from 'vue'
import SmartLink from '../content/SmartLink.vue'

// The standalone family's "Refine your search" band, legacy's
// `database_search` (database_results.php): across the page under the
// banner, the label, a keyword box, "in" and the field list, then Search,
// which searches within the results, and New Search, which goes back to the
// search form. A word is needed: legacy's sendForm() refused an empty box.
const props = defineProps({
  /** "Refine your search:" */
  label: { type: String, required: true },
  /** "in" */
  inLabel: { type: String, required: true },
  /** The field list: [{ value, label }]. */
  fields: { type: Array, required: true },
  searchLabel: { type: String, required: true },
  newSearchLabel: { type: String, required: true },
  /** Where New Search leads (a route location or an address). */
  newSearch: { type: [String, Object], required: true },
})
const emit = defineEmits(['search'])

const keyword = ref('')
const field = ref(props.fields[0]?.value ?? '')

function search() {
  const word = keyword.value.trim()
  if (word) emit('search', { keyword: word, field: field.value })
}
</script>

<template>
  <form class="mwnf-standalone-refine" @submit.prevent="search">
    <div class="mwnf-standalone-refine__row">
      <label class="mwnf-standalone-refine__label" for="mwnf-standalone-refine-keyword">{{ label }}</label>
      <input id="mwnf-standalone-refine-keyword" v-model="keyword" type="text" size="40">
      <label class="mwnf-standalone-refine__label" for="mwnf-standalone-refine-field">{{ inLabel }}</label>
      <select id="mwnf-standalone-refine-field" v-model="field">
        <option v-for="f in fields" :key="f.value" :value="f.value">{{ f.label }}</option>
      </select>
      <button type="submit" class="mwnf-standalone-refine__button">{{ searchLabel }}</button>
      <SmartLink class="mwnf-standalone-refine__button mwnf-standalone-refine__button--new" :to="newSearch">{{ newSearchLabel }}</SmartLink>
    </div>
  </form>
</template>
