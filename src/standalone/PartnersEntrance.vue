<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { md } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// The standalone family's Partners entrance, legacy's partners.php: one row a
// project, its name in italics on the site's picture box, beside it a blank
// line, "About" on the right and the project's links one under another.
// "About" opens the project's text over the dimmed page (legacy's
// `#quick-view`), closed by its × or a click on the page. Legacy keeps this
// page left to right in Arabic too, each text running in its own direction.
//
//   projects: [{ name, about, links: [{ label, to | href }] }]   // about: Markdown
//   aboutLabel: the "About" link's words; closeLabel: the ×'s accessible name
const props = defineProps({
  projects: { type: Array, default: () => [] },
  aboutLabel: { type: String, default: '' },
  closeLabel: { type: String, default: '' },
})

const rows = computed(() => props.projects.map((project) => ({ ...project, aboutHtml: project.about ? md(project.about) : '' })))

const open = ref(-1)
function close() {
  open.value = -1
}
function onKey(event) {
  if (event.key === 'Escape') close()
}
watch(open, (index) => {
  if (typeof document === 'undefined') return
  if (index >= 0) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="mwnf-standalone-pe">
    <div v-if="open >= 0" class="mwnf-standalone-pe__shade" @click="close"></div>
    <div v-for="(project, index) in rows" :key="index" class="mwnf-standalone-pe__row">
      <div class="mwnf-standalone-pe__box">
        <h3 class="mwnf-standalone-pe__name">{{ project.name }}</h3>
      </div>
      <div class="mwnf-standalone-pe__links">
        <p aria-hidden="true">&nbsp;</p>
        <p v-if="project.aboutHtml" class="mwnf-standalone-pe__about">
          <button type="button" :aria-expanded="open === index" @click="open = index">{{ aboutLabel }}</button>
        </p>
        <div v-if="open === index" class="mwnf-standalone-pe__popup" role="dialog">
          <button type="button" class="mwnf-standalone-pe__close" :aria-label="closeLabel || undefined" @click="close">
            <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
              <mask :id="`mwnf-standalone-pe-x${index}`">
                <rect width="24" height="24" fill="#fff" />
                <path d="M8 8l8 8M16 8l-8 8" stroke="#000" stroke-width="3" stroke-linecap="round" />
              </mask>
              <circle cx="12" cy="12" r="12" fill="currentColor" :mask="`url(#mwnf-standalone-pe-x${index})`" />
            </svg>
          </button>
          <div class="mwnf-standalone-pe__text" v-html="project.aboutHtml"></div>
        </div>
        <p v-for="link in project.links" :key="link.label">
          <SmartLink :to="link.to" :href="link.href">{{ link.label }}</SmartLink>
        </p>
      </div>
    </div>
  </div>
</template>
