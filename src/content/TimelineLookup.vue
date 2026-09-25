<script setup>
import { computed, ref, watch } from 'vue'
import { md } from '@museumwnf/viewer-core'
import { useI18n } from '@museumwnf/viewer-core/i18n'
import SmartLink from './SmartLink.vue'

// The timeline popout a DXA gallery/exhibition item sheet opens onto its own
// sheet: a trigger line, a country select, a "see the full search" link and
// the events for the record's own date range. The countries, the events
// lookup and the search route are the family's item-page spec
// (`@museumwnf/viewer-core/dxa`), so `ItemDetailView` asks the `spec` for
// one small, already-normalized `info` object instead of guessing at any
// of that.
const props = defineProps({
  /**
   * `{ trigger?, heading, countries: [{ value, label }], defaultCountry?,
   * events(countryCode), range: [from, to], era?(year), searchTo(countryCode,
   * range) }` — see `spec.related.timeline` in `docs/slot-catalogue.md`.
   */
  info: { type: Object, required: true },
})

const { t } = useI18n()
const open = ref(false)
const country = ref(props.info.defaultCountry ? props.info.defaultCountry() : 'all')

// A new record's `info` (its `events`/`range`/`defaultCountry` all close
// over that record) — reselect the default country for it, the way the
// item sheets used to reset on `watch(item, …, { immediate: true })`.
watch(
  () => props.info,
  (info) => { country.value = info.defaultCountry ? info.defaultCountry() : 'all' },
)

const range = computed(() => props.info.range ?? [null, null])
const events = computed(() => props.info.events(country.value))
const currentLabel = computed(() => props.info.countries.find((c) => c.value === country.value)?.label ?? '')
const era = (year) => (props.info.era ? props.info.era(year) : String(year ?? ''))
</script>

<template>
  <div class="mwnf-sheet-timeline">
    <p class="mwnf-sheet-timeline__trigger" @click="open = !open">➤ {{ t(info.trigger ?? 'record.related.timelineForItem') }}</p>
    <div v-if="open" class="mwnf-sheet-timeline__popout" dir="ltr">
      <button type="button" class="mwnf-sheet-timeline__close" :aria-label="t('core.action.close')" @click="open = false">✕</button>
      <p class="mwnf-sheet-timeline__title">{{ t(info.heading) }}</p>
      <div class="mwnf-sheet-timeline__option">
        <select v-model="country" class="mwnf-sheet-timeline__select">
          <option v-for="c in info.countries" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <SmartLink class="mwnf-sheet-timeline__link" :to="info.searchTo(country, range)">➤ {{ t('timeline.action.beginFullSearch') }}</SmartLink>
      </div>
      <div class="mwnf-sheet-timeline__scroll">
        <p class="mwnf-sheet-timeline__subheader">{{ currentLabel }}, {{ era(range[0]) }} – {{ era(range[1]) }}</p>
        <p v-if="!events.length" class="mwnf-sheet-timeline__empty">{{ t('timeline.results.noEvents') }}</p>
        <div v-for="(event, index) in events" :key="event.id ?? index" class="mwnf-sheet-timeline__event">
          <div class="mwnf-sheet-timeline__date">{{ era(event.year_from) }}</div>
          <div class="mwnf-sheet-timeline__description" v-html="md(event.text.description)"></div>
        </div>
      </div>
    </div>
  </div>
</template>
