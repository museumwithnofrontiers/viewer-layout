<script setup>
import BackLink from '../../content/BackLink.vue'
import RecordLanguages from '../../content/RecordLanguages.vue'
import ItemDetailView from '../ItemDetailView.vue'
import { itemById, itemDetail } from './data.js'

// An exhibition's item page (D4): `ItemDetailView` over the family's spec
// (viewer-core's `useExhibitionItemDetail`), with the exhibition's own
// language-subset gate (`data-getter`): a record the package carries in
// another language only is not this build's. The header is a language
// switcher and a back link, with no title of its own, as legacy's was.

defineProps({ id: { type: String, required: true } })
</script>

<template>
  <ItemDetailView :spec="itemDetail" :id="id" :data-getter="(itemId) => itemById.get(itemId)" class="mwnf-dxa-item">
    <template #header="{ languages, language, select }">
      <div class="mwnf-dxa-item__languages">
        <RecordLanguages :languages="languages" :language="language" @select="select" />
      </div>
      <BackLink />
    </template>
  </ItemDetailView>
</template>
