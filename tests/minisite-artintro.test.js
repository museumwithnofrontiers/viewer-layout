import { describe, expect, it } from 'vitest'
import { mwnfLinks } from '@museumwnf/viewer-core'
import {
  ArtIntroHome, ArtIntroPage, artintroNavigation, artintroRoutes, artintroSettings, LABELS, labelSet, PLACEHOLDER_TITLE,
} from '../src/minisite/index.js'

const meta = (section, ...entities) => ({ section, entities })

describe("Discover Islamic Art's Artistic Introduction", () => {
  it('reads its own label set', () => {
    expect(LABELS.GAI).toBe('minisiteArtIntro')
    expect(labelSet(artintroSettings({ parent: 'https://p' }))).toBe('minisiteArtIntro')
  })

  it("links a record's sheet on the parent site", () => {
    const settings = artintroSettings({ parent: 'https://p', menuSecondColumnFrom: 6 })
    expect(settings.family).toBe('GAI')
    expect(settings.menuSecondColumnFrom).toBe(6)
    expect(settings.itemHref('a b')).toBe('https://p/#/item/a%20b')
  })

  it("has legacy's home page, its pages by theme and page, and the zoom window without the frame", () => {
    const routes = artintroRoutes(meta)
    expect(routes.map((r) => [r.name, r.path])).toEqual([
      ['home', '/'],
      ['page', '/page/:theme(\\d+)/:page(\\d+)?'],
      ['zoom', '/zoom'],
    ])
    expect(routes[0].component).toBe(ArtIntroHome)
    expect(routes[1].component).toBe(ArtIntroPage)
    expect(routes[1].props({ params: { theme: '3' } })).toEqual({ theme: 3, page: 1 })
    expect(routes[1].props({ params: { theme: '3', page: '2' } })).toEqual({ theme: 3, page: 2 })
    expect(routes[2].meta.bare).toBe('zoom')
  })

  it('leads its header to the MWNF portal and the parent site, and draws no menu over the footer', () => {
    const navigation = artintroNavigation({ languages: [], parent: 'https://p' })
    expect(navigation.logoHref).toBe('https://p/#/')
    expect(navigation.headerLinks.map((l) => [l.label, l.href])).toEqual([
      ['minisiteArtIntro.header.portal', mwnfLinks.portal],
      ['minisiteArtIntro.header.home', 'https://p/#/'],
    ])
    expect(navigation.menu).toEqual([])
    expect(navigation.footerLinks.map((l) => l.label)).toEqual([
      'minisiteArtIntro.footer.aboutMwnf',
      'minisiteArtIntro.footer.contact',
      'minisiteArtIntro.footer.legalNotice',
      'minisiteArtIntro.footer.credits',
      'minisiteArtIntro.footer.cookies',
    ])
  })

  it("treats the importer's placeholder titles as none", () => {
    expect(PLACEHOLDER_TITLE.test('Artintro Page 15')).toBe(true)
    expect(PLACEHOLDER_TITLE.test('Artintro Theme 3')).toBe(true)
    expect(PLACEHOLDER_TITLE.test('Page 4')).toBe(true)
    expect(PLACEHOLDER_TITLE.test('Monuments')).toBe(false)
  })
})
