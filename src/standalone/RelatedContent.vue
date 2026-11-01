<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'
import { downloadWord, sheetDocument } from './wordExport.js'

// The coloured Related Content column of a standalone item sheet
// (`database_item.php`'s `.item_colr_bg`): the heading in capitals, the
// related records as thumbnails grouped by type, whatever the site adds
// (its default slot: the artistic introduction, the timeline, the
// dynasties, where the record is on display), then the download links.
//
//   records: the related rows RecordView makes ({ id, image, imageAlt, name, badge, to })
//   groups: [{ heading: entry, type }]   // which rows go under which heading, by `badge`
//   download: { heading: entry, print: entry, word: entry, title: entry }
//     // "Download", "As PDF" (the browser's print), "As Word (text only)":
//     // the sheet's texts as legacy's export.php document, titled `title`
//   wordFile: the Word file's name (legacy's: the record's key, `;` as `_`)
const props = defineProps({
  heading: { type: String, default: 'record.related.title' },
  records: { type: Array, default: () => [] },
  groups: { type: Array, default: () => [] },
  download: { type: Object, default: null },
  wordFile: { type: String, default: 'sheet.doc' },
})
const { t } = useI18n()

const shown = computed(() => props.groups
  .map((group) => ({
    heading: t(group.heading),
    rows: props.records.filter((row) => !group.type || row.badge === group.type),
  }))
  .filter((group) => group.rows.length))

function print() {
  window.print()
}

function word(event) {
  const sheet = event.currentTarget.closest('.mwnf-standalone-item')
  if (!sheet) return
  const html = sheetDocument(sheet.querySelector('.mwnf-record__main') ?? sheet, {
    title: props.download?.title ? t(props.download.title) : '',
    dir: getComputedStyle(sheet).direction,
  })
  downloadWord(html, props.wordFile)
}
</script>

<template>
  <aside class="mwnf-standalone-related">
    <p class="mwnf-standalone-related__heading"><strong>{{ t(heading) }}</strong></p>
    <div v-for="group in shown" :key="group.heading" class="mwnf-standalone-related__group">
      <p class="mwnf-standalone-related__group-heading">{{ group.heading }}</p>
      <ul class="mwnf-standalone-related__thumbs">
        <li v-for="row in group.rows" :key="row.id">
          <SmartLink :to="row.to" :title="row.imageAlt">
            <img v-if="row.image" :src="row.image" :alt="row.imageAlt" />
            <span v-else v-html="row.name"></span>
          </SmartLink>
        </li>
      </ul>
    </div>
    <slot />
    <div v-if="download" class="mwnf-standalone-related__download">
      <p class="mwnf-standalone-related__download-heading">{{ t(download.heading) }}</p>
      <button type="button" class="mwnf-standalone-related__print" @click="print">{{ t(download.print) }}</button>
      <button v-if="download.word" type="button" class="mwnf-standalone-related__print mwnf-standalone-related__word" @click="word">{{ t(download.word) }}</button>
    </div>
  </aside>
</template>
