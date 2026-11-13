// The Publications site's pages: legacy books.museumwnf.org (book-client),
// a standalone site of its own (inventory-app#2515, #2542). Like `/minisite`,
// it imports only what the other entries publish and `@museumwnf/viewer-core`,
// and nothing imports from it.
//
// A site's `dataset.config.js` is `publicationsConfig()`; its texts are
// viewer-i18n's `publications` bundle.
import '../styles/publications.css'

export { default as PublicationsShell } from './Shell.vue'
export { default as PublicationsHome } from './Home.vue'
export { default as PublicationsCategory } from './Category.vue'
export { default as PublicationsResults } from './Results.vue'
export { default as PublicationPage } from './Publication.vue'
export { default as PublicationTile } from './Tile.vue'
export { default as PublicationsPagination } from './Pagination.vue'
export { categoriesOf, usePublications } from './data.js'
export { PUBLICATIONS_FOOTER } from './footer.js'
export { publicationsConfig, publicationsRoutes } from './routes.js'
export {
  availableLanguages, categoryBySlug, displayLanguage, documentsOf, editionsOf, editionText, FORMATS, formatsOf, hasSearch, homeLimit,
  inCategory, limitLanguages, PAGE_SIZE, present, PUBLICATION_CATEGORIES, PUBLICATION_ENTITIES, SEARCH_KEYS,
  searchPublications, themeKey, truncate,
} from './rules.js'
