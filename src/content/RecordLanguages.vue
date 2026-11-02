<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

// The languages one record carries, as buttons. Picking one changes what
// the sheet is read in and nothing else — not the site language, not the
// URL; that rule is viewer-core's `useRecordLanguage`, and this only renders
// what it decides. Identical in all seven websites but for the CSS.
const props = defineProps({
  /** ['ar', 'en'] or [{ code, label }], as viewer-core's `languageLabels()` answers. */
  languages: { type: Array, default: () => [] },
  language: { type: String, default: '' },
  /** Drawn from this many languages; legacy's standalone sheet drew its band for one. */
  from: { type: Number, default: 2 },
})
const emit = defineEmits(['select'])
const { t } = useI18n()

const entries = computed(() =>
  props.languages.map((entry) => (typeof entry === 'string' ? { code: entry, label: entry.toUpperCase() } : entry)),
)
</script>

<template>
  <div v-if="entries.length && entries.length >= from" class="mwnf-languages" role="group" :aria-label="t('record.sheet.languages')">
    <button
      v-for="entry in entries"
      :key="entry.code"
      type="button"
      class="mwnf-languages__button"
      :class="{ 'mwnf-languages__button--active': entry.code === language }"
      :aria-pressed="entry.code === language ? 'true' : 'false'"
      :lang="entry.code"
      @click="emit('select', entry.code)"
    >{{ entry.label }}</button>
  </div>
</template>
