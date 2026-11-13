<script setup>
// Legacy's search results (ResultsPage.vue, `/results`): "Search Results",
// and "for "<the terms>"" — what the visitor typed and chose, joined by
// commas — the pagination over and under the tiles, twelve a page. A tile
// shows the book in the language searched for, else in its main language.
// A search that found nothing says so; an empty one asks for terms.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paginate, useDataPackage, useI18n } from '@museumwnf/viewer-core'
import { usePublications } from './data.js'
import Pagination from './Pagination.vue'
import { FORMATS, hasSearch, PAGE_SIZE, SEARCH_KEYS, searchPublications } from './rules.js'
import Tile from './Tile.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const query = computed(() => Object.fromEntries(SEARCH_KEYS.map((key) => [key, typeof route.query[key] === 'string' ? route.query[key] : ''])))
// Every language a title or an author may be searched in.
const { availableLanguages } = useDataPackage()
const data = usePublications({ languagesToLoad: () => availableLanguages('publications') })

const searching = computed(() => hasSearch(query.value))
const textsOf = (publication) => (publication.languages ?? []).map((code) => data.text(publication, code))
const found = computed(() => searchPublications(data.publications.value, query.value, { editionById: data.editionById.value, textsOf }))
const pageInfo = computed(() => paginate(found.value, route.query.page ?? 1, PAGE_SIZE))
const tiles = computed(() => pageInfo.value.rows.map((publication) => data.tile(publication, query.value.language || null)))

// The terms, as legacy's header joined them: the typed words and the chosen options' names.
const terms = computed(() => {
  const q = query.value
  const subject = (data.tags.value ?? []).find((tag) => tag.id === q.subject)
  const format = FORMATS.find((entry) => entry.value === q.type)
  return [
    q.title, q.author, q.isbn,
    q.language ? data.languageName(q.language, 'en') : '',
    q.country ? data.countryName(q.country) : '',
    subject ? subject.description ?? subject.internal_name : '',
    format ? t(format.label) : '',
    q.publisher,
  ].filter(Boolean).join(', ')
})

function navigate(page) {
  router.push({ query: { ...route.query, page: String(page) } })
}
</script>

<template>
  <div class="mwnf-books-list mwnf-books-results">
    <h1 class="mwnf-books-list__title">
      <span>{{ t('publications.results.title') }}</span>
      <span v-if="terms">{{ ` ${t('publications.results.for')} "${terms}"` }}</span>
    </h1>
    <Pagination :page-info="pageInfo" @navigate="navigate" />
    <div v-if="tiles.length" class="mwnf-books-list__tiles">
      <Tile v-for="tile in tiles" :key="tile.id" :tile="tile" variant="results" />
    </div>
    <p v-else-if="searching" class="mwnf-books-list__empty">{{ t('publications.results.none') }}</p>
    <p v-else class="mwnf-books-list__empty">{{ t('publications.results.reset') }}</p>
    <Pagination :page-info="pageInfo" @navigate="navigate" />
  </div>
</template>
