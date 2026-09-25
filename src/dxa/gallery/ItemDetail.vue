<script setup>
import BackLink from '../../content/BackLink.vue'
import RecordLanguages from '../../content/RecordLanguages.vue'
import ItemDetailView from '../ItemDetailView.vue'
import { itemDetail } from './data.js'

// A gallery's item page (D4): `ItemDetailView` over the family's spec
// (viewer-core's `useGalleryItemDetail`). No language-subset gate: a gallery
// ships every item it lists in one build. The header is a language switcher
// and a back link, with no title of its own, as legacy's was.

defineProps({ id: { type: String, required: true } })
</script>

<template>
  <ItemDetailView :spec="itemDetail" :id="id" class="mwnf-dxa-item">
    <template #header="{ languages, language, select }">
      <div class="mwnf-dxa-item__languages">
        <RecordLanguages :languages="languages" :language="language" @select="select" />
      </div>
      <BackLink />
    </template>
  </ItemDetailView>
</template>
