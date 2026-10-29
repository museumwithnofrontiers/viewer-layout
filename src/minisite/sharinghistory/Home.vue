<script setup>
// The exhibition's home page (exh_items.php): its picture with the title and
// the quote laid over its foot; the menu — About the Exhibition, then each
// theme, which opens on its overview and subthemes — beside Related Content;
// the band with the windows and the partners' logos.
import { computed, ref } from 'vue'
import { useSharingHistoryExhibition } from './exhibition.js'
import Related from './Related.vue'
import Windows from './Windows.vue'
import { vTip } from '../tip.js'

const { data, imagesOf, label, picture, root, settings, subthemesOf, text, themes, title } = useSharingHistoryExhibition()

// A logo led to its partner's page on legacy; the parent site rebuilt those
// pages (`partnerLinks`, by legacy's address).
const logoHref = (logo) => settings.partnerLinks?.[logo.link] ?? logo.link

const quote = computed(() => (root.value ? text(root.value.id).extra?.subtitle ?? '' : ''))
const logos = computed(() => imagesOf('logo'))
// Legacy's accordion opened with every theme closed.
const open = ref(-1)
</script>

<template>
  <div v-if="root" class="mwnf-sh-home">
    <div class="mwnf-sh-home__picture" :style="{ backgroundImage: `url(${picture('legacy/home_bg.jpg') ?? ''})` }">
      <div class="mwnf-sh-home__heading">
        <div class="mwnf-sh-home__title">{{ title }}</div>
        <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
        <div v-if="quote" class="mwnf-sh-home__quote" v-html="data.mdInline(quote)" />
      </div>
    </div>

    <div class="mwnf-sh-home__menu">
      <div class="mwnf-sh-home__themes">
        <router-link :to="{ name: 'introduction' }">
          <b>{{ label('home.introduction') }}</b>
          <img :src="picture('legacy/arrow_black.gif')" alt="" width="15" height="9">
        </router-link>
        <div v-for="(theme, ti) in themes" :key="theme.id">
          <button type="button" class="mwnf-sh-home__theme" :aria-expanded="open === ti" @click="open = open === ti ? -1 : ti">
            {{ text(theme.id).title }}
            <img :src="picture('legacy/arrow_black_down.gif')" alt="" width="15" height="9">
          </button>
          <ul v-if="open === ti" class="mwnf-sh-home__pages">
            <li>
              <img :src="picture('legacy/arrow_inner_black.gif')" alt="" class="mwnf-sh-arrow" width="11" height="8">
              <router-link :to="{ name: 'theme', params: { theme: ti + 1 } }">{{ label('home.overview') }}</router-link>
            </li>
            <li v-for="(sub, si) in subthemesOf(theme.id)" :key="sub.id">
              <img :src="picture('legacy/arrow_inner_black.gif')" alt="" class="mwnf-sh-arrow" width="11" height="8">
              <router-link :to="{ name: 'subtheme', params: { theme: ti + 1, page: si + 1 } }">{{ text(sub.id).title }}</router-link>
            </li>
          </ul>
        </div>
      </div>
      <Related all-exhibitions />
    </div>

    <div class="mwnf-sh-band">
      <Windows class="mwnf-sh-band__links" />
      <div class="mwnf-sh-band__logos">
        <template v-for="(logo, i) in logos" :key="logo.url">
          <span v-if="i > 0" class="mwnf-sh-band__gap" />
          <a v-if="logo.link" v-tip="{ text: logo.alt_text ?? '' }" :href="logoHref(logo)"><img :src="logo.url" alt=""></a>
          <img v-else :src="logo.url" alt="">
        </template>
      </div>
    </div>
  </div>
</template>
