<script setup>
import SmartLink from '../content/SmartLink.vue'

// The standalone family's result tiles, legacy's `pc_all` grid
// (pclist_all.php, pm_museum_items.php): four to a row, each the record's
// picture in a 230 by 160 frame; hovering it opens a panel with the picture
// again, the name, the date line, the holder, the location and the link to
// the sheet. On a narrow screen the panel's lines stand beside the picture.
// What each line says is the website's (its spec's `record`).
//
//   rows: [{ id, to | href, image, name (inline HTML), lines: [inline HTML],
//            holder (inline HTML), location (inline HTML) }]
defineProps({
  rows: { type: Array, default: () => [] },
  /** The link to the sheet ("See Database Entry"). */
  seeLabel: { type: String, required: true },
  /** Shown when there is no row. */
  empty: { type: String, default: '' },
  /** The picture of a record that has none (a url()). */
  noImage: { type: String, default: '' },
})
</script>

<template>
  <div class="mwnf-standalone-results">
    <p v-if="!rows.length" class="mwnf-standalone-results__empty">{{ empty }}</p>
    <div v-for="row in rows" :key="row.id" class="mwnf-standalone-results__cell">
      <div class="mwnf-standalone-results__tile">
        <SmartLink class="mwnf-standalone-results__frame" :to="row.to" :href="row.href">
          <img :src="row.image || noImage" alt="">
        </SmartLink>
        <div class="mwnf-standalone-results__panel">
          <SmartLink class="mwnf-standalone-results__panel-frame" :to="row.to" :href="row.href">
            <img :src="row.image || noImage" alt="">
          </SmartLink>
          <!-- eslint-disable vue/no-v-html -- the record's own Markdown, rendered and escaped by viewer-core -->
          <p class="mwnf-standalone-results__name"><strong><SmartLink :to="row.to" :href="row.href"><span v-html="row.name"></span></SmartLink></strong></p>
          <p v-for="(line, i) in row.lines ?? []" :key="i" v-html="line"></p>
          <p v-if="row.holder" class="mwnf-standalone-results__holder"><strong v-html="row.holder"></strong></p>
          <p v-if="row.location" v-html="row.location"></p>
          <!-- eslint-enable vue/no-v-html -->
          <p><SmartLink class="mwnf-standalone-results__see" :to="row.to" :href="row.href">{{ seeLabel }}</SmartLink></p>
        </div>
      </div>
    </div>
  </div>
</template>
