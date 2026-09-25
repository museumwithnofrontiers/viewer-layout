import { partnerView } from '@museumwnf/viewer-core'
import {
  useGalleryData, useGalleryCollection, useGalleryTimeline, useGalleryPartner,
} from '@museumwnf/viewer-core/dxa'

// The gallery family's own instance of the shared DXA data layer (epics
// #1730/#1731): every page under src/dxa/gallery/ reads through this one
// module, the same explicit `data`/`collection` parameters the
// `@museumwnf/viewer-core/dxa` README shows, threaded through once so every
// page shares the same refs rather than each re-running `useGalleryData()`
// on its own — the same shape carpets'/amulets' own (now retired)
// `composables/gallery.js` threaded through for their site. No `config` is
// passed to any of them: a particular gallery's own project colours/notice
// list live in that site's `dataset.config.js`/item sheet (epic #1728,
// out of scope for these thin pages), not here.

export const data = useGalleryData()
const collection = useGalleryCollection(data)
const timeline = useGalleryTimeline(data, collection)
const partner = useGalleryPartner(data, collection)

export const {
  defaultLang, tr, md, mdInline, loadEnglish, labelOf,
  items, partners, countries, timelines,
  partnerById,
  itemRoute, partnerRoute, partnerObjectsRoute,
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

export const partnerDetail = {
  spec: { ...partnerSheet, media: () => [] },
  visible: () => true,
  view: (partner, text) => partnerView(partner, text, partnerViewCtx),
  labels: {
    partner: { objects: 'partner.action.viewObjects', homepage: 'partner.nav.homepage' },
  },
}