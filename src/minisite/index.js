// The mini-site family layer: legacy's virtual exhibitions, each a website of
// its own (inventory-app#2359). Discover Islamic Art's exhibitions were all
// built on the same pages (exhibitions/ISL/generic_*.php), which live here
// once, so a change to how a page is drawn reaches all of them; every other
// product's mini-sites have pages of their own (./sharinghistory/,
// ./baroqueart/, the Artistic Introduction's ./artintro/). A mini-site keeps its own
// exhibition settings (`minisite`), its theme (tokens.css, every value its
// legacy stylesheet set), its legacy pictures and its texts. Like `/dxa` and
// `/standalone`, it imports only what the other entries publish and
// `@museumwnf/viewer-core`, and nothing imports from it.
//
// A site's `dataset.config.js` names `MinisiteShell` as its shell,
// `minisiteNavigation()` as its navigation, `minisiteSettings()` as its
// `minisite`, and `minisiteRoutes()` as its routes.
import '../styles/minisite.css'
// Imported here, not only by ./sharinghistory/: the build keeps an entry's own
// stylesheets, and drops those of a module it reaches through `export *`.
import '../styles/minisite-sharinghistory.css'
import '../styles/minisite-artintro.css'
import '../styles/minisite-baroqueart.css'

export { default as MinisiteShell } from './Shell.vue'
export { default as MinisiteHome } from './Home.vue'
export { default as MinisiteIntroduction } from './Introduction.vue'
export { default as MinisitePage } from './Page.vue'
export { default as MinisiteCredits } from './Credits.vue'
export { default as MinisiteMap } from './Map.vue'
export { default as MinisiteZoom } from './Zoom.vue'
export { EXHIBITION_ENTITIES, exhibitionData, familyOf, LABELS, labelSet, useExhibition } from './exhibition.js'
export { islamicartMenu, minisiteNavigation, minisiteRoutes, minisiteSettings } from './routes.js'
// Sharing History's mini-sites: their own pages and frame (./sharinghistory/).
export * from './sharinghistory/index.js'
// Discover Baroque Art's mini-sites: a product of their own, with pages, frame and rules of their own (./baroqueart/).
export * from './baroqueart/index.js'
// Discover Islamic Art's Artistic Introduction: its own home page and pages (./artintro/).
export * from './artintro/index.js'
export {
  cleanText, curatorLabel, curatorLink, introCaption, ISLAMICART_NO_COUNTRY, pageWithNeighbours, placementCaption, PLACEHOLDER_TITLE,
  quoteHasItalics, readingOrder, sheetItemId, slotsOf, viewPicture, withFirstView,
} from './rules.js'
