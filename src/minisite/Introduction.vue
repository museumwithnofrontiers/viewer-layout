<script setup>
// The introduction (generic_introduction.php): the exhibition's title over
// legacy's picture, the way back and on, the introduction's text and, beside
// it, the map (`minisite.map`) and the pictures the exhibition opens with,
// each captioned.
import { computed, watch } from 'vue'
import { useGlossaryPopup } from '@museumwnf/viewer-core'
import GlossaryPopover from '../content/GlossaryPopover.vue'
import { openWindow, useExhibition, WINDOWS } from './exhibition.js'
import { introductionDocument } from './wordDocument.js'
import DownloadBlock from './DownloadBlock.vue'

const { label, lang, data, root, text, title, settings, picture, href, introCaption, slots, glossaryFor } = useExhibition()

const own = computed(() => (root.value ? text(root.value.id) : {}))
const glossary = computed(() => (root.value ? glossaryFor(root.value.id) : []))
const intro = computed(() => data.md(own.value.extra?.intro_text, { glossary: glossary.value }))
const header = computed(() => data.mdInline(own.value.extra?.intro_header ?? ''))

// The pictures placed on the exhibition itself, in their order.
const pictures = computed(() =>
  slots(root.value).flatMap((slot) => slot.variants).map(({ entry, image }) => ({ entry, image, lines: introCaption(entry) })),
)

const map = computed(() => settings.map ?? null)

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
  <div class="mwnf-minisite-intro" :style="{ backgroundImage: background ? `url(${background})` : 'none' }">
    <div class="mwnf-minisite-intro__title">{{ title }}</div>
    <div class="mwnf-minisite-intro__nav mwnf-minisite-intro__nav--start">
      &lt; <router-link :to="{ name: 'home' }">{{ label('nav.entrance') }}</router-link>
    </div>
    <div class="mwnf-minisite-intro__nav mwnf-minisite-intro__nav--end">
      &lt; <router-link :to="{ name: 'home' }">{{ label('nav.previous') }}</router-link> |
      <router-link :to="{ name: 'exhibition', params: { theme: 1, page: 1 } }">{{ label('nav.next') }}</router-link> &gt;
    </div>
    <div class="mwnf-minisite-intro__table">
      <div class="mwnf-minisite-intro__text" @click="popup.onClick">
        <!-- eslint-disable vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
        <div class="mwnf-minisite-intro__header" v-html="header" />
        <div class="mwnf-minisite-intro__content" v-html="intro" />
        <!-- eslint-enable vue/no-v-html -->
        <DownloadBlock :word="word" />
      </div>
      <div class="mwnf-minisite-intro__side">
        <div v-if="map" class="mwnf-minisite-intro-item">
          <a :href="href({ name: 'map' })" @click.prevent="openWindow(href({ name: 'map' }), WINDOWS.map)">
            <img :src="picture(map.thumbnail)" alt="" width="178" height="93">
          </a><br>
          <a class="mwnf-minisite-intro-item__map" :href="href({ name: 'map' })" @click.prevent="openWindow(href({ name: 'map' }), WINDOWS.map)">{{ label('intro.enlargeMap') }}</a>
        </div>
        <div v-for="item in pictures" :key="`${item.entry.id}-${item.entry.variant_order}`" class="mwnf-minisite-intro-item">
          <img v-if="item.image" class="mwnf-minisite-intro-item__image" :src="item.image" alt="">
          <br v-if="item.image">
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
