<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  centuryPresets, entityRef, useFacets, useI18n, useSearchLanguage, yearBuckets,
} from '@museumwnf/viewer-core'
import FacetSelect from '../content/FacetSelect.vue'
import FilterPanel from '../content/FilterPanel.vue'
import SmartLink from '../content/SmartLink.vue'

// The search entrance, composed: legacy's three shapes — the `Database.vue`
// three-keyword-row form of three standalone sites, the `CollectionSearch.vue`
// column of facet dropdowns of four galleries (choosing one navigates), and
// the `PcEntrance.vue` one-filter-at-a-time radio form of two more — as one
// view over `FilterPanel`/`FacetSelect` and viewer-core's `useFacets`,
// `centuryPresets`, `yearBuckets` and `useSearchLanguage`. It only writes the
// query its target results route reads; nothing is searched here. What a
// website declares is a spec, as route props:
//
//   {
//     mode: 'rows' | 'facets' | 'radio',
//     entity: 'items',                  // records `dates: 'buckets'` and an
//                                        // entity-backed facet (one with no
//                                        // `options` of its own) read
//     rows: 3,                          // 'rows': how many keyword rows
//     fields: [{ key, label }],         // 'rows': the field-select options; `label` an entry name
//     operators: [{ key, label }],      // 'rows': the AND/OR select, one row two on; default AND/OR
//                                        // (`catalogue.search.and`/`.or`)
//     dates: { presets } | 'buckets' | false,
//                                        // 'rows'/'facets': a "from"/"to" year select, over
//                                        // `centuryPresets` (asymmetric, legacy's own boundaries —
//                                        // `presets` a function called with no arguments or an
//                                        // already-built `{ from, to }`) or, 'buckets', one list
//                                        // built from `entity`'s own records through `yearBuckets`
//                                        // and used for both ends, as the facet galleries do
//     language: 'items' | false,        // an entity name: the search-language select over
//                                        // `useSearchLanguage`, restricting to a language the
//                                        // records were actually written in
//     extras: [{ key, type: 'checkbox', label }],
//     facets: [{ key, label, type: 'select' | 'year', options: [{ value, label }] }],
//                                        // 'facets'/'radio': a facet's options, given directly (a
//                                        // site's own label function already ran) or, when `options`
//                                        // is left out, derived from `entity`'s own records through
//                                        // `useFacets` (the raw value as its own label); `type:
//                                        // 'year'` renders a plain number input instead — legacy's
//                                        // "begin"/"end" radio rows, which invite any year, not a
//                                        // list of them
//     target: routeName,                // the results route this form writes into
//     submitLabel, showAllLabel,        // entry names; default `core.action.search` ('rows') or
//                                        // `core.action.browse` ('radio'), and `core.action.reset`
//     howTo: routeName | false,         // a link to the search-syntax essay, labelled
//                                        // `catalogue.search.howTo`
//   }
//
// The query it writes is the query `CatalogueResultsView`'s own spec reads:
// `q`/`field` for the first keyword row, `q2`/`field2`/`op2` and on for the
// rows after it, `from`/`to` for the date bound, `searchlanguage` for the search
// language (viewer-core's `SEARCH_LANGUAGE_KEY`; `lang` is the language the
// website is read in), a facet's own `key` for its value, and an extra's own `key` set
// to `'1'`. In `facets` mode, choosing a value navigates immediately, with
// only that one key — legacy's own `CollectionSearch.vue` behaviour, not an
// accumulating filter panel. "Show all" (`showAllLabel`, wired to
// `FilterPanel`'s reset) navigates to the target with none of the form's own
// keys, keeping only the extras — legacy's `showAll()` kept the "include
// EPM" checkbox but dropped everything a visitor had typed.
//
// Slots — `intro`, `before`, `extras`, `actions` — each given `{ mode,
// submit, showAll }`: `intro` and `before` for a site's own copy above the
// form (the shared `catalogue.search.intro`, or a gallery's own Markdown
// description, are entries a site places there itself); `extras` for a
// control the `extras` array does not cover; `actions` for a button beside
// Search/Show all/How to search.
//
// Unlike a content component (`SmartLink` never imports `vue-router`, since
// a website's own links already carry a resolved `to`), this view
// programmatically navigates to a route of its own choosing on submit and on
// a facet's choice — the one thing legacy's three `Database.vue`,
// `CollectionSearch.vue` and `PcEntrance.vue` all did by hand with
// `useRouter`. There is no other way to reach a router from here.

const props = defineProps({
  spec: { type: Object, required: true },
})

const { t } = useI18n()
const router = useRouter()
const spec = computed(() => props.spec)
const mode = computed(() => spec.value.mode)

// ── Records: an entity-backed facet, and the "buckets" date rule ───────────

const records = computed(() => (spec.value.entity ? (entityRef(spec.value.entity).value ?? []) : []))

// ── Dates ───────────────────────────────────────────────────────────────────

