<script setup>
import { ref } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../../content/SmartLink.vue'

// The galleries' tile grid, as legacy's ObjectGrid.vue (dxa-client,
// inventory-app#2423), on every page of objects: the collection and search
// results, the timeline gallery, a partner's objects. Four tiles a row, each
// a picture in a 175px frame; hovering one opens its card over it — the
// picture again, linked, then the name, the date, the holder, the place,
// "for <project>" and See Database Entry. A narrow screen lists them, each
// card beside its picture. `rows` are the gallery's tiles (viewer-core's
// `tile()`).
//
// The exhibitions' pages of objects draw legacy's exhibitions-client
// ObjectGrid: the same grid in the exhibition's colours (`family` set to
// `exhibition`), where a row with no project prints no "for" line, the
// "for" is the exhibition's own entry, and a monument prints no date (its
// tile reads the object's date, which a monument has not).
defineProps({
  rows: { type: Array, default: () => [] },
  family: { type: String, default: 'gallery' },
})

const { t } = useI18n()
const open = ref(-1)
</script>

<template>
  <div class="mwnf-dxa-grid" :class="{ 'mwnf-dxa-grid--exhibition': family === 'exhibition' }">
    <div
      v-for="(row, index) in rows"
      :key="row.id"
      class="mwnf-dxa-grid__entry"
      @mouseenter="open = index"
      @mouseleave="open = -1"
    >
      <div class="mwnf-dxa-grid__frame">
        <img class="mwnf-dxa-grid__image" :src="row.image" :alt="row.imageAlt" loading="lazy" />
      </div>
      <div class="mwnf-dxa-grid__card" :class="{ 'mwnf-dxa-grid__card--open': open === index }">
        <SmartLink class="mwnf-dxa-grid__card-image" :to="row.to" tabindex="-1">
          <img :src="row.image" :alt="row.imageAlt" loading="lazy" />
        </SmartLink>
        <div class="mwnf-dxa-grid__text">
          <p class="mwnf-dxa-grid__name" v-html="row.name"></p>
          <p class="mwnf-dxa-grid__date">{{ row.date }}</p>
          <p class="mwnf-dxa-grid__partner">{{ row.partner }}</p>
          <p class="mwnf-dxa-grid__place">{{ row.place }}</p>
          <p v-if="family !== 'exhibition' || row.project" class="mwnf-dxa-grid__project">{{ family === 'exhibition' ? t('exhibition.results.for') : t('gallery.results.for') }} <span>{{ row.project }}</span></p>
          <SmartLink class="mwnf-dxa-grid__link" :to="row.to">{{ t('catalogue.results.seeDatabaseEntry') }} &gt;</SmartLink>
        </div>
      </div>
    </div>
  </div>
</template>
