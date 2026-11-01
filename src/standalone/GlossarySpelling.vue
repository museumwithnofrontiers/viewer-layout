<script setup>
import { computed, onMounted, ref } from 'vue'
import { collate, entityRef, loadEntities, md, useDataPackage } from '@museumwnf/viewer-core'
import Window from './Window.vue'

// Legacy's Glossary & Spelling window (glossarysearch.php): the visitor types
// the first letters of a term and picks one of the spellings it starts, in
// the site's language (show_glossary_spell.php); the term's definition in
// that language follows, then every spelling the database knows it by, in
// all languages (show_glossary_def.php). Legacy's own suggestions never
// arrived (the script read the letters from a POST its autocomplete sent as
// a GET), so this window does what the scripts were written to do.
//
//   labels: { heading, intro, definition, spellings, spellingsNote, close }  // the texts, resolved
const props = defineProps({
  language: { type: String, default: 'en' },
  labels: { type: Object, default: () => ({}) },
  entity: { type: String, default: 'glossary' },
  /** The window's direction (`Window`'s `dir`). */
  dir: { type: String, default: '' },
})

const pkg = useDataPackage()
const terms = entityRef(props.entity)
const languages = computed(() => pkg.availableLanguages(props.entity).slice().sort())

onMounted(async () => {
  await loadEntities([props.entity])
  await Promise.all(languages.value.map((language) => pkg.loadTranslations(props.entity, language)))
})

const input = ref('')
const chosen = ref(null)
const active = ref(-1)

const textOf = (term, language) => pkg.translations(props.entity, language)[term.id] ?? {}

// Each spelling of the site's language that starts with the letters, once,
// in the collation's order, as legacy's `LIKE 'q%' ORDER BY spelling`.
const suggestions = computed(() => {
  const needle = collate(input.value.trim())
  if (!needle || chosen.value) return []
  const found = new Map()
  for (const term of terms.value ?? []) {
    for (const spelling of textOf(term, props.language).spellings ?? []) {
      const key = String(spelling).trim()
      if (key && collate(key).startsWith(needle)) found.set(key, term)
    }
  }
  return [...found].map(([spelling, term]) => ({ spelling, term }))
    .sort((a, b) => (collate(a.spelling) < collate(b.spelling) ? -1 : collate(a.spelling) > collate(b.spelling) ? 1 : 0))
})

const definition = computed(() => (chosen.value ? md(textOf(chosen.value, props.language).definition ?? '') : ''))

// Every spelling of the term in every language, once, languages in order.
const spellings = computed(() => {
  if (!chosen.value) return []
  const seen = new Set()
  const out = []
  for (const language of languages.value) {
    for (const spelling of textOf(chosen.value, language).spellings ?? []) {
      const key = collate(String(spelling).trim())
      if (key && !seen.has(key)) {
        seen.add(key)
        out.push(String(spelling).trim())
      }
    }
  }
  return out
})

function choose(suggestion) {
  chosen.value = suggestion.term
  input.value = suggestion.spelling
  active.value = -1
}

function onInput() {
  chosen.value = null
  active.value = -1
}

function onKeydown(event) {
  const list = suggestions.value
  if (!list.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = (active.value + 1) % list.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = (active.value - 1 + list.length) % list.length
  } else if (event.key === 'Enter' && active.value >= 0) {
    event.preventDefault()
    choose(list[active.value])
  }
}
</script>

<template>
  <Window :heading="labels.heading" :close-label="labels.close" :dir="dir">
    <div class="mwnf-standalone-glossary">
      <h2 class="mwnf-standalone-glossary__intro">{{ labels.intro }}</h2>
      <div class="mwnf-standalone-glossary__body">
        <div class="mwnf-standalone-glossary__field">
          <input
            v-model="input"
            type="text"
            class="mwnf-standalone-glossary__input"
            role="combobox"
            aria-autocomplete="list"
            :aria-expanded="suggestions.length > 0"
            :aria-label="labels.heading"
            @input="onInput"
            @keydown="onKeydown"
          />
          <ul v-if="suggestions.length" class="mwnf-standalone-glossary__suggestions" role="listbox">
            <li
              v-for="(suggestion, index) in suggestions"
              :key="suggestion.spelling"
              role="option"
              :aria-selected="index === active"
              :class="['mwnf-standalone-glossary__suggestion', { 'mwnf-standalone-glossary__suggestion--active': index === active }]"
              @mousedown.prevent="choose(suggestion)"
            >{{ suggestion.spelling }}</li>
          </ul>
        </div>
        <div class="mwnf-standalone-glossary__result" aria-live="polite">
          <template v-if="chosen">
            <template v-if="definition">
              <h3 class="mwnf-standalone-glossary__label">{{ labels.definition }}</h3>
              <!-- eslint-disable-next-line vue/no-v-html -- the term's own Markdown, rendered and escaped by viewer-core -->
              <div class="mwnf-standalone-glossary__definition" v-html="definition"></div>
            </template>
            <template v-if="spellings.length">
              <h3 class="mwnf-standalone-glossary__label mwnf-standalone-glossary__label--spellings">{{ labels.spellings }}</h3>
              <p class="mwnf-standalone-glossary__note">{{ labels.spellingsNote }}</p>
              <ul class="mwnf-standalone-glossary__spellings">
                <li v-for="spelling in spellings" :key="spelling">{{ spelling }}</li>
              </ul>
            </template>
          </template>
        </div>
      </div>
    </div>
  </Window>
</template>
