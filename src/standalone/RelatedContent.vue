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
// Then legacy's "See also" (`seeAlso`, which the item sheet builds from the
// record's links): its heading, its links, and groups of links under a
// heading of their own — Discover Islamic Art's "Related MWNF Travel Book",
// Discover Baroque Art's exhibition trails (inventory-app#2538). Legacy's
// tours are not linked: no site carries them.
//
//   records: the related rows RecordView makes ({ id, image, imageAlt, name, badge, to })
//   groups: [{ heading: entry, type }]   // which rows go under which heading, by `badge`
//   seeAlso: { heading: entry, links: [{ label: entry, href }], groups: [{ heading: entry, links: [{ text, href }] }] }
//   download: { heading: entry, print: entry, word: entry, title: entry }
//     // "Download", "As PDF" (the browser's print), "As Word (text only)":
//     // the sheet's texts as legacy's export.php document, titled `title`
//   wordFile: the Word file's name (legacy's: the record's key, `;` as `_`)
const props = defineProps({
  heading: { type: String, default: 'record.related.title' },
  records: { type: Array, default: () => [] },
  groups: { type: Array, default: () => [] },
  seeAlso: { type: Object, default: null },
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
    <div v-if="seeAlso" class="mwnf-standalone-related__see-also">
      <p class="mwnf-standalone-related__see-also-heading"><strong><br>{{ t(seeAlso.heading) }}</strong></p>
      <a
        v-for="link in seeAlso.links ?? []"
        :key="link.href"
        class="mwnf-standalone-related__see-also-link"
        :href="link.href"
        target="_blank"
        rel="noopener"
      >{{ t(link.label) }}</a>
      <div v-for="group in seeAlso.groups ?? []" :key="group.heading" class="mwnf-standalone-related__see-also-group">
        <p>{{ t(group.heading) }}</p>
        <p v-for="link in group.links" :key="link.href"><a :href="link.href">{{ link.text }}</a></p>
      </div>
    </div>
    <div v-if="download" class="mwnf-standalone-related__download">
      <p class="mwnf-standalone-related__download-heading">{{ t(download.heading) }}</p>
      <button type="button" class="mwnf-standalone-related__print" @click="print">{{ t(download.print) }}</button>
      <button v-if="download.word" type="button" class="mwnf-standalone-related__print mwnf-standalone-related__word" @click="word">{{ t(download.word) }}</button>
    </div>
  </aside>
</template>