const isBucketDates = computed(() => spec.value.dates === 'buckets')
const presets = computed(() => {
  const d = spec.value.dates
  if (!d || d === 'buckets') return null
  const raw = d.presets
  return typeof raw === 'function' ? raw() : (raw ?? centuryPresets())
})
function numberOptions(list) {
  return (list ?? []).map((year) => ({ value: year, label: String(year) }))
}
const bucketOptions = computed(() => (isBucketDates.value ? yearBuckets(records.value, t) : []))
const dateFromOptions = computed(() => (isBucketDates.value ? bucketOptions.value : numberOptions(presets.value?.from)))
const dateToOptions = computed(() => (isBucketDates.value ? bucketOptions.value : numberOptions(presets.value?.to)))
const showDates = computed(() => Boolean(spec.value.dates))
const dateFrom = ref('')
const dateTo = ref('')

// ── The search-language select ──────────────────────────────────────────────

const searchLang = spec.value.language ? useSearchLanguage(spec.value.language) : null
const languages = computed(() => searchLang?.languages.value ?? [])
const language = searchLang?.language ?? ref('')

// ── Facets: given directly, or derived from `entity`'s own records ─────────

const derivedFacetSpecs = computed(() => Object.fromEntries(
  (spec.value.facets ?? [])
    .filter((facet) => !facet.options && facet.type !== 'year')
    .map((facet) => [facet.key, { field: facet.field ?? facet.key }]),
))
const derivedFacetOptions = useFacets(records, derivedFacetSpecs)
const facetOptionsByKey = computed(() => {
  const out = {}
  for (const facet of spec.value.facets ?? []) out[facet.key] = facet.options ?? derivedFacetOptions.value[facet.key] ?? []
  return out
})

// ── 'rows': three (or `spec.rows`) keyword rows ─────────────────────────────

const DEFAULT_OPERATORS = [
  { key: 'AND', label: 'catalogue.search.and' },
  { key: 'OR', label: 'catalogue.search.or' },
]
// Legacy only ever had three rows, so only three are named; a spec asking
// for more has no fourth entry to label it with.
const KEYWORD_LABELS = ['catalogue.search.keywordOne', 'catalogue.search.keywordTwo', 'catalogue.search.keywordThree']

const operators = computed(() => spec.value.operators ?? DEFAULT_OPERATORS)
const rows = ref(Array.from({ length: spec.value.rows ?? 3 }, () => ({
  keyword: '',
  field: spec.value.fields?.[0]?.key ?? '',
  cond: (spec.value.operators ?? DEFAULT_OPERATORS)[0].key,
})))
function rowLabel(i) {
  return KEYWORD_LABELS[i] ? t(KEYWORD_LABELS[i]) : ''
}

// ── A facet's own current value — 'facets' mode shows it selected, 'radio'
// mode shows it in whichever row is chosen ─────────────────────────────────

const activeFacet = ref(spec.value.facets?.[0]?.key ?? '') // 'radio' only
const selection = reactive(Object.fromEntries((spec.value.facets ?? []).map((facet) => [facet.key, ''])))

// ── Extras ───────────────────────────────────────────────────────────────────

const extraValues = reactive(Object.fromEntries((spec.value.extras ?? []).map((extra) => [extra.key, false])))
function extrasQuery() {
  const out = {}
  for (const extra of spec.value.extras ?? []) if (extraValues[extra.key]) out[extra.key] = '1'
  return out
}

// ── Submit, facet choice, show all ──────────────────────────────────────────

function pushToTarget(query) {
  return router.push({ name: spec.value.target, query })
}

function submit() {
  const query = {}
  if (mode.value === 'rows') {
    rows.value.forEach((row, i) => {
      if (!row.keyword) return
      if (i === 0) {
        query.q = row.keyword
        if (row.field) query.field = row.field
      } else {
        const n = i + 1
        query[`q${n}`] = row.keyword
        if (row.field) query[`field${n}`] = row.field
        query[`op${n}`] = row.cond
      }
    })
    if (dateFrom.value) query.from = String(dateFrom.value)
    if (dateTo.value) query.to = String(dateTo.value)
    if (language.value) query.searchlanguage = language.value
  } else if (mode.value === 'radio') {
    const key = activeFacet.value
    const value = key ? selection[key] : ''
    if (value) query[key] = String(value)
  }
  Object.assign(query, extrasQuery())
  return pushToTarget(query)
}

function chooseFacet(key, value) {
  if (value === '' || value == null) return
  return pushToTarget({ [key]: String(value), ...extrasQuery() })
}

function showAll() {
  return pushToTarget(extrasQuery())
}

// ── Texts, slots ─────────────────────────────────────────────────────────────

const panelMode = computed(() => (mode.value === 'facets' ? 'immediate' : 'apply'))
const defaultSubmitEntry = computed(() => (mode.value === 'radio' ? 'core.action.browse' : 'core.action.search'))
const submitText = computed(() => t(spec.value.submitLabel ?? defaultSubmitEntry.value))
const showAllText = computed(() => t(spec.value.showAllLabel ?? 'core.action.reset'))

