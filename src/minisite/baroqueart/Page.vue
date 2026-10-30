<script setup>
// An exhibition page (exhibitions/BAR/generic_exhibition.php): the
// exhibition's title and the way back, on and through; the page's title, a
// thumbnail per item, its quote, its text; beside them the item on show — its
// picture (which opens the zoom), its caption with the artist and material
// lines, a dot per view of it (a placement's detail views among them), its
// justification, and the link to its sheet on the parent site
// (`minisite.itemHref`).
import { computed, ref, watch } from 'vue'
import { useGlossaryPopup } from '@museumwnf/viewer-core'
import GlossaryPopover from '../../content/GlossaryPopover.vue'
import { openWindow } from '../exhibition.js'
import { quoteHasItalics, sheetItemId, viewPicture } from '../rules.js'
import { vTip } from '../tip.js'
import { pageDocument } from '../wordDocument.js'
import Download from './Download.vue'
import { BAROQUEART_WINDOWS, useBaroqueartExhibition } from './exhibition.js'

const props = defineProps({
  theme: { type: Number, required: true },
  page: { type: Number, required: true },
})

const { label, lang, data, title, text, settings, picture, href, pageAt, slots, placementCaption, viewCaption, glossaryFor } =
  useBaroqueartExhibition()

const current = computed(() => pageAt(props.theme, props.page))
const own = computed(() => (current.value ? text(current.value.node.id) : {}))
const glossary = computed(() => (current.value ? glossaryFor(current.value.node.id) : []))
const pageSlots = computed(() => (current.value ? slots(current.value.node) : []))
const quote = computed(() => own.value.quote ?? '')

// The item on show and the view of it: the first of each when the page opens.
const selected = ref({ slot: 0, variant: 0 })
watch(() => [props.theme, props.page], () => (selected.value = { slot: 0, variant: 0 }))

const slot = computed(() => pageSlots.value[selected.value.slot] ?? null)
const variant = computed(() => slot.value?.variants[selected.value.variant] ?? null)
const image = computed(() => viewPicture(slot.value, selected.value.variant))

const caption = computed(() => {
  if (!slot.value || !variant.value) return null
  return {
    ...viewCaption(slot.value, selected.value.variant),
    sheetId: sheetItemId(slot.value, selected.value.variant, (id) => data.itemById.value.get(id)),
  }
})

function show(slotIndex) {
  selected.value = { slot: slotIndex, variant: 0 }
}
function showView(variantIndex) {
  selected.value = { ...selected.value, variant: variantIndex }
}
function zoom() {
  if (image.value) openWindow(href({ name: 'zoom', query: { img: image.value } }), BAROQUEART_WINDOWS.zoom)
}

const popup = useGlossaryPopup(glossary)

function word() {
  pageDocument({
    documentTitle: settings.documentTitle,
    title: title.value,
    pageTitle: own.value.title ?? '',
    quote: quote.value,
    text: own.value.description ?? '',
    slots: pageSlots.value.map((s) => s.variants.map((v, i) => (v.view ? viewCaption(s, i) : placementCaption(v.entry)))),
  })
}

// The window title, as legacy's: the virtual exhibitions, the exhibition, the page, its number.
watch(
  () => [own.value.title, title.value, lang.value],
  () => {
    document.title = [label('identity.windowTitle'), title.value, own.value.title, props.page].filter(Boolean).join(' | ')
  },
  { immediate: true },
)

const background = computed(() => picture(lang.value === 'ar' ? 'legacy/exhibition_bg_ar.jpg' : 'legacy/exhibition_bg.jpg'))
</script>

<template>
  <div v-if="current" class="mwnf-baroqueart-page" :style="{ backgroundImage: background ? `url(${background})` : 'none' }">
    <div class="mwnf-baroqueart-page__head">
      <div class="mwnf-baroqueart-page__title">{{ title }}</div>
      <div class="mwnf-baroqueart-page__nav mwnf-baroqueart-page__nav--start">
        &lt; <router-link :to="{ name: 'home' }">{{ label('nav.entrance') }}</router-link>
      </div>
      <div class="mwnf-baroqueart-page__nav mwnf-baroqueart-page__nav--end">
        &lt; <router-link :to="current.previous">{{ label('nav.previous') }}</router-link>
        <template v-if="current.next">
          | <router-link :to="current.next">{{ label('nav.next') }}</router-link> &gt;
        </template>
      </div>
    </div>

    <div class="mwnf-baroqueart-page__body">
      <div class="mwnf-baroqueart-page__text" @click="popup.onClick">
        <!-- eslint-disable vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
        <div class="mwnf-baroqueart-page__page-title" v-html="data.mdInline(own.title)" />
        <div class="mwnf-baroqueart-page__thumbs">
          <a
            v-for="(s, i) in pageSlots"
            :key="s.n"
            v-tip="{ text: data.mdStrip(viewCaption(s, 0).name), width: 160 }"
            href="#"
            @click.prevent="show(i)"
          ><img v-if="s.variants[0].image" :src="s.variants[0].image" alt="" height="36"></a>
        </div>
        <div
          class="mwnf-baroqueart-page__quote"
          :class="{ 'mwnf-baroqueart-page__quote--own-italics': quoteHasItalics(quote) }"
          v-html="data.mdInline(quote, { glossary })"
        />
        <div class="mwnf-baroqueart-page__content" v-html="data.md(own.description, { glossary })" />
        <!-- eslint-enable vue/no-v-html -->
        <Download :word="word" />
      </div>

      <div class="mwnf-baroqueart-page__item">
        <div class="mwnf-baroqueart-page__image">
          <a v-if="image" v-tip="{ text: label('item.showZoom') }" href="#" @click.prevent="zoom">
            <img :src="image" alt="">
          </a>
        </div>
        <div v-if="caption" class="mwnf-baroqueart-page__caption">
          <!-- eslint-disable vue/no-v-html -- the item's and the exhibition's own Markdown, rendered and escaped by viewer-core -->
          <div>
            <strong v-html="data.mdInline(caption.name)" /><br>
            <span v-html="data.mdInline(caption.detailName)" /><br>
            <template v-for="(line, i) in caption.dateLines" :key="i"><br v-if="i > 0"><span v-html="data.mdInline(line)" /></template>
          </div>
          <div>
            <template v-for="(line, i) in caption.details" :key="i"><span v-html="data.mdInline(line)" /><br></template>
          </div>
          <div v-html="data.mdInline(caption.artist)" />
          <div v-html="data.mdInline(caption.material)" />
          <div v-if="slot.variants.length > 1">
            <a
              v-for="(v, i) in slot.variants"
              :key="i"
              v-tip="{ text: label('item.showDetail') }"
              href="#"
              @click.prevent="showView(i)"
            ><img :src="picture(i === selected.variant ? 'legacy/ico_item_selected.gif' : 'legacy/ico_item.gif')" alt=""></a>
          </div>
          <div class="mwnf-baroqueart-page__justification" v-html="data.mdInline(caption.justification)" />
          <!-- eslint-enable vue/no-v-html -->
          <div v-if="caption.sheetId">
            <a class="mwnf-baroqueart-page__more" :href="settings.itemHref?.(caption.sheetId)" target="_blank">&gt; {{ label('item.moreInfo') }}</a>
          </div>
        </div>
      </div>
    </div>
    <GlossaryPopover
      v-if="popup.active.value"
      :term="popup.active.value"
      :html="data.md(popup.active.value.definition)"
      @close="popup.close"
    />
  </div>
</template>
