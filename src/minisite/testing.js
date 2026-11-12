// The mini-sites' smoke tests, written once (`@museumwnf/viewer-layout/minisite/testing`).
//
// Every mini-site of a family renders the same pages (minisiteConfig() and its
// siblings), so the family shares one smoke test. A site's own
// tests/smoke.test.js calls it with what only the site knows: its config, its
// minisite.json, its texts, its chrome's SOURCES.json and its text namespace.
// The family is minisite.json's `family`: `ISL` (Discover Islamic Art's
// exhibitions), `GAI` (its Artistic Introduction), `BAR` (Discover Baroque
// Art's) or `SH` (Sharing History's). A site may add tests of its own after
// the call.
//
// Runs inside the site's own Vitest, as ../dxa/testing.js does: `vitest`,
// node:fs and the data package resolve from the site.
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { mergeMessages } from '@museumwnf/viewer-core'
import {
  checkChromeSources, checkOfferedLanguages, checkRoutes, checkSectionMeta, checkTextsRendered, mountSite as mountOn,
} from '@museumwnf/viewer-core/testing'


const WAIT = { timeout: 20000 }

// What legacy's address and the theme file of each family look like, the
// marks that a copy of a template has become a mini-site.
// Each family's text set; the same names as exhibition.js's LABELS, repeated
// because this file ships as source on its own, without the built entry.
const LABEL_SETS = { ISL: 'minisite', GAI: 'minisiteArtIntro', BAR: 'minisiteBaroque', SH: 'minisiteSharingHistory' }

