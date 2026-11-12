<script setup>
import { computed } from 'vue'
import { useCatalogueResults, useI18n } from '@museumwnf/viewer-core'
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
// summary), `aside` (next to the results), `records` (the page's rows drawn
// the website's way; it also receives `rows` and `empty`), `pagination`
// (the pages' links, the website's way), `empty`, `before`, `after` — each
// receiving `{ filters, active, apply, reset, goToPage, matching, pageInfo,
// options }`: enough for a website to compose the panel itself, in the aside
// where legacy put it, or a second pagination above the tiles. A
// website whose page is not this shape registers its own component instead.

const props = defineProps({
  spec: { type: Object, required: true },
  /** Set by viewer-core when this view renders a `features.entities` route. */
  entity: { type: String, default: '' },
})

const { t } = useI18n()
const spec = computed(() => props.spec)

// The engine — the filters and the page in the URL, the facets, the dates,
// the order, the pages, the rows and the summary — is viewer-core's; this view
// draws it.
const { filters, apply, reset, goToPage, options, pageInfo, rows, summary, state: slotProps } = useCatalogueResults(
  () => props.spec,
  { entity: props.entity },
)

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
        <slot name="records" v-bind="{ ...slotProps, rows, empty }">
          <component :is="isGrid ? RecordGrid : RecordList" :records="rows" :action-label="spec.actionLabel ? t(spec.actionLabel) : ''">
            <template #empty><slot name="empty" v-bind="slotProps">{{ empty }}</slot></template>
          </component>
        </slot>
        <!-- A website's slot replaces the default even when it draws nothing
             (its pages elsewhere): Vue would fall back on an empty slot. -->
        <slot name="pagination" v-bind="slotProps">
          <Pagination v-if="!$slots.pagination" :page-info="pageInfo" :window="pagination.window" :jump="pagination.jump" :ends="pagination.ends" @navigate="goToPage" />
        </slot>
      </div>
      <aside v-if="$slots.aside" class="mwnf-catalogue__aside"><slot name="aside" v-bind="slotProps" /></aside>
    </div>

    <slot name="after" v-bind="slotProps" />
  </section>
</template>
