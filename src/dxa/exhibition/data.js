import { partnerView } from '@museumwnf/viewer-core'
import {
  useExhibitionData, useExhibitionCollection, useExhibitionTimeline, useExhibitionPartner,
} from '@museumwnf/viewer-core/dxa'

// The exhibition family's own instance of the shared DXA data layer (epics
// #1730/#1731): every page under src/dxa/exhibition/ reads through this one
// module, the same shape the-use-of-colours-in-art's/water-in-islam's own
// (now retired) `composables/exhibitionData.js` threaded through for their
// site. No `config` is passed to any of them: a particular exhibition's own
// project colours/notice list live in that site's `dataset.config.js`/item
// sheet (epic #1728, out of scope for these thin pages), not here. The
// item-sheet composable (`useExhibitionSheet`) is not called at all — no
// page in this family needs it.

export const data = useExhibitionData()
const collection = useExhibitionCollection(data)
const timeline = useExhibitionTimeline(data, collection)
const partner = useExhibitionPartner(data)

export const {
  defaultLang, tr, md, mdInline, labelOf, loadEnglish,
  items, itemById, countries, timelines,
  visiblePartnerById, isHiddenPartner,
  itemRoute, partnerRoute, partnerObjectsRoute,
} = data

export const {
  FACETS, haystack, tile, collectionResults, countryIdForCode,
} = collection

export { FACET_CATEGORIES, FACET_LABEL_KEYS, PAGE_SIZE, useFacetLabels } from '@museumwnf/viewer-core/dxa'

export const {
  hasTimeline, timelineSpec, timelineGallerySpec,
} = timeline

export const { partnerListSpec, partnerSheetSpec } = partner

// The partner page and list, as the family's shared `PartnerDetail` and
// `PartnerListView` read them (inventory-app#2034): the view-model's
// family-specific half — the country label, the two routes (a museum's or an
// institution's), the E6 hidden-partner rule, the renderers bound to this
// family's glossary — and the labels an exhibition words its own way, per
// variant: legacy's InstitutionProfile named its two links differently. The
// pictures are `PartnerPanel`'s, so the record view's own media gallery
// stays empty.
export const partnerViewCtx = {
  countryLabel: (id) => labelOf('countries', id),
  md,
  mdInline,
  route: partnerRoute,
  objectsRoute: partnerObjectsRoute,
  hidden: isHiddenPartner,
}

export const partnerDetail = {
  spec: { ...partnerSheetSpec, media: () => [] },
  visible: (id) => Boolean(visiblePartnerById(id)),
  view: (partner, text) => partnerView(partner, text, partnerViewCtx),
  labels: {
    partner: { objects: 'partner.action.viewObjects', homepage: 'partner.nav.homepage' },
    institution: { objects: 'exhibition.action.viewItems', homepage: 'exhibition.action.institutionHomepage' },
  },
}