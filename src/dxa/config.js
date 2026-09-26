import {
  languageLabels, loadEntities, mwnfLinks, offeredLanguages, useDataPackage,
} from '@museumwnf/viewer-core'
import { itemFromUidPath as itemFromUidList, partnerFromKey as partnerFromLists } from '@museumwnf/viewer-core/legacy'
import GalleryShell from './gallery/Shell.vue'
import ExhibitionShell from './exhibition/Shell.vue'
import { itemFromUidPath, partnerFromKey } from './gallery/data.js'
import { countries, hasTimeline, items, visiblePartners } from './exhibition/data.js'
import { standardRoutes } from './routes.js'

// A DXA site's whole declaration (inventory-app#2053/#2054). Every gallery's
// `dataset.config.js` was the same code apart from six values, and every
// exhibition's apart from seven; the site now passes those values and
// nothing else:
//
//   // src/dataset.config.js
//   import { galleryConfig } from '@museumwnf/viewer-layout/dxa'
//   export default galleryConfig({
//     datasetPackage: '@museumwnf/carpets-data',
//     siteName: 'Carpets',
//     origin: 'https://museumwithnofrontiers.github.io/carpets',
//     projectColors: { '<project id>': 'mwnf-chip--DCA', … },
//     noticeProjects: ['<project id>'],
//     creditsBody: 'carpets.credits.body',
//   })
//
// What a site owns beyond them — another route, a different menu — is an
// ordinary override of the returned object. Before the website mounts, a
// config reads nothing from its package but the manifest: the languages it
// offers, their labels and its name.

// A legacy URL pasted after the `#`: redirect-only, so an old address lands
// on the right page. The item's dbUid path resolves through
// `backward_compatibility`, a partner's country and legacy id through the
// partner record; the language segment is dropped, the page number moves to
// the query, and the timeline gallery's `start`/`end` path segments become
// the platform's `begin`/`end` keys.
function timelineGalleryRedirect({ country, start, end, page }) {
  const query = { country }
  if (start !== 'any') query.begin = start
  if (end !== 'any') query.end = end
  if (Number(page) > 1) query.page = page
  return { name: 'timeline-gallery', query }
}

/**
 * A gallery's config. `siteName` is the fallback for a package that predates
 * `manifest.site`; `projectColors` maps a project id to one of the
 * `mwnf-chip--*` classes; `noticeProjects` lists the projects whose sheets
 * carry the Explore-partner notice; `creditsBody` is the credits page's entry.
 */
