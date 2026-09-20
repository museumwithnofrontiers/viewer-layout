import { sectionMeta } from '@museumwnf/viewer-core'
import GalleryAbout from './gallery/About.vue'
import GalleryCredits from './gallery/Credits.vue'
import GallerySearchHowTo from './gallery/SearchHowTo.vue'
import GalleryPartners from './gallery/Partners.vue'
import GalleryPartnerProfile from './gallery/PartnerProfile.vue'
import GallerySearchResults from './gallery/SearchResults.vue'
import GalleryTimelineResults from './gallery/TimelineResults.vue'
import GalleryTimelineGallery from './gallery/TimelineGallery.vue'
import GalleryCollectionResults from './gallery/CollectionResults.vue'
import GalleryCollectionSearch from './gallery/CollectionSearch.vue'
import GalleryPartnerObjects from './gallery/PartnerObjects.vue'
import ExhibitionSearchHowTo from './exhibition/SearchHowTo.vue'
import ExhibitionPartners from './exhibition/Partners.vue'
import ExhibitionPartnerProfile from './exhibition/PartnerProfile.vue'
import ExhibitionSearchResults from './exhibition/SearchResults.vue'
import ExhibitionTimelineResults from './exhibition/TimelineResults.vue'
import ExhibitionTimelineGallery from './exhibition/TimelineGallery.vue'
import ExhibitionCollectionResults from './exhibition/CollectionResults.vue'
import ExhibitionCollectionSearch from './exhibition/CollectionSearch.vue'
import ExhibitionPartnerObjects from './exhibition/PartnerObjects.vue'

// The route entries every DXA gallery/exhibition registered for itself,
// byte-identical name-for-name and path-for-path across carpets/amulets
// (gallery) and colours/water-in-islam (exhibition) on `origin/main`
// 2026-09-20 — epic inventory-app#1731. `standardRoutes(family, config)`
// returns exactly those entries, pointed at the shared pages above instead
// of a site's own copy, so a site spreads the result into its
// `dataset.config.js`'s `extraViews` and keeps every existing deep link
// (and every `legacyRoutes` resolver that targets these names) working
// unmodified — it only needs to add its own home/item/timeline-entrance/
// partners-entrance routes and whatever else is genuinely its own.
//
// `meta` is built here, not read from the site: `CHROME` — the entity list
// every page's chrome loads before it renders — is `[family, 'items',
// 'partners', 'countries']` for both families (`'gallery'`/`'exhibition'` is
// the family name, not a site name), matching carpets'/colours' own
// `dataset.config.js` exactly.
//
//   import { standardRoutes } from '@museumwnf/viewer-layout/dxa'
//
//   extraViews: [
//     ...standardRoutes('gallery', { creditsBody: 'carpets.credits.body' }),
//     // + this gallery's own routes: home, item, collection entrance,
//     // timeline entrance, partners entrance
//   ]
//
// `About`/`ThemeGallery`/`Themes`/`RelatedContent` are not part of
// `standardRoutes('exhibition', …)` — blocked on the Theme epic
// (inventory-app#1729); a site keeps writing those itself until they are
// promoted in a later pass. The exhibition family's credits route is not
// promoted either: colours/water-in-islam never had a `Credits.vue` — their
// `/credits` route points `TextPageView` directly at a local `creditsSpec`,
// a one-line site concern, not a thin view.

