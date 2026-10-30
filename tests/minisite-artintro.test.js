import { readdirSync, readFileSync } from 'node:fs'
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

// Discover Islamic Art's own part: the Artistic Introduction may use Islamic
// Art's pages (its zoom window, its frame), never Baroque Art's or Sharing
// History's, and its stylesheet styles only its own elements.
describe("The Artistic Introduction's module stands on its own", () => {
  // Read from the package's root, where the tests run (jsdom gives import.meta.url no file scheme).
  const folder = 'src/minisite/artintro'
  const sources = readdirSync(folder).map((name) => [name, readFileSync(`${folder}/${name}`, 'utf8')])
  const SHARED = ['../exhibition.js', '../rules.js', '../tip.js', '../wordDocument.js', '../../chrome.js', '../../content/GlossaryPopover.vue']
  const ISLAMIC_ART = ['../Zoom.vue']

  it("imports only what every mini-site shares, and Discover Islamic Art's own pages", () => {
    for (const [name, source] of sources) {
      const parents = [...source.matchAll(/from '(\.\.\/[^']+)'/g)].map((m) => m[1])
      expect(parents.filter((path) => !SHARED.includes(path) && !ISLAMIC_ART.includes(path)), name).toEqual([])
    }
  })

  it('draws only its own classes, and its stylesheet styles only them', () => {
    for (const [name, source] of sources) expect(source, name).not.toMatch(/mwnf-(minisite|baroqueart|sh)[-_ "]/)
    // A rule may sit inside Islamic Art's frame (.mwnf-minisite …) to win over its link rules;
    // what it styles, its selector's last class, is the Artistic Introduction's own.
    const css = readFileSync('src/styles/minisite-artintro.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const subjects = [...css.matchAll(/([^{}]+)\{/g)]
      .flatMap((m) => m[1].split(','))
      .map((selector) => selector.match(/\.mwnf-[a-z_-]+/g)?.at(-1))
      .filter(Boolean)
    expect(subjects.length).toBeGreaterThan(0)
    expect(subjects.filter((s) => !s.startsWith('.mwnf-artintro'))).toEqual([])
  })
})