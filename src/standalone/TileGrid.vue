<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// A grid of picture tiles under a caption band: Sharing History's home page,
// one tile per exhibition, each with its own picture from the site's assets
// (legacy's `homeImg<n>.jpg`), not from the data package.
//
//   caption: entry,
//   items: [{ image, label: entry, to | href }]
const props = defineProps({
  caption: { type: String, default: '' },
  items: { type: Array, default: () => [] },
})
const { t } = useI18n()
const tiles = computed(() => props.items.map((item) => ({ ...item, label: item.label ? t(item.label) : '' })))
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
