<script setup>
import { computed } from 'vue'
import { renderBlock, useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// One of a standalone site's text pages, in legacy's centred column
// (`isl_missionstatement.php`, `recommendedlinks.php`): the shell's banner
// carries its title; here, the body, an optional "→" link under it, and the
// print link. `dropCap` opens the text with a large initial, as legacy's
// mission statement does — never on a right-to-left page.
//
//   body: entry (Markdown), link: { label: entry or text: string, to | href }, print: entry
const props = defineProps({
  body: { type: String, required: true },
  link: { type: Object, default: null },
  print: { type: String, default: '' },
  dropCap: { type: Boolean, default: false },
})
const { t } = useI18n()
const html = computed(() => renderBlock(t(props.body)))

function printPage() {
  window.print()
}
</script>

<template>
  <article class="mwnf-standalone-page" :class="{ 'mwnf-standalone-page--drop-cap': dropCap }">
    <div class="mwnf-standalone-page__body" v-html="html"></div>
    <p v-if="link" class="mwnf-standalone-page__link">
      <SmartLink :to="link.to" :href="link.href"><strong>{{ link.text ?? t(link.label) }}</strong></SmartLink>
    </p>
    <p v-if="print" class="mwnf-standalone-page__print">
      <button type="button" class="mwnf-standalone-page__print-button" @click="printPage">{{ t(print) }}</button>
    </p>
  </article>
</template>