export function galleryConfig({ datasetPackage, siteName, origin, projectColors = {}, noticeProjects = [], creditsBody }) {
  const { manifest } = useDataPackage()
  const languages = offeredLanguages()
  return {
    datasetPackage,
    // English is the base language of every catalogue: the site is known by
    // its English name.
    siteName: manifest.site?.names?.en ?? siteName,
    features: { entities: [] },
    languages,
    shell: GalleryShell,
    // Legacy's five sections, each entry's `section` the one its route's
    // `meta.section` carries so the active one follows `useSection()`; the
    // portal's My Collection link (no section: it never highlights); the
    // header and footer lists; the banner titles; the header search box. The
    // empty-string title is the router's catch-all, which carries no section.
    navigation: {
      languages: languageLabels(languages),
      links: [
        { section: 'about', label: 'core.nav.about', to: { name: 'about' } },
        { section: 'collection', label: 'core.nav.collection', to: { name: 'collection' } },
        { section: 'partners', label: 'core.nav.partners', to: { name: 'partners' } },
        { section: 'timeline', label: 'core.nav.timeline', to: { name: 'timeline' } },
        { section: 'credits', label: 'core.nav.credits', to: { name: 'credits' } },
        { label: 'core.nav.myCollection', href: mwnfLinks.myCollection, external: true },
      ],
      headerLinks: [
        { label: 'core.nav.home', to: { name: 'home' } },
        { label: 'gallery.nav.allGalleries', href: `${mwnfLinks.galleries}/list/1`, external: true },
      ],
      footerLinks: [
        { label: 'core.footer.aboutMwnf', href: mwnfLinks.about, external: true },
        { label: 'core.footer.contact', href: mwnfLinks.contact, external: true },
        { label: 'gallery.footer.legalNotice', href: mwnfLinks.legalNotice, external: true },
        { label: 'core.footer.credits', href: mwnfLinks.credits, external: true },
        { label: 'core.footer.cookies', href: mwnfLinks.cookies, external: true },
      ],
      sectionTitles: {
        collection: 'core.section.collection',
        database: 'core.section.database',
        partners: 'core.section.partners',
        timeline: 'core.section.timeline',
        about: 'core.section.about',
        credits: 'core.section.credits',
        '': 'gallery.section.error',
      },
      search: { route: 'search-results', key: 'q', placeholder: 'catalogue.search.placeholder', submitLabel: 'catalogue.search.submit', empty: 'all-objects' },
    },
    // What depends on the section alone; the banner's image and caption depend
    // on the loaded gallery, so the shell passes them.
    banner: {
      variant: ({ section }) => (section === 'home' ? 'strip' : 'section'),
      eyebrow: ({ section, t }) => (section === 'home' ? t('gallery.banner.discoverGalleries') : ''),
      captionLabel: 'gallery.banner.detailFrom',
      enter: ({ section, t }) => (section === 'home'
        ? { label: '»', href: '#/collection', ariaLabel: t('gallery.action.goToCollection') }
        : null),
    },
    // The chrome images live on the legacy media server; the package ships
    // the path.
    media: { legacyHost: 'https://images.museumwnf.org' },
    links: { ...mwnfLinks },
    projectColors,
    noticeProjects,
    // The address this build is deployed at, base path included, read by
    // `sourceUrl()` for the source credit.
    site: { origin },
    extraViews: standardRoutes('gallery', { creditsBody, pages: true }),
    legacyRoutes: [
      {
        path: '/database-item/:uid(.*)/:language',
        async resolve({ uid }) {
          await loadEntities(['items'])
          const item = itemFromUidPath(uid)
          return item ? { name: 'item', params: { id: item.id } } : null
        },
      },
      {
        path: '/partner/:country/:id/:language',
        async resolve({ country, id }) {
          await loadEntities(['partners'])
          const partner = partnerFromKey(country, id)
          return partner ? { name: 'partner', params: { id: partner.id } } : null
        },
      },
      {
        path: '/partner-objects/:country/:id/:page',
        async resolve({ country, id, page }) {
          await loadEntities(['partners'])
          const partner = partnerFromKey(country, id)
          if (!partner) return null
          return { name: 'partner-objects', params: { id: partner.id }, query: Number(page) > 1 ? { page } : {} }
        },
      },
      { path: '/timeline-gallery/:country/:start/:end/:page', resolve: timelineGalleryRedirect },
      { path: '/error', resolve: () => null },
    ],
  }
}

/**
 * An exhibition's config: `galleryConfig`'s values, `creditsBody` the
 * credits page's entry. The partner-objects texts are the shared
 * `exhibition.partnerObjects.*` entries; `partnerObjects` still overrides them.
 */
