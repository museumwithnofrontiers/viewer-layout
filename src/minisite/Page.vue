<script setup>
// An exhibition page (generic_exhibition.php): the exhibition's title and the
// way back, on and through; the page's title, a thumbnail per item, its quote,
// its text; beside them the item on show — its picture (which opens the
// zoom), its caption, a dot per view of it, its justification, and the link
// to its sheet on the parent site (`minisite.itemHref`).
import { computed, ref, watch } from 'vue'
import { useGlossaryPopup } from '@museumwnf/viewer-core'
import GlossaryPopover from '../content/GlossaryPopover.vue'
import { openWindow, useExhibition, WINDOWS } from './exhibition.js'
import { quoteHasItalics, sheetItemId, viewPicture, withFirstView } from './rules.js'
import { pageDocument } from './wordDocument.js'
import DownloadBlock from './DownloadBlock.vue'
import { vTip } from './tip.js'

const props = defineProps({
  theme: { type: Number, required: true },
  page: { type: Number, required: true },
})

const { t, lang, data, title, text, settings, picture, href, pageAt, slots, placementCaption, glossaryFor } = useExhibition()

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
    ...withFirstView(placementCaption(variant.value.entry), placementCaption(slot.value.variants[0].entry)),
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
  if (image.value) openWindow(href({ name: 'zoom', query: { img: image.value } }), WINDOWS.zoom)
}

const popup = useGlossaryPopup(glossary)

function word() {
  pageDocument({
    documentTitle: settings.documentTitle,
    title: title.value,
    pageTitle: own.value.title ?? '',
    quote: quote.value,
    text: own.value.description ?? '',
    slots: pageSlots.value.map((s) => s.variants.map((v) => placementCaption(v.entry))),
  })
}

// The window title, as legacy's: the virtual exhibitions, the exhibition, the page, its number.
watch(
  () => [own.value.title, title.value, lang.value],
  () => {
    document.title = [t('minisite.identity.windowTitle'), title.value, own.value.title, props.page].filter(Boolean).join(' | ')
  },
  { immediate: true },
)

const background = computed(() => picture(lang.value === 'ar' ? 'legacy/exhibition_bg_ar.jpg' : 'legacy/exhibition_bg.jpg'))
</script>

<template>
  <div v-if="current" class="mwnf-minisite-page" :style="{ backgroundImage: background ? `url(${background})` : 'none' }">
    <div class="mwnf-minisite-page__head">
      <div class="mwnf-minisite-page__title">{{ title }}</div>
      <div class="mwnf-minisite-page__nav mwnf-minisite-page__nav--start">
        &lt; <router-link :to="{ name: 'home' }">{{ t('minisite.nav.entrance') }}</router-link>
      </div>
      <div class="mwnf-minisite-page__nav mwnf-minisite-page__nav--end">
        &lt; <router-link :to="current.previous">{{ t('minisite.nav.previous') }}</router-link>
        <template v-if="current.next">
          | <router-link :to="current.next">{{ t('minisite.nav.next') }}</router-link> &gt;
        </template>
      </div>
    </div>

    <div class="mwnf-minisite-page__body">
      <div class="mwnf-minisite-page__text" @click="popup.onClick">
        <!-- eslint-disable vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
        <div class="mwnf-minisite-page__page-title" v-html="data.mdInline(own.title)" />
        <div class="mwnf-minisite-page__thumbs">
          <a
            v-for="(s, i) in pageSlots"
            :key="s.n"
            v-tip="{ text: data.mdStrip(placementCaption(s.variants[0].entry).name), width: 160 }"
            href="#"
            @click.prevent="show(i)"
          ><img v-if="s.variants[0].image" :src="s.variants[0].image" alt="" height="36"></a>
        </div>
        <div
          class="mwnf-minisite-page__quote"
          :class="{ 'mwnf-minisite-page__quote--own-italics': quoteHasItalics(quote) }"
          v-html="data.mdInline(quote, { glossary })"
        />
        <div class="mwnf-minisite-page__content" v-html="data.md(own.description, { glossary })" />
        <!-- eslint-enable vue/no-v-html -->
        <DownloadBlock :word="word" />
      </div>

      <div class="mwnf-minisite-page__item">
        <div class="mwnf-minisite-page__image">
          <a v-if="image" v-tip="{ text: t('minisite.item.showZoom') }" href="#" @click.prevent="zoom">
            <img :src="image" alt="">
          </a>
        </div>
        <div v-if="caption" class="mwnf-minisite-page__caption">
          <!-- eslint-disable vue/no-v-html -- the item's and the exhibition's own Markdown, rendered and escaped by viewer-core -->
          <div>
            <strong v-html="data.mdInline(caption.name)" /><br>
            <span v-html="data.mdInline(caption.detailName)" /><br>
            <template v-for="(line, i) in caption.dateLines" :key="i"><br v-if="i > 0"><span v-html="data.mdInline(line)" /></template>
          </div>
          <div>
            <template v-for="(line, i) in caption.details" :key="i"><span v-html="data.mdInline(line)" /><br></template>
          </div>
          <div v-if="slot.variants.length > 1">
            <a
              v-for="(v, i) in slot.variants"
              :key="i"
              v-tip="{ text: t('minisite.item.showDetail') }"
              href="#"
              @click.prevent="showView(i)"
            ><img :src="picture(i === selected.variant ? 'legacy/ico_item_selected.gif' : 'legacy/ico_item.gif')" alt=""></a>
          </div>
          <div class="mwnf-minisite-page__justification" v-html="data.mdInline(caption.justification)" />
          <!-- eslint-enable vue/no-v-html -->
          <div v-if="caption.sheetId">
            <a class="mwnf-minisite-page__more" :href="settings.itemHref?.(caption.sheetId)" target="_blank">&gt; {{ t('minisite.item.moreInfo') }}</a>
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
