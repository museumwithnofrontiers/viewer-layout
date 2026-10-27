import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useSiteConfig } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import {
  cleanText, curatorLabel, curatorLink, introCaption, ISLAMICART_NO_COUNTRY, MinisiteShell, minisiteNavigation, minisiteRoutes, minisiteSettings,
  pageWithNeighbours, placementCaption, PLACEHOLDER_TITLE, quoteHasItalics, readingOrder, slotsOf, withFirstView,
} from '../src/minisite/index.js'
import { settle } from './dxa/helpers.js'

// The mini-site family layer (inventory-app#2359): legacy's virtual exhibition
// pages, the rules they printed by, and the frame around them.

const countryName = (item) => ({ jor: 'Jordan', pse: 'Palestinian Territories' })[item?.country_id] ?? ''

describe('cleanText', () => {
  it('prints typographic quotes, the ellipsis and the bullet as legacy did', () => {
    expect(cleanText('Qusayr ‘Amra, “Dancers”… • end')).toBe('Qusayr \'Amra, "Dancers"... * end')
  })

  it('keeps a Markdown line break, which is legacy’s <br>', () => {
    expect(cleanText('first.  \nsecond')).toBe('first.  \nsecond')
  })
})

describe('placementCaption', () => {
  const coin = { type: 'object', country_id: 'jor', partner_id: 'p1' }
  const own = { name: 'Bronze coin.', dates: 'Hegira 77.', dynasty: 'Umayyad.', holder: 'Jordan Museum.', location: 'Amman.' }

  it('reads the item’s own fields, without their final period, the place followed by the country', () => {
    expect(placementCaption({ item: coin, own, countryName })).toEqual({
      name: 'Bronze coin',
      detailName: '',
      dateLines: ['Hegira 77', 'Umayyad'],
      details: ['Jordan Museum', 'Amman, Jordan'],
      justification: '',
    })
  })

  it('reads the page’s own text first, and prints the country after the page’s own place', () => {
    const caption = { name: 'Fils', date: 'AH 77', location: 'Jarash', justification: 'Minted in Jarash.' }
    const fields = placementCaption({ item: coin, own, caption, countryName })
    expect(fields.name).toBe('Fils')
    expect(fields.dateLines).toEqual(['AH 77', 'Umayyad'])
    expect(fields.details).toEqual(['Jordan Museum', 'Jarash, Jordan'])
    expect(fields.justification).toBe('Minted in Jarash.')
  })

  it('names no museum for a monument, and no country for the records legacy’s rule names', () => {
    const dome = { type: 'monument', country_id: 'pse', mwnf_reference: 'PA 04' }
    const fields = placementCaption({ item: dome, own: { name: 'Dome of the Rock.', location: 'Jerusalem' }, countryName, noCountry: ISLAMICART_NO_COUNTRY })
    expect(fields.details).toEqual(['Jerusalem'])
  })

  it('takes each field of a later view from the first view where its own is empty', () => {
    const first = placementCaption({ item: coin, own, countryName })
    const second = placementCaption({ item: coin, own: {}, caption: { justification: 'The reverse.' }, countryName })
    expect(withFirstView(second, first)).toMatchObject({ name: 'Bronze coin', justification: 'The reverse.' })
  })
})

describe('introCaption', () => {
  it('replaces each line by the exhibition’s own text, and the place entirely', () => {
    const item = { type: 'object', country_id: 'jor' }
    const own = { name: 'Column capital.', dates: 'Hegira 101.', dynasty: 'Umayyad.', holder: 'Jordan Archaeological Museum.', location: 'Amman' }
    expect(introCaption({ item, own, caption: { location: 'Al-Muwaqqar' }, countryName })).toEqual([
      'Column capital', 'Hegira 101', 'Umayyad', 'Jordan Archaeological Museum', 'Al-Muwaqqar',
    ])
  })
})

describe('slotsOf', () => {
  it('groups placements by position, orders their views, and falls back to the page’s own picture', () => {
    const node = {
      items: [
        { id: 'b', display_order: 2, variant_order: 1 },
        { id: 'a', display_order: 1, variant_order: 2, image_url: '/a2.jpg' },
        { id: 'a', display_order: 1, variant_order: 1, image_url: '/a1.jpg' },
      ],
      images: [{ display_order: 2, url: '/custom.jpg' }],
    }
    const slots = slotsOf(node)
    expect(slots.map((s) => s.n)).toEqual([1, 2])
    expect(slots[0].variants.map((v) => v.image)).toEqual(['/a1.jpg', '/a2.jpg'])
    expect(slots[1].variants[0].image).toBe('/custom.jpg')
  })
})

describe('reading order', () => {
  const themes = [{ id: 't1' }, { id: 't2' }]
  const children = (id) => (id === 't1' ? [{ id: 'p1' }, { id: 'p2' }] : [{ id: 'p3' }])
  const pages = readingOrder(themes, children)

  it('reads each theme’s pages, theme after theme', () => {
    expect(pages.map((p) => `${p.theme}/${p.page}`)).toEqual(['1/1', '1/2', '2/1'])
  })

  it('leads back to the introduction before the first page, and nowhere after the last', () => {
    expect(pageWithNeighbours(pages, 1, 1).previous).toEqual({ name: 'introduction' })
    expect(pageWithNeighbours(pages, 1, 2).next).toEqual({ name: 'exhibition', params: { theme: 2, page: 1 } })
    expect(pageWithNeighbours(pages, 2, 1).next).toBeNull()
    expect(pageWithNeighbours(pages, 3, 1)).toBeNull()
  })
})

