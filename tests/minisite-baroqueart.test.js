import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mwnfLinks, useSiteConfig } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import {
  BAROQUEART_LABELS, BAROQUEART_NO_COUNTRY, baroqueartCaption, baroqueartCuratorLabel, baroqueartDetailViewCaption, BaroqueartHome,
  BaroqueartIntroduction, baroqueartMenu, baroqueartNavigation, BaroqueartPage, baroqueartRoutes, baroqueartSettings, BaroqueartShell,
  baroqueartSlotsOf, baroqueartWithFirstView, BaroqueartZoom, ISLAMICART_NO_COUNTRY, viewPicture,
} from '../src/minisite/index.js'
import { settle } from './dxa/helpers.js'

// Discover Baroque Art's mini-sites (exhibitions/BAR/, inventory-app#2390): a
// product of their own, with their own pages, frame, caption rules and
// stylesheet (src/minisite/baroqueart/).

const meta = (section, ...entities) => ({ section, entities })
const painting = { type: 'object', country_id: 'cze' }
const church = { type: 'monument', country_id: 'cze' }
const czech = (item) => (item?.country_id === 'cze' ? 'Czech Republic' : '')

describe("Discover Baroque Art's caption rules", () => {
  it('prints the artist and the material, the page’s own first, else an object’s artist or a monument’s architects', () => {
    const own = { name: 'Portrait.', artist: 'Johann Kupetzky.', materials: ['Oil on canvas.'] }
    expect(baroqueartCaption({ item: painting, own, countryName: czech })).toMatchObject({
      name: 'Portrait',
      artist: 'Johann Kupetzky',
      material: 'Oil on canvas',
    })
    const caption = { artist: 'Santini', material: 'Stucco' }
    expect(baroqueartCaption({ item: church, own: { architects: 'J. B. Santini Aichel.' }, caption, countryName: czech }))
      .toMatchObject({ artist: 'Santini', material: 'Stucco' })
    expect(baroqueartCaption({ item: church, own: { architects: 'J. B. Santini Aichel.' }, countryName: czech }).artist)
      .toBe('J. B. Santini Aichel')
  })

  it('shows a placement’s detail views as its views, each with its own picture', () => {
    const node = {
      items: [{ id: 'church', display_order: 1, variant_order: 1, image_url: 'church.jpg', details: [
        { id: 'altar', image_url: 'altar.jpg' }, { id: 'pulpit', image_url: null },
      ] }],
    }
    const [slot] = baroqueartSlotsOf(node)
    expect(slot.variants.map((v) => [v.view.id, v.image])).toEqual([['altar', 'altar.jpg'], ['pulpit', null]])
    expect(viewPicture(slot, 1)).toBe('altar.jpg')
  })

  it('shows the page’s picture at its position for a detail view that has none of its own, as legacy showed its placeholder', () => {
    const node = {
      images: [{ url: 'awaiting.jpg', display_order: 1 }],
      items: [{ id: 'abbey', display_order: 1, variant_order: 2, details: [{ image_url: null }, { image_url: 'fresco.jpg' }] }],
    }
    const [slot] = baroqueartSlotsOf(node)
    expect(slot.variants.map((v) => v.image)).toEqual(['awaiting.jpg', 'fresco.jpg'])
  })

  it('never gives a view the first view’s detail name, which legacy wrote as a space', () => {
    const first = { name: 'Library', detailName: 'Triumphal arches', dateLines: ['1728'], details: [], artist: 'Santini', material: '', justification: 'Wisdom.' }
    const second = { name: 'Detail of ceiling painting', detailName: '', dateLines: ['1723'], details: [], artist: '', material: '', justification: '' }
    expect(baroqueartWithFirstView(second, first)).toMatchObject({ detailName: '', artist: 'Santini', justification: 'Wisdom.' })
  })

  it('captions a detail view from its own text, the first view’s, then the detail it shows', () => {
    const fields = baroqueartDetailViewCaption({
      caption: { detail_name: 'Pulpit' },
      first: { name: 'Pilgrimage church', dynasty: 'Baroque' },
      record: { name: 'The pulpit.', dates: '1720', location: 'Nave', artist: 'Anonymous' },
      placement: { item: church, own: { location: 'Žďár nad Sázavou' }, caption: {}, countryName: czech },
    })
    expect(fields).toEqual({
      name: 'Pilgrimage church',
      detailName: 'Pulpit',
      dateLines: ['Baroque', '1720', 'Nave'],
      details: ['Žďár nad Sázavou, Czech Republic'],
      artist: 'Anonymous',
      material: '',
      justification: '',
    })
  })

  it('names a curator with the city and country legacy printed after it', () => {
    const lookups = { partnerName: () => 'Moravian Gallery', partnerCountry: () => 'cze', countryName: () => 'Czech Republic' }
    expect(baroqueartCuratorLabel({ partner: 'p', place: 'Brno', country: 'cze' }, lookups)).toBe('Moravian Gallery, Brno, Czech Republic')
    expect(baroqueartCuratorLabel({ partner: 'p' }, lookups)).toBe('Moravian Gallery, Czech Republic')
  })

  it("keeps legacy's own copy of the Jerusalem rule", () => {
    expect(BAROQUEART_NO_COUNTRY).toEqual(ISLAMICART_NO_COUNTRY)
  })
})

