<script setup>
import { computed } from 'vue'
import {
  dateRange, entityRef, renderInline, renderPlain, sortChronological, useDataPackage, useFacets, useI18n,
  useListQuery, usePagination,
} from '@museumwnf/viewer-core'
import FacetSelect from '../content/FacetSelect.vue'
import FilterPanel from '../content/FilterPanel.vue'
import Pagination from '../content/Pagination.vue'
import RecordGrid from '../content/RecordGrid.vue'
import RecordList from '../content/RecordList.vue'
import ResultsSummary from '../content/ResultsSummary.vue'

// The results page, composed. The engine is viewer-core's — the filters and
// the page in the URL, the options, the date rule, the order, the pages —
// and the parts are the content components; what a website declares is a
// spec, as route props:
//
//   {
//     entity: 'items',
//     keys: ['country', 'partner', 'begin', 'end'],   // what the URL carries
//     facets: { country: { field: 'country_id', label: countryLabel }, … },  // viewer-core's facet spec
//     facetScope: 'all' | 'matching',                  // options over every record (standalone) or the survivors (DXA)
//     controls: [                                      // the panel's controls, in order; texts are entry names
//       { key: 'country', label: 'catalogue.facet.country', anyLabel: 'catalogue.facet.any' },
//       { key: 'begin', type: 'year', label: 'catalogue.facet.fromYear' },
//       { key: 'q', type: 'query', label: 'catalogue.facet.keyword', placeholder: 'catalogue.facet.keywordPlaceholder' },
//       { key: 'epm', type: 'checkbox', label: 'catalogue.facet.epm' },
//     ],
//     filterMode: 'apply' | 'immediate',
//     scope: (record, filters) => boolean,             // a site rule applied before anything else
//     match: (record, filters) => boolean,             // the site's own filters (its extras)
//     narrow: (list, filters, helpers) => list,        // a site rule over the whole list — a keyword index, say
//     dates: { mode: 'overlap' | 'contain', begin: 'begin', end: 'end' },   // decision D5, declared once
//     sort: 'chronological' | { undated: 'first' } | (list) => list | false,
//     pageSize: 20,
//     variant: 'list' | 'grid',
//     boxed: true,                                     // the results in the site's content box, as a panel
//     record: (record, helpers) => { id, image, imageAlt, name, meta, badge, to },  // the row
//     recordRoute: 'item',                             // the default row's route name
//     summary: (context) => [{ label, count?, value? }],
//     title, filterTitle, empty, actionLabel,          // entry names
//     pagination: { window, jump, ends },
//   }
//
// Slots — `filters` (more controls inside the panel), `actions` (beside the
// summary), `aside` (next to the results), `empty`, `before`, `after` — each
// receiving `{ filters, active, apply, reset, goToPage, matching, pageInfo,
// options }`: enough for a website to compose the panel itself, in the aside
// where legacy put it, or a second pagination above the tiles. A
// website whose page is not this shape registers its own component instead.

const props = defineProps({
  spec: { type: Object, required: true },
  /** Set by viewer-core when this view renders a `features.entities` route. */
  entity: { type: String, default: '' },
})

const { t, locale } = useI18n()
const pkg = useDataPackage()

const entity = props.spec.entity ?? props.entity
const spec = computed(() => props.spec)
const records = entityRef(entity)
if (entity) pkg.loadTranslations(entity, 'en')

const keys = computed(() => spec.value.keys ?? [...Object.keys(spec.value.facets ?? {}), ...datesKeys()])
function datesKeys() {
  const dates = spec.value.dates
  return dates ? [dates.begin ?? 'begin', dates.end ?? 'end'] : []
}

const { filters, page, active, apply, reset, goToPage } = useListQuery({ keys: keys.value })

const helpers = {
  t,
  locale,
  tr: (name, id) => pkg.tr(name, id, locale.value, 'en'),
  renderInline,
  renderPlain,
}

// ── What matches ───────────────────────────────────────────────────────────

function facetValues(record, facet) {
  if (typeof facet.values === 'function') return [facet.values(record)].flat()
  const raw = record?.[facet.field]
  return Array.isArray(raw) ? raw : [raw]
}

const matching = computed(() => {
  const s = spec.value
  let list = records.value ?? []
  if (s.scope) list = list.filter((record) => s.scope(record, filters, helpers))
  for (const [key, facet] of Object.entries(s.facets ?? {})) {
    const wanted = filters[key]
    if (!wanted) continue
    list = list.filter((record) => facetValues(record, facet).map(String).includes(String(wanted)))
  }
  if (s.match) list = list.filter((record) => s.match(record, filters, helpers))
  if (s.narrow) list = s.narrow(list, filters, helpers)
  if (s.dates) {
    list = dateRange(list, {
      begin: filters[s.dates.begin ?? 'begin'],
      end: filters[s.dates.end ?? 'end'],
      mode: s.dates.mode ?? 'overlap',
      fields: s.dates.fields,
    })
  }
  const sort = s.sort ?? 'chronological'
  if (typeof sort === 'function') return sort(list)
  if (sort === 'chronological') return sortChronological(list)
  if (sort && typeof sort === 'object') return sortChronological(list, sort)
  return list
})

const facetSource = computed(() => (spec.value.facetScope === 'matching' ? matching.value : records.value ?? []))
const options = useFacets(facetSource, () => spec.value.facets ?? {})

const pageInfo = usePagination(matching, { page, size: () => spec.value.pageSize ?? 20 })

