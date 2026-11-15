<script setup>
import LegacyItemSheet from '../LegacyItemSheet.vue'
import { itemDetail } from './data.js'

// A gallery's item page (D4): legacy's sheet (dxa-client's DatabaseItem.vue,
// inventory-app#2423) over the family's spec (viewer-core's
// `useGalleryItemDetail`), in the gallery's words. No language-subset gate:
// a gallery ships every item it lists in one build.
defineProps({ id: { type: String, required: true } })

const WORDS = {
  viewShortDescription: 'gallery.sheet.viewShortDescription',
  hideShortDescription: 'gallery.sheet.hideShortDescription',
  glossary: 'gallery.related.glossary',
  dynasties: 'gallery.related.dynasties',
  exhibitions: 'gallery.related.exhibitions',
  workingNumber: 'gallery.sheet.workingNumber',
  relatedAudio: 'gallery.related.audio',
  relatedVideos: 'gallery.related.videos',
  relatedObjects: 'gallery.related.objects',
  // Legacy's client drew only the related objects; its API also returned the
  // related monuments, drawn apart as Discover Islamic Art's sheet did.
  relatedMonuments: 'gallery.related.monuments',
}
</script>

<template>
  <LegacyItemSheet :id="id" :item-detail="itemDetail" :words="WORDS" />
</template>
