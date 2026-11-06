<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { renderBlock, useFacets, useI18n, yearBuckets } from '@museumwnf/viewer-core'
import { english, galleryTitleIn, items, FACETS, GALLERY_ERA_WORDS, GALLERY_FACET_CATEGORIES } from './data.js'

// The collection entrance as legacy's (dxa-client CollectionSearch.vue,
// inventory-app#2423): "Filter by:" over a column of dropdowns, each opening
// on its name and going straight to the results once a value is chosen, the
// start and end dates side by side, and the text beside them. Legacy wrote
// the names in English on every language's page; they are the gallery's own
// entries.
//
// The text, English on every page as legacy wrote it, names the gallery in its
// first sentence ("the *Historical Cars* database"): an entry takes nothing
// inserted into it, so the gallery's English full name goes between the text
// before it and the text after it.

const router = useRouter()
const { t } = useI18n()
const intro = computed(() => renderBlock(
  `${t('gallery.collection.introBeforeName')} *${galleryTitleIn(english)}* ${t('gallery.collection.introAfterName')}`,
))

const options = useFacets(items, FACETS)
const NAMES = {
  country: 'gallery.collection.selectCountry',
  type: 'gallery.collection.type',
  dynasty: 'gallery.collection.periodDynasty',
  subject: 'gallery.collection.subject',
  material: 'gallery.collection.material',
}
const lists = computed(() => ['country', ...GALLERY_FACET_CATEGORIES]
  .filter((key) => key === 'country' || (options.value[key] ?? []).length > 0)
  .map((key) => ({ key, name: NAMES[key], options: options.value[key] ?? [] })))

const eraT = (key) => t(GALLERY_ERA_WORDS[key] ?? key)
const years = computed(() => yearBuckets(items.value ?? [], eraT))

function choose(key, value) {
  if (value === '' || value == null) return
  router.push({ name: 'collection-results', query: { [key]: String(value) } })
}
</script>

<template>
  <div class="mwnf-dxa-gallery-collection">
    <div class="mwnf-dxa-gallery-collection__dropdowns">
      <div class="mwnf-dxa-gallery-collection__label">{{ t('gallery.collection.filterBy') }}</div>
      <div class="mwnf-dxa-gallery-collection__selects">
        <select
          v-for="list in lists"
          :key="list.key"
          class="mwnf-dxa-gallery-collection__select"
          :aria-label="t(list.name)"
          @change="choose(list.key, $event.target.value)"
        >
          <option selected disabled value="">{{ t(list.name) }}</option>
          <option v-for="option in list.options" :key="option.value" :value="String(option.value)">{{ option.label }}</option>
        </select>
        <div class="mwnf-dxa-gallery-collection__dates">
          <select class="mwnf-dxa-gallery-collection__select" :aria-label="t('gallery.collection.startDate')" @change="choose('from', $event.target.value)">
            <option selected disabled value="">{{ t('gallery.collection.startDate') }}</option>
            <option v-for="year in years" :key="year.value" :value="String(year.value)">{{ year.label }}</option>
          </select>
          <select class="mwnf-dxa-gallery-collection__select" :aria-label="t('gallery.collection.endDate')" @change="choose('to', $event.target.value)">
            <option selected disabled value="">{{ t('gallery.collection.endDate') }}</option>
            <option v-for="year in years" :key="year.value" :value="String(year.value)">{{ year.label }}</option>
          </select>
        </div>
      </div>
    </div>
    <div class="mwnf-dxa-gallery-collection__description mwnf-prose vc-text" dir="auto" v-html="intro"></div>
  </div>
</template>