function galleryRoutes(config) {
  const meta = sectionMeta(['gallery', 'items', 'partners', 'countries'])
  const creditsBody = config.creditsBody

  return [
    { path: '/search', name: 'search-results', component: GallerySearchResults, meta: meta('database') },
    { path: '/how-to-search', name: 'search-how-to', component: GallerySearchHowTo, meta: meta('database') },
    { path: '/partners', name: 'partners', component: GalleryPartners, meta: meta('partners') },
    {
      path: '/partner/:id',
      name: 'partner',
      component: GalleryPartnerProfile,
      props: (route) => ({ id: route.params.id }),
      meta: meta('partners', 'languages'),
    },
    { path: '/partner/:id/objects', name: 'partner-objects', component: GalleryPartnerObjects, meta: meta('partners') },
    {
      path: '/timeline-results',
      name: 'timeline-results',
      component: GalleryTimelineResults,
      meta: meta('timeline', 'timelines', 'timeline_events'),
    },
    {
      path: '/timeline/gallery',
      name: 'timeline-gallery',
      component: GalleryTimelineGallery,
      meta: meta('timeline', 'timelines', 'timeline_events'),
    },
    { path: '/about', name: 'about', component: GalleryAbout, meta: meta('about') },
    {
      path: '/credits',
      name: 'credits',
      component: GalleryCredits,
      props: { bodyKey: creditsBody },
      meta: meta('credits'),
    },
    { path: '/collection', name: 'collection', component: GalleryCollectionSearch, meta: meta('collection', 'tags') },
    {
      path: '/collection-results',
      name: 'collection-results',
      component: GalleryCollectionResults,
      meta: meta('collection', 'tags', 'timelines'),
    },
  ]
}

function exhibitionRoutes(config) {
  const meta = sectionMeta(['exhibition', 'items', 'partners', 'countries'])
  const texts = config.partnerObjects

  return [
    { path: '/search', name: 'search-results', component: ExhibitionSearchResults, meta: meta('database') },
    { path: '/how-to-search', name: 'search-how-to', component: ExhibitionSearchHowTo, meta: meta('database') },
    { path: '/partners', name: 'partners', component: ExhibitionPartners, meta: meta('partners') },
    { path: '/partner/:id', name: 'partner', component: ExhibitionPartnerProfile, meta: meta('partners', 'languages') },
    {
      path: '/partner/:id/objects',
      name: 'partner-objects',
      component: ExhibitionPartnerObjects,
      props: { texts },
      meta: meta('partners'),
    },
    {
      path: '/institution/:id',
      name: 'institution',
      component: ExhibitionPartnerProfile,
      props: { variant: 'institution' },
      meta: meta('partners', 'languages'),
    },
    {
      path: '/institution/:id/monuments',
      name: 'institution-monuments',
      component: ExhibitionPartnerObjects,
      props: { variant: 'institution', texts },
      meta: meta('partners'),
    },
    {
      path: '/timeline-results',
      name: 'timeline-results',
      component: ExhibitionTimelineResults,
      meta: meta('timeline', 'timelines', 'timeline_events'),
    },
    {
      path: '/timeline/gallery',
      name: 'timeline-gallery',
      component: ExhibitionTimelineGallery,
      meta: meta('timeline', 'timelines', 'timeline_events'),
    },
    { path: '/collection', name: 'collection', component: ExhibitionCollectionSearch, meta: meta('collection', 'tags') },
    {
      path: '/collection-results',
      name: 'collection-results',
      component: ExhibitionCollectionResults,
      meta: meta('collection', 'tags', 'timelines'),
    },
  ]
}

/**
 * The pinned route entries for a DXA family, ready to spread into a site's
 * `dataset.config.js` `extraViews`.
 *
 * @param {'gallery' | 'exhibition'} family
 * @param {object} config
 * @param {string} [config.creditsBody] — gallery only: the entry name the
 *   `credits` route's `TextPageView` reads (e.g. `'carpets.credits.body'`).
 * @param {object} [config.partnerObjects] — exhibition only: the five entry
 *   names `PartnerObjects.vue`/`InstitutionMonuments.vue` never shared
 *   across sites: `{ emptyPartner, emptyInstitution, institutionSummary,
 *   partnerProfileLabel, institutionProfileLabel }`.
 * @returns {Array<import('vue-router').RouteRecordRaw>}
 */
export function standardRoutes(family, config = {}) {
  if (family === 'gallery') return galleryRoutes(config)
  if (family === 'exhibition') return exhibitionRoutes(config)
  throw new Error(`standardRoutes: unknown family "${family}" (expected "gallery" or "exhibition")`)
}
