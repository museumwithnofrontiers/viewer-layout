<script setup>
import { computed } from 'vue'
import { useI18n, useSection, useSiteConfig } from '@museumwnf/viewer-core'
import SiteShell from '../components/SiteShell.vue'
import PageShell from '../PageShell.vue'
import Banner from './Banner.vue'
import Sponsors from './Sponsors.vue'
import { byLanguage } from './chrome.js'

// A standalone site's page chrome — Discover Islamic Art, Discover Baroque
// Art, Sharing History, the three sites legacy built from one PHP template
// family. The layout's `SiteShell`, composed from the config's `navigation`
// as on every site, plus what the family's legacy pages share, read from
// `config.standalone`:
//
//   standalone: {
//     logo: { src: url | { [lang]: url }, alt: entry, href, print: url | { [lang]: url } },
//     heading: entry,                         // the header's title, on every page but the home page
//     headerLinks: [{ label, href | to, external, on: 'home' | 'inner' | 'all' }],
//     banner: { home: url, inner: url },      // the home page's picture; the inner pages' band, titled
//     menu: { home: 'after-banner', inner: 'before-banner' },
//     languages: true,                        // false: chrome in one language, no switcher
//     copyright: entry,                       // the footer line; the current year follows it
//     sponsors: { on: 'home' | 'all', columns: [...] },   // see Sponsors.vue
//     areas: { [section]: { logo, banner, class } },      // a section with its own chrome
//   }
//
// The inner pages' banner title is `navigation.sectionTitles[section]`, as on
// every site. Every value is optional: a site that sets none gets the
// SiteShell it had.
//
// The menu above the banner needs PageShell's `navigationPlacement`. Until
// the PageShell this package carries has it, the inner banner is the first
// block of the page's content instead: the same order on the screen.

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

const nativePlacement = Boolean(PageShell.props?.navigationPlacement)

const logo = computed(() => {
  const own = standalone.value.logo ?? {}
  const src = byLanguage(area.value?.logo ?? own.src, locale.value)
  return src ? { src, alt: own.alt ? t(own.alt) : '', href: own.href ?? '', print: byLanguage(own.print, locale.value) } : null
})

const headerLinks = computed(() => (standalone.value.headerLinks ?? [])
  .filter((link) => !link.on || link.on === 'all' || link.on === (isHome.value ? 'home' : 'inner')))

const menuPlacement = computed(() => {
  const menu = standalone.value.menu ?? {}
  return (isHome.value ? menu.home : menu.inner) ?? 'after-banner'
})

const bannerImage = computed(() => {
  const banner = { ...(standalone.value.banner ?? {}), ...(area.value?.banner ?? {}) }
  return isHome.value ? (banner.home ?? '') : (banner.inner ?? '')
})
const bannerTitle = computed(() => {
  const entry = nav.value.sectionTitles?.[section.value]
  return entry ? t(entry) : ''
})
const innerBanner = computed(() => !isHome.value && Boolean(bannerImage.value || bannerTitle.value))
// Where the inner banner goes: the banner section when the menu stays below it
// or PageShell can put the menu first; else the top of the content.
const bannerInContent = computed(() => innerBanner.value && menuPlacement.value === 'before-banner' && !nativePlacement)

const sponsors = computed(() => {
  const band = standalone.value.sponsors
  if (!band?.columns?.length) return null
  return band.on === 'all' || isHome.value ? band : null
})

// What SiteShell builds from the config, adjusted per page: the header links
// of this kind of page, no banner of SiteShell's own (this shell draws it),
// and no switcher on a site whose chrome has one language.
const shellConfig = computed(() => ({
  navigation: {
    ...nav.value,
    headerLinks: headerLinks.value,
    sectionTitles: {},
    ...(standalone.value.languages === false ? { languages: [] } : {}),
  },
  banner: null,
}))

const currentYear = new Date().getFullYear()
const footerText = computed(() => (standalone.value.copyright ? `${t(standalone.value.copyright)} ${currentYear}` : ''))

// The sections decide whether to draw a slot once, when they are created
// (AppSponsors' and AppBanner's `visible` read `useSlots()` in a computed,
// which does not track a slot that comes or goes). So the shell is drawn anew
// whenever the set of slots it passes changes: the first route resolves after
// the shell exists, and home ↔ inner page swaps the banner and the band.
const slotSet = computed(() => [isHome.value, Boolean(sponsors.value), innerBanner.value, bannerInContent.value].join('-'))

const pageClass = computed(() => [
  'mwnf-standalone',
  isHome.value ? 'mwnf-standalone--home' : 'mwnf-standalone--inner',
  area.value?.class ?? '',
])
</script>

<template>
  <SiteShell
    :key="slotSet"
    :class="pageClass"
    :config="shellConfig"
    :languages="standalone.languages === false ? [] : props.languages"
    :language="props.language"
    language-placement="header"
    language-style="select"
    :header-home="logo?.href ?? ''"
    :header-title="isHome ? '' : (standalone.heading ? t(standalone.heading) : '')"
    header-title-href="#/"
    :banner-image="isHome ? bannerImage : ''"
    :navigation-placement="nativePlacement ? menuPlacement : undefined"
    :footer-text="footerText || undefined"
    @update:language="emit('update:language', $event)"
  >
    <template v-if="logo" #brand>
      <img class="mwnf-standalone__logo" :src="logo.src" :alt="logo.alt" />
      <img v-if="logo.print" class="mwnf-standalone__print-logo" :src="logo.print" alt="" />
    </template>
    <template v-if="innerBanner && !bannerInContent" #banner>
      <Banner :image="bannerImage" :title="bannerTitle" />
    </template>
    <template v-if="bannerInContent" #notice>
      <Banner class="mwnf-standalone-banner--in-content" :image="bannerImage" :title="bannerTitle" />
    </template>
    <slot />
    <template v-if="sponsors" #sponsors>
      <Sponsors :columns="sponsors.columns" />
    </template>
  </SiteShell>
</template>
