<script setup>
// The introduction (exh_introduction.php): "About the Exhibition" and the
// exhibition's text, with the download block; beside it, the pictures the
// exhibition places (sh_exhibition_images), one at a time, each with its
// caption and the link to its record's sheet, the others as thumbnails; under
// both, the exhibition's pages, Related Content and the windows.
import { computed, ref } from 'vue'
import { useSharingHistoryExhibition } from './exhibition.js'
import Banner from './Banner.vue'
import Download from './Download.vue'
import Related from './Related.vue'
import Windows from './Windows.vue'

const { caption, data, label, lang, pages, picture, root, settings, text, themes, title } = useSharingHistoryExhibition()

const own = computed(() => (root.value ? text(root.value.id) : {}))
const next = computed(() => (pages.value[0] ? { name: 'theme', params: { theme: 1 } } : null))

// The exhibition's own placements, in their order, each shown with its record's first picture.
const pictures = computed(() =>
  [...(root.value?.items ?? [])]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((entry) => ({ entry, image: data.itemById.value.get(entry.id)?.images?.[0] ?? null }))
    .filter((p) => p.image),
)
const shown = ref(0)
const current = computed(() => pictures.value[shown.value] ?? null)
const lines = computed(() => {
  if (!current.value) return null
  const own = data.tr('items', current.value.entry.id, lang.value)
  return { ...caption(current.value.entry), secondName: own.second_name ?? '', photographer: current.value.image.photographer ?? '' }
})
const sheet = computed(() => (current.value ? `${settings.parent}/#/item/${encodeURIComponent(current.value.entry.id)}` : ''))
</script>

<template>
  <div v-if="root" style="font-size: calc(11px * var(--sh-text-scale, 1))">
    <Banner kind="intro" :previous="{ name: 'home' }" :next="next" />
    <div class="mwnf-sh-intro">
      <div class="mwnf-sh-intro__text">
        <div class="mwnf-sh-intro__heading">{{ label('home.introduction') }}</div>
        <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
        <div class="mwnf-sh-intro__body" v-html="data.md(own.description ?? '')" />
        <Download :title="title" :blocks="[{ heading: label('home.introduction'), text: own.description ?? '' }]" />
      </div>
      <div class="mwnf-sh-intro__pictures">
        <div v-if="current" class="mwnf-sh-intro__picture">
          <img :src="current.image.url" alt=""><br>
          <!-- eslint-disable vue/no-v-html -- the records' own Markdown, rendered and escaped by viewer-core -->
          <b v-if="lines.name" v-html="data.mdInline(lines.name)" />
          <template v-if="lines.secondName"><br><br><b v-html="data.mdInline(lines.secondName)" /></template>
          <template v-for="key in ['date', 'place', 'artist', 'material', 'architects', 'photographer']" :key="key">
            <template v-if="lines[key]"><br><br><span v-html="data.mdInline(lines[key])" /></template>
          </template>
          <!-- eslint-enable vue/no-v-html -->
          <br><br>
          <img :src="picture('legacy/arrow_inner_black.gif')" alt="" class="mwnf-sh-arrow" width="11" height="8">
          <a :href="sheet">{{ label('item.moreInfo') }}</a>
        </div>
        <div v-if="pictures.length > 1" class="mwnf-sh-intro__thumbs">
          <button v-for="(p, i) in pictures" :key="p.entry.id" type="button" @click="shown = i">
            <img :src="p.image.url" alt="">
          </button>
        </div>
      </div>
    </div>
    <div class="mwnf-sh-bottom">
      <div class="mwnf-sh-bottom__pages">
        <b>{{ label('page.inExhibition') }}</b>
        <ul>
          <li>
            <img :src="picture('legacy/arrow.gif')" alt="" width="10" height="9">
            <span class="mwnf-sh-bottom__current">{{ label('home.introduction') }}</span>
          </li>
          <li v-for="(t, ti) in themes" :key="t.id">
            <img :src="picture('legacy/arrow.gif')" alt="" width="10" height="9">
            <router-link :to="{ name: 'theme', params: { theme: ti + 1 } }">{{ text(t.id).title }}</router-link>
          </li>
        </ul>
      </div>
      <div class="mwnf-sh-bottom__related">
        <Related arrow="legacy/arrow_inner.gif" />
        <Windows class="mwnf-sh-bottom__windows" />
      </div>
    </div>
  </div>
</template>
