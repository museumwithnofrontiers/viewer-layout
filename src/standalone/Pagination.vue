<script setup>
import { computed } from 'vue'

// The standalone family's pagination, legacy's `page_listing`
// (pclist_all.php, pm_museum_items.php): "Previous", the page numbers, then
// "Next", centred under the results. Legacy listed the pages in blocks of
// twenty (1 to 20, then 21 to 40…), the current page underlined; "Previous"
// and "Next" are plain words on the first and the last page. The words are
// the website's (legacy's own).
//
// `pageInfo` is what viewer-core's `paginate()` answers:
// { total, lastPage, currentPage, from, to, rows }.
const props = defineProps({
  pageInfo: { type: Object, required: true },
  previousLabel: { type: String, required: true },
  nextLabel: { type: String, required: true },
  /** How many page numbers a block lists. */
  block: { type: Number, default: 20 },
})
const emit = defineEmits(['navigate'])

const current = computed(() => props.pageInfo?.currentPage ?? 1)
const last = computed(() => props.pageInfo?.lastPage ?? 1)

const pages = computed(() => {
  const size = Math.max(1, props.block)
  const first = Math.floor((current.value - 1) / size) * size + 1
  const out = []
  for (let page = first; page <= Math.min(last.value, first + size - 1); page++) out.push(page)
  return out
})

function go(page) {
  if (page >= 1 && page <= last.value && page !== current.value) emit('navigate', page)
}
</script>

<template>
  <nav v-if="last > 1" class="mwnf-standalone-pages">
    <span class="mwnf-standalone-pages__previous">
      <a v-if="current > 1" href="#" @click.prevent="go(current - 1)">{{ previousLabel }}</a>
      <template v-else>{{ previousLabel }}</template>
    </span>
    <a
      v-for="page in pages"
      :key="page"
      href="#"
      class="mwnf-standalone-pages__number"
      :class="{ 'mwnf-standalone-pages__number--active': page === current }"
      :aria-current="page === current ? 'page' : undefined"
      @click.prevent="go(page)"
    >{{ page }}</a>
    <span class="mwnf-standalone-pages__next">
      <a v-if="current < last" href="#" @click.prevent="go(current + 1)">{{ nextLabel }}</a>
      <template v-else>{{ nextLabel }}</template>
    </span>
  </nav>
</template>
