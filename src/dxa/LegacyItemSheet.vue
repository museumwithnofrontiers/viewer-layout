<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  mdInline, mwnfLinks, siblingSiteUrl, sourceUrl, useDataPackage, useI18n, useProjects, useSiteConfig,
} from '@museumwnf/viewer-core'
import BackLink from '../content/BackLink.vue'
import RecordLanguages from '../content/RecordLanguages.vue'
import ItemDetailView from './ItemDetailView.vue'
import { galleryExhibitionSections } from './gallery/onDisplay.js'

// Legacy's DXA item sheet (dxa-client's and exhibitions-client's
// DatabaseItem.vue, the same template; inventory-app#2423, #2379):
// `ItemDetailView` over a family's spec, with legacy's sheet in its slots.
// The header is a language switcher and a back link, with no title of its
// own, as legacy's was. A gallery passes its spec and words; an exhibition
// also its language-subset gate (`dataGetter`): a record the package
// carries in another language only is not this build's.
//
// Legacy pointed at the record in its home database three times: the
// "Source (<host>)" link under the pictures, the citation's address and the
// Source box on the project's colour. The home is now the record's page on
// the site its project lives on (`manifest.projects`' `home_site`, a sibling
// of this site); a record whose project has no site of its own lives here, so
// it points at this page.
const props = defineProps({
  id: { type: String, required: true },
  /** The family's item spec (viewer-core's `useGalleryItemDetail`/`useExhibitionItemDetail`). */
  itemDetail: { type: Object, required: true },
  dataGetter: { type: Function, default: null },
  /**
   * The family's entry names for legacy's words:
   * `{ viewShortDescription, hideShortDescription, glossary, dynasties, exhibitions, workingNumber }`.
   */
  words: { type: Object, required: true },
})

const { t } = useI18n()
const route = useRoute()
const projects = useProjects()
const pkg = useDataPackage()
const siteConfig = useSiteConfig()

// The chip line above the sheet gives way to legacy's links under the
// pictures; the citation's address is the home's, printed below. The
// sidebar takes legacy's wording, and each gallery it names links to the
// record on that gallery's site.
const spec = computed(() => ({
  ...props.itemDetail,
  sourceDatabase: false,
  sourceCredit: false,
  // Legacy drew a thumbnail for a single picture too, and named its
  // photographer and copyright only in the thumbnail's tooltip.
  mediaThumbsFrom: 1,
  mediaCreditCaption: false,
  shortDescriptionLabels: { view: props.words.viewShortDescription, hide: props.words.hideShortDescription },
  related: {
    ...props.itemDetail.related,
    glossaryLabels: { tool: props.words.glossary },
    dynastiesHeading: props.words.dynasties,
    mediaHeadings: { audio: props.words.relatedAudio, video: props.words.relatedVideos },
    onDisplayIn: {
      ...props.itemDetail.related?.onDisplayIn,
      exhibitionsHeading: props.words.exhibitions,
      galleriesHeading: 'core.project.galleries',
      href: (ref, record) => (ref.site ? siblingSiteUrl(ref.site, `/item/${record.id}`) : ref.legacy_host),
      // Legacy's exhibitions: the pages of our mini-sites and online
      // exhibitions that show the item, not the exhibitions it belongs to;
      // this site's own pages open here.
      exhibitions: (record, ctx) => galleryExhibitionSections(record, ctx.language, pkg.manifest?.site?.key),
    },
  },
}))

function homeUrl(record) {
  const home = projects.links(record?.project_id)?.homeSite
  const url = home && home !== pkg.manifest?.site?.key ? siblingSiteUrl(home, `/item/${record.id}`) : null
  return url ?? sourceUrl(route)
}

// Legacy named the home by its host ("islamicart.museumwnf.org"); our sites
// share one, so its first path segment goes with it.
function homeLabel(url) {
  try {
    const { host, pathname } = new URL(url)
    const segment = pathname.split('/').find(Boolean)
    return segment ? `${host}/${segment}` : host
  } catch {
    return url
  }
}

