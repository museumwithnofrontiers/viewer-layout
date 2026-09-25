<script setup>
import { computed } from 'vue'
import { useI18n, useSection, useSiteConfig } from '@museumwnf/viewer-core'
import SiteShell from '../../components/SiteShell.vue'
import {
  chromeImage, defaultLang, gallery, itemById, labelOf, manifest, tr,
} from './data.js'

// A gallery's page chrome: the layout's `SiteShell`, composed from the
// config's `navigation` and `banner` (galleryConfig), plus what only the
// loaded gallery record can answer — the banner's image and caption, the
// home page's title — and the MWNF mark. Each gallery carried this as its
// own `SiteShell.vue`, the same code in all 37.

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

const galleryName = computed(() =>
  manifest.site?.names?.[locale.value] ?? manifest.site?.names?.en ?? gallery.value?.names?.en ?? '',
)
const section = useSection()
const isHome = computed(() => section.value === 'home')
const currentYear = new Date().getFullYear()

// The banner: the gallery's image, captioned with the banner item's sheet.
// A `config.banner` function sees only the section and the language, never
// the loaded record, so both stay here.
const bannerImage = computed(() => chromeImage(gallery.value?.banner_image_path, 'hi_res'))
const bannerCaption = computed(() => {
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
</script>

<template>
  <SiteShell
    :languages="props.languages"
    :language="props.language"
    language-placement="header"
    language-style="buttons"
    :header-home="links.portal"
    :header-eyebrow="isHome ? '' : t('core.project.galleries')"
    :header-title="isHome ? '' : galleryName"
    header-title-href="#/"
    :banner-image="bannerImage"
    :banner-caption="bannerCaption"
    :banner-title="isHome ? galleryName : undefined"
    :notice="{ title: t('gallery.notice.tip'), text: t('gallery.notice.databaseReplaced') }"
    :footer-text="`${t('gallery.footer.copyright')} 2004–${currentYear}`"
    @update:language="emit('update:language', $event)"
  >
    <template #brand><span class="mwnf-dxa-logo-mark">MWNF</span></template>
    <slot />
  </SiteShell>
</template>
