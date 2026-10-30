// Discover Baroque Art's mini-sites: legacy's virtual exhibitions of Discover
// Baroque Art (exhibitions/BAR/), a product of their own, with pages, frame,
// caption rules and stylesheet of their own (minisite-baroqueart.css, imported
// by ../index.js). They share with every mini-site only how a mini-site reads
// its records (../exhibition.js), the order of its pages and which record a
// view opens (../rules.js), the tooltip and the Word document; a change to
// another family's pages never reaches them.

export { default as BaroqueartShell } from './Shell.vue'
export { default as BaroqueartHome } from './Home.vue'
export { default as BaroqueartIntroduction } from './Introduction.vue'
export { default as BaroqueartPage } from './Page.vue'
export { default as BaroqueartZoom } from './Zoom.vue'
export { BAROQUEART_LABELS, BAROQUEART_WINDOWS, useBaroqueartExhibition } from './exhibition.js'
export { baroqueartMenu, baroqueartNavigation, baroqueartRoutes, baroqueartSettings } from './routes.js'
// Named for the family: the entry also exports Discover Islamic Art's rules.
export {
  BAROQUEART_NO_COUNTRY, curatorLabel as baroqueartCuratorLabel, detailViewCaption as baroqueartDetailViewCaption,
  introCaption as baroqueartIntroCaption, placementCaption as baroqueartCaption, slotsOf as baroqueartSlotsOf,
  withFirstView as baroqueartWithFirstView,
} from './rules.js'
