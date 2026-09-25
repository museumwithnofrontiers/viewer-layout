import { describe, expect, it } from 'vitest'
import { exhibitionConfig, galleryConfig, standardRoutes } from '../src/dxa/index.js'
import * as content from '../src/content/index.js'
import * as views from '../src/views/index.js'
import * as dxa from '../src/dxa/index.js'

// The DXA family layer's route table and site declarations
// (inventory-app#2053/#2054/#2055). Names, paths and `meta` are pinned: a
// deep link or a legacy redirect targets them by name.

const byName = (routes) => Object.fromEntries(routes.map((route) => [route.name, route]))

describe('standardRoutes', () => {
  it('serves the pages a gallery used to carry only with pages: true', () => {
    const without = byName(standardRoutes('gallery', { creditsBody: 'carpets.credits.body' }))
    expect(without.home).toBeUndefined()
    expect(without.item).toBeUndefined()

    const routes = byName(standardRoutes('gallery', { creditsBody: 'carpets.credits.body', pages: true }))
    expect(routes.home.path).toBe('/')
    expect(routes.item.path).toBe('/item/:id')
    expect(routes.item.props({ params: { id: 'i-1' } })).toEqual({ id: 'i-1' })
    expect(routes.item.meta).toEqual({
      section: 'database',
      entities: ['gallery', 'items', 'partners', 'countries', 'languages', 'dynasties', 'glossary', 'timelines', 'timeline_events'],
    })
    expect(routes.timeline.path).toBe('/timeline')
    // The eleven standard pages are still there, under their own names.
    expect(routes.credits.props).toEqual({ bodyKey: 'carpets.credits.body' })
    expect(routes.partner.path).toBe('/partner/:id')
  })

  it("serves an exhibition's pages, legacy's theme address included, and its credits page given its body", () => {
    const routes = byName(standardRoutes('exhibition', { pages: true, creditsBody: 'waterInIslam.credits.body' }))
    for (const name of ['home', 'about', 'themes', 'theme', 'theme-gallery', 'item', 'related', 'timeline', 'credits']) {
      expect(routes[name], name).toBeTruthy()
    }
    expect(routes.theme.path).toBe('/theme/:id/:subtheme?/:image?')
    expect(routes['theme-gallery'].path).toBe('/theme-gallery/:id')
    expect(routes.related.meta.entities).toContain('related_content')
    expect(routes.credits.props).toEqual({ spec: { body: 'waterInIslam.credits.body', back: true } })

    expect(byName(standardRoutes('exhibition', { pages: true })).credits).toBeUndefined()
  })

  it("defaults the partner-objects texts to the shared entries, a site's own still winning", () => {
    const shared = byName(standardRoutes('exhibition'))
    expect(shared['partner-objects'].props.texts).toEqual({
      emptyPartner: 'exhibition.partnerObjects.emptyPartner',
      emptyInstitution: 'exhibition.partnerObjects.emptyInstitution',
      institutionSummary: 'exhibition.partner.monumentsInExhibition',
      partnerProfileLabel: 'exhibition.partnerObjects.partnerProfile',
      institutionProfileLabel: 'exhibition.partnerObjects.institutionProfile',
    })
    const own = byName(standardRoutes('exhibition', { partnerObjects: { emptyPartner: 'site.partnerObjects.emptyPartner' } }))
    expect(own['institution-monuments'].props.texts.emptyPartner).toBe('site.partnerObjects.emptyPartner')
    expect(own['institution-monuments'].props.texts.emptyInstitution).toBe('exhibition.partnerObjects.emptyInstitution')
  })
})

describe('galleryConfig', () => {
  const config = galleryConfig({
    datasetPackage: '@museumwnf/carpets-data',
    siteName: 'Carpets',
    origin: 'https://example.org/carpets',
    projectColors: { 'proj-a': 'mwnf-chip--DCA' },
    noticeProjects: ['proj-e'],
    creditsBody: 'carpets.credits.body',
  })

  it("holds the site's own values where the platform reads them", () => {
    expect(config.datasetPackage).toBe('@museumwnf/carpets-data')
    expect(config.site).toEqual({ origin: 'https://example.org/carpets' })
    expect(config.projectColors).toEqual({ 'proj-a': 'mwnf-chip--DCA' })
    expect(config.noticeProjects).toEqual(['proj-e'])
    expect(config.shell).toBe(dxa.GalleryShell)
  })

  it('declares every page, the family menu and the legacy redirects', () => {
    const routes = byName(config.extraViews)
    expect(routes.home && routes.item && routes.timeline && routes.credits).toBeTruthy()
    expect(config.navigation.links.map((link) => link.section).filter(Boolean)).toEqual(['about', 'collection', 'partners', 'timeline', 'credits'])
    expect(config.legacyRoutes.map((route) => route.path)).toEqual([
      '/database-item/:uid(.*)/:language',
      '/partner/:country/:id/:language',
      '/partner-objects/:country/:id/:page',
      '/timeline-gallery/:country/:start/:end/:page',
      '/error',
    ])
    expect(config.legacyRoutes[3].resolve({ country: 'eg', start: '900', end: 'any', page: '2' }))
      .toEqual({ name: 'timeline-gallery', query: { country: 'eg', begin: '900', page: '2' } })
  })
})

describe('exhibitionConfig', () => {
  const config = exhibitionConfig({
    datasetPackage: '@museumwnf/water-in-islam-data',
    siteName: 'Water in Islam',
    origin: 'https://example.org/water-in-islam',
    projectColors: { 'proj-a': 'mwnf-chip--EXH' },
    noticeProjects: [],
    creditsBody: 'waterInIslam.credits.body',
  })

  it("declares the exhibition's pages, its credits page, its shell and its institution redirects", () => {
    const routes = byName(config.extraViews)
    expect(routes.theme && routes.about && routes.related && routes.credits).toBeTruthy()
    expect(config.shell).toBe(dxa.ExhibitionShell)
    expect(config.legacyRoutes.map((route) => route.path)).toContain('/institution-monuments/:country/:id/:page')
  })

  it('offers the Timeline menu entry only when the exhibition has a chronology', () => {
    const timeline = config.navigation.links.find((link) => link.section === 'timeline')
    expect(typeof timeline.when).toBe('function')
  })

  it('buckets the sponsor logos by legacy category, the header category apart', () => {
    const t = (key) => key
    const groups = config.logos.sponsorGroups([
      { category_id: 0, alt: 'Header' },
      { category_id: 2, alt: 'B', display_order: 2 },
      { category_id: 1, alt: 'A' },
      { category_id: 2, alt: 'C', display_order: 1 },
      { category_id: 3, alt: 'hidden', visible: false },
    ], t)
    expect(groups.map((group) => group.title)).toEqual(['exhibition.sponsors.patronage', 'exhibition.sponsors.support'])
    expect(groups[1].sponsors.map((sponsor) => sponsor.name)).toEqual(['C', 'B'])
  })
})

describe('the family-only blocks (inventory-app#2055)', () => {
  it('live under /dxa only (the aliases went in 3.0.0, inventory-app#2058)', () => {
    for (const name of ['FeaturedPartners', 'SiblingGalleries', 'PopupLogo', 'PictureGallery', 'PictureNarrative']) {
      expect(dxa[name], name).toBeTruthy()
      expect(content[name], name).toBeUndefined()
    }
    expect(dxa.ItemDetailView).toBeTruthy()
    expect(views.RecordSheetView).toBeUndefined()
    expect(dxa.GalleryPartnerProfile).toBeUndefined()
    expect(dxa.ExhibitionPartnerProfile).toBeUndefined()
  })
})
