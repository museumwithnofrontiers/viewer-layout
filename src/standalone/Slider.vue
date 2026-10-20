<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// A row of pictures that moves by one: Sharing History's Historical
// Background slider (legacy's `hb_slider`, one row of pictures per strip).
// The pictures come from the site's assets.
//
//   slides: [{ image, label: entry, to | href }],
//   visible: how many show at once
const props = defineProps({
  slides: { type: Array, default: () => [] },
  visible: { type: Number, default: 5 },
  previousLabel: { type: String, default: 'core.pagination.previous' },
  nextLabel: { type: String, default: 'core.pagination.next' },
})
const { t } = useI18n()
const start = ref(0)
const last = computed(() => Math.max(0, props.slides.length - props.visible))
const shown = computed(() => props.slides.slice(start.value, start.value + props.visible)
  .map((slide) => ({ ...slide, label: slide.label ? t(slide.label) : '' })))
</script>

<template>
  <div v-if="slides.length" class="mwnf-standalone-slider" :style="{ '--mwnf-standalone-slider-count': visible }">
    <button type="button" class="mwnf-standalone-slider__button" :disabled="start === 0" :aria-label="t(previousLabel)" @click="start = Math.max(0, start - 1)">‹</button>
    <ul class="mwnf-standalone-slider__track">
      <li v-for="slide in shown" :key="slide.image" class="mwnf-standalone-slider__slide">
        <SmartLink :to="slide.to" :href="slide.href">
          <img :src="slide.image" :alt="slide.label" />
          <span v-if="slide.label" class="mwnf-standalone-slider__label">{{ slide.label }}</span>
        </SmartLink>
      </li>
    </ul>
    <button type="button" class="mwnf-standalone-slider__button" :disabled="start >= last" :aria-label="t(nextLabel)" @click="start = Math.min(last, start + 1)">›</button>
  </div>
</template>
