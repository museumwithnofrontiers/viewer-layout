// Sharing History's mini-sites: a family of their own (exhibitions/AWE/, inside
// the Sharing History frame), with pages of their own. They share only how
// every mini-site reads its records (../exhibition.js) and the tooltip. Their
// stylesheet (minisite-sharinghistory.css) is imported by ../index.js.

export { default as SharingHistoryShell } from './Shell.vue'
export { default as SharingHistoryHome } from './Home.vue'
export { default as SharingHistoryIntroduction } from './Introduction.vue'
export { default as SharingHistoryPage } from './Page.vue'
export { default as SharingHistoryFurtherReading } from './FurtherReading.vue'
export { default as SharingHistoryWindow } from './Window.vue'
export { default as SharingHistoryZoom } from './Zoom.vue'
// Named for the family: the entry also exports Discover Islamic Art's
// readingOrder, slotsOf and placementCaption.
export {
  pageRoute as sharinghistoryPageRoute, pageWithNext as sharinghistoryPageWithNext,
  placementCaption as sharinghistoryCaption, readingOrder as sharinghistoryReadingOrder,
  relatedLinks as sharinghistoryRelatedLinks, SHARINGHISTORY_LABELS, SHARINGHISTORY_WINDOWS,
  slotsOf as sharinghistorySlotsOf, useSharingHistoryExhibition,
} from './exhibition.js'
export { sharinghistoryNavigation, sharinghistoryRoutes, sharinghistorySettings } from './routes.js'
