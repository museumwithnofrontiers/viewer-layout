<script setup>
import { computed } from 'vue'
import { useI18n, useSection, useSiteConfig } from '@museumwnf/viewer-core'
import SiteShell from '../components/SiteShell.vue'
import { chromeSource } from '../chrome.js'
import Banner from './Banner.vue'
import Sponsors from './Sponsors.vue'
import { byLanguage } from './chrome.js'

// A standalone site's page chrome — Discover Islamic Art, Discover Baroque
// Art, Sharing History, the three sites legacy built from one PHP template
// family. It is the layout's `SiteShell`, so everything SiteShell reads from
// the config works as on any site: `navigation` (the menu, `placement` —
// legacy's menu sits under the home page's picture and above every other
// page's band — the footer links, `socialLinks`), `chrome` (the site's own
// files under theme/assets/) and `brand`. On top, what the family's legacy
// pages share, read from `config.standalone`:
//
//   standalone: {
//     logo: { src, alt: entry, href, print },  // `src`, `print`: a chrome key or URL, or one per language ({ en, ar })
//     heading: entry,                         // the header's title, on every page but the home page
//     headerLinks: [{ label, href | to, external, on: 'home' | 'inner' | 'all' }],
//     banner: { home, inner, homeTitle, homeText },  // chrome keys or URLs: the home page's picture; the inner pages' band;
//                                             // entries printed over the home page's picture (Sharing History's bannerText.php)
//     languages: true,                        // false: chrome in one language, no switcher
//     copyright: entry,                       // the footer line; the current year follows it
//     sponsors: { on: 'home' | 'all', columns: [...] },   // see Sponsors.vue
//     areas: { [section]: { logo, banner, class } },      // a section with its own chrome
//   }
//
// The inner pages' band is titled by `navigation.sectionTitles[section]`, as
// on every site. Every value is optional.

const props = defineProps({
  language: { type: String, default: 'en' },
  languages: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:language'])

const { t, locale } = useI18n()
const siteConfig = useSiteConfig()
const section = useSection()

const standalone = computed(() => siteConfig.standalone ?? {})
const nav = computed(() => siteConfig.navigation ?? {})
const isHome = computed(() => section.value === 'home')
const area = computed(() => standalone.value.areas?.[section.value] ?? null)
const asset = (value) => chromeSource(siteConfig.chrome, byLanguage(value, locale.value))

// The mark: SiteShell's `brand`, in the language the site is in.
const brand = computed(() => {
  const own = standalone.value.logo ?? {}
  const logo = asset(area.value?.logo ?? own.src)
  return logo ? { logo, alt: own.alt ?? '' } : null
})
const printLogo = computed(() => asset(standalone.value.logo?.print))

const headerLinks = computed(() => (standalone.value.headerLinks ?? [])
  .filter((link) => !link.on || link.on === 'all' || link.on === (isHome.value ? 'home' : 'inner')))

const bannerImage = computed(() => {
  const banner = { ...(standalone.value.banner ?? {}), ...(area.value?.banner ?? {}) }
  return asset(isHome.value ? banner.home : banner.inner) ?? ''
})
const bannerTitle = computed(() => {
  const entry = nav.value.sectionTitles?.[section.value]
  return entry ? t(entry) : ''
})
const innerBanner = computed(() => !isHome.value && Boolean(bannerImage.value || bannerTitle.value))
// The home page's words over its picture, when legacy printed any.
const homeBanner = computed(() => {
  const { homeTitle, homeText } = standalone.value.banner ?? {}
  return isHome.value && (homeTitle || homeText) ? { title: homeTitle ? t(homeTitle) : '', text: homeText ? t(homeText) : '' } : null
})

const sponsors = computed(() => {
  const band = standalone.value.sponsors
  if (!band?.columns?.length) return null
  return band.on === 'all' || isHome.value ? band : null
})

// What SiteShell builds from the config, adjusted per page: the header links
// of this kind of page, the mark, no banner of SiteShell's own (this shell
// draws it), and no switcher on a site whose chrome has one language.
const shellConfig = computed(() => ({
  navigation: {
    ...nav.value,
    headerLinks: headerLinks.value,
    sectionTitles: {},
    ...(standalone.value.languages === false ? { languages: [] } : {}),
  },
  banner: null,
  ...(brand.value ? { brand: brand.value } : {}),
}))

const currentYear = new Date().getFullYear()
const footerText = computed(() => (standalone.value.copyright ? `${t(standalone.value.copyright)} ${currentYear}` : ''))

const pageClass = computed(() => [
  'mwnf-standalone',
  isHome.value ? 'mwnf-standalone--home' : 'mwnf-standalone--inner',
  area.value?.class ?? '',
])
</script>

<template>
  <SiteShell
    :class="pageClass"
    :config="shellConfig"
    :languages="standalone.languages === false ? [] : props.languages"
    :language="props.language"
    language-placement="header"
    language-style="select"
    :header-home="standalone.logo?.href ?? ''"
    :header-title="isHome ? '' : (standalone.heading ? t(standalone.heading) : '')"
    header-title-href="#/"
    :banner-image="isHome && !homeBanner ? bannerImage : ''"
    :footer-text="footerText || undefined"
    @update:language="emit('update:language', $event)"
  >
    <template v-if="innerBanner" #banner>
      <Banner :image="bannerImage" :title="bannerTitle" />
    </template>
    <template v-else-if="homeBanner" #banner>
      <section class="mwnf-banner mwnf-standalone-home-banner">
        <img v-if="bannerImage" class="mwnf-banner__image" :src="bannerImage" alt="" />
        <div class="mwnf-standalone-home-banner__text">
          <h2 v-if="homeBanner.title" class="mwnf-standalone-home-banner__title"><i>{{ homeBanner.title }}</i></h2>
          <p v-if="homeBanner.text" class="mwnf-standalone-home-banner__line"><span>{{ homeBanner.text }}</span></p>
        </div>
      </section>
    </template>
    <template v-if="printLogo" #notice>
      <img class="mwnf-standalone__print-logo" :src="printLogo" alt="" />
    </template>
    <slot />
    <template v-if="sponsors" #sponsors>
      <Sponsors :columns="sponsors.columns" />
    </template>
  </SiteShell>
</template>
