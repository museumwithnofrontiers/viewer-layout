<script setup>
import { ref, watch } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

// The record's short description folded behind its toggle, after the section
// it follows (`spec.shortDescriptionAfter` naming a section rather than a
// row): legacy's "View Short Description" under the Description. A row keeps
// its toggle in RecordSheet.
const props = defineProps({
  /** Rendered HTML of the short description. */
  html: { type: String, required: true },
  dir: { type: String, default: undefined },
})
const { t } = useI18n()
const open = ref(false)
watch(() => props.html, () => { open.value = false })
</script>

<template>
  <div class="mwnf-sheet__short" :dir="dir">
    <button type="button" class="mwnf-sheet__toggle" :aria-expanded="open ? 'true' : 'false'" @click="open = !open">
      {{ open ? t('record.action.hideShortDescription') : t('record.action.viewShortDescription') }}
    </button>
    <!-- eslint-disable-next-line vue/no-v-html -- the record's own Markdown, rendered and escaped by viewer-core -->
    <div v-if="open" class="mwnf-sheet__block" v-html="html"></div>
  </div>
</template>
