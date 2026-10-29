import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { useSiteConfig } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import {
  baroqueartMenu, cleanText, curatorLabel, curatorLink, detailViewCaption, introCaption, ISLAMICART_NO_COUNTRY, labelSet, MinisiteShell,
  minisiteNavigation, minisiteRoutes, minisiteSettings,
  pageWithNeighbours, placementCaption, PLACEHOLDER_TITLE, quoteHasItalics, readingOrder, sheetItemId, slotsOf, viewPicture,
  withFirstView,
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

  it('shows the first view’s picture for a view that has none, as legacy did', () => {
    const slot = { variants: [{ image: '/a1.jpg' }, { image: '/a2.jpg' }, { image: null }] }
    expect(viewPicture(slot, 1)).toBe('/a2.jpg')
    expect(viewPicture(slot, 2)).toBe('/a1.jpg')
    expect(viewPicture(null, 0)).toBeNull()
  })

  it('opens the view’s record, else the first view’s, and none for a photo legacy placed with no record', () => {
    const items = { o1: { id: 'o1', type: 'object' }, p1: { id: 'p1', type: 'picture' }, p2: { id: 'p2', type: 'picture' } }
    const itemOf = (id) => items[id]
    const slot = (...ids) => ({ variants: ids.map((id) => ({ entry: { id } })) })
    expect(sheetItemId(slot('o1', 'p1'), 1, itemOf)).toBe('o1')
    expect(sheetItemId(slot('p1', 'o1'), 1, itemOf)).toBe('o1')
    expect(sheetItemId(slot('p1', 'p2'), 1, itemOf)).toBeNull()
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

// Discover Baroque Art's exhibitions ran on pages built like ISL's
// (exhibitions/BAR/generic_*.php), with their own labels, two more caption
// lines, detail views and a home band of their own (inventory-app#2390).
describe('Discover Baroque Art', () => {
  const painting = { type: 'object', country_id: 'cze' }
  const church = { type: 'monument', country_id: 'cze' }
  const czech = (item) => (item?.country_id === 'cze' ? 'Czech Republic' : '')

  it('reads the family’s own label set', () => {
    expect(labelSet({})).toBe('minisite')
    expect(labelSet({ family: 'BAR' })).toBe('minisiteBaroque')
    expect(labelSet({ family: 'BAR', texts: 'other' })).toBe('other')
  })

  it('prints the artist and the material, the page’s own first, else an object’s artist or a monument’s architects', () => {
    const own = { name: 'Portrait.', artist: 'Johann Kupetzky.', materials: ['Oil on canvas.'] }
    expect(placementCaption({ item: painting, own, countryName: czech, family: 'BAR' })).toMatchObject({
      artist: 'Johann Kupetzky',
      material: 'Oil on canvas',
    })
    const caption = { artist: 'Santini', material: 'Stucco' }
    expect(placementCaption({ item: church, own: { architects: 'J. B. Santini Aichel.' }, caption, countryName: czech, family: 'BAR' }))
      .toMatchObject({ artist: 'Santini', material: 'Stucco' })
    expect(placementCaption({ item: church, own: { architects: 'J. B. Santini Aichel.' }, countryName: czech, family: 'BAR' }).artist)
      .toBe('J. B. Santini Aichel')
    expect(placementCaption({ item: painting, own, countryName: czech })).not.toHaveProperty('artist')
  })

  it('shows a placement’s detail views as its views, each with its own picture', () => {
    const node = {
      items: [{ id: 'church', display_order: 1, variant_order: 1, image_url: 'church.jpg', details: [
        { id: 'altar', image_url: 'altar.jpg' }, { id: 'pulpit', image_url: null },
      ] }],
    }
    const [slot] = slotsOf(node)
    expect(slot.variants.map((v) => [v.view.id, v.image])).toEqual([['altar', 'altar.jpg'], ['pulpit', null]])
    expect(viewPicture(slot, 1)).toBe('altar.jpg')
  })

  it('never gives a view the first view’s detail name, which legacy wrote as a space', () => {
    const first = { name: 'Library', detailName: 'Triumphal arches', dateLines: ['1728'], details: [], justification: 'Wisdom.' }
    const second = { name: 'Detail of ceiling painting', detailName: '', dateLines: ['1723'], details: [], justification: '' }
    expect(withFirstView(second, first, 'BAR')).toMatchObject({ detailName: '', justification: 'Wisdom.' })
    expect(withFirstView(second, first)).toMatchObject({ detailName: 'Triumphal arches' })
  })

  it('captions a detail view from its own text, the first view’s, then the detail it shows', () => {
    const fields = detailViewCaption({
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
    expect(curatorLabel({ partner: 'p', place: 'Brno', country: 'cze' }, lookups)).toBe('Moravian Gallery, Brno, Czech Republic')
  })

  it('has its own menu and footer: no Artistic Introduction, no bars, the language policy', () => {
    const navigation = minisiteNavigation({ languages: [], parent: 'https://example.org/baroqueart', family: 'BAR' })
    expect(navigation.menu.map((l) => l.label)).toEqual(baroqueartMenu('https://example.org/baroqueart').map((l) => l.label))
    expect(navigation.menu.some((l) => l.label.endsWith('artisticIntroduction'))).toBe(false)
    expect(navigation.menu.find((l) => l.label === 'minisiteBaroque.menu.exhibitions').href).toBe('#/')
    expect(navigation.menuSeparator).toBe(false)
    expect(navigation.footerLinks.map((l) => l.label)).toContain('minisiteBaroque.footer.languagePolicy')
    expect(navigation.logoTip).toBe('minisiteBaroque.header.logoTip')
    expect(minisiteSettings({ parent: 'https://example.org/baroqueart' }).partnerListHref).toBe('https://example.org/baroqueart/#/partners')
  })
})
