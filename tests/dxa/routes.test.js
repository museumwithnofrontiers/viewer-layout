import { describe, expect, it } from 'vitest'
import { standardRoutes } from '../../src/dxa/routes.js'

// Pins `standardRoutes`' route name/path sets to exactly what carpets' and
// the-use-of-colours-in-art's own `dataset.config.js` register on
// `origin/main` (epic inventory-app#1731's design note) — a site adopting
// the factory must keep every existing deep link, so a change to either set
// below is a breaking change for every DXA site, not a refactor.

function nameAndPath(routes) {
  return routes.map((r) => ({ name: r.name, path: r.path }))
}

describe('standardRoutes("gallery", config)', () => {
  const routes = standardRoutes('gallery', { creditsBody: 'carpets.credits.body' })

  it('returns exactly the 11 pinned route name/path pairs', () => {
    expect(nameAndPath(routes)).toEqual([
      { name: 'search-results', path: '/search' },
      { name: 'search-how-to', path: '/how-to-search' },
      { name: 'partners', path: '/partners' },
      { name: 'partner', path: '/partner/:id' },
      { name: 'partner-objects', path: '/partner/:id/objects' },
      { name: 'timeline-results', path: '/timeline-results' },
      { name: 'timeline-gallery', path: '/timeline/gallery' },
      { name: 'about', path: '/about' },
      { name: 'credits', path: '/credits' },
      { name: 'collection', path: '/collection' },
      { name: 'collection-results', path: '/collection-results' },
    ])
  })

  it('threads config.creditsBody into the credits route as a prop', () => {
    const credits = routes.find((r) => r.name === 'credits')
    expect(credits.props).toEqual({ bodyKey: 'carpets.credits.body' })
  })

  it('builds meta.section/meta.entities off the gallery CHROME', () => {
    const partners = routes.find((r) => r.name === 'partners')
    expect(partners.meta).toEqual({ section: 'partners', entities: ['gallery', 'items', 'partners', 'countries'] })
  })
})

describe('standardRoutes("exhibition", config)', () => {
  const config = {
    partnerObjects: {
      emptyPartner: 'colours.partnerObjects.emptyPartner',
      emptyInstitution: 'colours.partnerObjects.emptyInstitution',
      institutionSummary: 'colours.partner.monumentsInExhibition',
      partnerProfileLabel: 'colours.partnerObjects.partnerProfile',
      institutionProfileLabel: 'colours.partnerObjects.institutionProfile',
    },
  }
  const routes = standardRoutes('exhibition', config)

  it('returns exactly the 11 pinned route name/path pairs (9 pages + 2 institution variants)', () => {
    expect(nameAndPath(routes)).toEqual([
      { name: 'search-results', path: '/search' },
      { name: 'search-how-to', path: '/how-to-search' },
      { name: 'partners', path: '/partners' },
      { name: 'partner', path: '/partner/:id' },
      { name: 'partner-objects', path: '/partner/:id/objects' },
      { name: 'institution', path: '/institution/:id' },
      { name: 'institution-monuments', path: '/institution/:id/monuments' },
      { name: 'timeline-results', path: '/timeline-results' },
      { name: 'timeline-gallery', path: '/timeline/gallery' },
      { name: 'collection', path: '/collection' },
      { name: 'collection-results', path: '/collection-results' },
    ])
  })

  it('reuses PartnerProfile/PartnerObjects for the institution routes, no separate component', () => {
    const partner = routes.find((r) => r.name === 'partner')
    const institution = routes.find((r) => r.name === 'institution')
    expect(institution.component).toBe(partner.component)
    expect(institution.props).toEqual({ variant: 'institution' })

    const partnerObjects = routes.find((r) => r.name === 'partner-objects')
    const institutionMonuments = routes.find((r) => r.name === 'institution-monuments')
    expect(institutionMonuments.component).toBe(partnerObjects.component)
    expect(institutionMonuments.props).toEqual({ variant: 'institution', texts: config.partnerObjects })
    expect(partnerObjects.props).toEqual({ texts: config.partnerObjects })
  })

  it('builds meta.section/meta.entities off the exhibition CHROME', () => {
    const partners = routes.find((r) => r.name === 'partners')
    expect(partners.meta).toEqual({ section: 'partners', entities: ['exhibition', 'items', 'partners', 'countries'] })
  })
})

describe('standardRoutes with an unknown family', () => {
  it('throws', () => {
    expect(() => standardRoutes('theme')).toThrow(/unknown family/)
  })
})
