// The mini-site family layer: legacy's virtual exhibitions, each a website of
// its own (inventory-app#2359), every one built on the same pages
// (exhibitions/ISL/ or exhibitions/BAR/generic_*.php), so what they share lives here once and a
// change to how a page is drawn reaches all of them. A mini-site keeps its own
// exhibition settings (`minisite`), its theme (tokens.css, every value its
// legacy stylesheet set), its legacy pictures and its texts. Like `/dxa` and
// `/standalone`, it imports only what the other entries publish and
// `@museumwnf/viewer-core`, and nothing imports from it.
//
// A site's `dataset.config.js` names `MinisiteShell` as its shell,
// `minisiteNavigation()` as its navigation, `minisiteSettings()` as its
// `minisite`, and `minisiteRoutes()` as its routes.
import '../styles/minisite.css'

export { default as MinisiteShell } from './Shell.vue'
export { default as MinisiteHome } from './Home.vue'
export { default as MinisiteIntroduction } from './Introduction.vue'
export { default as MinisitePage } from './Page.vue'
export { default as MinisiteCredits } from './Credits.vue'
export { default as MinisiteMap } from './Map.vue'
export { default as MinisiteZoom } from './Zoom.vue'
export { EXHIBITION_ENTITIES, exhibitionData, familyOf, LABELS, labelSet, useExhibition } from './exhibition.js'
export { baroqueartMenu, islamicartMenu, minisiteNavigation, minisiteRoutes, minisiteSettings } from './routes.js'
// Sharing History's mini-sites: their own pages and frame (./sharinghistory/).
export * from './sharinghistory/index.js'
export {
  cleanText, curatorLabel, curatorLink, detailViewCaption, introCaption, ISLAMICART_NO_COUNTRY, pageWithNeighbours, placementCaption, PLACEHOLDER_TITLE,
  quoteHasItalics, readingOrder, sheetItemId, slotsOf, viewPicture, withFirstView,
} from './rules.js'
