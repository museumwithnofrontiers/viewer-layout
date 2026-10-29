<script setup>
// The item panel of an exhibition page (subtheme_items.php's showItem()):
// the view's picture, which opens the zoom window; its caption; the link to
// the record's sheet on the parent site; and the slot's other views as
// "Related", each shown in the panel when chosen.
import { computed } from 'vue'
import { openWindow } from '../exhibition.js'
import { SHARINGHISTORY_WINDOWS, useSharingHistoryExhibition } from './exhibition.js'
import { vTip } from '../tip.js'

const props = defineProps({
  // The slot shown (`slotsOf()`), and which of its views.
  slot: { type: Object, default: null },
  view: { type: Number, default: 0 },
})
const emit = defineEmits(['update:view'])

const { caption, data, href, label, picture, settings } = useSharingHistoryExhibition()

const entry = computed(() => props.slot?.variants[props.view] ?? null)
const lines = computed(() => (entry.value ? caption(entry.value) : null))
const sheet = computed(() => (entry.value ? `${settings.parent}/#/item/${encodeURIComponent(entry.value.id)}` : ''))

// "Related": the slot's other views, the main one first; legacy listed at most
// five beside the main view, and never the view on show.
const others = computed(() =>
  (props.slot?.variants ?? [])
    .slice(0, 6)
    .map((variant, index) => ({ variant, index }))
    .filter((other) => other.index !== props.view),
)

function zoom() {
  openWindow(href({ name: 'zoom', query: { img: entry.value.image_url } }), SHARINGHISTORY_WINDOWS.zoom)
}
</script>

<template>
  <div v-if="entry" class="mwnf-sh-panel">
    <!-- The picture and, under its right edge, the magnifier: both open the zoom window. -->
    <div class="mwnf-sh-panel__picture">
      <div class="mwnf-sh-panel__frame">
        <div>
          <button v-tip="{ text: label('item.showZoom') }" type="button" @click="zoom">
            <img class="mwnf-sh-panel__shown" :src="entry.image_url" alt="">
          </button>
          <div class="mwnf-sh-panel__magnify">
            <button v-tip="{ text: label('item.showZoom') }" type="button" @click="zoom">
              <img :src="picture('legacy/magnify.png')" alt="" width="15" height="15">
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="mwnf-sh-panel__caption">
      <!-- eslint-disable vue/no-v-html -- the records' own Markdown, rendered and escaped by viewer-core -->
      <p v-if="lines.name" class="mwnf-sh-panel__name" v-html="data.mdInline(lines.name)" />
      <p v-if="lines.date" v-html="data.mdInline(lines.date)" />
      <p v-if="lines.place" v-html="data.mdInline(lines.place)" />
      <p v-if="lines.artist" v-html="data.mdInline(lines.artist)" />
      <p v-if="lines.material" v-html="data.mdInline(lines.material)" />
      <p v-if="lines.architects" v-html="data.mdInline(lines.architects)" />
      <p v-if="lines.justification" class="mwnf-sh-panel__justification" v-html="data.mdInline(lines.justification)" />
      <!-- eslint-enable vue/no-v-html -->
      <p>
        <img :src="picture('legacy/arrow_inner_black.gif')" alt="" class="mwnf-sh-arrow" width="11" height="8">
        <a :href="sheet" target="_blank" rel="noopener">{{ label('item.moreInfo') }}</a>
      </p>
      <template v-if="others.length">
        <p><b>{{ label('item.related') }}</b></p>
        <div class="mwnf-sh-panel__related">
          <button v-for="other in others" :key="other.index" type="button" @click="emit('update:view', other.index)">
            <img :src="other.variant.image_url" alt="">
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