export function exhibitionConfig({
  datasetPackage, siteName, origin, projectColors = {}, noticeProjects = [], creditsBody, partnerObjects,
}) {
  const { manifest } = useDataPackage()
  const languages = offeredLanguages()
  const partnerFromExhibitionKey = async (country, id) => {
    await loadEntities(['exhibition', 'partners', 'countries'])
    return partnerFromLists(visiblePartners.value, countries.value, country, id)
  }
  return {
    datasetPackage,
    siteName: manifest.site?.names?.en ?? siteName,
    features: { entities: [] },
    languages,
    shell: ExhibitionShell,
    // Legacy's NavigationComponent, one for one, with "related content" at
    // /related. Timeline is dropped when the exhibition reports neither
    // chronology: the flags gate the entry, not the data.
    navigation: {
      languages: languageLabels(languages),
      links: [
        { section: 'about', label: 'core.nav.about', to: { name: 'about' } },
        { section: 'themes', label: 'exhibition.nav.themes', to: { name: 'themes' } },
        { section: 'collection', label: 'core.nav.collection', to: { name: 'collection' } },
        { section: 'partners', label: 'core.nav.partners', to: { name: 'partners' } },
        { section: 'timeline', label: 'core.nav.timeline', to: { name: 'timeline' }, when: () => hasTimeline.value },
        { section: 'related', label: 'record.related.title', to: { name: 'related' } },
        { section: 'credits', label: 'core.nav.credits', to: { name: 'credits' } },
        { label: 'core.nav.myCollection', href: mwnfLinks.myCollection, external: true },
      ],
      headerLinks: [
        { label: 'core.nav.home', to: { name: 'home' } },
        { label: 'core.footer.aboutMwnf', href: mwnfLinks.about, external: true },
      ],
      footerLinks: [
        { label: 'core.footer.aboutMwnf', href: mwnfLinks.about, external: true },
        { label: 'core.footer.contact', href: mwnfLinks.contact, external: true },
        { label: 'exhibition.footer.legalNotice', href: mwnfLinks.legalNotice, external: true },
        { label: 'core.footer.credits', href: mwnfLinks.credits, external: true },
        { label: 'core.footer.cookies', href: mwnfLinks.cookies, external: true },
      ],
      // Every section page but Home, which the shell titles from the
      // exhibition record.
      sectionTitles: {
        themes: 'exhibition.section.themes',
        collection: 'core.section.collection',
        database: 'core.section.database',
        partners: 'core.section.partners',
        related: 'record.related.title',
        timeline: 'core.section.timeline',
        about: 'core.section.about',
        credits: 'core.section.credits',
      },
      // `all-objects` is legacy's sentinel for an empty search, and the value
      // the results page matches on.
      search: { route: 'search-results', key: 'q', placeholder: 'catalogue.search.placeholder', submitLabel: 'catalogue.search.submit', empty: 'all-objects' },
    },
    banner: {
      variant: ({ section }) => (section === 'home' ? 'split' : 'section'),
    },
    // Legacy's header shows category 0 ("Header") beside the MWNF mark and
    // leaves the other categories to the footer strip. Only categories 1 and
    // 2 carry real copy; 3 and 4 hold legacy placeholders, which fall back to
    // the category's own name.
    logos: {
      header: (logo) => Number(logo.category_id) === 0 && logo.visible !== false,
      headerTitle: 'exhibition.sponsors.coOrganisers',
      sponsorGroups: (logos, t) => {
        const byCategory = new Map()
        for (const logo of logos) {
          if (logo.visible === false) continue
          if (Number(logo.category_id) === 0) continue
          const key = logo.category_id ?? 0
          const bucket = byCategory.get(key)
          if (bucket) bucket.push(logo)
          else byCategory.set(key, [logo])
        }
        return [...byCategory.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([categoryId, group]) => ({
            title: Number(categoryId) === 1 ? t('exhibition.sponsors.patronage')
              : Number(categoryId) === 2 ? t('exhibition.sponsors.support')
                : (group[0].category ?? ''),
            sponsors: [...group]
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((logo) => ({ name: logo.alt, href: logo.href, logo: logo.image })),
          }))
      },
    },
    // The chrome images and related-content documents live on the legacy
    // media server; the package ships the path.
    media: { legacyHost: 'https://images.museumwnf.org' },
    links: { ...mwnfLinks },
    projectColors,
    noticeProjects,
    site: { origin },
    extraViews: standardRoutes('exhibition', { creditsBody, partnerObjects, pages: true }),
    legacyRoutes: [
      {
        path: '/database-item/:uid(.*)/:language',
        async resolve({ uid }) {
          await loadEntities(['items'])
          const item = itemFromUidList(items.value, uid)
          return item ? { name: 'item', params: { id: item.id } } : null
        },
      },
      {
        path: '/partner/:country/:id/:language',
        async resolve({ country, id }) {
          const partner = await partnerFromExhibitionKey(country, id)
          return partner ? { name: 'partner', params: { id: partner.id } } : null
        },
      },
      {
        path: '/partner-objects/:country/:id/:page',
        async resolve({ country, id, page }) {
          const partner = await partnerFromExhibitionKey(country, id)
          if (!partner) return null
          return { name: 'partner-objects', params: { id: partner.id }, query: Number(page) > 1 ? { page } : {} }
        },
      },
      {
        path: '/institution/:country/:id/:language',
        async resolve({ country, id }) {
          const partner = await partnerFromExhibitionKey(country, id)
          return partner ? { name: 'institution', params: { id: partner.id } } : null
        },
      },
      {
        path: '/institution-monuments/:country/:id/:page',
        async resolve({ country, id, page }) {
          const partner = await partnerFromExhibitionKey(country, id)
          if (!partner) return null
          return { name: 'institution-monuments', params: { id: partner.id }, query: Number(page) > 1 ? { page } : {} }
        },
      },
      { path: '/timeline-gallery/:country/:start/:end/:page', resolve: timelineGalleryRedirect },
      { path: '/error', resolve: () => null },
    ],
  }
}