describe('texts legacy printed or did not', () => {
  it('reads an importer’s placeholder title as no title', () => {
    expect(PLACEHOLDER_TITLE.test('Page 49')).toBe(true)
    expect(PLACEHOLDER_TITLE.test('Pages of the Qur’an')).toBe(false)
  })

  it('sets a quote in italics unless it marks its own', () => {
    expect(quoteHasItalics('‘Each province continued.’')).toBe(false)
    expect(quoteHasItalics('The *minaret* and the mosque')).toBe(true)
  })
})

describe('the curators’ band', () => {
  const lookups = {
    partnerName: (id) => ({ p1: 'Jordan Archaeological Museum' })[id],
    partnerCountry: (id) => ({ p1: 'jor' })[id],
    countryName: (id) => ({ jor: 'Jordan', tur: 'Turkey' })[id],
  }

  it('names a partner and its country, and leads to its page on the parent site', () => {
    expect(curatorLabel({ partner: 'p1', logo: 'legacy/JO-10.gif' }, lookups)).toBe('Jordan Archaeological Museum, Jordan')
    expect(curatorLink({ partner: 'p1' }, (id) => `/#/partner/${id}`)).toBe('/#/partner/p1')
  })

  it('names a curator that is no partner as the site gives it, and keeps legacy’s own link', () => {
    const curator = { name: 'EGE University, Izmir', country: 'tur', href: '#', logo: 'legacy/TU-28.gif' }
    expect(curatorLabel(curator, lookups)).toBe('EGE University, Izmir, Turkey')
    expect(curatorLink(curator, (id) => `/#/partner/${id}`)).toBe('#')
    expect(curatorLink({ name: 'University of Palermo', href: '' }, () => 'x')).toBe('')
  })
})

describe('the declaration a site makes', () => {
  const meta = (section, ...entities) => ({ section, entities })

  it('names every route, legacy’s windows drawn without the frame', () => {
    const routes = minisiteRoutes(meta)
    expect(routes.map((r) => r.name)).toEqual(['home', 'introduction', 'exhibition', 'credits', 'map', 'zoom'])
    expect(routes.filter((r) => r.meta.bare).map((r) => r.name)).toEqual(['credits', 'map', 'zoom'])
    expect(routes.find((r) => r.name === 'exhibition').props({ params: { theme: '2' } })).toEqual({ theme: 2, page: 1 })
  })

  it('links the header and the menu to the parent site', () => {
    const navigation = minisiteNavigation({ languages: [], parent: 'https://example.org/islamicart' })
    expect(navigation.headerLinks.map((l) => l.href)).toEqual(['https://example.org/islamicart/#/exhibitions', 'https://example.org/islamicart/#/'])
    expect(navigation.menu.find((l) => l.label === 'minisite.menu.artisticIntroduction')).toMatchObject({ window: true })
  })

  it('opens a record’s sheet and a curator’s page on the parent site', () => {
    const settings = minisiteSettings({ parent: 'https://example.org/islamicart', menuSecondColumnFrom: 7 })
    expect(settings.itemHref('a b')).toBe('https://example.org/islamicart/#/item/a%20b')
    expect(settings.partnerHref('p1')).toBe('https://example.org/islamicart/#/partner/p1')
    expect(settings.menuSecondColumnFrom).toBe(7)
  })
})

describe('MinisiteShell', () => {
  const texts = {
    'minisite.header.logoTip': 'Return to MWNF Portal homepage',
    'minisite.header.exhibitionsList': 'List of the Exhibitions',
    'minisite.header.home': 'Home',
    'minisite.header.homeTip': 'Discover Islamic Art homepage',
    'minisite.menu.timeline': 'Timeline',
    'minisite.footer.contact': 'Contact',
    'minisite.footer.copyright': '© Museum With No Frontiers (MWNF) 2004 –',
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
        { path: '/credits', name: 'credits', component: { template: '<p>credits</p>' }, meta: { bare: 'credits' } },
      ],
    })
    await router.push(path)
    await router.isReady()
    const wrapper = mount(MinisiteShell, {
      props: {
        ...minisiteNavigation({
          languages: [{ code: 'fr', label: 'Français' }, { code: 'en', label: 'English' }],
          parent: 'https://example.org/islamicart',
          menu: [{ label: 'minisite.menu.timeline', href: '/t' }],
        }),
        language: 'en',
      },
      slots: { default: '<p class="page">the page</p>' },
      global: { plugins: [createI18n({ locale: 'en', messages: { en: texts } }), router] },
    })
    await settle(() => true, 1)
    return wrapper
  }

  it('draws legacy’s frame around the page: the logo, the links back, the menu and the footer', async () => {
    const wrapper = await mountShell('/')
    expect(wrapper.find('.mwnf-minisite-header__logo img').attributes('src')).toBe('/assets/logo_en.gif')
    expect(wrapper.find('.mwnf-minisite-header__back').text()).toContain('List of the Exhibitions')
    expect(wrapper.findAll('.mwnf-minisite-header__select option').map((o) => o.text())).toEqual(['English', 'Français'])
    expect(wrapper.find('.mwnf-minisite-menu').text()).toContain('Timeline')
    expect(wrapper.find('.mwnf-minisite-footer').text()).toContain(`© Museum With No Frontiers (MWNF) 2004 – ${new Date().getFullYear()}`)
    expect(wrapper.find('.page').exists()).toBe(true)
    // English takes the fading strips the other way round, as legacy did.
    expect(wrapper.findAll('.mwnf-minisite__strip')[0].attributes('style')).toContain('bg_fading_left.gif')
  })

  it('draws one of legacy’s windows alone', async () => {
    const wrapper = await mountShell('/credits')
    expect(wrapper.find('.mwnf-minisite-window--credits .page').exists()).toBe(true)
    expect(wrapper.find('.mwnf-minisite-header').exists()).toBe(false)
  })
})