describe("Discover Baroque Art's site declaration", () => {
  it('reads its own label set and links the parent site', () => {
    const settings = baroqueartSettings({ parent: 'https://example.org/baroqueart', menuSecondColumnFrom: 7 })
    expect(BAROQUEART_LABELS).toBe('minisiteBaroque')
    expect(settings.texts).toBe('minisiteBaroque')
    expect(settings.menuSecondColumnFrom).toBe(7)
    expect(settings.itemHref('a b')).toBe('https://example.org/baroqueart/#/item/a%20b')
    expect(settings.partnerListHref).toBe('https://example.org/baroqueart/#/partners')
  })

  it("has legacy's home page, introduction, exhibition pages and the zoom window without the frame", () => {
    const routes = baroqueartRoutes(meta)
    expect(routes.map((r) => [r.name, r.path])).toEqual([
      ['home', '/'],
      ['introduction', '/introduction'],
      ['exhibition', '/exhibition/:theme(\\d+)/:page(\\d+)?'],
      ['zoom', '/zoom'],
    ])
    expect(routes.map((r) => r.component)).toEqual([BaroqueartHome, BaroqueartIntroduction, BaroqueartPage, BaroqueartZoom])
    expect(routes[2].props({ params: { theme: '3' } })).toEqual({ theme: 3, page: 1 })
    expect(routes[3].meta.bare).toBe('zoom')
  })

  it('has its own menu and footer: no Artistic Introduction, the exhibition’s own home, the language policy', () => {
    const navigation = baroqueartNavigation({ languages: [], parent: 'https://example.org/baroqueart' })
    expect(navigation.menu).toEqual(baroqueartMenu('https://example.org/baroqueart'))
    expect(navigation.menu.some((l) => l.label.endsWith('artisticIntroduction'))).toBe(false)
    expect(navigation.menu.find((l) => l.label === 'minisiteBaroque.menu.exhibitions').href).toBe('#/')
    expect(navigation).not.toHaveProperty('menuSeparator')
    expect(navigation.footerLinks.map((l) => l.label)).toEqual([
      'minisiteBaroque.footer.aboutMwnf',
      'minisiteBaroque.footer.contact',
      'minisiteBaroque.footer.legalNotice',
      'minisiteBaroque.footer.credits',
      'minisiteBaroque.footer.languagePolicy',
      'minisiteBaroque.footer.cookies',
    ])
    expect(navigation.logoHref).toBe(mwnfLinks.portal)
    expect(navigation.logoTip).toBe('minisiteBaroque.header.logoTip')
  })
})

