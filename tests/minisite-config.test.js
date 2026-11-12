import { describe, expect, it } from 'vitest'
import {
  ArtIntroHome, artintroConfig, BAROQUEART_NO_COUNTRY, BaroqueartHome, baroqueartMinisiteConfig, BaroqueartShell,
  ISLAMICART_NO_COUNTRY, MinisiteHome, minisiteConfig, MinisiteShell, parentSite, SharingHistoryHome,
  sharinghistoryMinisiteConfig, SharingHistoryShell,
} from '../src/minisite/index.js'
import { projectChips } from '../src/dxa/index.js'

// The mini-sites' factories: what every site of a family declared by hand,
// each site passing only its own values.

const site = (repo) => ({ datasetPackage: `@museumwnf/${repo}-data`, origin: `https://example.org/${repo}`, chrome: { a: 'b' } })
const names = (config) => config.extraViews.map((route) => route.name)

describe('parentSite', () => {
  it("names the product next to the mini-site's own address", () => {
    expect(parentSite('https://example.org/islamicart-women', 'islamicart')).toBe('https://example.org/islamicart')
    expect(parentSite('https://example.org/islamicart-women/', 'islamicart')).toBe('https://example.org/islamicart')
  })
})

describe('minisiteConfig', () => {
  const exhibition = { family: 'ISL', menuSecondColumnFrom: 7, curators: [{ partner: 'p1', logo: 'legacy/a.gif', space: 30 }], maps: 2 }
  const config = minisiteConfig({ ...site('islamicart-women'), exhibition })

  it("holds the site's own values, its family's pages and frame, and the parent product's links", () => {
    expect(config.datasetPackage).toBe('@museumwnf/islamicart-women-data')
    expect(config.siteName).toBe('Fixture Museum')
    expect(config.site).toEqual({ origin: 'https://example.org/islamicart-women' })
    expect(config.chrome).toEqual({ a: 'b' })
    expect(config.features.entities).toEqual([])
    expect(config.shell).toBe(MinisiteShell)
    expect(config.views.home).toBe(MinisiteHome)
    expect(names(config)).toEqual(['home', 'introduction', 'exhibition', 'credits', 'map', 'zoom'])
    expect(config.minisite.parent).toBe('https://example.org/islamicart')
    expect(config.minisite.itemHref('x')).toBe('https://example.org/islamicart/#/item/x')
    expect(config.navigation.headerLinks[1].href).toBe('https://example.org/islamicart/#/')
  })

  it("reads minisite.json, the family's no-country rule and document title unless it sets its own", () => {
    expect(config.minisite.menuSecondColumnFrom).toBe(7)
    expect(config.minisite.curators).toBe(exhibition.curators)
    expect(config.minisite.map.count).toBe(2)
    expect(config.minisite.map.picture('fr', 1)).toBe('legacy/map1_fr.jpg')
    expect(config.minisite.noCountry).toBe(ISLAMICART_NO_COUNTRY)
    expect(config.minisite.documentTitle).toBe('MWNF DISCOVER ISLAMIC ART: Exhibition')
    const own = minisiteConfig({ ...site('x'), exhibition: { ...exhibition, maps: 0, noCountry: { partners: [] }, documentTitle: 'T' } })
    expect(own.minisite.map).toBeNull()
    expect(own.minisite.noCountry).toEqual({ partners: [] })
    expect(own.minisite.documentTitle).toBe('T')
  })
})

describe('artintroConfig', () => {
  it("draws the Artistic Introduction's own pages, with no menu over the footer", () => {
    const config = artintroConfig({ ...site('islamicart-artistic-introduction'), exhibition: { family: 'GAI', social: [{ href: 'x' }] } })
    expect(config.views.home).toBe(ArtIntroHome)
    expect(names(config)).toEqual(['home', 'page', 'zoom'])
    expect(config.minisite.family).toBe('GAI')
    expect(config.minisite.social).toEqual([{ href: 'x' }])
    expect(config.minisite.noCountry).toBe(ISLAMICART_NO_COUNTRY)
  })
})

describe('baroqueartMinisiteConfig', () => {
  it("draws Discover Baroque Art's pages and frame, linked to baroqueart", () => {
    const config = baroqueartMinisiteConfig({ ...site('baroqueart-devotion'), exhibition: { family: 'BAR', curators: [], design: { name: 'D' } } })
    expect(config.shell).toBe(BaroqueartShell)
    expect(config.views.home).toBe(BaroqueartHome)
    expect(names(config)).toEqual(['home', 'introduction', 'exhibition', 'zoom'])
    expect(config.minisite.parent).toBe('https://example.org/baroqueart')
    expect(config.minisite.design).toEqual({ name: 'D' })
    expect(config.minisite.noCountry).toBe(BAROQUEART_NO_COUNTRY)
    expect(config.minisite.documentTitle).toBe('MWNF DISCOVER BAROQUE ART - Exhibition')
  })
})

describe('sharinghistoryMinisiteConfig', () => {
  it("draws Sharing History's pages and frame, its footer listing the parent's country profiles", () => {
    const profiles = [{ text: 'Austria', href: 'https://example.org/sharinghistory/#/historical-profiles/a/b' }]
    const config = sharinghistoryMinisiteConfig({ ...site('sharinghistory-migrations'), exhibition: { family: 'SH', profiles, logos: [], partnerLinks: {} } })
    expect(config.shell).toBe(SharingHistoryShell)
    expect(config.views.home).toBe(SharingHistoryHome)
    expect(names(config)).toContain('further-reading')
    expect(config.minisite.parent).toBe('https://example.org/sharinghistory')
    expect(config.minisite.family).toBe('SH')
  })
})

describe('projectChips', () => {
  it("gives each project its site's chip: a product's own, an exhibition's, the galleries' for none", () => {
    const manifest = {
      projects: {
        dia: { home_site: 'islamicart' },
        dba: { home_site: 'baroqueart' },
        awe: { home_site: 'sharinghistory' },
        dca: { home_site: 'carpets' },
        dga: { home_site: 'glass' },
        hijaz: { home_site: 'the-hijaz-railway' },
        galleries: { home_site: null },
        unknown: { home_site: 'somewhere-else' },
        // A package exported before its exporter wrote home_site: the site's own table does.
        exwit: { name: { en: 'With Brush and Qalam' } },
      },
    }
    expect(projectChips(manifest)).toEqual({
      dia: 'mwnf-chip--ISLandEPM',
      dba: 'mwnf-chip--DBA',
      awe: 'mwnf-chip--AWE',
      dca: 'mwnf-chip--DCA',
      dga: 'mwnf-chip--DGA',
      hijaz: 'mwnf-chip--EXH',
      galleries: 'mwnf-chip--Galleries',
    })
    expect(projectChips(undefined)).toEqual({})
  })
})
