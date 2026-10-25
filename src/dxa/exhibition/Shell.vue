<script setup>
import { computed } from 'vue'
import { useI18n, useSection, useSiteConfig } from '@museumwnf/viewer-core'
import SiteShell from '../../components/SiteShell.vue'
import PopupLogo from '../PopupLogo.vue'
import { chromePicture, chromeSource, withSitePictures } from '../../chrome.js'
import {
  bannerCaption, chromeImage, defaultLang, exhibition, exhibitionHeadline, exhibitionSubtitle,
  exhibitionTitle, itemById, labelOf, md, tr,
} from './data.js'

// An exhibition's page chrome: the layout's `SiteShell`, composed from the
// config's `navigation`, `logos` and `banner` (exhibitionConfig), plus what
// only the loaded exhibition record can answer — the banner's image and
// caption, the home page's title, subtitle, headline, enter link and
// strapline, the logos reshaped into the shell's `logos` shape, the MWNF
// mark and the dismissible popup notice. Each exhibition carried this as its
// own `SiteShell.vue`, the same code in all six.

// `language`, `languages` and `update:language` are viewer-core's shell
// contract: the language the application is in, the languages it offers,
// and the event that sets it.
const props = defineProps({
  language: { type: String, default: 'en' },
  languages: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:language'])

const { t, locale } = useI18n()
const siteConfig = useSiteConfig()
const links = computed(() => siteConfig.links ?? {})

// The header mark: the site's own logo file (`config.brand`), else the text.
const hasLogo = computed(() => Boolean(chromeSource(siteConfig.chrome, siteConfig.brand?.logo)))

const section = useSection()
const isHome = computed(() => section.value === 'home')
const currentYear = new Date().getFullYear()

// The banner: on the home page legacy's composed home image, captioned with
// the home item's sheet; on every other page the exhibition's banner,
// captioned with the curator's own line where there is one, and with the
// banner item's sheet where there is not.
const homeImage = computed(() => (isHome.value ? exhibition.value?.homepage_image_path : null))
const bannerImage = computed(() => (
  homeImage.value
    ? chromeImage(homeImage.value, 'hi_res')
    : chromeImage(exhibition.value?.banner_image_path, 'hi_res')
))
const banner = computed(() => {
  const curated = homeImage.value ? '' : bannerCaption(locale.value)
  if (curated) return curated
  const itemId = homeImage.value ? exhibition.value?.homepage_item_id : exhibition.value?.banner_item_id
  const item = itemById.value.get(itemId)
  if (!item) return ''
  const sheet = tr('items', item.id, defaultLang)
  // Legacy's caption: the item's own holding museum (a monument has none, and
  // its institution is not printed), the location, on every page but the home
  // page the province, and the country.
  return {
    name: labelOf('items', item.id),
    holder: sheet.holder ?? '',
    location: sheet.location ?? '',
    province: homeImage.value ? '' : (sheet.province ?? ''),
    country: labelOf('countries', item.country_id),
  }
})

// Legacy's BottomBanner: the exhibition's identity on the left and the two
// ways into it on the right, under every page, Home included.
const bottomLinks = computed(() => [
  { label: t('core.nav.about'), description: t('exhibition.nav.introduction'), href: '#/about' },
  { label: t('exhibition.nav.themes'), description: t('exhibition.nav.contentAtAGlance'), href: '#/themes' },
])

// The exhibition's logo records, in the `logos` shape `config.logos.header`
// and `.sponsorGroups` bucket by: the header-logo fields plus the legacy
// category, visibility and order. The sponsors' logos are the site's, not the
// inventory's (inventory-app#2233, Pascal 2026-10-20): a site's own
// `sponsorLogos` list replaces the package's; otherwise each package entry
// draws the site's file at `chrome/<legacy_path>`, else legacy's media host —
// never the inventory's `image_url`.
function logoCaption(logo) {
  return logo.labels?.[locale.value] ?? logo.labels?.en ?? logo.alt_text ?? ''
}
const exhibitionLogos = computed(() => {
  const own = siteConfig.sponsorLogos
  if (Array.isArray(own)) {
    return own
      .map((logo) => ({ ...logo, image: chromeSource(siteConfig.chrome, logo.image), alt: logo.alt ? t(logo.alt) : '' }))
      .filter((logo) => logo.image)
  }
  return (exhibition.value?.logos ?? [])
    .map((logo) => ({
      image: logo.legacy_path ? chromeImage(logo.legacy_path, 'full') : null,
      alt: logoCaption(logo),
      href: logo.url || undefined,
      category_id: logo.category_id,
      category: logo.category,
      visible: logo.visible,
      display_order: logo.display_order,
    }))
    .filter((logo) => logo.image)
})

// A picture in the popup notice that the site keeps a copy of
// (`theme/assets/chrome/<path>`, the path after legacy's size segment) is
// drawn from the site's file.
function popupPicture(src) {
  const host = siteConfig.media?.legacyHost
  if (!host || !src.startsWith(`${host.replace(/\/+$/, '')}/`)) return null
  const path = src.slice(host.replace(/\/+$/, '').length + 1).split('/').slice(1).join('/')
  return chromePicture(siteConfig.chrome, path)
}

// Legacy showed its popup notice once per page load when the exhibition set
// it, per language (a language's instance may suppress the notice another
// shows). The body is Markdown, rendered through the package's block
// pipeline and passed as HTML: the component's inline rendering drops the
// paragraphs a notice needs.
const popupContent = computed(() => withSitePictures(
  md(exhibition.value?.popup_logos?.[locale.value] ?? exhibition.value?.popup_logos?.en ?? ''),
  popupPicture,
))
const popupEnabled = computed(() => {
  const show = exhibition.value?.popup_logo_show
  if (show === null || show === undefined) return false
  if (typeof show === 'boolean') return show
  return show[locale.value] ?? show.en ?? false
})
</script>

<template>
  <SiteShell
    :languages="props.languages"
    :language="props.language"
    language-placement="header"
    language-style="select"
    :header-home="links.portal"
    :header-title="t('exhibition.identity.tagline')"
    header-title-href="#/about"
    :banner-image="bannerImage"
    :banner-caption="banner"
    :banner-caption-label="t('layout.banner.detailFrom')"
    :banner-title="isHome ? exhibitionTitle(locale) : ''"
    :banner-subtitle="isHome ? exhibitionSubtitle(locale) : ''"
    :banner-headline="isHome ? exhibitionHeadline(locale) : ''"
    :banner-enter="isHome ? { label: t('exhibition.action.enter'), href: '#/about' } : null"
    :banner-strapline="isHome ? t('exhibition.identity.strapline') : ''"
    hyperlinks-variant="tiles"
    :hyperlinks-title="exhibitionTitle(locale)"
    hyperlinks-title-href="#/"
    :hyperlinks-subtitle="exhibitionSubtitle(locale)"
    :hyperlinks="bottomLinks"
    :footer-text="`${t('core.footer.copyright')} 2004–${currentYear}`"
    :logos="exhibitionLogos"
    @update:language="emit('update:language', $event)"
  >
    <template v-if="!hasLogo" #brand><span class="mwnf-dxa-logo-mark">MWNF</span></template>
    <template #notice><PopupLogo :content="popupContent" :enabled="popupEnabled" raw-html /></template>
    <slot />
  </SiteShell>
</template>
