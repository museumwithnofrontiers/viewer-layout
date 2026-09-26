import { sectionMeta } from '@museumwnf/viewer-core'
import PartnerDetail from './PartnerDetail.vue'
import { partnerDetail as galleryPartnerDetail } from './gallery/data.js'
import { partnerDetail as exhibitionPartnerDetail } from './exhibition/data.js'
import GalleryAbout from './gallery/About.vue'
import GalleryCredits from './gallery/Credits.vue'
import GallerySearchHowTo from './gallery/SearchHowTo.vue'
import GalleryPartners from './gallery/Partners.vue'
import GallerySearchResults from './gallery/SearchResults.vue'
import GalleryTimelineResults from './gallery/TimelineResults.vue'
import GalleryTimelineGallery from './gallery/TimelineGallery.vue'
import GalleryCollectionResults from './gallery/CollectionResults.vue'
import GalleryCollectionSearch from './gallery/CollectionSearch.vue'
import GalleryPartnerObjects from './gallery/PartnerObjects.vue'
import ExhibitionSearchHowTo from './exhibition/SearchHowTo.vue'
import ExhibitionPartners from './exhibition/Partners.vue'
import ExhibitionSearchResults from './exhibition/SearchResults.vue'
import ExhibitionTimelineResults from './exhibition/TimelineResults.vue'
import ExhibitionTimelineGallery from './exhibition/TimelineGallery.vue'
import ExhibitionCollectionResults from './exhibition/CollectionResults.vue'
import ExhibitionCollectionSearch from './exhibition/CollectionSearch.vue'
import ExhibitionPartnerObjects from './exhibition/PartnerObjects.vue'
import TextPageView from '../views/TextPageView.vue'

// The family pages a site used to carry itself (inventory-app#2053/#2054),
// served when `pages: true` — loaded on their route, as the sites loaded
// their own.
const GalleryHome = () => import('./gallery/Home.vue')
const GalleryItemDetail = () => import('./gallery/ItemDetail.vue')
const GalleryTimeline = () => import('./gallery/Timeline.vue')
const ExhibitionHome = () => import('./exhibition/Home.vue')
const ExhibitionAbout = () => import('./exhibition/About.vue')
const ExhibitionThemes = () => import('./exhibition/Themes.vue')
const ExhibitionTheme = () => import('./exhibition/Theme.vue')
const ExhibitionThemeGallery = () => import('./exhibition/ThemeGallery.vue')
const ExhibitionItemDetail = () => import('./exhibition/ItemDetail.vue')
const ExhibitionRelatedContent = () => import('./exhibition/RelatedContent.vue')
const ExhibitionTimeline = () => import('./exhibition/Timeline.vue')

// The exhibition partner-objects texts, the same in every exhibition (viewer-i18n
// 4.3.0). A site's own `partnerObjects` still overrides them.
const EXHIBITION_PARTNER_OBJECTS = {
  emptyPartner: 'exhibition.partnerObjects.emptyPartner',
  emptyInstitution: 'exhibition.partnerObjects.emptyInstitution',
  institutionSummary: 'exhibition.partner.monumentsInExhibition',
  partnerProfileLabel: 'partner.action.partnerProfile',
  institutionProfileLabel: 'exhibition.partnerObjects.institutionProfile',
}

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
// With `pages: true` they also serve the pages each site of the family still
// wrote for itself (inventory-app#2053/#2054): the home page, the item page
// and the timeline entrance, and for an exhibition its about page, themes,
// theme pages, theme galleries, related content and, given `creditsBody`,
// its credits page. `galleryConfig`/`exhibitionConfig` (config.js) pass it;
// a site still declaring those routes itself leaves it off.

