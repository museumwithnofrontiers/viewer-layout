<script setup>
import { computed } from 'vue'
import { useI18n, useSection, useSiteConfig } from '@museumwnf/viewer-core'
import SiteShell from '../../components/SiteShell.vue'
import PopupLogo from '../PopupLogo.vue'
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
const { links } = useSiteConfig()

const section = useSection()
const isHome = computed(() => section.value === 'home')
const currentYear = new Date().getFullYear()

// The banner: the exhibition's image, captioned with the curator's own line
// where there is one, and with the banner item's sheet where there is not.
const bannerImage = computed(() => chromeImage(exhibition.value?.banner_image_path, 'hi_res'))
const banner = computed(() => {
  const curated = bannerCaption(locale.value)
  if (curated) return curated
  const item = itemById.value.get(exhibition.value?.banner_item_id)
  if (!item) return ''
  const sheet = tr('items', item.id, defaultLang)
  return {
    name: labelOf('items', item.id),
    partner: labelOf('partners', item.partner_id),
    location: sheet.location ?? '',
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
// category, visibility and order.
function logoCaption(logo) {
  return logo.labels?.[locale.value] ?? logo.labels?.en ?? logo.alt_text ?? ''
}
const exhibitionLogos = computed(() =>
  (exhibition.value?.logos ?? []).map((logo) => ({
    image: logo.image_url,
    alt: logoCaption(logo),
    href: logo.url || undefined,
    category_id: logo.category_id,
    category: logo.category,
    visible: logo.visible,
    display_order: logo.display_order,
  })),
)

// Legacy showed its popup notice once per page load when the exhibition set
// it, per language (a language's instance may suppress the notice another
// shows). The body is Markdown, rendered through the package's block
// pipeline and passed as HTML: the component's inline rendering drops the
// paragraphs a notice needs.
const popupContent = computed(() =>
  md(exhibition.value?.popup_logos?.[locale.value] ?? exhibition.value?.popup_logos?.en ?? ''),
)
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
    language-style="buttons"
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
    <template #brand><span class="mwnf-dxa-logo-mark">MWNF</span></template>
    <template #notice><PopupLogo :content="popupContent" :enabled="popupEnabled" raw-html /></template>
    <slot />
  </SiteShell>
</template>
