import { partnerView, useSiteConfig } from '@museumwnf/viewer-core'
import { chromePicture } from '../../chrome.js'
import {
  useExhibitionData, useExhibitionCollection, useExhibitionTimeline, useExhibitionPartner,
  useExhibitionItemDetail, useExhibitionThemes,
} from '@museumwnf/viewer-core/dxa'

// The exhibition family's own instance of the shared DXA data layer (epics
// #1730/#1731): every page under src/dxa/exhibition/ reads through this one
// module, the same shape the-use-of-colours-in-art's/water-in-islam's own
// (now retired) `composables/exhibitionData.js` threaded through for their
// site. No `config` is passed to any of them: a particular exhibition's own
// project colours and notice list live in that site's `dataset.config.js`,
// which the item page's spec reads through `useSiteConfig()`.

export const data = useExhibitionData()
const collection = useExhibitionCollection(data)
const timeline = useExhibitionTimeline(data, collection)
const partner = useExhibitionPartner(data)

// The theme pages' tree and pictures, and the item page's spec
// (inventory-app#2053).
export const themes = useExhibitionThemes(data)
export const { itemDetail } = useExhibitionItemDetail(data, timeline)

export const {
  defaultLang, tr, md, mdInline, mdStrip, labelOf, loadEnglish,
  exhibition, relatedContent, items, itemById, countries, timelines, visiblePartners,
  visiblePartnerById, isHiddenPartner,
  itemRoute, partnerRoute, partnerObjectsRoute,
  countryLabelFromCode,
  exhibitionTitle, exhibitionSubtitle, exhibitionHeadline, bannerCaption, projectName,
} = data

// A chrome picture the package names by its legacy path: the site's own copy
// under `theme/assets/chrome/` (`config.chrome`, inventory-app#2233 D7)
// when it supplies one, else the legacy media host, at `size`.
export function chromeImage(path, size = 'hi_res') {
  return chromePicture(useSiteConfig().chrome, path) ?? data.chromeImage(path, size)
}

export const {
  FACETS, haystack, tile, collectionResults, countryIdForCode,
} = collection

// Legacy's lists of an exhibition's records (dxa-api Items::GetSome, as the
// galleries'): twenty tiles a page, by start date, the undated first, and
// the records of one year by country, partner, then legacy key
// (inventory-app#2379).
const compareText = (a, b) => String(a ?? '').localeCompare(String(b ?? ''), 'en', { sensitivity: 'base' })
function compareKeys(a, b) {
  const left = String(a ?? '').split(':')
  const right = String(b ?? '').split(':')
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const x = left[i] ?? ''
    const y = right[i] ?? ''
    if (x === y) continue
    if (/^\d+$/.test(x) && /^\d+$/.test(y)) return Number(x) - Number(y)
    return x.localeCompare(y, 'en')
  }
  return 0
}
export function legacyOrder(a, b) {
  return compareText(labelOf('countries', a.country_id), labelOf('countries', b.country_id))
    || compareText(labelOf('partners', a.partner_id), labelOf('partners', b.partner_id))
    || compareKeys(a.backward_compatibility, b.backward_compatibility)
}
export const legacyPaging = {
  pageSize: 20,
  sort: { undated: 'first', tiebreak: (a, b) => legacyOrder(a, b) },
}

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
  // The English the family loads up front, under the record's own language:
  // the page draws at once, and switches when that language arrives.
  view: (partner, text) => partnerView(partner, { ...tr('partners', partner.id, defaultLang), ...text }, partnerViewCtx),
  labels: {
    partner: { objects: 'partner.action.viewObjects', homepage: 'partner.nav.homepage' },
    institution: { objects: 'exhibition.action.viewItems', homepage: 'exhibition.action.institutionHomepage' },
  },
}