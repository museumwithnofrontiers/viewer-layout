<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'

// A DXA site's pages of records as legacy's PagesComponent, the same in both
// families' clients (dxa-client and exhibitions-client, inventory-app#2379):
// "<< First", "< Previous", up to fifteen page numbers with the current one in
// their middle (eleven, nine or five on a narrower screen), "Next >",
// "Last >>"; the words go below 500px. Legacy wrote them in English on every
// language's page; they are the family's own entries (`<family>.pages.*`),
// and its classes `mwnf-dxa-<family>-pages`, each family's stylesheet drawing
// its own. Like legacy, the screen is read once.
const props = defineProps({
  pageInfo: { type: Object, required: true },
  /** `exhibition` or `gallery`: whose entries and classes. */
  family: { type: String, default: 'exhibition' },
})
const emit = defineEmits(['navigate'])
const { t } = useI18n()

const block = computed(() => `mwnf-dxa-${props.family}-pages`)
const word = (name) => t(`${props.family}.pages.${name}`)

const narrower = (px) => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(`(max-width: ${px}px)`).matches
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
  <div v-if="last > 1" :class="block">
    <button type="button" :class="[`${block}__button`, { 'is-disabled': disabled(1) }]" :disabled="disabled(1)" @click="go(1)">
      &lt;&lt;<span v-if="!lessThan499">{{ ' ' + word('first') }}</span>
    </button>
    <button type="button" :class="[`${block}__button`, { 'is-disabled': disabled(current - 1) }]" :disabled="disabled(current - 1)" @click="go(current - 1)">
      &lt;<span v-if="!lessThan499">{{ ' ' + word('previous') }}</span>
    </button>
    <div :class="`${block}__numbers`">
      <button
        v-for="page in pages"
        :key="page"
        type="button"
        :class="[`${block}__button`, { 'is-disabled': disabled(page) }]"
        :disabled="disabled(page)"
        :aria-current="page === current ? 'page' : undefined"
        @click="go(page)"
      >
        {{ page }}
      </button>
    </div>
    <button type="button" :class="[`${block}__button`, { 'is-disabled': disabled(current + 1) }]" :disabled="disabled(current + 1)" @click="go(current + 1)">
      <span v-if="!lessThan499">{{ word('next') + ' ' }}</span>&gt;
    </button>
    <button type="button" :class="[`${block}__button`, { 'is-disabled': disabled(last) }]" :disabled="disabled(last)" @click="go(last)">
      <span v-if="!lessThan499">{{ word('last') + ' ' }}</span>&gt;&gt;
    </button>
  </div>
</template>
