<script setup>
import { computed } from 'vue'
import SmartLink from '../content/SmartLink.vue'
import StandalonePagination from './Pagination.vue'
import { downloadWord, timelineDocument } from './wordExport.js'

// The standalone family's Timeline results, legacy's hcr_result.php: the
// coloured band with the search in words ("Timeline | 1000 A.D. to 1200
// A.D. | EGYPT") and its three lists, which search again as soon as one
// changes; the way back; the Date and Country | Description headings; one
// row an event (its date on a strip over a rule, its country on a strip,
// its description); legacy's pages; and beside them the Related Content
// column, "See Gallery" when the period has records, and the downloads:
// "As PDF" is the browser's print, "As Word (text only)" every event of the
// search as legacy's export_hcr_content.php wrote it. Every word is the
// website's.
//
//   selects: [{ key, label, value, options: [{ value, label }] }]   // legacy's order: start, end, country
//   rows: [{ id, date, country, html }]                             // `html` the description, rendered
//   all: every row of the search, for the Word file (defaults to `rows`)
//   related: { heading, gallery: { label, to, title } } | null
//   download: { heading, pdf, word, file, title, heading line for the file }
const props = defineProps({
  heading: { type: String, default: '' },
  summary: { type: String, default: '' },
  selects: { type: Array, default: () => [] },
  back: { type: Array, default: () => [] },
  heads: { type: Object, default: () => ({}) },
  rows: { type: Array, default: () => [] },
  all: { type: Array, default: null },
  empty: { type: String, default: '' },
  pageInfo: { type: Object, default: null },
  previousLabel: { type: String, default: '' },
  nextLabel: { type: String, default: '' },
  related: { type: Object, default: null },
  download: { type: Object, default: null },
})
const emit = defineEmits(['change', 'navigate'])

const hasRows = computed(() => props.rows.length > 0)

function print() {
  window.print()
}

function word(event) {
  const page = event.currentTarget.closest('.mwnf-standalone-tlr')
  downloadWord(
    timelineDocument({
      title: props.download?.title ?? '',
      heading: props.download?.line ?? '',
      heads: props.heads,
      rows: props.all ?? props.rows,
      empty: props.empty,
      dir: page ? getComputedStyle(page).direction : '',
    }),
    props.download?.file ?? 'timeline.doc',
  )
}
</script>

<template>
  <div class="mwnf-standalone-tlr">
    <section class="mwnf-standalone-tlr__band">
      <div class="mwnf-standalone-tlr__band-inner">
        <p class="mwnf-standalone-tlr__summary"><b>{{ heading }}</b> | {{ summary }}</p>
        <div class="mwnf-standalone-tlr__selects">
          <p v-for="select in selects" :key="select.key">
            <label :for="`mwnf-tlr-${select.key}`">{{ select.label }}</label>
            <select :id="`mwnf-tlr-${select.key}`" :value="select.value" @change="emit('change', { key: select.key, value: $event.target.value })">
              <option v-for="option in select.options" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </p>
        </div>
      </div>
    </section>

    <p class="mwnf-standalone-item__back mwnf-standalone-tlr__back">
      <template v-for="link in back" :key="link.label">
        <button v-if="link.history" type="button" class="mwnf-standalone-item__back-link" @click="$router.back()">{{ link.label }}</button>
        <SmartLink v-else class="mwnf-standalone-item__back-link" :to="link.to" :href="link.href">{{ link.label }}</SmartLink>
      </template>
    </p>

    <div v-if="hasRows" class="mwnf-standalone-tlr__heads">
      <h3>{{ heads.date }}</h3>
      <h3>{{ heads.countryDescription }}</h3>
    </div>
    <div class="mwnf-standalone-tlr__body">
      <div class="mwnf-standalone-tlr__list">
        <div v-for="row in rows" :key="row.id" class="mwnf-standalone-tlr__row">
          <div class="mwnf-standalone-tlr__date"><p><span>{{ row.date }}</span></p></div>
          <div class="mwnf-standalone-tlr__content">
            <p><span>{{ row.country }}</span></p>
            <div v-html="row.html"></div>
          </div>
        </div>
        <p v-if="!hasRows" class="mwnf-standalone-tlr__empty">{{ empty }}</p>
        <StandalonePagination
          v-if="pageInfo"
          :page-info="pageInfo"
          :previous-label="previousLabel"
          :next-label="nextLabel"
          @navigate="emit('navigate', $event)"
        />
      </div>

      <aside class="mwnf-standalone-tlr__related">
        <div v-if="related" class="mwnf-standalone-tlr__panel">
          <p><strong>{{ related.heading }}</strong></p>
          <p v-if="related.gallery">
            <SmartLink class="mwnf-standalone-tlr__link" :to="related.gallery.to" :title="related.gallery.title">{{ related.gallery.label }}</SmartLink>
          </p>
        </div>
        <div v-if="download" class="mwnf-standalone-tlr__panel">
          <p class="mwnf-standalone-tlr__download">{{ download.heading }}</p>
          <p><a href="#" class="mwnf-standalone-tlr__link" @click.prevent="print">{{ download.pdf }}</a></p>
          <p><a href="#" class="mwnf-standalone-tlr__link" @click.prevent="word">{{ download.word }}</a></p>
        </div>
      </aside>
    </div>
  </div>
</template>
