<script setup>
// The exhibition's home page (generic_index.php, generic_homelogo.php): its
// title and line over legacy's picture, the menu — the introduction and every
// theme, the later ones in a second column (`minisite.menuSecondColumnFrom`) —
// and the band crediting the curators, whose line opens the credits. Which
// curators, their logos and their links are the site's own (`minisite.curators`);
// how the band shows them is here.
import { computed, watch } from 'vue'
import { openWindow, useExhibition, WINDOWS } from './exhibition.js'
import { curatorLabel, curatorLink } from './rules.js'
import { vTip } from './tip.js'

const { label, family, lang, data, root, themes, text, title, settings, picture, href, glossaryFor } = useExhibition()

const description = computed(() =>
  root.value ? data.mdInline(text(root.value.id).description, { glossary: glossaryFor(root.value.id) }) : '',
)

// $_HOME_MENU_COL2: the introduction and the themes before this position in
// the first column, the rest in the second.
const split = computed(() => (settings.menuSecondColumnFrom ?? Infinity) - 1)
const firstColumn = computed(() => themes.value.slice(0, split.value).map((theme, i) => ({ theme, number: i + 1 })))
const secondColumn = computed(() => themes.value.slice(split.value).map((theme, i) => ({ theme, number: split.value + i + 1 })))

const curators = computed(() => settings.curators ?? [])

const curatorName = (curator) =>
  curatorLabel(curator, {
    partnerName: (id) => data.tr('partners', id, lang.value).name,
    partnerCountry: (id) => data.partnerById.value.get(id)?.country_id,
    countryName: (id) => data.tr('countries', id, lang.value).name,
  })
const curatorHref = (curator) => curatorLink(curator, settings.partnerHref)

// Discover Baroque Art's band (exhibitions/BAR/generic_homelogo.php): who
// curated the exhibition (its own credits text), the partner institutions'
// list, each curator named over its logo, and beside them the designer.
const credits = computed(() => (root.value ? text(root.value.id).extra?.credits ?? '' : ''))
const design = computed(() => settings.design ?? null)

const background = computed(() => picture(lang.value === 'ar' ? 'legacy/home_bg_ar.jpg' : 'legacy/home_bg.jpg'))

watch([title, lang], () => {
  document.title = [label('identity.windowTitle'), title.value].filter(Boolean).join(' | ')
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
      <div>&gt; <router-link :to="{ name: 'introduction' }">{{ label('home.introduction') }}</router-link></div>
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
  <div v-if="family === 'BAR'" class="mwnf-minisite-partners mwnf-minisite-partners--baroque">
    <div class="mwnf-minisite-partners__curators">
      <div class="mwnf-minisite-partners__line">{{ label('home.curatedBy') }}</div>
      <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
      <div class="mwnf-minisite-partners__tab" v-html="data.mdInline(credits)" />
      <div class="mwnf-minisite-partners__cooperation">
        {{ label('home.cooperation') }} <a :href="settings.partnerListHref">{{ label('home.partnerInstitutions') }}</a>
      </div>
      <div class="mwnf-minisite-partners__tab">
        <template v-for="(curator, i) in curators" :key="curator.logo">
          {{ curatorName(curator) }}<br>
          <a v-tip="{ text: curatorName(curator), width: 220 }" class="mwnf-minisite-partners__curator" :href="curatorHref(curator)"><img :src="picture(curator.logo)" alt=""></a>
          <span v-if="i < curators.length - 1" class="mwnf-minisite-partners__gap" :style="{ width: `${curator.space ?? 0}px` }" />
        </template>
      </div>
    </div>
    <div v-if="design" class="mwnf-minisite-partners__design">
      {{ label('home.design') }}
      <div class="mwnf-minisite-partners__design-tab">{{ design.name }}</div>
      <div class="mwnf-minisite-partners__design-tab">
        <a :href="design.href" target="_blank" rel="noopener"><img :src="picture(design.logo)" alt=""></a>
      </div>
    </div>
  </div>
  <div v-else class="mwnf-minisite-partners">
    <div class="mwnf-minisite-partners__line">
      <a :href="href({ name: 'credits' })" @click.prevent="openWindow(href({ name: 'credits' }), WINDOWS.credits)">{{ label('home.curatedBy') }}</a>
    </div>
    <div class="mwnf-minisite-partners__logos">
      <template v-for="(curator, i) in curators" :key="curator.logo">
        <a v-tip="{ text: curatorName(curator), width: 280 }" class="mwnf-minisite-partners__curator" :href="curatorHref(curator)">
          <img :src="picture(curator.logo)" alt="" height="74">
        </a>
        <span v-if="i < curators.length - 1" class="mwnf-minisite-partners__space" :style="{ width: `${curator.space ?? 0}px` }" />
      </template>
    </div>
  </div>
</template>
