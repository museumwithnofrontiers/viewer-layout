// The DXA family pages: the gallery/exhibition thin views confirmed
// byte-identical within each pair (carpets/amulets, colours/water-in-islam,
// `origin/main` 2026-09-20) folded into one shared page per family — epic
// inventory-app#1731, building on `@museumwnf/viewer-core/dxa`'s composables
// (epic #1730) and the item page's composed view, `ItemDetailView` (epic #1728).
//
// A site does not usually import these pages directly — `standardRoutes`
// (routes.js) is the entry point, returning ready-made route entries. The
// components are exported too, for a site that wants one of them on a route
// of its own naming/path, or wrapped.
import '../styles/dxa.css'

export { standardRoutes } from './routes.js'

// A DXA site's whole declaration, from its own values (inventory-app#2053/#2054).
export { exhibitionConfig, galleryConfig } from './config.js'

// The family pages a site used to carry, and the two shells. `standardRoutes`
// serves the pages with `pages: true`; exported for a site that wraps one.
export { default as GalleryShell } from './gallery/Shell.vue'
export { default as GalleryHome } from './gallery/Home.vue'
export { default as GalleryItemDetail } from './gallery/ItemDetail.vue'
export { default as GalleryTimeline } from './gallery/Timeline.vue'
export { default as ExhibitionShell } from './exhibition/Shell.vue'
export { default as ExhibitionHome } from './exhibition/Home.vue'
export { default as ExhibitionAbout } from './exhibition/About.vue'
export { default as ExhibitionThemes } from './exhibition/Themes.vue'
export { default as ExhibitionTheme } from './exhibition/Theme.vue'
export { default as ExhibitionThemeGallery } from './exhibition/ThemeGallery.vue'
export { default as ExhibitionItemDetail } from './exhibition/ItemDetail.vue'
export { default as ExhibitionRelatedContent } from './exhibition/RelatedContent.vue'
export { default as ExhibitionTimeline } from './exhibition/Timeline.vue'
export { aboutSpec as exhibitionAboutSpec, themeNodeRoute, themeSpec as exhibitionThemeSpec } from './exhibition/themeSpecs.js'

// The family-only blocks and the item page's composed view (inventory-app#2055).
export { default as ItemDetailView } from './ItemDetailView.vue'
export { default as FeaturedPartners } from './FeaturedPartners.vue'
export { default as SiblingGalleries } from './SiblingGalleries.vue'
export { default as PopupLogo } from './PopupLogo.vue'
export { default as PictureGallery } from './PictureGallery.vue'
export { default as PictureNarrative } from './PictureNarrative.vue'
// One partner page for both families (inventory-app#2034); each family's
// own half is its `partnerDetail`, the `family` prop `standardRoutes`
// passes.
export { default as PartnerDetail } from './PartnerDetail.vue'
export { partnerDetail as galleryPartnerDetail } from './gallery/data.js'
export { partnerDetail as exhibitionPartnerDetail } from './exhibition/data.js'

export { default as GalleryAbout } from './gallery/About.vue'
export { default as GalleryCredits } from './gallery/Credits.vue'
export { default as GallerySearchHowTo } from './gallery/SearchHowTo.vue'
export { default as GalleryPartners } from './gallery/Partners.vue'
export { default as GallerySearchResults } from './gallery/SearchResults.vue'
export { default as GalleryTimelineResults } from './gallery/TimelineResults.vue'
export { default as GalleryTimelineGallery } from './gallery/TimelineGallery.vue'
export { default as GalleryCollectionResults } from './gallery/CollectionResults.vue'
export { default as GalleryCollectionSearch } from './gallery/CollectionSearch.vue'
export { default as GalleryPartnerObjects } from './gallery/PartnerObjects.vue'

export { default as ExhibitionSearchHowTo } from './exhibition/SearchHowTo.vue'
export { default as ExhibitionPartners } from './exhibition/Partners.vue'
export { default as ExhibitionSearchResults } from './exhibition/SearchResults.vue'
export { default as ExhibitionTimelineResults } from './exhibition/TimelineResults.vue'
export { default as ExhibitionTimelineGallery } from './exhibition/TimelineGallery.vue'
export { default as ExhibitionCollectionResults } from './exhibition/CollectionResults.vue'
export { default as ExhibitionCollectionSearch } from './exhibition/CollectionSearch.vue'
export { default as ExhibitionPartnerObjects } from './exhibition/PartnerObjects.vue'
