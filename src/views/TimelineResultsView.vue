<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  eventDateLabel, renderBlock, renderInline, useI18n, useListQuery, usePagination, useTimelineEvents,
  yearBucketsFromRange,
} from '@museumwnf/viewer-core'
import FacetSelect from '../content/FacetSelect.vue'
import FilterPanel from '../content/FilterPanel.vue'
import Pagination from '../content/Pagination.vue'
import ResultsSummary from '../content/ResultsSummary.vue'
import SmartLink from '../content/SmartLink.vue'
import TimelineEventList from '../content/TimelineEventList.vue'

// The timeline entrance and results, composed: seven sites' hand-written
// Timeline pages over one engine, viewer-core's `useTimelineEvents` — the
// worldwide country merge, an exhibition's own narrative axis, or Sharing
// History's exhibition split — filtered by country/collection/period, paged,
// with per-event rows built for `TimelineEventList`. What a website declares
// is a spec, as route props:
//
//   {
//     scope: 'country' | 'local' | 'collection',    // useTimelineEvents' own axis
//     countryLabel: (id) => string,                  // a country's display name — the site's
//     countryIdForCode: (code) => id,                 // DXA's legacy 2-letter code, if the site's URL keys on one
//     collections: (ctx) => [{ value, label }],       // Sharing History's exhibition/PC picker — value 'pc' is the
//                                                      // Permanent Collection sentinel; every label already resolved text
//     tr: (id) => translated fields,                  // an event's own translation, the site's `tr`, bound
//     timelinesEntity: 'timelines',                   // data package file names, for a site that calls its own something else
//     eventsEntity: 'timeline_events',
//     keys,                                           // the URL's own filter keys; default: every control's key
//     controls: [{ key: 'country' | 'collection' | 'begin' | 'end', label, placeholder, anyLabel, hideEmpty, options? }],
//                // `options` on a 'begin' or 'end' control: an array [{ value, label }] or
//                // a function (ctx) => [{ value, label }] receiving the same helpers as `collections`.
//                // With options, the control renders a FacetSelect (bucketed years for DXA);
//                // without, the number input (free years for standalone sites).
//     pageSize: 15,
//     entrance: false | true,                         // true: render the form alone; navigates to `route` on submit
//     route: 'timeline-results',                       // the entrance's own target route (a name)
//     event: (event, ctx) => ({ date, caption, description, media, actions }),  // the row — see TimelineEventList
//     gallery: { route, items: (ctx) => count | array | boolean, label } | false, // the "See gallery" cross-link:
//                                                      // shown once `items` says objects exist for this country/period —
//                                                      // an item's own shape is the site's, never this view's
//     summary: (ctx) => [{ label, count?, value? }],
//     errorSelect, errorPeriod,                        // entry names for the entrance's own validation
//     title, filterTitle, applyLabel, resetLabel, submitLabel, empty,  // entry names
//     pagination: { window, jump, ends },
//   }
//
// Slots — `summary`, `cross-link`, `event`, `before`, `after` — each given
// `{ filters, active, apply, reset, goToPage, events, pageInfo, countries,
// collections, gallery, t, tr }`: `event` replaces the whole events list
// (`TimelineEventList` otherwise); `cross-link` replaces the "See gallery"
// box's own content, still inside its link. The `#date`/`#caption`/`#media`/
// `#actions` slots of `TimelineEventList` are not re-exposed here — a
// website wanting one of those writes its own component on
// `TimelineEventList` directly, the escape hatch every composed view leaves
// open.
//
// The site deltas this generalises: DXA's "See gallery" box (`gallery`, over
// an item predicate the site supplies); the standalone sites' "View items
// from this period" per-event action (`event(...).actions`); Sharing
// History's "Country | Theme" caption and image/item strip
// (`event(...).caption`/`.media`) and its `collection` control — the
// Permanent Collection sentinel is the site's own `collections()` entry,
// `useTimelineEvents({ scope: 'collection' })` reading the same `collection`
// filter key back; the exhibitions' suppressed country column is simply a
// `controls` without `'country'` and an `event()` that leaves `caption`
// empty; DXA's own century-bucketed year selects are the `#before`/`#after`
// slots plus the site's own `begin`/`end` control markup, this view deciding
// nothing about how a year is picked, only that it travels in the query.

