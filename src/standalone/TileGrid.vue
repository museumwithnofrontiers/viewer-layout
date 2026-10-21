<script setup>
import { computed } from 'vue'
import { renderPlain, useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'
import { useChromePicture } from './chrome.js'

// A grid of picture tiles under a caption band: Sharing History's home page,
// one tile per exhibition, each with its own picture from the site's assets
// (legacy's `homeImg<n>.jpg`), not from the data package.
//
//   caption: entry,
//   items: [{ image, label: entry, to | href }]   // `image`: a chrome key or URL; `text` in place of `label`: a name from the data package, Markdown
const props = defineProps({
  caption: { type: String, default: '' },
  items: { type: Array, default: () => [] },
})
const { t } = useI18n()
const picture = useChromePicture()
const tiles = computed(() => props.items.map((item) => ({ ...item, image: picture(item.image) ?? '', label: item.text ? renderPlain(item.text) : item.label ? t(item.label) : '' })))
</script>

<template>
  <section v-if="tiles.length" class="mwnf-standalone-tiles">
    <p v-if="caption" class="mwnf-standalone-tiles__caption">{{ t(caption) }}</p>
    <ul class="mwnf-standalone-tiles__grid">
      <li v-for="tile in tiles" :key="tile.image" class="mwnf-standalone-tiles__tile">
        <SmartLink :to="tile.to" :href="tile.href" class="mwnf-standalone-tiles__link">
          <img class="mwnf-standalone-tiles__image" :src="tile.image" :alt="tile.label" />
          <span v-if="tile.label" class="mwnf-standalone-tiles__label">{{ tile.label }}</span>
        </SmartLink>
      </li>
    </ul>
  </section>
</template>
