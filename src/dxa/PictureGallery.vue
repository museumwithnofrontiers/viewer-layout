<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// The curated-picture side panel + thumbnail strip a DXA exhibition theme
// page shows beside its narrative body (the shell around it is EssayView's
// `panel`/`thumbnails` slots — see PictureNarrative.vue for the `after-body`
// half of the same page). A picture is not a catalogue record: several
// curated crops can share one parent, or point at no parent the package
// carries at all, so every field this component shows (`name`,
// `imageCaption`, `detail`, `fields`, `to`) is already resolved by the
// website — the one place that knows how to turn a picture's
// `parent_item_id` back into a labelled record. `to: null` renders the "not
// in this exhibition" message in place of a link, rather than a dead one.
//
// A picture that is the TARGET of another picture's related-work link
// (`backRelated`, populated from anywhere in the theme tree — see
// PictureNarrative for why cross-theme links matter) starts hidden behind
// "Add related works": the toggle that keeps the strip to the curator's own
// primary selection, exactly as legacy's theme page did.
const props = defineProps({
  /**
   * The node's ordered picture selections:
   *   { id, image, imageAlt, name (inline HTML), imageCaption, detail,
   *     fields: [{ label, value (inline HTML) }], to (route | null),
   *     backRelated: [{ picture, reciprocalText }] }
   * Only `backRelated`'s length is read here, to decide what the toggle
   * hides — PictureNarrative renders its content.
   */
  pictures: { type: Array, default: () => [] },
  /** The selected picture's id — v-model:selected-id. */
  selectedId: { type: [String, Number], default: null },
  seeItemEntry: { type: String, default: 'exhibition.theme.seeItemEntry' },
  unresolvedEntry: { type: String, default: 'exhibition.theme.recordNotInSite' },
  emptyEntry: { type: String, default: 'exhibition.theme.additionalContent' },
  addRelatedEntry: { type: String, default: 'exhibition.theme.addRelatedWorks' },
  hideRelatedEntry: { type: String, default: 'exhibition.theme.hideRelatedWorks' },
})
const emit = defineEmits(['update:selectedId'])

const { t } = useI18n()

const selected = computed(() => props.pictures.find((picture) => picture.id === props.selectedId) ?? null)
const hasRelated = computed(() => props.pictures.some((picture) => picture.backRelated?.length))

// The toggle is this component's own UI state, not part of the selection
// contract a website shares with PictureNarrative — it resets whenever the
// picture list itself changes (a new theme or sub-theme node), same as
// legacy's own per-node reset.
const showAll = ref(false)
watch(() => props.pictures, () => { showAll.value = false })

const strip = computed(() => (
  showAll.value ? props.pictures : props.pictures.filter((picture) => !picture.backRelated?.length)
))

function select(picture) {
  emit('update:selectedId', picture.id)
}
</script>

<template>
  <div class="mwnf-picture-gallery">
    <div v-if="selected" class="mwnf-picture-gallery__selected">
      <div class="mwnf-picture-gallery__image">
        <img :src="selected.image" :alt="selected.imageAlt ?? ''" />
      </div>
      <div class="mwnf-picture-gallery__details">
        <div class="mwnf-picture-gallery__detail mwnf-picture-gallery__detail--title">
          <span v-if="selected.imageCaption">{{ selected.imageCaption }}, </span>
          <span v-html="selected.name"></span>
        </div>
        <div v-for="(field, index) in selected.fields ?? []" :key="index" class="mwnf-picture-gallery__detail">
          <span v-if="field.label" class="mwnf-picture-gallery__label">{{ field.label }}</span>
          <span v-html="field.value"></span>
        </div>
        <div v-if="selected.detail" class="mwnf-picture-gallery__detail">{{ selected.detail }}</div>
        <SmartLink v-if="selected.to" class="mwnf-picture-gallery__link" :to="selected.to">{{ t(seeItemEntry) }} →</SmartLink>
        <div v-else class="mwnf-picture-gallery__unresolved">{{ t(unresolvedEntry) }}</div>
      </div>
    </div>
    <div v-else class="mwnf-picture-gallery__empty">{{ t(emptyEntry) }}</div>

    <div v-if="pictures.length" class="mwnf-picture-gallery__strip">
      <ul class="mwnf-picture-gallery__thumbs">
        <li
          v-for="picture in strip"
          :key="picture.id"
          class="mwnf-picture-gallery__thumb"
          :class="{
            'mwnf-picture-gallery__thumb--active': picture.id === selectedId,
            'mwnf-picture-gallery__thumb--related': picture.backRelated?.length,
          }"
        >
          <button type="button" @click="select(picture)">
            <img :src="picture.image" :alt="picture.imageAlt ?? ''" loading="lazy" />
          </button>
          <div class="mwnf-picture-gallery__thumb-text">
            <span v-if="picture.imageCaption">{{ picture.imageCaption }}, </span>
            <span class="mwnf-picture-gallery__thumb-name" v-html="picture.name"></span>
            <span v-if="picture.detail">, {{ picture.detail }}</span>
          </div>
        </li>
      </ul>

      <label v-if="hasRelated" class="mwnf-picture-gallery__toggle">
        <input v-model="showAll" type="checkbox" />
        <span>{{ showAll ? t(hideRelatedEntry) : t(addRelatedEntry) }}</span>
      </label>
    </div>
  </div>
</template>