const props = defineProps({
  spec: { type: Object, required: true },
})

const { t } = useI18n()
const router = useRouter()
const spec = computed(() => props.spec)
const isEntrance = computed(() => Boolean(spec.value.entrance))

const timeline = useTimelineEvents({
  scope: props.spec.scope ?? 'country',
  countryLabel: props.spec.countryLabel,
  countryIdForCode: props.spec.countryIdForCode,
  tr: props.spec.tr,
  timelinesEntity: props.spec.timelinesEntity,
  eventsEntity: props.spec.eventsEntity,
})

const controls = computed(() => spec.value.controls ?? [])
const keys = computed(() => spec.value.keys ?? controls.value.map((control) => control.key))
const hasControl = (key) => controls.value.some((control) => control.key === key)
const helpers = computed(() => ({
  t,
  tr: props.spec.tr,
  years: { min: eventYearRange.value[0], max: eventYearRange.value[1] },
}))

// ── Filters ──────────────────────────────────────────────────────────────

// Entrance mode keeps its own state: it is not the page whose URL these
// filters belong to, it is what *builds* the URL of another one.
const entranceFilters = reactive(Object.fromEntries(keys.value.map((key) => [key, ''])))
const entranceError = ref('')

const listQuery = isEntrance.value ? null : useListQuery({ keys: keys.value })
const activeFilters = isEntrance.value ? entranceFilters : listQuery.filters

function collectionParam(value) {
  if (!hasControl('collection')) return undefined
  if (value === '' || value == null) return undefined
  return value === 'pc' ? null : value
}

// ── Entrance: validation and the target route ───────────────────────────

function resetEntrance() {
  for (const key of keys.value) entranceFilters[key] = ''
  entranceError.value = ''
}

function submitEntrance() {
  entranceError.value = ''
  const hasPeriod = Boolean(activeFilters.begin) && Boolean(activeFilters.end)
  if (hasPeriod && Number(activeFilters.begin) >= Number(activeFilters.end)) {
    entranceError.value = t(spec.value.errorPeriod ?? 'timeline.form.errorPeriod')
    return
  }
  if (!activeFilters.country && !hasPeriod) {
    entranceError.value = t(spec.value.errorSelect ?? 'timeline.form.errorSelect')
    return
  }
  const query = {}
  for (const key of keys.value) if (activeFilters[key]) query[key] = activeFilters[key]
  router.push({ name: spec.value.route, query })
}

// ── The events ──────────────────────────────────────────────────────────

const events = computed(() => {
  if (isEntrance.value) return []
  const f = activeFilters
  return timeline.findEvents({
    country: f.country || undefined,
    collection: collectionParam(f.collection),
    begin: f.begin,
    end: f.end,
  })
})

// Compute year range from loaded events for bucketed controls.
// The range is the data's span, not the filtered event list: entrance's
// rightly-empty list should not suppress the bucketed options.
const eventYearRange = computed(() => {
  const allEvents = timeline.findEvents({
    country: undefined,
    collection: undefined,
  })
  const years = allEvents
    .map((e) => e.year_from)
    .filter((v) => Number.isFinite(v) && v !== 0)
  if (!years.length) return [null, null]
  return [Math.min(...years), Math.max(...years)]
})

const pageInfo = usePagination(events, {
  page: () => (listQuery ? listQuery.page.value : 1),
  size: () => spec.value.pageSize ?? 15,
})

