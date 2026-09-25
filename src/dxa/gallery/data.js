import { partnerView } from '@museumwnf/viewer-core'
import {
  useGalleryData, useGalleryCollection, useGalleryTimeline, useGalleryPartner, useGalleryItemDetail,
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
  chromeImage, pickSiblings, siblingUrl,
} = data

export const {
  FACETS, haystack, tile, collectionResults, countryIdForCode,
} = collection

export { FACET_CATEGORIES, FACET_LABEL_KEYS, PAGE_SIZE, useFacetLabels } from '@museumwnf/viewer-core/dxa'

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
  spec: { ...partnerSheet, media: () => [] },
  visible: () => true,
  // The English the family loads up front, under the record's own language:
  // the page draws at once, and switches when that language arrives.
  view: (partner, text) => partnerView(partner, { ...tr('partners', partner.id, defaultLang), ...text }, partnerViewCtx),
  labels: {
    partner: { objects: 'partner.action.viewObjects', homepage: 'partner.nav.homepage' },
  },
}