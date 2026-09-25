// The DXA family pages: the gallery/exhibition thin views confirmed
// byte-identical within each pair (carpets/amulets, colours/water-in-islam,
// `origin/main` 2026-09-20) folded into one shared page per family — epic
// inventory-app#1731, building on `@museumwnf/viewer-core/dxa`'s composables
// (epic #1730) and `RecordSheetView`/item-sheet composed view (epic #1728).
//
// A site does not usually import these pages directly — `standardRoutes`
// (routes.js) is the entry point, returning ready-made route entries. The
// components are exported too, for a site that wants one of them on a route
// of its own naming/path, or wrapped.
import '../styles/dxa.css'

export { standardRoutes } from './routes.js'

// One partner page for both families (inventory-app#2034); each family's
// own half is its `partnerDetail`, the `family` prop `standardRoutes`
// passes. `GalleryPartnerProfile`/`ExhibitionPartnerProfile` below are that
// page too, kept under their old names until inventory-app#2017's major
// release.
export { default as PartnerDetail } from './PartnerDetail.vue'
export { partnerDetail as galleryPartnerDetail } from './gallery/data.js'
export { partnerDetail as exhibitionPartnerDetail } from './exhibition/data.js'

export { default as GalleryAbout } from './gallery/About.vue'
export { default as GalleryCredits } from './gallery/Credits.vue'
export { default as GallerySearchHowTo } from './gallery/SearchHowTo.vue'
export { default as GalleryPartners } from './gallery/Partners.vue'
export { default as GalleryPartnerProfile } from './gallery/PartnerProfile.vue'
export { default as GallerySearchResults } from './gallery/SearchResults.vue'
export { default as GalleryTimelineResults } from './gallery/TimelineResults.vue'
export { default as GalleryTimelineGallery } from './gallery/TimelineGallery.vue'
export { default as GalleryCollectionResults } from './gallery/CollectionResults.vue'
export { default as GalleryCollectionSearch } from './gallery/CollectionSearch.vue'
export { default as GalleryPartnerObjects } from './gallery/PartnerObjects.vue'

export { default as ExhibitionSearchHowTo } from './exhibition/SearchHowTo.vue'
export { default as ExhibitionPartners } from './exhibition/Partners.vue'
export { default as ExhibitionPartnerProfile } from './exhibition/PartnerProfile.vue'
export { default as ExhibitionSearchResults } from './exhibition/SearchResults.vue'
export { default as ExhibitionTimelineResults } from './exhibition/TimelineResults.vue'
export { default as ExhibitionTimelineGallery } from './exhibition/TimelineGallery.vue'
export { default as ExhibitionCollectionResults } from './exhibition/CollectionResults.vue'
export { default as ExhibitionCollectionSearch } from './exhibition/CollectionSearch.vue'
export { default as ExhibitionPartnerObjects } from './exhibition/PartnerObjects.vue'
