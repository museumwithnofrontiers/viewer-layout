<script setup>
// A theme's overview (theme_items.php, `page` 0) or one of its subthemes
// (subtheme_items.php): the theme's title and the page's in the coloured bar,
// the thumbnails of its pictures, the quote and the text, "More about" the
// theme, the download block; the item panel beside them; under both, the
// exhibition's pages, Related Content and the windows.
import { computed, ref, watch } from 'vue'
import { mdStrip, NotFoundView } from '@museumwnf/viewer-core'
import { useSharingHistoryExhibition } from './exhibition.js'
import Banner from './Banner.vue'
import Download from './Download.vue'
import Panel from './Panel.vue'
import Related from './Related.vue'
import Windows from './Windows.vue'

const props = defineProps({
  theme: { type: Number, required: true },
  page: { type: Number, default: 0 },
})

const { data, label, pageAt, picture, slots, subthemesOf, text, themes, title } = useSharingHistoryExhibition()

const current = computed(() => pageAt(props.theme, props.page))
const themeNode = computed(() => current.value?.themeNode ?? null)
const node = computed(() => current.value?.node ?? null)
const own = computed(() => (node.value ? text(node.value.id) : {}))
const pageSlots = computed(() => slots(node.value))
const subthemes = computed(() => (themeNode.value ? subthemesOf(themeNode.value.id) : []))

// The panel shows the first picture's first view until a thumbnail or a view is chosen.
const shown = ref(0)
const view = ref(0)
watch(node, () => {
  shown.value = 0
  view.value = 0
})
const choose = (index) => {
  shown.value = index
  view.value = 0
}

// Legacy's pages printed the titles with their tags stripped (its home menu kept their italics).
const titleOf = (id) => mdStrip(text(id).title ?? '')
const pageName = computed(() => (props.page === 0 ? label('home.overview') : mdStrip(own.value.title ?? '')))
const blocks = computed(() => [
  { heading: text(themeNode.value?.id).title },
  { heading: pageName.value },
  { text: own.value.quote ?? '' },
  { text: own.value.description ?? '' },
])
</script>

<template>
  <NotFoundView v-if="!current" />
  <div v-else class="mwnf-sh-pagewrap" style="font-size: calc(11px * var(--sh-text-scale, 1))">
    <Banner :next="current.next" />
    <div class="mwnf-sh-page">
      <div class="mwnf-sh-page__text">
        <div class="mwnf-sh-page__theme">{{ titleOf(themeNode.id) }}</div>
        <div class="mwnf-sh-page__name">&nbsp;{{ pageName }}</div>
        <div v-if="pageSlots.length" class="mwnf-sh-page__thumbs">
          <button v-for="(slot, i) in pageSlots" :key="`${slot.n}-${slot.variants[0].id}`" type="button" @click="choose(i)">
            <img :src="slot.variants[0].image_url" alt="">
          </button>
        </div>
        <div class="mwnf-sh-page__rule" />
        <div class="mwnf-sh-page__body">
          <!-- eslint-disable vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
          <div v-if="own.quote" class="mwnf-sh-page__quote" v-html="data.md(own.quote)" />
          <div v-if="own.description" v-html="data.md(own.description)" />
          <!-- eslint-enable vue/no-v-html -->
        </div>
        <div class="mwnf-sh-more">
          <b><span class="mwnf-sh-more__label">{{ label('page.moreAbout') }}</span><br><span class="mwnf-sh-more__theme">{{ titleOf(themeNode.id) }}</span></b>
          <ul>
            <li>
              <img :src="picture('legacy/arrow_inner_black.gif')" alt="" class="mwnf-sh-arrow" width="11" height="8">
              <span v-if="page === 0" class="mwnf-sh-more__current">{{ label('home.overview') }}</span>
              <router-link v-else :to="{ name: 'theme', params: { theme } }">{{ label('home.overview') }}</router-link>
            </li>
            <li v-for="(sub, si) in subthemes" :key="sub.id">
              <img :src="picture('legacy/arrow_inner_black.gif')" alt="" class="mwnf-sh-arrow" width="11" height="8">
              <span v-if="page === si + 1" class="mwnf-sh-more__current">{{ titleOf(sub.id) }}</span>
              <router-link v-else :to="{ name: 'subtheme', params: { theme, page: si + 1 } }">{{ titleOf(sub.id) }}</router-link>
            </li>
          </ul>
        </div>
        <Download :title="title" :blocks="blocks" />
      </div>
      <Panel v-model:view="view" :slot="pageSlots[shown] ?? null" />
    </div>
    <div class="mwnf-sh-bottom">
      <div class="mwnf-sh-bottom__pages">
        <b>{{ label('page.inExhibition') }}</b>
        <ul>
          <li>
            <img :src="picture('legacy/arrow.gif')" alt="" width="10" height="9">
            <router-link :to="{ name: 'introduction' }">{{ label('home.introduction') }}</router-link>
          </li>
          <li v-for="(t, ti) in themes" :key="t.id">
            <img :src="picture('legacy/arrow.gif')" alt="" width="10" height="9">
            <span v-if="ti + 1 === theme" class="mwnf-sh-bottom__current">{{ titleOf(t.id) }}</span>
            <router-link v-else :to="{ name: 'theme', params: { theme: ti + 1 } }">{{ titleOf(t.id) }}</router-link>
          </li>
        </ul>
      </div>
      <div class="mwnf-sh-bottom__related">
        <Related arrow="legacy/arrow_inner.gif" :theme-id="themeNode.id" :subtheme-id="page === 0 ? null : node.id" />
        <Windows class="mwnf-sh-bottom__windows" />
      </div>
    </div>
  </div>
</template>
