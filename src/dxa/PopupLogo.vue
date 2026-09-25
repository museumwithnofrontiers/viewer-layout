<script setup>
import { computed, ref } from 'vue'
import { renderInline } from '@museumwnf/viewer-core'

// A dismissible modal popup with logo or sponsor content. The popup is shown
// when enabled is true; the user can dismiss it with the close button. The
// content can be:
//
// 1. Markdown (default): rendered through viewer-core's `renderInline` pipeline,
//    which escapes HTML and converts Markdown syntax.
// 2. Raw HTML (opt-in): when `rawHtml` is true, the content is inserted as-is,
//    bypassing escaping. This should only be used when the HTML is trusted
//    (e.g., from the importer, after conversion from legacy HTML).
const props = defineProps({
  // Markdown or raw HTML content, depending on `rawHtml` setting
  content: { type: String, default: '' },
  // When true, `content` is rendered as raw HTML; when false (default), as Markdown
  rawHtml: { type: Boolean, default: false },
  // Controls whether the popup is shown at all
  enabled: { type: Boolean, default: true },
  closeLabel: { type: String, default: 'core.action.close' },
})

const dismissed = ref(false)

const renderedContent = computed(() => {
  if (props.rawHtml) {
    // Trust the HTML; the caller owns the security boundary.
    return props.content
  }
  // Render Markdown through the escaping pipeline.
  return renderInline(props.content)
})

const visible = computed(() => props.enabled && !!props.content && !dismissed.value)
</script>

<template>
  <div v-if="visible" class="mwnf-popup-logo">
    <button class="mwnf-popup-logo__close" :aria-label="$t(closeLabel)" @click="dismissed = true">✕</button>
    <div v-if="rawHtml" class="mwnf-popup-logo__content" v-html="renderedContent"></div>
    <div v-else class="mwnf-popup-logo__content" v-html="renderedContent"></div>
  </div>
</template>