const FAMILIES = {
  ISL: { legacy: /^https:\/\/.+\/exhibitions\//, token: '--minisite-' },
  GAI: { legacy: /^https:\/\/.+\/gai\//, token: '--minisite-' },
  BAR: { legacy: /^https:\/\/.+\/exhibitions\/BAR\//, token: '--minisite-' },
  SH: { legacy: /^https:\/\/sharinghistory\.museumwnf\.org\/exhibitions\/AWE\//, token: '--sh-head-bg' },
}

/**
 * The family's smoke test, against this site's own dataset:
 * - `config`, `exhibition` — the site's dataset.config.js and minisite.json;
 * - `sharedTexts`, `ownTexts` — its family's viewer-i18n bundle and its
 *   locales/en.json, merged as main.js merges them;
 * - `sources` — theme/assets/legacy/SOURCES.json, its chrome's provenance;
 * - `namespace` — its own texts' namespace (package.json `viewerI18n.namespace`).
 */
export function describeMinisiteSmoke({ config, exhibition, sharedTexts, ownTexts, sources, namespace }) {
  const family = exhibition.family ?? 'ISL'
  const marks = FAMILIES[family]
  if (!marks) throw new Error(`describeMinisiteSmoke: unknown family "${family}" in minisite.json.`)
  const messages = mergeMessages(sharedTexts, { en: ownTexts })
  const mountSite = (hash) => mountOn(config, messages, hash)
  const namespaces = [config.minisite?.texts ?? LABEL_SETS[family], namespace, 'core', 'layout']

  describe('mini-site smoke test', () => {
    // A copy of the family's template is not a mini-site until inventory-app's
    // scripts/minisites generator has written what legacy configured for it:
    // the settings, the theme and the frame's pictures.
    it("carries this site's own settings, theme and pictures", () => {
      expect(exhibition.legacy).toMatch(marks.legacy)
      if (family === 'ISL' || family === 'BAR') expect(exhibition.curators.length).toBeGreaterThan(0)
      if (family === 'SH') expect(exhibition.profiles.length).toBeGreaterThan(0)
      expect(readFileSync('theme/tokens.css', 'utf8')).toContain(marks.token)
      expect(Object.keys(sources.files).length).toBeGreaterThan(0)
    })

    it('holds the chrome taken from legacy, byte for byte, and nothing else', () => {
      expect(checkChromeSources(sources)).toEqual([])
    })

    it('declares the entities every route reads, and the section it belongs to', () => {
      for (const route of config.extraViews) expect(Array.isArray(route.meta?.entities), route.name).toBe(true)
      expect(checkSectionMeta(config)).toEqual([])
    })

    it('publishes no generic entity pages', () => {
      expect(config.features.entities).toEqual([])
    })

    it('offers the languages the package declares, where the exhibition has texts in them', () => {
      const rule = family === 'ISL' || family === 'GAI' ? { entity: 'collections' } : undefined
      expect(checkOfferedLanguages(config, rule)).toEqual([])
      expect(config.languages.length).toBeGreaterThan(0)
      expect(config.navigation.languages.map((l) => l.code)).toEqual(config.languages)
    })

    PAGES[family]({ config, mountSite, namespaces })
  })
}

// ── Each family's pages ────────────────────────────────────────────────────

const PAGES = {
  ISL({ config, mountSite, namespaces }) {
    it('draws the home page: the title, the menu and the curators', async () => {
      const { app, host } = await mountSite('#/?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-minisite-home__title')?.textContent.trim()).toBeTruthy(), WAIT)
      // The introduction and one entry per theme.
      expect(host.querySelectorAll('.mwnf-minisite-home__menu div').length).toBeGreaterThan(1)
      expect(host.querySelectorAll('.mwnf-minisite-partners__curator').length).toBe(config.minisite.curators.length)
      // The frame: the menu over the footer, legacy's links in its order.
      expect(host.querySelectorAll('.mwnf-minisite-menu li').length).toBe(config.navigation.menu.length)
      app.unmount()
    }, 30000)

    it('draws the introduction: its text and its captioned pictures', async () => {
      const { app, host } = await mountSite('#/introduction?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-minisite-intro__content')?.textContent.trim()).toBeTruthy(), WAIT)
      // The captions come with the items' texts, which may arrive after the introduction's.
      await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-minisite-intro-item strong').length).toBeGreaterThan(0), WAIT)
      app.unmount()
    }, 30000)

    it('draws an exhibition page: thumbnails, the item on show and its caption', async () => {
      const { app, host } = await mountSite('#/exhibition/1/1?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-minisite-page__caption strong')?.textContent.trim()).toBeTruthy(), WAIT)
      expect(host.querySelectorAll('.mwnf-minisite-page__thumbs a').length).toBeGreaterThan(0)
      expect(host.querySelector('.mwnf-minisite-page__page-title').textContent.trim()).not.toBe('')
      // The first page's previous page is the introduction.
      expect(host.querySelector('.mwnf-minisite-page__nav--end a').getAttribute('href')).toContain('#/introduction')
      app.unmount()
    }, 30000)

    it("draws legacy's windows without the frame", async () => {
      const { app, host } = await mountSite('#/credits?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-minisite-credits h1')?.textContent.trim()).toBeTruthy(), WAIT)
      expect(host.querySelector('.mwnf-minisite-header')).toBeNull()
      app.unmount()
    }, 30000)

    it('declares every route by name, and leaves the catch-all to the router', () => {
      expect(checkRoutes(config, { names: ['home', 'introduction', 'exhibition', 'credits', 'map', 'zoom'] })).toEqual([])
    })

    it('renders its own texts, none as a bare entry name', async () => {
      const { app, host } = await mountSite('#/exhibition/1/1?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-minisite-page__caption')).not.toBeNull(), WAIT)
      expect(host.textContent).toContain('Exhibition homepage')
      expect(checkTextsRendered(host, { namespaces })).toEqual([])
      app.unmount()
    }, 30000)
  },

  GAI({ config, mountSite, namespaces }) {
    it('draws the home page: the title, the subtitle, the menu of its themes and the social-media links', async () => {
      const { app, host } = await mountSite('#/?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-artintro-home__title')?.textContent.trim()).toBeTruthy(), WAIT)
      expect(host.querySelector('.mwnf-artintro-home__subtitle').textContent.trim()).not.toBe('')
      expect(host.querySelectorAll('.mwnf-artintro-home__menu div, .mwnf-artintro-home__menu2 div').length).toBeGreaterThan(1)
      expect(host.querySelectorAll('.mwnf-artintro-home__social a').length).toBe(config.minisite.social.length)
      // No menu over the footer.
      expect(host.querySelector('.mwnf-minisite-menu')).toBeNull()
      app.unmount()
    }, 30000)

    it("draws a theme's page: its pages, the item on show, its caption and the thumbnails", async () => {
      const { app, host } = await mountSite('#/page/1/1?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-artintro-page__caption strong')?.textContent.trim()).toBeTruthy(), WAIT)
      expect(host.querySelector('.mwnf-artintro-page__title').textContent.trim()).not.toBe('')
      expect(host.querySelectorAll('.mwnf-artintro-page__pages a').length).toBeGreaterThan(0)
      expect(host.querySelectorAll('.mwnf-artintro-page__thumbs a').length).toBeGreaterThan(0)
      app.unmount()
    }, 30000)

    it('draws the zoom window without the frame', async () => {
      const { app, host } = await mountSite('#/zoom?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-minisite-zoom')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-minisite-header')).toBeNull()
      app.unmount()
    }, 30000)

    it('declares every route by name, and leaves the catch-all to the router', () => {
      expect(checkRoutes(config, { names: ['home', 'page', 'zoom'] })).toEqual([])
    })

    it('renders its own texts, none as a bare entry name', async () => {
      const { app, host } = await mountSite('#/page/1/1?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-artintro-page__caption')).not.toBeNull(), WAIT)
      expect(host.textContent).toContain('More information')
      expect(checkTextsRendered(host, { namespaces })).toEqual([])
      app.unmount()
    }, 30000)
  },

  BAR({ config, mountSite, namespaces }) {
    it('draws the home page: the title, the menu, the curators and the designer', async () => {
      const { app, host } = await mountSite('#/?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-home__title')?.textContent.trim()).toBeTruthy(), WAIT)
      // The introduction and one entry per theme.
      expect(host.querySelectorAll('.mwnf-baroqueart-home__menu div').length).toBeGreaterThan(1)
      expect(host.querySelectorAll('.mwnf-baroqueart-partners__curator').length).toBe(config.minisite.curators.length)
      expect(Boolean(host.querySelector('.mwnf-baroqueart-partners__design'))).toBe(Boolean(config.minisite.design))
      // The frame: the menu over the footer, legacy's links in its order.
      expect(host.querySelectorAll('.mwnf-baroqueart-menu li').length).toBe(config.navigation.menu.length)
      app.unmount()
    }, 30000)

    it('draws the introduction: its text and its captioned pictures', async () => {
      const { app, host } = await mountSite('#/introduction?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-intro__content')?.textContent.trim()).toBeTruthy(), WAIT)
      await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-baroqueart-intro-item strong').length).toBeGreaterThan(0), WAIT)
      app.unmount()
    }, 30000)

    it('draws an exhibition page: thumbnails, the item on show and its caption', async () => {
      const { app, host } = await mountSite('#/exhibition/1/1?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-page__caption strong')?.textContent.trim()).toBeTruthy(), WAIT)
      expect(host.querySelectorAll('.mwnf-baroqueart-page__thumbs a').length).toBeGreaterThan(0)
      expect(host.querySelector('.mwnf-baroqueart-page__page-title').textContent.trim()).not.toBe('')
      expect(host.querySelector('.mwnf-baroqueart-page__nav--end a').getAttribute('href')).toContain('#/introduction')
      app.unmount()
    }, 30000)

    it('draws the zoom window without the frame', async () => {
      const { app, host } = await mountSite('#/zoom?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-zoom')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-baroqueart-header')).toBeNull()
      app.unmount()
    }, 30000)

    it('declares every route by name, and leaves the catch-all to the router', () => {
      expect(checkRoutes(config, { names: ['home', 'introduction', 'exhibition', 'zoom'] })).toEqual([])
    })

    it('renders its own texts, none as a bare entry name', async () => {
      const { app, host } = await mountSite('#/exhibition/1/1?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-page__caption')).not.toBeNull(), WAIT)
      expect(host.textContent).toContain('Exhibition homepage')
      expect(checkTextsRendered(host, { namespaces })).toEqual([])
      app.unmount()
    }, 30000)
  },

  SH({ config, mountSite, namespaces }) {
    it('draws the home page: the title, the theme menu, the logos and the frame', async () => {
      const { app, host } = await mountSite('#/?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sh-home__title')?.textContent.trim()).toBeTruthy(), WAIT)
      expect(host.querySelectorAll('.mwnf-sh-home__theme').length).toBeGreaterThan(0)
      expect(host.querySelectorAll('.mwnf-sh-band__logos img').length).toBeGreaterThan(0)
      expect(host.querySelectorAll('.mwnf-sh-menu > ul > li').length).toBe(config.navigation.menu.length)
      app.unmount()
    }, 30000)

    it('draws the introduction: its text and a captioned picture', async () => {
      const { app, host } = await mountSite('#/introduction?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sh-intro__body')?.textContent.trim()).toBeTruthy(), WAIT)
      // The caption is the record's, whose texts load after the exhibition's.
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sh-intro__picture b')?.textContent.trim()).toBeTruthy(), WAIT)
      app.unmount()
    }, 30000)

    it("draws a theme's overview and a subtheme: thumbnails, the item on show and its caption", async () => {
      for (const address of ['#/theme/1?lang=en', '#/theme/1/1?lang=en']) {
        const { app, host } = await mountSite(address)
        await vi.waitFor(() => expect(host.querySelector('.mwnf-sh-panel__name')?.textContent.trim()).toBeTruthy(), WAIT)
        expect(host.querySelectorAll('.mwnf-sh-page__thumbs img').length).toBeGreaterThan(0)
        expect(host.querySelector('.mwnf-sh-page__name').textContent.trim()).not.toBe('')
        app.unmount()
      }
    }, 60000)

    it("draws legacy's windows without the frame", async () => {
      const { app, host } = await mountSite('#/credits?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sh-window h3')?.textContent.trim()).toBeTruthy(), WAIT)
      expect(host.querySelector('.mwnf-sh-header')).toBeNull()
      app.unmount()
    }, 30000)

    it('declares every route by name, and leaves the catch-all to the router', () => {
      expect(
        checkRoutes(config, { names: ['home', 'introduction', 'theme', 'subtheme', 'further-reading', 'credits', 'cover-image', 'zoom'] }),
      ).toEqual([])
    })

    it('renders its own texts, none as a bare entry name', async () => {
      const { app, host } = await mountSite('#/theme/1/1?lang=en')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sh-panel')).not.toBeNull(), WAIT)
      expect(host.textContent).toContain('Exhibition homepage')
      expect(checkTextsRendered(host, { namespaces })).toEqual([])
      app.unmount()
    }, 30000)
  },
}