const slotProps = computed(() => ({ mode: mode.value, submit, showAll }))
</script>

<template>
  <section class="mwnf-search-form" :class="`mwnf-search-form--${mode}`">
    <slot name="intro" v-bind="slotProps" />
    <slot name="before" v-bind="slotProps" />

    <FilterPanel
      class="mwnf-search-form__panel"
      :mode="panelMode"
      :apply-label="submitText"
      :reset-label="showAllText"
      @apply="submit"
      @reset="showAll"
    >
      <!-- 'rows': the keyword rows, the date range, the search language -->
      <template v-if="mode === 'rows'">
        <div v-for="(row, i) in rows" :key="i" class="mwnf-search-form__row">
          <span class="mwnf-search-form__row-label">{{ rowLabel(i) }}</span>
          <select v-if="i > 0" v-model="row.cond" class="mwnf-facet__select mwnf-search-form__operator">
            <option v-for="op in operators" :key="op.key" :value="op.key">{{ t(op.label) }}</option>
          </select>
          <select v-model="row.field" class="mwnf-facet__select mwnf-search-form__field">
            <option v-for="field in spec.fields ?? []" :key="field.key" :value="field.key">{{ t(field.label) }}</option>
          </select>
          <input
            v-model="row.keyword"
            type="text"
            class="mwnf-search-form__keyword"
            :placeholder="t('catalogue.search.keywordPlaceholder')"
          />
        </div>

        <div v-if="showDates" class="mwnf-search-form__dates">
          <FacetSelect v-model="dateFrom" :label="t('catalogue.facet.dateFrom')" :options="dateFromOptions" any-label="—" />
          <FacetSelect v-model="dateTo" :label="t('catalogue.facet.dateTo')" :options="dateToOptions" any-label="—" />
        </div>

        <label v-if="spec.language" class="mwnf-facet">
          <span class="mwnf-facet__label">{{ t('catalogue.search.language') }}</span>
          <select v-model="language" class="mwnf-facet__select mwnf-search-form__language">
            <option value="">{{ t('catalogue.search.anyLanguage') }}</option>
            <option v-for="code in languages" :key="code" :value="code">{{ code.toUpperCase() }}</option>
          </select>
        </label>
      </template>

      <!-- 'facets': a column of dropdowns, choosing one navigates -->
      <template v-else-if="mode === 'facets'">
        <FacetSelect
          v-for="facet in spec.facets ?? []"
          :key="facet.key"
          :label="facet.label ? t(facet.label) : ''"
          :options="facetOptionsByKey[facet.key] ?? []"
          :model-value="selection[facet.key]"
          @update:model-value="chooseFacet(facet.key, $event)"
        />
        <div v-if="showDates" class="mwnf-search-form__dates">
          <FacetSelect
            :model-value="dateFrom"
            :label="t('catalogue.facet.startDate')"
            :options="dateFromOptions"
            @update:model-value="dateFrom = $event; chooseFacet('from', $event)"
          />
          <FacetSelect
            :model-value="dateTo"
            :label="t('catalogue.facet.endDate')"
            :options="dateToOptions"
            @update:model-value="dateTo = $event; chooseFacet('to', $event)"
          />
        </div>
      </template>

      <!-- 'radio': one filter at a time, chosen by a radio -->
      <template v-else-if="mode === 'radio'">
        <div v-for="facet in spec.facets ?? []" :key="facet.key" class="mwnf-search-form__radio-row">
          <label class="mwnf-search-form__radio-choice">
            <input v-model="activeFacet" type="radio" name="mwnf-search-form-filter" :value="facet.key" />
            {{ facet.label ? t(facet.label) : '' }}
          </label>
          <FacetSelect
            v-if="facet.type !== 'year'"
            v-model="selection[facet.key]"
            :options="facetOptionsByKey[facet.key] ?? []"
            :disabled="activeFacet !== facet.key"
          />
          <input
            v-else
            v-model="selection[facet.key]"
            type="number"
            class="mwnf-search-form__year"
            :disabled="activeFacet !== facet.key"
          />
        </div>
      </template>

      <label v-for="extra in spec.extras ?? []" :key="extra.key" class="mwnf-facet mwnf-facet--checkbox">
        <input v-model="extraValues[extra.key]" type="checkbox" class="mwnf-facet__checkbox" />
        <span class="mwnf-facet__label">{{ t(extra.label) }}</span>
      </label>
      <slot name="extras" v-bind="slotProps" />
    </FilterPanel>

    <p v-if="spec.howTo" class="mwnf-search-form__how-to">
      <SmartLink :to="{ name: spec.howTo }">{{ t('catalogue.search.howTo') }}</SmartLink>
    </p>

    <slot name="actions" v-bind="slotProps" />
  </section>
</template>