function defaultEventRow(event) {
  const label = spec.value.countryLabel && event.country_id ? spec.value.countryLabel(event.country_id) : ''
  return {
    id: event.id,
    date: eventDateLabel(event, event.text, t),
    caption: label ? renderInline(String(label)) : '',
    description: event.text?.description ? renderBlock(String(event.text.description), { breaks: true }) : '',
  }
}

// The three callers — collections, options, and event — share one helpers context;
// unwrap it for all of them so they see the same { t, tr, years } object.
const rows = computed(() => pageInfo.value.rows.map((event) => (spec.value.event ?? defaultEventRow)(event, helpers.value)))

// ── Controls' own options ───────────────────────────────────────────────

const countryOptions = computed(() =>
  (timeline.countries.value ?? []).map((row) => ({
    value: row.value,
    label: row.value === 'all' ? t('timeline.form.allCountries') : row.label,
  })),
)
const collectionOptions = computed(() => spec.value.collections?.(helpers.value) ?? [])

// Compute begin/end control options for each control in the spec.
const controlOptions = computed(() => {
  const optionsByKey = {}
  for (const control of controls.value) {
    if ((control.key === 'begin' || control.key === 'end') && control.options) {
      if (typeof control.options === 'function') {
        optionsByKey[control.key] = control.options(helpers.value)
      } else {
        optionsByKey[control.key] = control.options
      }
    }
  }
  return optionsByKey
})

// ── The context every function and slot reads ───────────────────────────

const baseCtx = computed(() => ({
  filters: activeFilters,
  active: keys.value.some((key) => activeFilters[key]),
  apply: isEntrance.value ? submitEntrance : (patch) => listQuery.apply(patch),
  reset: isEntrance.value ? resetEntrance : listQuery.reset,
  goToPage: isEntrance.value ? () => {} : listQuery.goToPage,
  events: events.value,
  pageInfo: pageInfo.value,
  countries: countryOptions.value,
  collections: collectionOptions.value,
  t,
  tr: spec.value.tr,
}))

// ── The gallery cross-link ──────────────────────────────────────────────

// Computed off `baseCtx`, not `slotProps` — `slotProps` carries `gallery`
// itself, so reading it here would be circular.
const galleryResult = computed(() => {
  const gallery = spec.value.gallery
  if (!gallery || isEntrance.value) return null
  return gallery.items ? gallery.items(baseCtx.value) : true
})
const galleryVisible = computed(() => {
  const result = galleryResult.value
  if (result == null) return false
  return Array.isArray(result) ? result.length > 0 : Boolean(result)
})
const galleryCount = computed(() => {
  const result = galleryResult.value
  if (Array.isArray(result)) return result.length
  return typeof result === 'number' ? result : null
})
const galleryInfo = computed(() => {
  if (!galleryVisible.value) return null
  const query = {}
  for (const key of keys.value) if (activeFilters[key]) query[key] = activeFilters[key]
  return {
    to: { name: spec.value.gallery.route, query },
    count: galleryCount.value,
    label: t(spec.value.gallery.label ?? 'timeline.nav.seeGallery'),
  }
})

const slotProps = computed(() => ({ ...baseCtx.value, gallery: galleryInfo.value }))

// ── The summary and the panel ───────────────────────────────────────────

const summary = computed(() => {
  if (spec.value.summary) return spec.value.summary(slotProps.value)
  return [{ label: t(spec.value.summaryLabel ?? 'timeline.results.eventsFound'), count: pageInfo.value.total }]
})

const empty = computed(() => t(spec.value.empty ?? 'timeline.results.noResults'))
const pagination = computed(() => ({ window: 5, jump: false, ends: true, ...(spec.value.pagination ?? {}) }))

function controlLabel(control, fallback) {
  return control.label ? t(control.label) : fallback ? t(fallback) : ''
}
</script>