// ── The rows ───────────────────────────────────────────────────────────────

const recordRoute = computed(() => spec.value.recordRoute ?? (props.entity ? `${props.entity}-detail` : 'item'))

function defaultRecord(record) {
  const text = helpers.tr(entity, record.id)
  const name = text.name ?? record.internal_name ?? record.id
  return {
    id: record.id,
    image: record.images?.[0]?.url ?? '',
    imageAlt: renderPlain(String(name)),
    name: renderInline(String(name)),
    meta: [],
    badge: record.type ?? '',
    to: { name: recordRoute.value, params: { id: record.id } },
  }
}

const rows = computed(() => pageInfo.value.rows.map((record) => (spec.value.record ?? defaultRecord)(record, helpers)))

const slotProps = computed(() => ({
  filters,
  active: active.value,
  apply,
  reset,
  goToPage,
  matching: matching.value,
  pageInfo: pageInfo.value,
  options: options.value,
}))

// ── The summary ────────────────────────────────────────────────────────────

const summary = computed(() => {
  const s = spec.value
  if (s.summary) return s.summary({ ...slotProps.value, t, total: (records.value ?? []).length })
  return [{ label: t(s.summaryLabel ?? 'catalogue.results.itemsFound'), count: pageInfo.value.total }]
})

// ── The controls ───────────────────────────────────────────────────────────

const mode = computed(() => spec.value.filterMode ?? 'apply')
const controls = computed(() => spec.value.controls ?? [])
const hasPanel = computed(() => controls.value.length > 0 || Boolean(spec.value.panel))

function choose(key, value) {
  if (mode.value === 'immediate') apply({ [key]: value })
  else filters[key] = value
}

const empty = computed(() => t(spec.value.empty ?? 'catalogue.results.noResultsFilter'))
const isGrid = computed(() => spec.value.variant === 'grid')
const pagination = computed(() => ({ window: 5, jump: false, ends: true, ...(spec.value.pagination ?? {}) }))
</script>

<template>
  <section class="mwnf-catalogue" :class="{ 'mwnf-catalogue--boxed': spec.boxed }">
    <slot name="before" v-bind="slotProps" />

    <h1 v-if="spec.title" class="mwnf-catalogue__title">{{ t(spec.title) }}</h1>

    <FilterPanel
      v-if="hasPanel || $slots.filters"
      class="mwnf-catalogue__filters"
      :mode="mode"
      :title="spec.filterTitle ? t(spec.filterTitle) : ''"
      :reset-label="spec.resetLabel ? t(spec.resetLabel) : ''"
      @apply="apply()"
      @reset="reset()"
    >
      <template v-for="control in controls" :key="control.key">
        <label v-if="control.type === 'year'" class="mwnf-facet">
          <span v-if="control.label" class="mwnf-facet__label">{{ t(control.label) }}</span>
          <input
            type="number"
            class="mwnf-facet__select"
            :value="filters[control.key]"
            :placeholder="control.placeholder ? t(control.placeholder) : ''"
            @input="filters[control.key] = $event.target.value"
            @change="mode === 'immediate' ? apply() : null"
          />
        </label>
        <label v-else-if="control.type === 'query'" class="mwnf-facet">
          <span v-if="control.label" class="mwnf-facet__label">{{ t(control.label) }}</span>
          <input
            type="text"
            class="mwnf-facet__select"
            :value="filters[control.key]"
            :placeholder="control.placeholder ? t(control.placeholder) : ''"
            @input="filters[control.key] = $event.target.value"
            @change="mode === 'immediate' ? apply() : null"
          />
        </label>
        <label v-else-if="control.type === 'checkbox'" class="mwnf-facet mwnf-facet--checkbox">
          <input
            type="checkbox"
            class="mwnf-facet__checkbox"
            :checked="filters[control.key] === '1'"
            @change="choose(control.key, $event.target.checked ? '1' : '')"
          />
          <span v-if="control.label" class="mwnf-facet__label">{{ t(control.label) }}</span>
        </label>
        <FacetSelect
          v-else
          :model-value="filters[control.key]"
          :label="control.label ? t(control.label) : ''"
          :options="options[control.key] ?? []"
          :placeholder="control.placeholder ? t(control.placeholder) : ''"
          :any-label="control.anyLabel ? t(control.anyLabel) : ''"
          :hide-empty="Boolean(control.hideEmpty)"
          @update:model-value="choose(control.key, $event)"
        />
      </template>
      <slot name="filters" v-bind="slotProps" />
    </FilterPanel>

    <ResultsSummary :parts="summary">
      <template v-if="$slots.actions" #actions><slot name="actions" v-bind="slotProps" /></template>
    </ResultsSummary>

    <div class="mwnf-catalogue__body">
      <div class="mwnf-catalogue__results">
        <component :is="isGrid ? RecordGrid : RecordList" :records="rows" :action-label="spec.actionLabel ? t(spec.actionLabel) : ''">
          <template #empty><slot name="empty" v-bind="slotProps">{{ empty }}</slot></template>
        </component>
        <Pagination :page-info="pageInfo" :window="pagination.window" :jump="pagination.jump" :ends="pagination.ends" @navigate="goToPage" />
      </div>
      <aside v-if="$slots.aside" class="mwnf-catalogue__aside"><slot name="aside" v-bind="slotProps" /></aside>
    </div>

    <slot name="after" v-bind="slotProps" />
  </section>
</template>
