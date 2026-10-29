<script setup>
// Further Reading (bibliography.php): under the introduction's banner, titled
// Further Reading, the languages the bibliography is in (the page's own
// marked), the link closing the window, the exhibition's name and its
// bibliography, in the page language, its entries in the order the importer
// kept (legacy's own: the curated order where the exhibition set one, else
// alphabetical).
import { computed } from 'vue'
import { useSharingHistoryExhibition } from './exhibition.js'
import Banner from './Banner.vue'

const { data, label, lang, languageName, offered, picture, root, text, title } = useSharingHistoryExhibition()

// The importer keeps the bibliography by legacy's language code.
const bibliography = computed(() => (root.value ? text(root.value.id).extra?.bibliography ?? {} : {}))
const shownLanguage = computed(() => (bibliography.value[lang.value] ? lang.value : 'en'))
const entries = computed(() => bibliography.value[shownLanguage.value] ?? [])
// The languages of this website the bibliography is in. Legacy floated its
// tabs right, so the first it listed stood rightmost.
const languages = computed(() => offered.filter((code) => bibliography.value[code]?.length).reverse())

// Legacy's link closed the window bibliography.php had been opened in.
const close = () => window.close()
</script>

<template>
  <div v-if="root">
    <Banner kind="intro" :heading="label('related.furtherReading')" :paging="false" />
    <div class="mwnf-sh-reading">
      <div class="mwnf-sh-reading__languages">
        <template v-for="code in languages" :key="code">
          <div v-if="code === shownLanguage" class="mwnf-sh-reading__language mwnf-sh-reading__language--current">{{ languageName(code) }}</div>
          <div v-else class="mwnf-sh-reading__language">
            <router-link :to="{ name: 'further-reading', query: { lang: code } }">{{ languageName(code) }}</router-link>
          </div>
        </template>
      </div>
      <div class="mwnf-sh-reading__content">
        <div class="mwnf-sh-reading__close">
          <a href="#" @click.prevent="close"><img :src="picture('legacy/dash_dark_back.gif')" alt="" width="11" height="8">{{ label('reading.close') }}</a>
        </div>
        <div class="mwnf-sh-reading__title"><span>{{ title }}</span></div>
        <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
        <p v-for="entry in entries" :key="entry" v-html="data.mdInline(entry)" />
      </div>
    </div>
  </div>
</template>
