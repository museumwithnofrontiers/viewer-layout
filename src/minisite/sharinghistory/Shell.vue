<script setup>
// The Sharing History frame around every virtual exhibition page
// (exhibitions/AWE/_headerEx.php, _menuFooterEx.php, _footer_inside.inc.php):
// a 990px column between two fading strips; the header with the MWNF logo,
// the site's name and its links, with the text-size buttons over a page of
// text; under the page, the menu and the footer. Legacy's windows (the
// curators, the cover image, the zoom) are routes marked `meta.bare`, drawn
// without it. What it shows comes from `navigation`
// (`sharinghistoryNavigation()`); its pictures are the site's chrome files
// under `legacy/`, the names legacy gave them.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { chromeSource } from '../../chrome.js'
import { tip, vTip } from '../tip.js'

const props = defineProps({
  languages: { type: Array, default: () => [] },
  language: { type: String, required: true },
  texts: { type: String, default: 'minisiteSharingHistory' },
  portalHref: { type: String, required: true },
  homeHref: { type: String, required: true },
  aboutLinks: { type: Array, default: () => [] },
  menu: { type: Array, default: () => [] },
  footerLinks: { type: Array, default: () => [] },
})

const { t } = useI18n()
const config = useSiteConfig()
const route = useRoute()
const bare = computed(() => route.meta?.bare ?? null)
const asset = (path) => chromeSource(config.chrome, path)
const label = (key) => t(`${props.texts}.${key}`)
const year = new Date().getFullYear()

// The text-size buttons legacy drew over a page of text (_font_resize_script.php).
const scale = ref(1)
const sizable = computed(() => route.name !== 'home')
const resize = (step) => {
  scale.value = step === 0 ? 1 : Math.min(1.6, Math.max(0.8, scale.value + step))
}

const frame = computed(() => ({
  '--sh-title-band': `url(${asset('legacy/bg.png') ?? ''})`,
  '--sh-text-scale': String(scale.value),
}))
</script>

<template>
  <div v-if="bare" :class="`mwnf-sh-window mwnf-sh-window--${bare}`">
    <slot />
  </div>
  <div v-else class="mwnf-sh" :style="frame">
    <div class="mwnf-sh__strip" :style="{ backgroundImage: `url(${asset('legacy/bg_fading_right.gif') ?? ''})` }" aria-hidden="true" />
    <div class="mwnf-sh__column">
      <header class="mwnf-sh-header">
        <div class="mwnf-sh-header__logo">
          <a v-tip="{ text: label('header.portalTip') }" :href="portalHref">
            <img :src="asset(`legacy/mwnfLogoShExIn-${language}.png`) ?? asset('legacy/mwnfLogoShExIn-en.png')" alt="" width="101" height="45">
          </a>
        </div>
        <div class="mwnf-sh-header__space" />
        <a v-tip="{ text: label('header.homeTip') }" class="mwnf-sh-header__name" :href="homeHref">
          <h1>{{ label('header.heading') }}</h1>
          <h2>{{ label('header.subheading') }}</h2>
        </a>
        <div class="mwnf-sh-header__links">
          <div v-if="sizable" class="mwnf-sh-header__sizes">
            <button v-tip="{ text: label('header.decreaseSize') }" type="button" style="font-size: 9px" @click="resize(-0.1)">A</button>
            <button v-tip="{ text: label('header.revertSize') }" type="button" style="font-size: 11px" @click="resize(0)">A</button>
            <button v-tip="{ text: label('header.increaseSize') }" type="button" style="font-size: 13px" @click="resize(0.1)">A</button>
          </div>
          <ul class="mwnf-sh-header__list">
            <li>
              <a :href="aboutLinks[0]?.href">{{ label('header.about') }}</a>
              <ul class="mwnf-sh-drop">
                <li v-for="link in aboutLinks" :key="link.label"><a :href="link.href">{{ label(link.label) }}</a></li>
              </ul>
            </li>
          </ul>
          <div class="mwnf-sh-header__more">
            <a v-tip="{ text: label('header.homeTip') }" :href="homeHref">{{ label('header.home') }}</a>
            <a v-tip="{ text: label('header.portalTip') }" :href="portalHref">{{ label('header.portal') }}</a>
          </div>
        </div>
      </header>

      <main class="mwnf-sh__page">
        <slot />
      </main>

      <nav class="mwnf-sh-menu">
        <ul>
          <li v-for="item in menu" :key="item.label">
            <a v-tip="{ text: item.tip ? label(item.tip) : '' }" :href="item.href ?? '#'">{{ label(item.label) }}</a>
            <ul v-if="item.links?.length" class="mwnf-sh-drop">
              <li v-for="link in item.links" :key="link.href">
                <a :href="link.href">{{ link.text ?? label(link.label) }}</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <footer class="mwnf-sh-footer">
        <template v-for="link in footerLinks" :key="link.label">
          <a :href="link.href">{{ label(link.label) }}</a> |
        </template>
        {{ label('footer.copyright') }} {{ year }}
      </footer>
    </div>
    <div class="mwnf-sh__strip" :style="{ backgroundImage: `url(${asset('legacy/bg_fading_left.gif') ?? ''})` }" aria-hidden="true" />
    <div v-if="tip.visible" class="mwnf-sh-tip" :style="{ left: `${tip.x + 12}px`, top: `${tip.y + 12}px`, width: `${tip.width}px` }">{{ tip.text }}</div>
  </div>
</template>