function galleryRoutes(config) {
  const meta = sectionMeta(['gallery', 'items', 'partners', 'countries'])
  const creditsBody = config.creditsBody

  const pages = config.pages
    ? [
      { path: '/', name: 'home', component: GalleryHome, meta: meta('home') },
      {
        path: '/item/:id',
        name: 'item',
        component: GalleryItemDetail,
        props: (route) => ({ id: String(route.params.id) }),
        meta: meta('database', 'languages', 'dynasties', 'glossary', 'timelines', 'timeline_events'),
      },
      { path: '/timeline', name: 'timeline', component: GalleryTimeline, meta: meta('timeline', 'timelines', 'timeline_events') },
    ]
    : []

  return [
    ...pages,
    { path: '/search', name: 'search-results', component: GallerySearchResults, meta: meta('database') },
    { path: '/how-to-search', name: 'search-how-to', component: GallerySearchHowTo, meta: meta('database') },
    { path: '/partners', name: 'partners', component: GalleryPartners, meta: meta('partners') },
    {
      path: '/partner/:id',
      name: 'partner',
      component: PartnerDetail,
      props: (route) => ({ id: String(route.params.id), family: galleryPartnerDetail }),
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
  const texts = { ...EXHIBITION_PARTNER_OBJECTS, ...config.partnerObjects }

  // `/theme/:id` keeps legacy's `display_order - 1`: the About theme is display
  // order 1, so the first listed theme is `/theme/1`. The sub-theme and picture
  // segments name which part of the theme is read, so they stay in the path.
  const pages = config.pages
    ? [
      { path: '/', name: 'home', component: ExhibitionHome, meta: meta('home') },
      { path: '/about', name: 'about', component: ExhibitionAbout, meta: meta('about', 'themes') },
      { path: '/themes', name: 'themes', component: ExhibitionThemes, meta: meta('themes', 'themes') },
      { path: '/theme/:id/:subtheme?/:image?', name: 'theme', component: ExhibitionTheme, meta: meta('themes', 'themes', 'glossary', 'dynasties') },
      { path: '/theme-gallery/:id', name: 'theme-gallery', component: ExhibitionThemeGallery, meta: meta('themes', 'themes') },
      {
        path: '/item/:id',
        name: 'item',
        component: ExhibitionItemDetail,
        props: (route) => ({ id: String(route.params.id) }),
        meta: meta('database', 'languages', 'dynasties', 'glossary', 'timelines', 'timeline_events'),
      },
      { path: '/related', name: 'related', component: ExhibitionRelatedContent, meta: meta('related', 'related_content') },
      { path: '/timeline', name: 'timeline', component: ExhibitionTimeline, meta: meta('timeline', 'timelines', 'timeline_events') },
      ...(config.creditsBody
        ? [{ path: '/credits', name: 'credits', component: TextPageView, props: { spec: { body: config.creditsBody, back: true } }, meta: meta('credits') }]
        : []),
    ]
    : []

  return [
    ...pages,
    { path: '/search', name: 'search-results', component: ExhibitionSearchResults, meta: meta('database') },
    { path: '/how-to-search', name: 'search-how-to', component: ExhibitionSearchHowTo, meta: meta('database') },
    { path: '/partners', name: 'partners', component: ExhibitionPartners, meta: meta('partners') },
    {
      path: '/partner/:id',
      name: 'partner',
      component: PartnerDetail,
      props: (route) => ({ id: String(route.params.id), family: exhibitionPartnerDetail }),
      meta: meta('partners', 'languages'),
    },
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
      component: PartnerDetail,
      props: (route) => ({ id: String(route.params.id), family: exhibitionPartnerDetail, variant: 'institution' }),
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
 * @param {object} [config.partnerObjects] — exhibition only: overrides of the
 *   five partner-objects entry names, `{ emptyPartner, emptyInstitution,
 *   institutionSummary, partnerProfileLabel, institutionProfileLabel }`, which
 *   default to the shared `exhibition.partnerObjects.*` entries.
 * @param {boolean} [config.pages] — also serve the family pages each site used
 *   to write itself (home, item, timeline entrance; for an exhibition also
 *   about, themes, theme, theme gallery, related content).
 * @param {string} [config.creditsBody] — the entry name the `credits` page's
 *   body reads (e.g. `'carpets.credits.body'`): a gallery's always, an
 *   exhibition's with `pages`.
 * @returns {Array<import('vue-router').RouteRecordRaw>}
 */
export function standardRoutes(family, config = {}) {
  if (family === 'gallery') return galleryRoutes(config)
  if (family === 'exhibition') return exhibitionRoutes(config)
  throw new Error(`standardRoutes: unknown family "${family}" (expected "gallery" or "exhibition")`)
}
