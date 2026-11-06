import { partnerView, useSiteConfig } from '@museumwnf/viewer-core'
import { chromePicture } from '../../chrome.js'
import { withLegacyTagOrder } from '../legacyFacets.js'
import {
  useGalleryData, useGalleryCollection, useGalleryTimeline, useGalleryPartner, useGalleryItemDetail,
  FACET_CATEGORIES as DXA_FACET_CATEGORIES,
} from '@museumwnf/viewer-core/dxa'

// The gallery family's own instance of the shared DXA data layer (epics
// #1730/#1731): every page under src/dxa/gallery/ reads through this one
// module, the same explicit `data`/`collection` parameters the
// `@museumwnf/viewer-core/dxa` README shows, threaded through once so every
// page shares the same refs rather than each re-running `useGalleryData()`
// on its own — the same shape carpets'/amulets' own (now retired)
// `composables/gallery.js` threaded through for their site. No `config` is
// passed to any of them: a particular gallery's own project colours and
// notice list live in that site's `dataset.config.js`, which the item page's
// spec reads through `useSiteConfig()`.

export const data = useGalleryData()
const collection = useGalleryCollection(data)
const timeline = useGalleryTimeline(data, collection)
const partner = useGalleryPartner(data, collection)

// The item page's spec (inventory-app#2054).
export const { itemDetail } = useGalleryItemDetail(data, timeline)

export const {
  manifest, defaultLang, tr, md, mdInline, loadEnglish, labelOf,
  gallery, items, itemById, partners, countries, timelines,
  partnerById,
  itemRoute, partnerRoute, partnerObjectsRoute, itemFromUidPath, partnerFromKey,
  pickSiblings, siblingUrl,
} = data

// The gallery's full name, as legacy's: the gallery's project name where the
// gallery is a project of its own (carpets: "Discover Carpet Art", glass:
// "Discover Glass Art"), and the gallery's name everywhere else — dxa-client's
// `VUE_APP_DXA_FULL`, read from the package rather than written per site.
// `pick` chooses the language from a names map; `english` is legacy's own
// pick for the sentences it wrote in English on every page.
export const english = (names) => names?.en ?? ''
export function galleryTitleIn(pick) {
  const project = manifest.projects?.[manifest.gallery?.project_id ?? gallery.value?.project_id]
  return pick(project?.name) || pick(manifest.site?.names) || pick(gallery.value?.names)
}

// A chrome picture the package names by its legacy path: the site's own copy
// under `theme/assets/chrome/` (`config.chrome`, inventory-app#2233 D7)
// when it supplies one, else the legacy media host, at `size`.
export function chromeImage(path, size = 'hi_res') {
  return chromePicture(useSiteConfig().chrome, path) ?? data.chromeImage(path, size)
}

export const {
  haystack, tile, legacyOrder, countryIdForCode,
} = collection
// The tag lists in legacy's order (dxa/legacyFacets.js), on the entrance and the results page.
export const FACETS = withLegacyTagOrder(collection.FACETS)
export const collectionResults = { ...collection.collectionResults, facets: FACETS }

// Legacy's lists of objects (dxa-api): twenty tiles a page, and the records
// of one year in legacy's order (viewer-core's `legacyOrder`) — what every
// gallery page of objects lays over its spec (inventory-app#2423).
export const legacyPaging = {
  pageSize: 20,
  sort: { undated: 'first', tiebreak: (a, b) => legacyOrder(a, b) },
}

export { FACET_CATEGORIES, FACET_LABEL_KEYS, GALLERY_ERA_WORDS, PAGE_SIZE, useFacetLabels } from '@museumwnf/viewer-core/dxa'

// The categories a gallery's dropdowns list, as legacy's (dxa-client
// CollectionSearch.vue, CollectionResults.vue): no artist.
export const GALLERY_FACET_CATEGORIES = DXA_FACET_CATEGORIES.filter((category) => category !== 'artist')

export const { timelineResults, timelineGallery } = timeline

export const { partnerList, partnerSheet, partnerObjects } = partner

// The partner page and list, as the family's shared `PartnerDetail` and
// `PartnerListView` read them (inventory-app#2034): the view-model's
// family-specific half — the country label, the two routes, the renderers
// bound to this family's glossary — and the labels a gallery words its own
// way. A gallery hides no partner. The pictures are `PartnerPanel`'s, so the
// record view's own media gallery stays empty (it used to show them twice).
export const partnerViewCtx = {
  countryLabel: (id) => labelOf('countries', id),
  md,
  mdInline,
  route: partnerRoute,
  objectsRoute: partnerObjectsRoute,
}

/**
 * The home page's featured partners: up to `count` of the partners legacy
 * flagged for the portal, in a fresh random order on every visit — legacy drew
 * them server-side, which a static package cannot replay — as `partnerView()`
 * view-models `FeaturedPartners` reads (inventory-app#2015).
 */
export function featuredPartners(count) {
  const pool = (partners.value ?? []).filter((p) => p.featured)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count).map((p) => partnerView(p, tr('partners', p.id, defaultLang), partnerViewCtx))
}

export const partnerDetail = {
  spec: { ...partnerSheet, media: () => [], sourceCredit: false },
  visible: () => true,
  // The English the family loads up front, under the record's own language:
  // the page draws at once, and switches when that language arrives.
  view: (partner, text) => partnerView(partner, { ...tr('partners', partner.id, defaultLang), ...text }, partnerViewCtx),
  // Legacy's dxa-client PartnerProfile, the exhibitions' same template in the
  // gallery's colours (inventory-app#2423): its words in English on every
  // page, a thumbnail for one picture too, the photographer and copyright
  // only in its tooltip, and Google's map under its own line.
  labels: {
    partner: { objects: 'gallery.partner.viewObjects', homepage: 'gallery.partner.homepage' },
  },
  className: 'mwnf-dxa-gallery-profile',
  media: { thumbsFrom: 1, creditCaption: false },
  legacyMap: { label: 'gallery.partner.mapLabel' },
}