<script setup>
// The exhibition's home page (generic_index.php, generic_homelogo.php): its
// title and line over legacy's picture, the menu — the introduction and every
// theme, the later ones in a second column (`minisite.menuSecondColumnFrom`) —
// and the band crediting the curators (`minisite.curators`), whose line opens
// the credits.
import { computed, watch } from 'vue'
import { openWindow, useExhibition, WINDOWS } from './exhibition.js'
import { vTip } from './tip.js'

const { t, lang, data, root, themes, text, title, settings, picture, href, glossaryFor } = useExhibition()

const description = computed(() =>
  root.value ? data.mdInline(text(root.value.id).description, { glossary: glossaryFor(root.value.id) }) : '',
)

// $_HOME_MENU_COL2: the introduction and the themes before this position in
// the first column, the rest in the second.
const split = computed(() => (settings.menuSecondColumnFrom ?? Infinity) - 1)
const firstColumn = computed(() => themes.value.slice(0, split.value).map((theme, i) => ({ theme, number: i + 1 })))
const secondColumn = computed(() => themes.value.slice(split.value).map((theme, i) => ({ theme, number: split.value + i + 1 })))

const curators = computed(() => settings.curators ?? [])

// A curator's tooltip: the museum's name and its country (MuseumTool::getMuseumName).
function curatorName(id) {
  const partner = data.partnerById.value.get(id)
  const country = partner?.country_id ? data.tr('countries', partner.country_id, lang.value).name : ''
  return [data.tr('partners', id, lang.value).name, country].filter(Boolean).join(', ')
}

const background = computed(() => picture(lang.value === 'ar' ? 'legacy/home_bg_ar.jpg' : 'legacy/home_bg.jpg'))

watch([title, lang], () => {
  document.title = [t('minisite.identity.windowTitle'), title.value].filter(Boolean).join(' | ')
}, { immediate: true })
</script>

<template>
  <div class="mwnf-minisite-home">
    <div class="mwnf-minisite-home__bg1" />
    <div class="mwnf-minisite-home__bg2" :style="{ backgroundImage: background ? `url(${background})` : 'none' }" />
    <div class="mwnf-minisite-home__title">{{ title }}</div>
    <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
    <div class="mwnf-minisite-home__description" v-html="description" />
    <div class="mwnf-minisite-home__menu">
      <div>&gt; <router-link :to="{ name: 'introduction' }">{{ t('minisite.home.introduction') }}</router-link></div>
      <div v-for="{ theme, number } in firstColumn" :key="theme.id">
        &gt; <router-link :to="{ name: 'exhibition', params: { theme: number } }">{{ text(theme.id).title }}</router-link>
      </div>
    </div>
    <div v-if="secondColumn.length" class="mwnf-minisite-home__menu2">
      <div v-for="{ theme, number } in secondColumn" :key="theme.id">
        &gt; <router-link :to="{ name: 'exhibition', params: { theme: number } }">{{ text(theme.id).title }}</router-link>
      </div>
    </div>
  </div>
  <div class="mwnf-minisite-partners">
    <div class="mwnf-minisite-partners__line">
      <a :href="href({ name: 'credits' })" @click.prevent="openWindow(href({ name: 'credits' }), WINDOWS.credits)">{{ t('minisite.home.curatedBy') }}</a>
    </div>
    <div class="mwnf-minisite-partners__logos">
      <template v-for="(curator, i) in curators" :key="curator.partner">
        <a v-tip="{ text: curatorName(curator.partner), width: 280 }" :href="settings.partnerHref?.(curator.partner)">
          <img :src="picture(curator.logo)" alt="" height="74">
        </a>
        <span v-if="i < curators.length - 1" class="mwnf-minisite-partners__space" :style="{ width: `${curator.space ?? 0}px` }" />
      </template>
    </div>
  </div>
</template>
