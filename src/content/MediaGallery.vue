<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

// A record's images: the current one large, the others as thumbnails, a
// caption, and a lightbox — legacy DatabaseItem.vue's gallery, which the
// standalone sites now adopt too (decision D4). Escape closes the lightbox,
// the arrows move; focus goes back to what opened it.
const props = defineProps({
  /** [{ url, alt?, caption?, photographer?, copyright? }] */
  images: { type: Array, default: () => [] },
  /** Open the sheet on this image. */
  start: { type: Number, default: 0 },
  /** No thumbnails, no lightbox: every image in a row, as the standalone sites showed them. */
  variant: { type: String, default: '' },
  /** The thumbnails are drawn from this many images; legacy's standalone sheet drew one for a single image. */
  thumbsFrom: { type: Number, default: 2 },
})
const { t } = useI18n()

const current = ref(Math.min(props.start, Math.max(0, props.images.length - 1)))
watch(() => props.images, () => { current.value = 0 })

const image = computed(() => props.images[current.value] ?? null)
const credit = computed(() => {
  const parts = []
  if (image.value?.photographer) parts.push(`${t('record.media.photograph')}: ${image.value.photographer}`)
  if (image.value?.copyright) parts.push(`© ${image.value.copyright}`)
  return parts.join(' — ')
})

const open = ref(false)
let opener = null
const closeButton = ref(null)

function show(index) {
  current.value = (index + props.images.length) % props.images.length
}
function openLightbox() {
  if (!image.value) return
  opener = document.activeElement
  open.value = true
  document.addEventListener('keydown', onKey)
  requestAnimationFrame(() => closeButton.value?.focus?.())
}
function closeLightbox() {
  open.value = false
  document.removeEventListener('keydown', onKey)
  opener?.focus?.()
  opener = null
}
function onKey(event) {
  if (event.key === 'Escape') closeLightbox()
  else if (event.key === 'ArrowRight') show(current.value + 1)
  else if (event.key === 'ArrowLeft') show(current.value - 1)
}
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="images.length" class="mwnf-media" :class="variant ? `mwnf-media--${variant}` : ''">
    <template v-if="variant === 'row'">
      <figure v-for="(item, index) in images" :key="item.url ?? index" class="mwnf-media__figure">
        <img class="mwnf-media__image" :src="item.url" :alt="item.alt ?? ''" loading="lazy" />
        <figcaption v-if="item.caption || item.photographer || item.copyright" class="mwnf-media__caption">
          <span v-if="item.caption">{{ item.caption }}</span>
          <span v-if="item.photographer" class="mwnf-media__credit">{{ t('record.media.photograph') }}: {{ item.photographer }}</span>
          <span v-if="item.copyright" class="mwnf-media__credit">© {{ item.copyright }}</span>
        </figcaption>
      </figure>
    </template>
    <template v-else>
      <button type="button" class="mwnf-media__main" @click="openLightbox">
        <img class="mwnf-media__image" :src="image.url" :alt="image.alt ?? ''" />
      </button>
      <ul v-if="images.length >= thumbsFrom" class="mwnf-media__thumbs">
        <li v-for="(item, index) in images" :key="item.url ?? index">
          <button
            type="button"
            class="mwnf-media__thumb"
            :class="{ 'mwnf-media__thumb--active': index === current }"
            :aria-pressed="index === current ? 'true' : 'false'"
            :title="[item.photographer, item.copyright].filter(Boolean).join(' — ') || undefined"
            @click="show(index)"
          >
            <img :src="item.url" :alt="item.alt ?? ''" loading="lazy" />
          </button>
        </li>
      </ul>
      <p v-if="image.caption || credit" class="mwnf-media__caption">
        <span v-if="image.caption">{{ image.caption }}</span>
        <span v-if="credit" class="mwnf-media__credit">{{ credit }}</span>
      </p>
      <div v-if="open" class="mwnf-lightbox" role="dialog" aria-modal="true" @click.self="closeLightbox">
        <button ref="closeButton" type="button" class="mwnf-lightbox__close" :aria-label="t('core.action.close')" @click="closeLightbox">✕</button>
        <button v-if="images.length > 1" type="button" class="mwnf-lightbox__control mwnf-lightbox__control--previous" :aria-label="t('core.pagination.previous')" @click.stop="show(current - 1)">‹</button>
        <img class="mwnf-lightbox__image" :src="image.url" :alt="image.alt ?? ''" />
        <button v-if="images.length > 1" type="button" class="mwnf-lightbox__control mwnf-lightbox__control--next" :aria-label="t('core.pagination.next')" @click.stop="show(current + 1)">›</button>
      </div>
    </template>
  </div>
</template>
