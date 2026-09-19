<script setup>
import { computed } from 'vue'
import { renderBlock, useI18n } from '@museumwnf/viewer-core'

// The narrative content below a DXA exhibition theme page's essay body
// (EssayView's `after-body` slot), for whichever picture PictureGallery.vue
// has selected: the curator's own text about that specific crop
// (`contextualDescription` — themes.json translations' `contextual_description`,
// distinct from the node's own `presentation` that EssayView's body already
// renders), then the related pictures it points to and, when another
// picture points AT it, the one it is related to.
//
// `theme_item_related` rows can name another theme entirely
// (`themes.json`'s `related[].theme_id`) — a picture in "Colour and Light"
// can be related to one in "Colour and Religion". Resolving that link is the
// website's job (it alone walks the whole theme tree, not just the current
// node), which is why `related`/`backRelated` below already carry the
// resolved target/source picture, not just an id: this component never
// looks outside the one picture it was given. Only the first incoming link
// is shown as a reciprocal box — legacy's own theme page rendered a single
// "related to" slot, never a list of them.
const props = defineProps({
  /**
   * The selected picture, in PictureGallery's own shape, plus its relations:
   *   related: [{ picture: { id, image, imageAlt, name, detail, to }, text }]
   *   backRelated: [{ picture: {...}, reciprocalText }]
   * `null` when nothing is selected (or nothing carries a `related`/
   * `backRelated` at all) — renders nothing.
   */
  picture: { type: Object, default: null },
  /** Markdown; the empty string renders no block. */
  contextualDescription: { type: String, default: '' },
  relatedHeadingEntry: { type: String, default: 'exhibition.related.items' },
  reciprocalFallbackEntry: { type: String, default: 'exhibition.related.reciprocal' },
})
const emit = defineEmits(['select'])

const { t } = useI18n()

const contextualHtml = computed(() => (
  props.contextualDescription ? renderBlock(props.contextualDescription, { breaks: true }) : ''
))
const targets = computed(() => props.picture?.related ?? [])
const source = computed(() => props.picture?.backRelated?.[0] ?? null)

function select(picture) {
  emit('select', picture.id)
}
</script>

<template>
  <div v-if="picture" class="mwnf-picture-narrative">
    <div v-if="contextualHtml" class="mwnf-picture-narrative__text mwnf-sheet__block" v-html="contextualHtml"></div>

    <div v-if="targets.length" class="mwnf-picture-narrative__related">
      <div class="mwnf-picture-narrative__heading">{{ t(relatedHeadingEntry) }}</div>
      <div class="mwnf-picture-narrative__images">
        <div class="mwnf-picture-narrative__image mwnf-picture-narrative__image--main">
          <img :src="picture.image" :alt="picture.imageAlt ?? ''" />
          <div class="mwnf-picture-narrative__thumb-text">
            <span v-html="picture.name"></span>
            <span v-if="picture.detail">, {{ picture.detail }}</span>
          </div>
        </div>
        <div v-for="entry in targets" :key="entry.picture.id" class="mwnf-picture-narrative__image">
          <button type="button" @click="select(entry.picture)">
            <img :src="entry.picture.image" :alt="entry.picture.imageAlt ?? ''" />
          </button>
          <div class="mwnf-picture-narrative__thumb-text">
            <span v-html="entry.picture.name"></span>
            <span v-if="entry.picture.detail">, {{ entry.picture.detail }}</span>
          </div>
          <div v-if="entry.text" class="mwnf-picture-narrative__relation">{{ entry.text }}</div>
        </div>
      </div>
    </div>

    <div v-if="source" class="mwnf-picture-narrative__related">
      <div class="mwnf-picture-narrative__heading">{{ t(relatedHeadingEntry) }}</div>
      <p class="mwnf-picture-narrative__text mwnf-picture-narrative__text--reciprocal">
        {{ source.reciprocalText || t(reciprocalFallbackEntry) }}
      </p>
      <div class="mwnf-picture-narrative__image">
        <button type="button" @click="select(source.picture)">
          <img :src="source.picture.image" :alt="source.picture.imageAlt ?? ''" />
        </button>
        <div class="mwnf-picture-narrative__thumb-text">
          <span v-html="source.picture.name"></span>
          <span v-if="source.picture.detail">, {{ source.picture.detail }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