const tone = (record) => siteConfig.projectColors?.[record?.project_id] ?? ''

// The citation sentence with its project in italics, as legacy set it.
function citationParts(sentence, record) {
  const project = projects.label(record?.project_id) ?? ''
  const at = project ? sentence.indexOf(` ${project},`) : -1
  if (at < 0) return { before: sentence, project: '', after: '' }
  return { before: sentence.slice(0, at + 1), project, after: sentence.slice(at + 1 + project.length) }
}

function museumLink(ctx) {
  return {
    to: props.itemDetail.museum?.route?.(ctx.record?.partner_id) ?? null,
    holder: ctx.text?.holder ? mdInline(String(ctx.text.holder)) : '',
  }
}
</script>

<template>
  <ItemDetailView :spec="spec" :id="id" :data-getter="dataGetter" class="mwnf-dxa-item mwnf-dxa-gallery-item">
    <template #header="{ languages, language, select }">
      <div class="mwnf-dxa-item__languages">
        <RecordLanguages :languages="languages" :language="language" :from="1" @select="select" />
      </div>
      <BackLink />
    </template>

    <template #after-media="{ record, dir }">
      <div v-if="record" class="mwnf-dxa-gallery-item__links" :dir="dir || undefined">
        <p>
          <a :href="homeUrl(record)" target="_blank" rel="noopener"><span class="mwnf-dxa-gallery-item__icon" aria-hidden="true">↗</span><bdi>{{ t('record.source.label') }} <span>({{ homeLabel(homeUrl(record)) }})</span></bdi></a>
        </p>
        <p>
          <a :href="mwnfLinks.myCollection" target="_blank" rel="noopener"><span class="mwnf-dxa-gallery-item__icon" aria-hidden="true">↗</span>{{ t('record.action.addToCollection') }}</a>
        </p>
      </div>
    </template>

    <template #museum="museumCtx">
      <template v-for="museum in [museumLink(museumCtx)]" :key="'museum'">
        <!-- eslint-disable-next-line vue/no-v-html -- the holder's own Markdown, rendered and escaped by viewer-core -->
        <RouterLink v-if="museum.to && museum.holder" :to="museum.to" class="mwnf-dxa-gallery-item__museum"><span class="mwnf-dxa-gallery-item__icon" aria-hidden="true">↗</span><span v-html="museum.holder"></span></RouterLink>
        <!-- eslint-disable-next-line vue/no-v-html -- as above -->
        <span v-else-if="museum.holder" v-html="museum.holder"></span>
      </template>
    </template>

    <template #credits="{ record, credits, workingNumber, citation, dir }">
      <div v-if="record" class="mwnf-dxa-gallery-item__credits" :dir="dir || undefined">
        <template v-if="citation">
          <p class="mwnf-dxa-gallery-item__label">{{ t('record.citation.ofThisPage') }}</p>
          <p v-for="parts in [citationParts(citation, record)]" :key="'citation'" class="mwnf-dxa-gallery-item__citation">
            {{ parts.before }}<span class="mwnf-dxa-gallery-item__project">{{ parts.project }}</span>{{ parts.after }}
            <span class="mwnf-dxa-gallery-item__address">{{ homeUrl(record) }}</span>
          </p>
        </template>
        <p v-for="credit in credits" :key="credit.label" class="mwnf-dxa-gallery-item__credit">
          <span class="mwnf-dxa-gallery-item__credit-label">{{ credit.label }}</span>
          <span>{{ credit.value }}</span>
        </p>
        <p v-if="workingNumber" class="mwnf-dxa-gallery-item__number">
          <span class="mwnf-dxa-gallery-item__number-label">{{ t(words.workingNumber) }}</span>{{ ' ' }}{{ workingNumber }}
        </p>
        <div class="mwnf-dxa-gallery-item__source" :class="tone(record)">
          <p>{{ t('record.source.label') }}</p>
          <p><a :href="homeUrl(record)" target="_blank" rel="noopener">{{ homeUrl(record) }}</a></p>
        </div>
      </div>
    </template>
  </ItemDetailView>
</template>
