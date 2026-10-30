<script setup>
// A page of the Artistic Introduction (gai/generic_page.php): the way back to
// the home page; the theme's title, its pages — Monuments, Objects — the
// page's quote and its text; beside them the item on show — its picture (which
// opens the zoom), its caption, a dot per view of it, its justification and
// the link to its sheet on the parent site (`minisite.itemHref`) — and under
// it a thumbnail per item. The captions are composed as Discover Islamic Art's
// exhibition pages compose theirs (../rules.js).
import { computed, ref, watch } from 'vue'
import { useGlossaryPopup } from '@museumwnf/viewer-core'
import GlossaryPopover from '../../content/GlossaryPopover.vue'
import { openWindow, useExhibition, WINDOWS } from '../exhibition.js'
import { quoteHasItalics, sheetItemId, viewPicture } from '../rules.js'
import { vTip } from '../tip.js'

const props = defineProps({
  theme: { type: Number, required: true },
  page: { type: Number, required: true },
})

const { label, lang, data, root, title, text, settings, picture, href, pages, slots, viewCaption, glossaryFor } = useExhibition()

const current = computed(() => pages.value.find((p) => p.theme === props.theme && p.page === props.page) ?? null)
const siblings = computed(() => pages.value.filter((p) => p.theme === props.theme))
const own = computed(() => (current.value ? text(current.value.node.id) : {}))
const glossary = computed(() => (current.value ? glossaryFor(current.value.node.id) : []))
const pageSlots = computed(() => (current.value ? slots(current.value.node) : []))
const quote = computed(() => own.value.quote ?? '')
const subtitle = computed(() => (root.value ? text(root.value.id).extra?.subtitle ?? '' : ''))

// The item on show and the view of it: the first of each when the page opens.
const selected = ref({ slot: 0, variant: 0 })
watch(() => [props.theme, props.page], () => (selected.value = { slot: 0, variant: 0 }))

const slot = computed(() => pageSlots.value[selected.value.slot] ?? null)
const image = computed(() => viewPicture(slot.value, selected.value.variant))
const caption = computed(() => {
  if (!slot.value?.variants[selected.value.variant]) return null
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
  if (image.value) openWindow(href({ name: 'zoom', query: { img: image.value } }), WINDOWS.zoom)
}

const popup = useGlossaryPopup(glossary)

// The bar over the page (#GaiBlock1), legacy's picture over the token's colour.
const headPicture = computed(() => picture('legacy/page_block1_bg.gif'))

// The window title, as legacy's: the site, the introduction.
watch([title, lang], () => {
  document.title = [label('identity.windowTitle'), title.value].filter(Boolean).join(' | ')
}, { immediate: true })
</script>

<template>
  <div v-if="current" class="mwnf-artintro-page">
    <div class="mwnf-artintro-page__head" :style="{ backgroundImage: headPicture ? `url(${headPicture})` : 'none' }">
      <div class="mwnf-artintro-page__back">
        <!-- eslint-disable-next-line vue/no-v-html -- the introduction's own Markdown, rendered and escaped by viewer-core -->
        &lt; <router-link :to="{ name: 'home' }"><span v-html="data.mdInline(subtitle)" /> | <span v-html="data.mdInline(title)" /></router-link>
      </div>
    </div>

    <div class="mwnf-artintro-page__body">
      <div class="mwnf-artintro-page__text" @click="popup.onClick">
        <!-- eslint-disable vue/no-v-html -- the introduction's own Markdown, rendered and escaped by viewer-core -->
        <div class="mwnf-artintro-page__title" v-html="data.mdInline(text(current.themeNode.id).title)" />
        <div class="mwnf-artintro-page__pages">
          <template v-for="(p, i) in siblings" :key="p.node.id">
            <template v-if="i > 0"> / </template>
            <router-link
              :to="{ name: 'page', params: { theme: p.theme, page: p.page } }"
              :class="p.page === page ? 'mwnf-artintro-page__current' : 'mwnf-artintro-page__other'"
            ><span v-html="data.mdInline(text(p.node.id).title)" /></router-link>
          </template>
        </div>
        <div
          class="mwnf-artintro-page__quote"
          :class="{ 'mwnf-artintro-page__quote--own-italics': quoteHasItalics(quote) }"
          v-html="data.mdInline(quote, { glossary })"
        />
        <div class="mwnf-artintro-page__content" v-html="data.md(own.description, { glossary })" />
        <!-- eslint-enable vue/no-v-html -->
      </div>

      <div class="mwnf-artintro-page__item">
        <div class="mwnf-artintro-page__image">
          <a v-if="image" v-tip="{ text: label('item.showZoom') }" href="#" @click.prevent="zoom">
            <img :src="image" alt="">
          </a>
        </div>
        <div v-if="caption" class="mwnf-artintro-page__caption">
          <!-- eslint-disable vue/no-v-html -- the item's and the introduction's own Markdown, rendered and escaped by viewer-core -->
          <div>
            <strong v-html="data.mdInline(caption.name)" /><br>
            <template v-for="(line, i) in caption.dateLines" :key="i"><br v-if="i > 0"><span v-html="data.mdInline(line)" /></template>
          </div>
          <div>
            <template v-for="(line, i) in caption.details" :key="i"><span v-html="data.mdInline(line)" /><br></template>
          </div>
          <div v-if="slot.variants.length > 1">
            <a
              v-for="(v, i) in slot.variants"
              :key="i"
              v-tip="{ text: label('item.showDetail') }"
              href="#"
              @click.prevent="showView(i)"
            ><img :src="picture(i === selected.variant ? 'legacy/ico_item_selected.gif' : 'legacy/ico_item.gif')" alt=""></a>
          </div>
          <div class="mwnf-artintro-page__justification" v-html="data.mdInline(caption.justification)" />
          <!-- eslint-enable vue/no-v-html -->
          <div v-if="caption.sheetId">
            <a class="mwnf-artintro-page__more" :href="settings.itemHref?.(caption.sheetId)">&gt; {{ label('item.moreInfo') }}</a>
          </div>
        </div>
        <div class="mwnf-artintro-page__thumbs">
          <a
            v-for="(s, i) in pageSlots"
            :key="`${s.n}-${s.variants[0].entry.id}`"
            v-tip="{ text: data.mdStrip(viewCaption(s, 0).name), width: 160 }"
            href="#"
            @click.prevent="show(i)"
          ><img v-if="s.variants[0].image" :src="s.variants[0].image" alt="" height="36"></a>
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
