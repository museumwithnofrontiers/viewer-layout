<script setup>
// Legacy's category page (CategoryPage.vue, `/category/<name>/<page>`): the
// category's name, the pagination over and under the list, twelve tiles a
// page, each with its authors. The page is the address's `page` query.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paginate, useI18n } from '@museumwnf/viewer-core'
import { usePublications } from './data.js'
import Pagination from './Pagination.vue'
import { categoryBySlug, inCategory, PAGE_SIZE } from './rules.js'
import Tile from './Tile.vue'

const props = defineProps({
  category: { type: String, required: true },
})
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const data = usePublications({ tiles: true })

const entry = computed(() => categoryBySlug(props.category, data.categories.value))
const pageInfo = computed(() => paginate(entry.value ? data.inCategory(entry.value, inCategory) : [], route.query.page ?? 1, PAGE_SIZE))
const tiles = computed(() => pageInfo.value.rows.map((publication) => data.tile(publication)))

function navigate(page) {
  router.push({ query: { ...route.query, page: String(page) } })
}
</script>

<template>
  <div class="mwnf-books-list mwnf-books-category">
    <template v-if="entry">
      <h1 class="mwnf-books-list__title">{{ t(entry.label) }}</h1>
      <Pagination :page-info="pageInfo" @navigate="navigate" />
      <div class="mwnf-books-list__tiles">
        <Tile v-for="tile in tiles" :key="tile.id" :tile="tile" variant="category" />
      </div>
      <Pagination :page-info="pageInfo" @navigate="navigate" />
    </template>
    <p v-else class="mwnf-books-list__empty">{{ t('core.notFound.page') }}</p>
  </div>
</template>