<template>
  <section class="mwnf-timeline">
    <slot name="before" v-bind="slotProps" />

    <h1 v-if="spec.title" class="mwnf-timeline__title">{{ t(spec.title) }}</h1>

    <FilterPanel
      class="mwnf-timeline__filters"
      :title="spec.filterTitle ? t(spec.filterTitle) : ''"
      :apply-label="isEntrance ? t(spec.submitLabel ?? 'core.action.search') : (spec.applyLabel ? t(spec.applyLabel) : '')"
      :reset-label="spec.resetLabel ? t(spec.resetLabel) : ''"
      @apply="isEntrance ? submitEntrance() : listQuery.apply()"
      @reset="isEntrance ? resetEntrance() : listQuery.reset()"
    >
      <template v-for="control in controls" :key="control.key">
        <FacetSelect
          v-if="control.key === 'country'"
          :model-value="activeFilters.country"
          :label="controlLabel(control, 'catalogue.facet.country')"
          :options="countryOptions"
          :placeholder="control.placeholder ? t(control.placeholder) : t('catalogue.facet.selectCountry')"
          :any-label="control.anyLabel ? t(control.anyLabel) : ''"
          :hide-empty="Boolean(control.hideEmpty)"
          @update:model-value="activeFilters.country = $event"
        />
        <FacetSelect
          v-else-if="control.key === 'collection'"
          :model-value="activeFilters.collection"
          :label="controlLabel(control)"
          :options="collectionOptions"
          :placeholder="control.placeholder ? t(control.placeholder) : ''"
          :any-label="control.anyLabel ? t(control.anyLabel) : ''"
          :hide-empty="Boolean(control.hideEmpty)"
          @update:model-value="activeFilters.collection = $event"
        />
        <FacetSelect
          v-else-if="(control.key === 'begin' || control.key === 'end') && controlOptions[control.key]"
          :model-value="activeFilters[control.key]"
          :label="controlLabel(control, control.key === 'begin' ? 'catalogue.facet.startDate' : 'catalogue.facet.endDate')"
          :options="controlOptions[control.key]"
          :placeholder="control.placeholder ? t(control.placeholder) : t(control.key === 'begin' ? 'timeline.form.fromYearHint' : 'timeline.form.toYearHint')"
          :any-label="control.anyLabel ? t(control.anyLabel) : ''"
          :hide-empty="Boolean(control.hideEmpty)"
          @update:model-value="activeFilters[control.key] = $event"
        />
        <label v-else class="mwnf-facet">
          <span class="mwnf-facet__label">{{ controlLabel(control, control.key === 'begin' ? 'catalogue.facet.startDate' : 'catalogue.facet.endDate') }}</span>
          <input
            type="number"
            class="mwnf-facet__select"
            :value="activeFilters[control.key]"
            :placeholder="control.placeholder ? t(control.placeholder) : t(control.key === 'begin' ? 'timeline.form.fromYearHint' : 'timeline.form.toYearHint')"
            @input="activeFilters[control.key] = $event.target.value"
          />
        </label>
      </template>
    </FilterPanel>

    <p v-if="isEntrance && entranceError" class="mwnf-timeline__error">{{ entranceError }}</p>

    <template v-if="!isEntrance">
      <slot name="summary" v-bind="slotProps">
        <ResultsSummary :parts="summary" />
      </slot>

      <SmartLink v-if="galleryInfo" class="mwnf-timeline__gallery" :to="galleryInfo.to">
        <slot name="cross-link" v-bind="slotProps">
          {{ galleryInfo.label }}<template v-if="galleryInfo.count != null"> ({{ galleryInfo.count }})</template>
        </slot>
      </SmartLink>

      <slot name="event" v-bind="slotProps">
        <TimelineEventList :events="rows">
          <template #empty><slot name="empty" v-bind="slotProps">{{ empty }}</slot></template>
        </TimelineEventList>
      </slot>

      <Pagination
        :page-info="pageInfo"
        :window="pagination.window"
        :jump="pagination.jump"
        :ends="pagination.ends"
        @navigate="listQuery.goToPage"
      />
    </template>

    <slot name="after" v-bind="slotProps" />
  </section>
</template>
