<script setup>
// Legacy's PagesComponent: "<< First", "< Previous", the page numbers, "Next >",
// "Last >>", each a button, disabled where it would stay on the page. Legacy
// drew it only when there was more than one page (setDisplayPageNavigation).
//
// `pageInfo` is viewer-core's `paginate()` answer.
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'

const props = defineProps({
  pageInfo: { type: Object, required: true },
})
const emit = defineEmits(['navigate'])
const { t } = useI18n()

const current = computed(() => props.pageInfo.currentPage)
const last = computed(() => props.pageInfo.lastPage)
const pages = computed(() => Array.from({ length: last.value }, (_, i) => i + 1))
const disabled = (page) => page < 1 || page > last.value || page === current.value

function go(page) {
  if (!disabled(page)) emit('navigate', page)
}
</script>

<template>
  <nav v-if="last > 1" class="mwnf-books-pages">
    <button type="button" class="mwnf-books-pages__button" :disabled="disabled(1)" @click="go(1)">&lt;&lt; {{ t('publications.pagination.first') }}</button>
    <button type="button" class="mwnf-books-pages__button" :disabled="disabled(current - 1)" @click="go(current - 1)">&lt; {{ t('publications.pagination.previous') }}</button>
    <span class="mwnf-books-pages__numbers">
      <button
        v-for="page in pages"
        :key="page"
        type="button"
        class="mwnf-books-pages__button"
        :disabled="disabled(page)"
        :aria-current="page === current ? 'page' : undefined"
        @click="go(page)"
      >{{ page }}</button>
    </span>
    <button type="button" class="mwnf-books-pages__button" :disabled="disabled(current + 1)" @click="go(current + 1)">{{ t('publications.pagination.next') }} &gt;</button>
    <button type="button" class="mwnf-books-pages__button" :disabled="disabled(last)" @click="go(last)">{{ t('publications.pagination.last') }} &gt;&gt;</button>
  </nav>
</template>
