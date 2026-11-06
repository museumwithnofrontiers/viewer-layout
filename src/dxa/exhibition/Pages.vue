<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'

// An exhibition's pages of records as legacy's PagesComponent
// (exhibitions-client, inventory-app#2379): "<< First", "< Previous", up to
// fifteen page numbers with the current one in their middle (eleven, nine
// or five on a narrower screen), "Next >", "Last >>"; the words go below
// 500px. Legacy wrote them in English on every language's page; they are
// the exhibition's own entries. Like legacy, the screen is read once.
const props = defineProps({
  pageInfo: { type: Object, required: true },
})
const emit = defineEmits(['navigate'])
const { t } = useI18n()

const narrower = (px) => typeof window !== 'undefined' && window.matchMedia(`(max-width: ${px}px)`).matches
const lessThan499 = narrower(499)
const [middle, lesserHalf, maximum] = narrower(599) ? [3, 2, 5] : narrower(724) ? [5, 4, 9] : narrower(849) ? [6, 5, 11] : [8, 7, 15]

const current = computed(() => props.pageInfo?.currentPage ?? 1)
const last = computed(() => props.pageInfo?.lastPage ?? 1)

// Legacy's setRange: the window keeps its size, the current page in its
// middle once past it, and slides back from the last page.
const pages = computed(() => {
  let min = 1
  let max = last.value
  if (last.value > maximum) {
    const mid = current.value
    if (mid > middle) min = mid - lesserHalf
    if (mid + lesserHalf < last.value) {
      max = min <= lesserHalf && mid <= lesserHalf ? maximum : mid + lesserHalf
    } else {
      min = last.value - (maximum - 1)
      max = last.value
    }
  }
  const out = []
  for (let page = min; page <= max; page++) out.push(page)
  return out
})

const disabled = (page) => page < 1 || page > last.value || page === current.value

function go(page) {
  if (!disabled(page)) emit('navigate', page)
}
</script>

<template>
  <div v-if="last > 1" class="mwnf-dxa-exhibition-pages">
    <button type="button" class="mwnf-dxa-exhibition-pages__button" :class="{ 'is-disabled': disabled(1) }" :disabled="disabled(1)" @click="go(1)">
      &lt;&lt;<span v-if="!lessThan499">{{ ' ' + t('exhibition.pages.first') }}</span>
    </button>
    <button type="button" class="mwnf-dxa-exhibition-pages__button" :class="{ 'is-disabled': disabled(current - 1) }" :disabled="disabled(current - 1)" @click="go(current - 1)">
      &lt;<span v-if="!lessThan499">{{ ' ' + t('exhibition.pages.previous') }}</span>
    </button>
    <div class="mwnf-dxa-exhibition-pages__numbers">
      <button
        v-for="page in pages"
        :key="page"
        type="button"
        class="mwnf-dxa-exhibition-pages__button"
        :class="{ 'is-disabled': disabled(page) }"
        :disabled="disabled(page)"
        :aria-current="page === current ? 'page' : undefined"
        @click="go(page)"
      >
        {{ page }}
      </button>
    </div>
    <button type="button" class="mwnf-dxa-exhibition-pages__button" :class="{ 'is-disabled': disabled(current + 1) }" :disabled="disabled(current + 1)" @click="go(current + 1)">
      <span v-if="!lessThan499">{{ t('exhibition.pages.next') + ' ' }}</span>&gt;
    </button>
    <button type="button" class="mwnf-dxa-exhibition-pages__button" :class="{ 'is-disabled': disabled(last) }" :disabled="disabled(last)" @click="go(last)">
      <span v-if="!lessThan499">{{ t('exhibition.pages.last') + ' ' }}</span>&gt;&gt;
    </button>
  </div>
</template>
