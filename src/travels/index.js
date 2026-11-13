// The Travels site's pages: the Exhibition Trails of legacy
// travels.museumwnf.org, a standalone site of its own (inventory-app#2515,
// #2543). Like `/minisite`, it imports only what the other entries publish
// and `@museumwnf/viewer-core`, and nothing imports from it.
//
// A site's `dataset.config.js` is `travelsConfig()`; its texts are
// viewer-i18n's `travels` bundle.
import '../styles/travels.css'

export { default as TravelsShell } from './Shell.vue'
export { default as TravelsHome } from './Home.vue'
export { default as TravelsTrails } from './Trails.vue'
export { default as TravelsTrail } from './Trail.vue'
export { default as TravelsItinerary } from './Itinerary.vue'
export { default as TravelsTrailHeader } from './TrailHeader.vue'
export { default as TravelsCrumbs } from './Crumbs.vue'
export { useTravels } from './data.js'
export { travelsConfig, travelsRoutes } from './routes.js'
export {
  bookLink, childrenOf, galleryOf, HIDDEN_PROJECTS, isListed, ITINERARY_TABS, ITINERARY_TYPE, itineraryNumber,
  itineraryPicture, lines, LOCATION_TYPE, locationsOfTrail, mainLocations, neighbours, projectCode, projectOfTrail,
  TRAIL_TABS, TRAIL_TYPE, TRAVEL_ENTITIES, trailsOf,
} from './rules.js'
