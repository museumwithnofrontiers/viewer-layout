<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { I18nText, renderInline, useI18n, useKeywordIndex } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import Pages from './Pages.vue'
import {
  itemById, labelOf, loadEnglish, tr, defaultLang, haystack, itemRoute, legacyPaging,
} from './data.js'

// The search results as legacy's (exhibitions-client SearchResults.vue,
// inventory-app#2379): Back; "Results of your search | <n> record(s) out of
// <total> items" beside the search box with its Search and Reset buttons
// and "Search Term Tips"; legacy's pager above and below; then the record
// in focus — its picture, name, date, holder and place — beside two columns
// of results, each a picture with the name, the place and, in italics, the
// date; resting on a picture or a name brings that record into focus. Below
// 975px the record in focus goes. Legacy ran MySQL boolean full-text search
// and sorted each page by start date; viewer-core runs the same grammar over
// the exhibition's haystack. `all-items` (legacy's) and `all-objects` are an
// empty search: every record, in the collection's order. Legacy wrote every
// word here in English on every language's page; they are the exhibition's
// own entries.
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const index = useKeywordIndex('items', { grammar: 'boolean', haystack })
const ready = ref(false)
loadEnglish().then(() => { ready.value = true })

const isAll = (term) => !term || term === 'all-items' || term === 'all-objects'

// Legacy cut a date longer than eighty characters.
const shortDate = (text) => (text && text.length > 80 ? `${text.slice(0, 80)}...` : (text ?? ''))

const spec = computed(() => ({
  entity: 'items',
  keys: ['q'],
  scope: (item) => itemById.value.has(item.id),
  narrow: (list, filters) => {
    if (!ready.value) return []
    if (isAll(filters.q)) return list
    const ids = new Set(list.map((i) => i.id))
    return index.search(filters.q).filter((i) => ids.has(i.id))
  },
  ...legacyPaging,
  sort: isAll(route.query.q) ? legacyPaging.sort : false,
  summary: () => [],
  record: (item) => {
    const text = tr('items', item.id, defaultLang)
    return {
      id: item.id,
      image: item.images?.[0]?.url ?? '',
      imageAlt: labelOf('items', item.id),
      name: renderInline(text.name ?? item.internal_name ?? ''),
      date: shortDate(text.dates),
      partner: labelOf('partners', item.partner_id),
      place: [text.location, labelOf('countries', item.country_id)].filter(Boolean).join(', '),
      start: item.start_date ?? 0,
      to: itemRoute(item),
    }
  },
}))

// Legacy sorted each page it was served by start date.
const byStart = (rows) => [...rows].sort((a, b) => a.start - b.start)

const term = ref('')
watch(() => route.query.q, (q) => { term.value = isAll(q) ? '' : String(q ?? '') }, { immediate: true })

function search() {
  router.push({ name: 'search-results', query: { q: term.value || 'all-items' } })
}
function resetSearch() {
  router.push({ name: 'search-results', query: { q: 'all-items' } })
}

// The record in focus: the first of the page until another is pointed at.
const focus = ref(null)
const narrowQuery = typeof window !== 'undefined' ? window.matchMedia('(max-width: 974px)') : null
const narrow = ref(Boolean(narrowQuery?.matches))
narrowQuery?.addEventListener('change', (event) => { narrow.value = event.matches })
function main(rows) {
  return rows.find((row) => row.id === focus.value) ?? rows[0]
}
watch(() => route.fullPath, () => { focus.value = null })
</script>

<template>
  <div class="mwnf-dxa-exhibition-search">
    <CatalogueResultsView :spec="spec" class="mwnf-dxa-exhibition-search__view">
      <template #before="{ pageInfo, goToPage }">
        <BackLink />
        <div class="mwnf-dxa-exhibition-search__header">
          <div class="mwnf-dxa-exhibition-search__info">
            <p v-if="pageInfo.total">{{ t('exhibition.search.heading') }} | {{ pageInfo.total }} {{ t('exhibition.search.recordsOutOf') }} {{ itemById.size }} {{ t('exhibition.collection.items') }}</p>
            <p v-else>{{ t('exhibition.search.heading') }} | <span>{{ t('exhibition.search.none') }}</span></p>
          </div>
          <div class="mwnf-dxa-exhibition-search__box">
            <form @submit.prevent="search()">
              <input v-model="term" class="mwnf-dxa-exhibition-search__input" type="search" :placeholder="t('exhibition.search.placeholder')" :aria-label="t('exhibition.search.placeholder')" />
              <div class="mwnf-dxa-exhibition-search__buttons">
                <button type="submit" class="mwnf-dxa-exhibition-search__button">{{ t('exhibition.search.submit') }}</button>
                <button type="button" class="mwnf-dxa-exhibition-search__button" @click="resetSearch()">{{ t('exhibition.search.reset') }}</button>
              </div>
            </form>
            <div class="mwnf-dxa-exhibition-search__tips">
              <RouterLink :to="{ name: 'search-how-to' }">{{ t('exhibition.search.tips') }}</RouterLink>
            </div>
          </div>
        </div>
        <Pages class="mwnf-dxa-exhibition-pages--top" :page-info="pageInfo" @navigate="goToPage" />
      </template>

      <template #records="{ rows }">
        <div v-if="rows.length" class="mwnf-dxa-exhibition-search__results">
          <div v-if="!narrow" class="mwnf-dxa-exhibition-search__main">
            <div class="mwnf-dxa-exhibition-search__main-photo">
              <img :src="main(byStart(rows)).image" :alt="main(byStart(rows)).imageAlt" />
            </div>
            <div class="mwnf-dxa-exhibition-search__main-text">
              <p><strong v-html="main(byStart(rows)).name"></strong></p>
              <p>{{ main(byStart(rows)).date }}</p>
              <p class="mwnf-dxa-exhibition-search__main-holder"><strong>{{ main(byStart(rows)).partner }}</strong></p>
              <p>{{ main(byStart(rows)).place }}</p>
            </div>
          </div>
          <div class="mwnf-dxa-exhibition-search__list">
            <div v-for="row in byStart(rows)" :key="row.id" class="mwnf-dxa-exhibition-search__result">
              <RouterLink :to="row.to" class="mwnf-dxa-exhibition-search__result-image">
                <img :src="row.image" :alt="row.imageAlt" loading="lazy" @mouseover="focus = row.id" />
              </RouterLink>
              <div class="mwnf-dxa-exhibition-search__result-text">
                <RouterLink :to="row.to"><strong v-html="row.name" @mouseover="focus = row.id"></strong><span>, {{ row.place }}</span></RouterLink>
                <p><em>{{ row.date }}</em></p>
              </div>
            </div>
          </div>
        </div>
        <I18nText v-else class="mwnf-dxa-exhibition-search__none" keypath="exhibition.search.noResults" />
      </template>

      <template #pagination></template>

      <template #after="{ pageInfo, goToPage }">
        <Pages v-if="pageInfo.lastPage > 1" :page-info="pageInfo" @navigate="goToPage" />
        <div v-else class="mwnf-dxa-exhibition-search__end"></div>
      </template>
    </CatalogueResultsView>
  </div>
</template>
