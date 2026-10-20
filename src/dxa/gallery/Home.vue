<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import FeaturedPartners from '../FeaturedPartners.vue'
import SiblingGalleries from '../SiblingGalleries.vue'
import { chromeAsset, chromePicture } from '../../chrome.js'
import { chromeImage, featuredPartners, pickSiblings, siblingUrl } from './data.js'

// A gallery's home page: the banner is the shell's; under it, legacy stacked
// the featured-partners carousel, the logos strip and the sibling-galleries
// strip. What is the gallery's here is its data: which partners are featured
// (legacy's server-side random draw, replayed on every visit — data.js's
// `featuredPartners`), and which siblings its roster carries, each linked
// when it resolved to an address and shown as a tile otherwise. Each gallery
// carried this as its own `Home.vue`, the same code in all 37.
//
// Legacy's logos strip held one row across every DXA site, Glass's, and no
// package carries it: a site declares it as `homeLogos` (galleryConfig).
const { t, locale } = useI18n()
const siteConfig = useSiteConfig()
const links = computed(() => siteConfig.links ?? {})

const CAROUSEL_SIZE = 8
const SIBLING_COUNT = 4

const partners = computed(() => featuredPartners(CAROUSEL_SIZE))

const siblings = ref([])
onMounted(() => { siblings.value = pickSiblings(SIBLING_COUNT) })

const siblingRecords = computed(() =>
  siblings.value.map((sibling) => ({
    id: sibling.id,
    name: sibling.names?.[locale.value] ?? sibling.names?.en ?? sibling.slug,
    image: sibling.image_path ? chromeImage(sibling.image_path, 'zoom') : null,
    route: siblingUrl(sibling),
  })),
)

// The three virtual museums, each in its project's colour — the chip tokens
// a site already sets for the source-database chip — over legacy's picture
// banner when the site supplies it (`theme/assets/dia.jpg`, `dba.jpg`, `sh.jpg`).
const museums = computed(() => [
  { name: t('core.project.islamicArt'), href: `${links.value.islamicArt}/`, image: chromeAsset(siteConfig.chrome, 'dia.jpg'), accent: 'var(--mwnf-project-ISLandEPM, #ffcc00)', textColor: 'var(--mwnf-project-ISLandEPM-text, #000000)' },
  { name: t('core.project.baroqueArt'), href: `${links.value.baroqueArt}/`, image: chromeAsset(siteConfig.chrome, 'dba.jpg'), accent: 'var(--mwnf-project-DBA, #001d66)', textColor: 'var(--mwnf-project-DBA-text, #ffffff)' },
  { name: t('core.project.sharingHistory'), href: `${links.value.sharingHistory}/`, image: chromeAsset(siteConfig.chrome, 'sh.jpg'), accent: 'var(--mwnf-project-AWE, #900000)', textColor: 'var(--mwnf-project-AWE-text, #ffffff)' },
])

const homeLogos = computed(() =>
  (siteConfig.homeLogos ?? [])
    .map((logo) => ({
      image: chromePicture(siteConfig.chrome, logo.image) ?? chromeImage(logo.image, 'gallery_logo'),
      href: logo.href ?? '',
      alt: logo.alt ? t(logo.alt) : '',
    }))
    .filter((logo) => logo.image),
)

const seeMoreGalleriesHref = computed(() => `${links.value.galleries}/list`)
</script>

<template>
  <div class="mwnf-dxa-home">
    <FeaturedPartners :partners="partners" />
    <section v-if="homeLogos.length" class="mwnf-dxa-home-logos">
      <p class="mwnf-dxa-home-logos__label">{{ t('gallery.home.logosLabel') }}</p>
      <ul class="mwnf-dxa-home-logos__list">
        <li v-for="logo in homeLogos" :key="logo.image">
          <component
            :is="logo.href ? 'a' : 'span'"
            class="mwnf-dxa-home-logos__logo"
            :href="logo.href || undefined"
            :title="logo.alt || undefined"
            :target="logo.href ? '_blank' : undefined"
            :rel="logo.href ? 'noopener' : undefined"
          >
            <img :src="logo.image" :alt="logo.alt" />
          </component>
        </li>
      </ul>
    </section>
    <SiblingGalleries
      :galleries="siblingRecords"
      :museums="museums"
      galleries-heading-entry="gallery.action.visitGalleries"
      see-more-galleries-entry="gallery.action.seeMoreGalleries"
      :see-more-galleries-href="seeMoreGalleriesHref"
      museums-heading-entry="gallery.siblings.otherVirtualMuseums"
    />
  </div>
</template>
