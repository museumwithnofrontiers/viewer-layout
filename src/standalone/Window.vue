<script setup>
// One of legacy's windows (`#hcr_timeline .modal-content`: the Glossary &
// Spelling tool, the timeline for an item), opened by `window.open` from a
// page and drawn on a route marked `meta.bare`: the heading in the band,
// the × that closes the window, the content in its scrolling article.
defineProps({
  heading: { type: String, default: '' },
  /** The ×'s accessible name. */
  closeLabel: { type: String, default: '' },
  /** The window's direction, when legacy's was not the site's (Islamic Art's Arabic windows stayed left to right). */
  dir: { type: String, default: '' },
})

// Legacy's `closew()`: back to the page that opened it, then closed. A window
// the browser did not open by script stays open; its history goes back.
function close() {
  if (window.opener) {
    window.opener.focus()
    window.close()
  } else {
    window.history.back()
  }
}
</script>

<template>
  <div class="mwnf-standalone-window" :dir="dir || undefined">
    <div class="mwnf-standalone-window__box">
      <header class="mwnf-standalone-window__header">
        <h1 class="mwnf-standalone-window__heading">{{ heading }}</h1>
        <button type="button" class="mwnf-standalone-window__close" :aria-label="closeLabel || undefined" @click="close">×</button>
      </header>
      <article class="mwnf-standalone-window__article">
        <slot />
      </article>
    </div>
  </div>
</template>
