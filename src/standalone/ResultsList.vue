<script setup>
import { computed, ref } from 'vue'
import SmartLink from '../content/SmartLink.vue'

// The standalone family's search results, legacy's `database_listing`
// (database_results.php): in col-md-3 the preview of a record — its
// picture, its name, its date line, its holder and its location — the
// first one's until another one's picture or words are hovered; in
// col-md-9 the records two to a row, each its picture in a 154 by 122
// frame beside the name and place, and the date in italics under them.
// What each line says is the website's (its spec's `record`).
//
//   rows: [{ id, to | href, image, name (inline HTML), place (inline HTML),
//            dates (inline HTML),
//            preview: { lines: [inline HTML], holder (inline HTML),
//                       location (inline HTML) } }]
const props = defineProps({
  rows: { type: Array, default: () => [] },
  /** Shown when there is no row. */
  empty: { type: String, default: '' },
  /** The picture of a record that has none (a url()). */
  noImage: { type: String, default: '' },
})

const hovered = ref(null)
const shown = computed(() => hovered.value ?? props.rows[0] ?? null)
</script>

<template>
  <div class="mwnf-standalone-list">
    <div class="mwnf-standalone-list__aside">
      <div v-if="shown" class="mwnf-standalone-list__preview">
        <div class="mwnf-standalone-list__preview-picture">
          <img v-if="shown.image || noImage" :src="shown.image || noImage" alt="">
        </div>
        <!-- eslint-disable vue/no-v-html -- the record's own Markdown, rendered and escaped by viewer-core -->
        <p class="mwnf-standalone-list__preview-name"><strong v-html="shown.name"></strong></p>
        <p v-for="(line, i) in shown.preview?.lines ?? []" :key="i" v-html="line"></p>
        <p v-if="shown.preview?.holder"><strong v-html="shown.preview.holder"></strong></p>
        <p v-if="shown.preview?.location" v-html="shown.preview.location"></p>
        <!-- eslint-enable vue/no-v-html -->
      </div>
    </div>
    <div class="mwnf-standalone-list__records">
      <p v-if="!rows.length" class="mwnf-standalone-list__empty">{{ empty }}</p>
      <div v-for="row in rows" :key="row.id" class="mwnf-standalone-list__cell">
        <div class="mwnf-standalone-list__frame">
          <SmartLink :to="row.to" :href="row.href" @mouseenter="hovered = row" @mouseleave="hovered = null">
            <img v-if="row.image || noImage" :src="row.image || noImage" alt="">
          </SmartLink>
        </div>
        <div class="mwnf-standalone-list__content">
          <!-- eslint-disable vue/no-v-html -- the record's own Markdown, rendered and escaped by viewer-core -->
          <p><SmartLink :to="row.to" :href="row.href" @mouseenter="hovered = row" @mouseleave="hovered = null"><span class="mwnf-standalone-list__name" v-html="`${row.name},`"></span> <span v-html="row.place"></span></SmartLink></p>
          <div v-if="row.dates"><i v-html="row.dates"></i></div>
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </div>
    </div>
  </div>
</template>
