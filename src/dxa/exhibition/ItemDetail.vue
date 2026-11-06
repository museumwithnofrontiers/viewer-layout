<script setup>
import LegacyItemSheet from '../LegacyItemSheet.vue'
import { itemById, itemDetail } from './data.js'

// An exhibition's item page (D4): legacy's sheet (exhibitions-client's
// DatabaseItem.vue, the galleries' same template; inventory-app#2379) over
// the family's spec (viewer-core's `useExhibitionItemDetail`), in the
// exhibition's words, with the exhibition's own language-subset gate: a
// record the package carries in another language only is not this build's.
defineProps({ id: { type: String, required: true } })

const WORDS = {
  viewShortDescription: 'exhibition.sheet.viewShortDescription',
  hideShortDescription: 'exhibition.sheet.hideShortDescription',
  glossary: 'exhibition.sheet.glossary',
  dynasties: 'exhibition.sheet.dynasties',
  exhibitions: 'exhibition.sheet.exhibitions',
  workingNumber: 'exhibition.sheet.workingNumber',
}
const inBuild = (itemId) => itemById.value.get(itemId)
</script>

<template>
  <LegacyItemSheet :id="id" :item-detail="itemDetail" :data-getter="inBuild" :words="WORDS" class="mwnf-dxa-exhibition-item" />
</template>
