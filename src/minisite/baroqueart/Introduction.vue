<script setup>
// The introduction (exhibitions/BAR/generic_introduction.php): the
// exhibition's title over legacy's picture, the way back and on, the
// introduction's text and, beside it, the pictures the exhibition opens with,
// each captioned, each opening in the zoom window.
import { computed, watch } from 'vue'
import { useGlossaryPopup } from '@museumwnf/viewer-core'
import GlossaryPopover from '../../content/GlossaryPopover.vue'
import { openWindow } from '../exhibition.js'
import { introductionDocument } from '../wordDocument.js'
import Download from './Download.vue'
import { BAROQUEART_WINDOWS, useBaroqueartExhibition } from './exhibition.js'

const { label, lang, data, root, text, title, settings, picture, href, introCaption, slots, glossaryFor } = useBaroqueartExhibition()

const own = computed(() => (root.value ? text(root.value.id) : {}))
const glossary = computed(() => (root.value ? glossaryFor(root.value.id) : []))
const intro = computed(() => data.md(own.value.extra?.intro_text, { glossary: glossary.value }))
const header = computed(() => data.mdInline(own.value.extra?.intro_header ?? ''))

// The pictures placed on the exhibition itself, in their order.
const pictures = computed(() =>
  slots(root.value).flatMap((slot) => slot.variants).map(({ entry, image }) => ({ entry, image, lines: introCaption(entry) })),
)

function zoom(image) {
  openWindow(href({ name: 'zoom', query: { img: image } }), BAROQUEART_WINDOWS.introZoom)
}
const popup = useGlossaryPopup(glossary)

function word() {
  introductionDocument({
    documentTitle: settings.documentTitle,
    title: title.value,
    header: own.value.extra?.intro_header ?? '',
    text: own.value.extra?.intro_text ?? '',
    captions: pictures.value.map((p) => p.lines),
  })
}

const background = computed(() => picture(lang.value === 'ar' ? 'legacy/intro_bg_ar.jpg' : 'legacy/intro_bg.jpg'))

watch([title, lang], () => {
  document.title = [label('identity.windowTitle'), title.value].filter(Boolean).join(' | ')
}, { immediate: true })
</script>

<template>
  <div class="mwnf-baroqueart-intro" :style="{ backgroundImage: background ? `url(${background})` : 'none' }">
    <div class="mwnf-baroqueart-intro__title">{{ title }}</div>
    <div class="mwnf-baroqueart-intro__nav mwnf-baroqueart-intro__nav--start">
      &lt; <router-link :to="{ name: 'home' }">{{ label('nav.entrance') }}</router-link>
    </div>
    <div class="mwnf-baroqueart-intro__nav mwnf-baroqueart-intro__nav--end">
      &lt; <router-link :to="{ name: 'home' }">{{ label('nav.previous') }}</router-link> |
      <router-link :to="{ name: 'exhibition', params: { theme: 1, page: 1 } }">{{ label('nav.next') }}</router-link> &gt;
    </div>
    <div class="mwnf-baroqueart-intro__table">
      <div class="mwnf-baroqueart-intro__text" @click="popup.onClick">
        <!-- eslint-disable vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
        <div class="mwnf-baroqueart-intro__header" v-html="header" />
        <div class="mwnf-baroqueart-intro__content" v-html="intro" />
        <!-- eslint-enable vue/no-v-html -->
        <Download :word="word" />
      </div>
      <div class="mwnf-baroqueart-intro__side">
        <div v-for="item in pictures" :key="`${item.entry.id}-${item.entry.variant_order}`" class="mwnf-baroqueart-intro-item">
          <template v-if="item.image">
            <a :href="href({ name: 'zoom', query: { img: item.image } })" @click.prevent="zoom(item.image)">
              <img class="mwnf-baroqueart-intro-item__image" :src="item.image" alt="">
            </a>
            <br>
          </template>
          <template v-for="(line, i) in item.lines.filter(Boolean)" :key="i">
            <br v-if="i > 0">
            <!-- eslint-disable-next-line vue/no-v-html -- an item's own Markdown, rendered and escaped by viewer-core -->
            <strong v-if="i === 0 && item.lines[0]" v-html="data.mdInline(line)" /><span v-else v-html="data.mdInline(line)" />
          </template>
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
