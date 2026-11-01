// The standalone family layer: Discover Islamic Art, Discover Baroque Art and
// Sharing History, the three sites legacy built from one PHP template family
// (inventory-app#2233, decision D1: their layouts match legacy's, and what
// they share lives here once). Like `/dxa`, it imports only what the other
// entries publish and `@museumwnf/viewer-core`, and nothing imports from it.
//
// A site's `dataset.config.js` names `Shell` as its shell and sets
// `config.standalone` (Shell.vue lists the keys); its routes name the pages
// below, or its own.
import '../styles/standalone.css'

export { default as StandaloneShell } from './Shell.vue'
export { default as StandaloneBanner } from './Banner.vue'
export { default as StandaloneSponsors } from './Sponsors.vue'
export { default as StandaloneHome } from './Home.vue'
export { default as TodayHighlight } from './TodayHighlight.vue'
export { default as StandaloneItemSheet } from './ItemSheet.vue'
export { default as RelatedContent } from './RelatedContent.vue'
export { default as StandaloneTextPage } from './TextPage.vue'
export { default as StandaloneSubNav } from './SubNav.vue'
export { default as StandaloneTileGrid } from './TileGrid.vue'
export { default as StandaloneResultsGrid } from './ResultsGrid.vue'
export { default as StandaloneSlider } from './Slider.vue'
export { byLanguage, dayOfYear, legacyHomeItemKey, pickForDay } from './chrome.js'
