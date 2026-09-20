import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import { layoutTexts } from '../helpers.js'

// Entries every DXA family page reads that `layoutTexts` (viewer-i18n's
// `core`/`layout`/`record`/`sheet`/`partner.map` namespaces) does not
// already carry — the `catalogue`/`partner`/`timeline` namespaces plus
// `core.status.loading`/`core.action.back`. Family-specific `gallery.*`/
// `exhibition.*` entries are added by each test file.
export const sharedDxaTexts = {
  'core.status.loading': 'Loading…',
  'core.action.back': 'Back',
  'catalogue.search.keywordPlaceholder': 'Search…',
  'catalogue.search.submit': 'Search',
  'catalogue.search.howTo': 'How to search',
  'catalogue.search.howToEssay': 'How the search operators work.',
  'catalogue.results.allObjects': 'all objects',
  'catalogue.results.outOf': 'out of',
  'catalogue.results.objects': 'objects',
  'catalogue.results.noResults': 'No results',
  'catalogue.results.noResultsSearch': 'No results for your search.',
  'catalogue.results.resetFilters': 'Reset filters',
  'catalogue.results.timelineForSearch': 'Timeline for this search',
  'catalogue.facet.filterBy': 'Filter by',
  'catalogue.facet.filterFurtherBy': 'Filter further by',
  'catalogue.facet.selectCountry': 'Select a country',
  'catalogue.facet.startDate': 'Start date',
  'catalogue.facet.endDate': 'End date',
  'partner.item.objectsInSite': 'object(s) in this site',
  'partner.info.about': 'About',
  'partner.info.contact': 'Contact',
  'partner.info.logo': 'Logo',
  'partner.info.addresses': 'Addresses',
  'partner.info.phone': 'Phone:',
  'partner.info.fax': 'Fax:',
  'partner.nav.homepage': 'Homepage',
  'timeline.nav.backToEvents': 'Back to events',
}

// Shared mounting helper for the DXA family pages (tests/dxa/*.test.js):
// a real router (the pinned route names every page reads through
// `useRoute()`/`RouterLink`) and i18n instance, over the fixture package
// behind `@inventory-data` — the same shape `tests/views.test.js` uses for
// the composed views these pages are built from.

export async function settle(predicate, tries = 40) {
  for (let i = 0; i < tries && !predicate(); i++) await new Promise((r) => setTimeout(r, 5))
  await nextTick()
}

const ROUTE_STUBS = [
  { path: '/', name: 'home', component: { template: '<p>home</p>' } },
  { path: '/about', name: 'about', component: { template: '<p>about</p>' } },
  { path: '/credits', name: 'credits', component: { template: '<p>credits</p>' } },
  { path: '/search', name: 'search-results', component: { template: '<p>search results</p>' } },
  { path: '/how-to-search', name: 'search-how-to', component: { template: '<p>how to</p>' } },
  { path: '/partners', name: 'partners', component: { template: '<p>partners</p>' } },
  { path: '/partner/:id', name: 'partner', component: { template: '<p>partner</p>' } },
  { path: '/partner/:id/objects', name: 'partner-objects', component: { template: '<p>partner objects</p>' } },
  { path: '/institution/:id', name: 'institution', component: { template: '<p>institution</p>' } },
  { path: '/institution/:id/monuments', name: 'institution-monuments', component: { template: '<p>institution monuments</p>' } },
  { path: '/timeline-results', name: 'timeline-results', component: { template: '<p>timeline results</p>' } },
  { path: '/timeline/gallery', name: 'timeline-gallery', component: { template: '<p>timeline gallery</p>' } },
  { path: '/collection', name: 'collection', component: { template: '<p>collection</p>' } },
  { path: '/collection-results', name: 'collection-results', component: { template: '<p>collection results</p>' } },
  { path: '/item/:id', name: 'item', component: { template: '<p>item</p>' } },
]

export async function mountPage(component, { props = {}, route = '/', messages = {} } = {}) {
  const i18n = createI18n({ locale: 'en', messages: { en: { ...layoutTexts, ...messages } } })
  const router = createRouter({ history: createMemoryHistory(), routes: ROUTE_STUBS })
  await router.push(route)
  await router.isReady()
  const wrapper = mount(component, { props, global: { plugins: [i18n, router] } })
  await settle(() => true, 1)
  return { wrapper, router }
}
