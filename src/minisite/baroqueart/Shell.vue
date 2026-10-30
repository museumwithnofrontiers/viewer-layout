<script setup>
// Discover Baroque Art's frame around every virtual exhibition page
// (exhibitions/BAR/generic_index.php and the others, _mainpage.css): a 763px
// column between two fading strips, the header with the MWNF logo, the two
// links back to the parent site and the language switcher; under the page,
// the menu (generic_footerTop.php), its links side by side with no bar between
// them, and the footer. The zoom window is a route marked `meta.bare`, drawn
// without it. What it shows comes from `navigation` (`baroqueartNavigation()`);
// its pictures are the site's chrome files under `legacy/`, the names legacy
// gave them.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { chromeSource } from '../../chrome.js'
import { tip, vTip } from '../tip.js'

const props = defineProps({
  languages: { type: Array, default: () => [] },
  language: { type: String, required: true },
  logoHref: { type: String, required: true },
  logoTip: { type: String, default: 'minisiteBaroque.header.logoTip' },
  headerLinks: { type: Array, default: () => [] },
  menu: { type: Array, default: () => [] },
  footerLinks: { type: Array, default: () => [] },
  copyright: { type: String, required: true },
})
const emit = defineEmits(['update:language'])

const { t } = useI18n()
const config = useSiteConfig()
const route = useRoute()
const bare = computed(() => route.meta?.bare ?? null)
const asset = (path) => chromeSource(config.chrome, path)

// The switcher lists legacy's languages by name, as its query sorted them.
const options = computed(() => [...props.languages].sort((a, b) => a.label.localeCompare(b.label)))
const year = new Date().getFullYear()

// The fading strips either side; legacy swapped them for English.
const strips = computed(() => {
  const left = asset('legacy/bg_fading_left.gif')
  const right = asset('legacy/bg_fading_right.gif')
  return props.language === 'en' ? [left, right] : [right, left]
})
</script>

<template>
  <div v-if="bare" :class="`mwnf-baroqueart-window mwnf-baroqueart-window--${bare}`">
    <slot />
  </div>
  <div v-else class="mwnf-baroqueart">
    <div class="mwnf-baroqueart__strip" :style="{ backgroundImage: strips[0] ? `url(${strips[0]})` : 'none' }" aria-hidden="true" />
    <div class="mwnf-baroqueart__column">
      <header class="mwnf-baroqueart-header">
        <div class="mwnf-baroqueart-header__logo">
          <a v-tip="{ text: logoTip ? t(logoTip) : '' }" :href="logoHref">
            <img :src="asset(`legacy/logo_${language}.gif`)" alt="" height="60">
          </a>
        </div>
        <div class="mwnf-baroqueart-header__nav">
          <div class="mwnf-baroqueart-header__back">
            <template v-for="(link, i) in headerLinks" :key="link.label">
              <template v-if="i > 0">&nbsp;|&nbsp;</template>
              <a v-tip="{ text: link.tip ? t(link.tip) : '' }" class="mwnf-baroqueart-header__link" :href="link.href">{{ t(link.label) }}</a>
            </template>
          </div>
          <div>
            <select
              class="mwnf-baroqueart-header__select"
              :value="language"
              :aria-label="t('layout.language.label')"
              @change="emit('update:language', $event.target.value)"
            >
              <option v-for="option in options" :key="option.code" :value="option.code">{{ option.label }}</option>
            </select>
          </div>
        </div>
      </header>

      <main>
        <slot />
      </main>

      <nav class="mwnf-baroqueart-menu">
        <ul class="mwnf-baroqueart-menu__list">
          <li v-for="link in menu" :key="link.label"><a :href="link.href">{{ t(link.label) }}</a></li>
        </ul>
      </nav>
      <div class="mwnf-baroqueart-menu__line" />
      <footer class="mwnf-baroqueart-footer">
        <template v-for="link in footerLinks" :key="link.label">
          <a :href="link.href">{{ t(link.label) }}</a>&nbsp;|&nbsp;
        </template>{{ t(copyright) }} {{ year }}
      </footer>
    </div>
    <div class="mwnf-baroqueart__strip" :style="{ backgroundImage: strips[1] ? `url(${strips[1]})` : 'none' }" aria-hidden="true" />
  </div>

  <div
    v-show="tip.visible"
    class="mwnf-baroqueart-tip"
    :style="{ left: `${tip.x + 12}px`, top: `${tip.y + 16}px`, width: `${tip.width}px` }"
    role="tooltip"
  >
    {{ tip.text }}
  </div>
</template>