describe('BaroqueartShell', () => {
  const texts = {
    'minisiteBaroque.header.logoTip': 'Return to MWNF Portal homepage',
    'minisiteBaroque.header.exhibitionsList': 'List of the Exhibitions',
    'minisiteBaroque.menu.timeline': 'Timeline',
    'minisiteBaroque.menu.partners': 'Partners',
    'minisiteBaroque.footer.copyright': '© Museum With No Frontiers (MWNF) 2004 –',
    'layout.language.label': 'Language',
  }
  const chrome = Object.fromEntries(
    ['logo_en.gif', 'bg_fading_left.gif', 'bg_fading_right.gif'].map((f) => [`../theme/assets/legacy/${f}`, `/assets/${f}`]),
  )

  async function mountShell(path) {
    const current = useSiteConfig()
    for (const key of Object.keys(current)) delete current[key]
    Object.assign(current, { chrome })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<p>home</p>' } },
        { path: '/zoom', name: 'zoom', component: { template: '<p>zoom</p>' }, meta: { bare: 'zoom' } },
      ],
    })
    await router.push(path)
    await router.isReady()
    const wrapper = mount(BaroqueartShell, {
      props: {
        ...baroqueartNavigation({
          languages: [{ code: 'it', label: 'Italiano' }, { code: 'en', label: 'English' }],
          parent: 'https://example.org/baroqueart',
          menu: [{ label: 'minisiteBaroque.menu.timeline', href: '/t' }, { label: 'minisiteBaroque.menu.partners', href: '/p' }],
        }),
        language: 'en',
      },
      slots: { default: '<p class="page">the page</p>' },
      global: { plugins: [createI18n({ locale: 'en', messages: { en: texts } }), router] },
    })
    await settle(() => true, 1)
    return wrapper
  }

  it('draws legacy’s frame around the page, its menu’s links with no bar between them', async () => {
    const wrapper = await mountShell('/')
    expect(wrapper.find('.mwnf-baroqueart-header__logo img').attributes('src')).toBe('/assets/logo_en.gif')
    expect(wrapper.find('.mwnf-baroqueart-header__back').text()).toContain('List of the Exhibitions')
    expect(wrapper.findAll('.mwnf-baroqueart-header__select option').map((o) => o.text())).toEqual(['English', 'Italiano'])
    expect(wrapper.find('.mwnf-baroqueart-menu').text()).toBe('TimelinePartners')
    expect(wrapper.find('.mwnf-baroqueart-footer').text()).toContain(`© Museum With No Frontiers (MWNF) 2004 – ${new Date().getFullYear()}`)
    expect(wrapper.findAll('.mwnf-baroqueart__strip')[0].attributes('style')).toContain('bg_fading_left.gif')
    expect(wrapper.find('.page').exists()).toBe(true)
  })

  it('draws the zoom window alone', async () => {
    const wrapper = await mountShell('/zoom')
    expect(wrapper.find('.mwnf-baroqueart-window--zoom .page').exists()).toBe(true)
    expect(wrapper.find('.mwnf-baroqueart-header').exists()).toBe(false)
  })
})

// A product of its own: nothing of another family's pages, frame or stylesheet
// reaches Discover Baroque Art's, and its own stylesheet styles nothing else.
describe("Discover Baroque Art's module stands on its own", () => {
  // Read from the package's root, where the tests run (jsdom gives import.meta.url no file scheme).
  const folder = 'src/minisite/baroqueart'
  const sources = readdirSync(folder).map((name) => [name, readFileSync(`${folder}/${name}`, 'utf8')])
  const SHARED = ['../exhibition.js', '../rules.js', '../tip.js', '../wordDocument.js', '../../chrome.js', '../../content/GlossaryPopover.vue']

  it('imports only what every mini-site shares', () => {
    for (const [name, source] of sources) {
      const parents = [...source.matchAll(/from '(\.\.\/[^']+)'/g)].map((m) => m[1])
      expect(parents.filter((path) => !SHARED.includes(path)), name).toEqual([])
    }
  })

  it('draws only its own classes, and its stylesheet styles only them', () => {
    for (const [name, source] of sources) expect(source, name).not.toMatch(/mwnf-(minisite|sh|artintro)[-_ "]/)
    const css = readFileSync('src/styles/minisite-baroqueart.css', 'utf8')
    const selectors = css.replace(/\/\*[\s\S]*?\*\//g, '').match(/\.mwnf-[a-z-]+/g)
    expect(selectors.filter((s) => !s.startsWith('.mwnf-baroqueart'))).toEqual([])
  })
})
