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
  defaultLang, tr, md, labelOf, loadEnglish,
  items, itemById, countries, timelines,
  visiblePartnerById,
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
