<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import FeaturedPartners from '../FeaturedPartners.vue'
import SiblingGalleries from '../SiblingGalleries.vue'
import { chromeImage, featuredPartners, pickSiblings, siblingUrl } from './data.js'

// A gallery's home page: the banner is the shell's; under it, legacy stacked
// the featured-partners carousel and the sibling-galleries strip. What is
// the gallery's here is its data: which partners are featured (legacy's
// server-side random draw, replayed on every visit — data.js's
// `featuredPartners`), and which siblings its roster carries, each linked
// when it resolved to an address and shown as a tile otherwise. Each gallery
// carried this as its own `Home.vue`, the same code in all 37.
//
// Legacy's logos slot is not drawn: the table behind it had a single row
// across every DXA site, and no package carries it.
const { t, locale } = useI18n()
const { links } = useSiteConfig()

const CAROUSEL_SIZE = 8
const SIBLING_COUNT = 4

const partners = computed(() => featuredPartners(CAROUSEL_SIZE))

const siblings = ref([])
onMounted(() => { siblings.value = pickSiblings(SIBLING_COUNT) })

const siblingRecords = computed(() =>
  siblings.value.map((sibling) => ({
    id: sibling.id,
    name: sibling.names?.[locale.value] ?? sibling.names?.en ?? sibling.slug,
    image: sibling.image_path ? chromeImage(sibling.image_path, 'lo_res') : null,
    route: siblingUrl(sibling),
  })),
)

// The three virtual museums, each in its project's colour: the chip tokens a
// site already sets for the source-database chip.
const museums = computed(() => [
  { name: t('core.project.islamicArt'), href: `${links.islamicArt}/`, accent: 'var(--mwnf-project-ISLandEPM, #ffcc00)', textColor: 'var(--mwnf-project-ISLandEPM-text, #000000)' },
  { name: t('core.project.baroqueArt'), href: `${links.baroqueArt}/`, accent: 'var(--mwnf-project-DBA, #001d66)', textColor: 'var(--mwnf-project-DBA-text, #ffffff)' },
  { name: t('core.project.sharingHistory'), href: `${links.sharingHistory}/`, accent: 'var(--mwnf-project-AWE, #900000)', textColor: 'var(--mwnf-project-AWE-text, #ffffff)' },
])

const seeMoreGalleriesHref = computed(() => `${links.galleries}/list`)
</script>

<template>
  <div class="mwnf-dxa-home">
    <FeaturedPartners :partners="partners" />
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
