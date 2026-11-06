<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { I18nText, useFacets, useI18n, yearBuckets } from '@museumwnf/viewer-core'
import { items, FACETS } from './data.js'
import { useThemeFilter } from './themeFilter.js'

// The collection entrance as legacy's (exhibitions-client CollectionSearch.vue,
// inventory-app#2379): "Filter by:" over a column of dropdowns — the theme
// ("All Themes", About, then each theme with its numeral), the country, the
// type, the material, the start and end dates side by side — each opening on
// its name and going straight to the results once a value is chosen; the
// text beside them. Legacy wrote the names in English on every language's
// page; they are the exhibition's own entries.
const router = useRouter()
const { t, locale } = useI18n()
const { themeOptions } = useThemeFilter(locale)

const options = useFacets(items, FACETS)
const lists = computed(() => [
  { key: 'country', name: 'exhibition.collection.selectCountry', options: options.value.country ?? [] },
  { key: 'type', name: 'exhibition.collection.type', options: options.value.type ?? [] },
  { key: 'material', name: 'exhibition.collection.material', options: options.value.material ?? [] },
])

// Legacy's years read "A.D." and "B.C.", as the galleries' did.
const ERA_WORDS = { 'catalogue.era.ad': 'exhibition.era.ad', 'catalogue.era.bc': 'exhibition.era.bc' }
const eraT = (key) => t(ERA_WORDS[key] ?? key)
const years = computed(() => yearBuckets(items.value ?? [], eraT))

function choose(key, value) {
  if (value === '' || value == null) return
  if (value === 'all') router.push({ name: 'collection-results' })
  else router.push({ name: 'collection-results', query: { [key]: String(value) } })
}
</script>

<template>
  <div class="mwnf-dxa-exhibition-collection">
    <div class="mwnf-dxa-exhibition-collection__dropdowns">
      <div class="mwnf-dxa-exhibition-collection__label">{{ t('exhibition.collection.filterBy') }}</div>
      <div class="mwnf-dxa-exhibition-collection__selects">
        <select class="mwnf-dxa-exhibition-collection__select" :aria-label="t('exhibition.collection.selectTheme')" @change="choose('theme', $event.target.value)">
          <option selected disabled value="">{{ t('exhibition.collection.selectTheme') }}</option>
          <option value="all">{{ t('exhibition.collection.allThemes') }}</option>
          <option v-for="option in themeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
        <select
          v-for="list in lists"
          :key="list.key"
          class="mwnf-dxa-exhibition-collection__select"
          :aria-label="t(list.name)"
          @change="choose(list.key, $event.target.value)"
        >
          <option selected disabled value="">{{ t(list.name) }}</option>
          <option v-for="option in list.options" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
        </select>
        <div class="mwnf-dxa-exhibition-collection__dates">
          <select class="mwnf-dxa-exhibition-collection__select" :aria-label="t('exhibition.collection.startDate')" @change="choose('from', $event.target.value)">
            <option selected disabled value="">{{ t('exhibition.collection.startDate') }}</option>
            <option v-for="year in years" :key="year.value" :value="String(year.value)">{{ year.label }}</option>
          </select>
          <select class="mwnf-dxa-exhibition-collection__select" :aria-label="t('exhibition.collection.endDate')" @change="choose('to', $event.target.value)">
            <option selected disabled value="">{{ t('exhibition.collection.endDate') }}</option>
            <option v-for="year in years" :key="year.value" :value="String(year.value)">{{ year.label }}</option>
          </select>
        </div>
      </div>
    </div>
    <I18nText class="mwnf-dxa-exhibition-collection__description mwnf-prose" dir="auto" keypath="exhibition.collection.intro" />
  </div>
</template>
