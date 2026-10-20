<script setup>
import { computed } from 'vue'
import { useI18n, useSection, useSiteConfig } from '@museumwnf/viewer-core'
import SiteShell from '../../components/SiteShell.vue'
import { chromeSource } from '../../chrome.js'
import {
  chromeImage, defaultLang, gallery, itemById, labelOf, manifest, tr,
} from './data.js'

// A gallery's page chrome: the layout's `SiteShell`, composed from the
// config's `navigation` and `banner` (galleryConfig), plus what only the
// loaded gallery record can answer — the banner's image and caption, the
// gallery's title — and the MWNF mark. Each gallery carried this as its
// own `SiteShell.vue`, the same code in all 37.
//
// A site with no gallery package of its own (the galleries hub, legacy's
// gallery 45) names its chrome in `config.galleryShell` instead; each field
// it sets wins over the package (README, "Site chrome").

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
const overrides = computed(() => siteConfig.galleryShell ?? {})

const section = useSection()
const isHome = computed(() => section.value === 'home')
const currentYear = new Date().getFullYear()

function named(names) {
  return names?.[locale.value] ?? names?.en ?? ''
}

// Legacy's title is the gallery's project name where the gallery is a
// project of its own (carpets: "Discover Carpet Art", glass: "Discover Glass
// Art"), and the gallery's name everywhere else — dxa-client's
// `VUE_APP_DXA_FULL`, read from the package rather than written per site.
const galleryTitle = computed(() => {
  const project = manifest.projects?.[manifest.gallery?.project_id ?? gallery.value?.project_id]
  return named(project?.name)
    || named(manifest.site?.names)
    || named(gallery.value?.names)
})

const headerEyebrow = computed(() => {
  if (overrides.value.headerEyebrow) return t(overrides.value.headerEyebrow)
  return isHome.value ? '' : t('core.project.galleries')
})
const headerTitle = computed(() => {
  if (overrides.value.headerTitle) return t(overrides.value.headerTitle)
  return isHome.value ? '' : galleryTitle.value
})

// The banner: the gallery's image, captioned with the banner item's sheet.
// A `config.banner` function sees only the section and the language, never
// the loaded record, so both stay here.
const bannerImage = computed(() => (
  overrides.value.bannerImage
    ? chromeSource(siteConfig.chrome, overrides.value.bannerImage)
    : chromeImage(gallery.value?.banner_image_path, 'hi_res')
))
const bannerCaption = computed(() => {
  if (overrides.value.bannerCaption) return overrides.value.bannerCaption
  const item = itemById.value.get(gallery.value?.banner_item_id)
  if (!item) return ''
  const sheet = tr('items', item.id, defaultLang)
  return {
    name: labelOf('items', item.id),
    partner: labelOf('partners', item.partner_id),
    location: sheet.location ?? '',
    country: labelOf('countries', item.country_id),
  }
})
// Over the home banner, legacy's "Discover MWNF Galleries" line and the title.
const bannerEyebrow = computed(() => {
  if (!isHome.value) return ''
  return t(overrides.value.bannerEyebrow || 'gallery.banner.discoverGalleries')
})
const bannerTitle = computed(() => {
  if (!isHome.value) return undefined
  return overrides.value.bannerTitle ? t(overrides.value.bannerTitle) : galleryTitle.value
})

// The header mark: the site's own logo file (`config.brand`), else the text.
const hasLogo = computed(() => Boolean(chromeSource(siteConfig.chrome, siteConfig.brand?.logo)))
</script>

<template>
  <SiteShell
    class="mwnf-dxa-gallery-shell"
    :class="{ 'mwnf-dxa-gallery-shell--home': isHome }"
    :languages="props.languages"
    :language="props.language"
    language-placement="header"
    language-style="buttons"
    :header-home="links.portal"
    :header-eyebrow="headerEyebrow"
    :header-title="headerTitle"
    header-title-href="#/"
    :banner-image="bannerImage"
    :banner-caption="bannerCaption"
    :banner-eyebrow="bannerEyebrow"
    :banner-title="bannerTitle"
    :notice="{ title: t('gallery.notice.tip'), text: t('gallery.notice.databaseReplaced') }"
    :footer-text="`${t('core.footer.copyright')} 2004–${currentYear}`"
    @update:language="emit('update:language', $event)"
  >
    <template v-if="!hasLogo" #brand><span class="mwnf-dxa-logo-mark">MWNF</span></template>
    <slot />
  </SiteShell>
</template>
