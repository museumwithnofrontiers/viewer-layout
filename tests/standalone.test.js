import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { loadEntities, useSiteConfig } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import {
  RelatedContent, StandaloneHome, StandaloneItemSheet, StandaloneShell, StandaloneSponsors, StandaloneSubNav,
  StandaloneTextPage, StandaloneTileGrid, TodayHighlight, byLanguage, dayOfYear, legacyHomeItemKey, pickForDay,
} from '../src/standalone/index.js'
import { layoutTexts } from './helpers.js'
import { settle } from './dxa/helpers.js'

// The standalone family layer (inventory-app#2233): Discover Islamic Art's,
// Discover Baroque Art's and Sharing History's chrome and pages, mounted
// against the fixture package. Every test asserts rendered text, hrefs or the
// classes the family stylesheet lays out.

const texts = {
  ...layoutTexts,
  'core.status.loading': 'Loading…',
  'record.related.title': 'Related Content',
  'site.identity.heading': 'Discover Islamic Art',
  'site.nav.portal': 'MWNF Portal',
  'site.nav.home': 'Home',
  'site.nav.database': 'Database',
  'site.nav.partners': 'Partners',
  'site.section.database': 'Database',
  'site.footer.aboutMwnf': 'About MWNF',
  'site.footer.copyright': '© Museum With No Frontiers (MWNF) 2004 –',
  'site.sponsors.supportHead': 'Discover Islamic Art',
  'site.sponsors.supportText': 'was set up with the support of:',
  'site.sponsors.europeanUnion': 'The European Commission is the EU’s executive body.',
  'site.logo': 'Museum With No Frontiers',
  'site.home.recommendedLinks': 'Recommended Links',
  'site.home.visit': 'Visit',
  'site.home.explore': 'Explore Islamic Art Collections',
  'site.home.exploreTooltip': 'Discover the world of Islam through masterpieces.',
  'site.home.highlight': 'Today’s highlight from the Permanent Collection',
  'site.home.alsoKnownAs': 'Also known as:',
  'site.home.viewDescription': 'View description',
  'site.item.back': 'Back',
  'site.item.download': 'Download',
  'site.item.asPdf': 'As PDF (including images)',
  'site.item.related': 'Related objects',
  'site.page.body': 'Like the other great traditions of *world art*.  \n  \nFollowing the conquest.',
  'site.page.print': 'Print this page',
  'site.tiles.caption': 'Ten Virtual Exhibitions',
  'site.tiles.one': 'Lives of the Mighty',
  'site.about.team': 'The Team',
  'site.banner.title': 'Sharing History',
  'site.banner.text': 'Arab World – Europe | 1815 – 1918',
  'site.nav.introduction': 'Introduction',
  'site.about.project': 'The Project',
  'site.about.background': 'See also Historical Background',
  'sheet.field.name': 'Name',
  'sheet.field.location': 'Location',
}

// The site's chrome files, as Vite's import.meta.glob over theme/assets/ hands them over.
const chrome = Object.fromEntries(
  ['logo_en.png', 'logo_fr.png', 'logo_print.gif', 'banner.jpg', 'banner_inside.jpg', 'euromed.jpg', 'homeImg1.jpg']
    .map((file) => [`../theme/assets/legacy/${file}`, `/assets/${file}`]),
)

const config = {
  chrome,
  navigation: {
    languages: [{ code: 'en', label: 'English' }, { code: 'fr', label: 'Français' }],
    links: [
      { section: 'database', label: 'site.nav.database', to: { name: 'database' } },
      { section: 'partners', label: 'site.nav.partners', to: { name: 'partners' } },
    ],
    footerLinks: [{ label: 'site.footer.aboutMwnf', href: 'https://www.museumwnf.org/about', external: true }],
    sectionTitles: { database: 'site.section.database' },
    placement: ({ section }) => (section === 'home' ? 'after-banner' : 'before-banner'),
  },
  standalone: {
    logo: {
      src: { en: 'legacy/logo_en.png', fr: 'legacy/logo_fr.png' },
      alt: 'site.logo',
      href: 'https://www.museumwnf.org',
      print: 'legacy/logo_print.gif',
    },
    heading: 'site.identity.heading',
    headerLinks: [
      { label: 'site.nav.portal', href: 'https://www.museumwnf.org' },
      { label: 'site.nav.home', to: { name: 'home' }, on: 'inner' },
    ],
    banner: { home: 'legacy/banner.jpg', inner: 'legacy/banner_inside.jpg' },
    copyright: 'site.footer.copyright',
    sponsors: {
      on: 'home',
      columns: [
        { lead: 'site.sponsors.supportHead', text: 'site.sponsors.supportText' },
        {
          logos: [
            { src: 'legacy/euromed.jpg', alt: 'site.logo', note: 'site.sponsors.europeanUnion' },
            { src: 'https://example.org/calouste.png', href: 'http://www.gulbenkian.pt' },
          ],
        },
      ],
    },
  },
}

const ROUTES = [
  { path: '/', name: 'home', component: { template: '<p>home</p>' }, meta: { section: 'home' } },
  { path: '/database', name: 'database', component: { template: '<p>database</p>' }, meta: { section: 'database' } },
  { path: '/partners', name: 'partners', component: { template: '<p>partners</p>' }, meta: { section: 'partners' } },
  { path: '/objects/:id', name: 'objects-detail', component: { template: '<p>detail</p>' } },
  { path: '/item/:id', name: 'item', component: { template: '<p>item</p>' } },
]

async function mountWith(component, { props = {}, slots = {}, route = '/', locale = 'en', site = config } = {}) {
  setSiteConfig(site)
  const i18n = createI18n({ locale, messages: { en: texts, fr: texts } })
  const router = createRouter({ history: createMemoryHistory(), routes: ROUTES })
  await router.push(route)
  await router.isReady()
  const wrapper = mount(component, { props, slots, global: { plugins: [i18n, router] } })
  await settle(() => true, 1)
  return wrapper
}

// The config every component reads outside createViewer: one object the file
// shares (as helpers.js' withSiteRights sets it), filled for each mount.
function setSiteConfig(site) {
  const current = useSiteConfig()
  for (const key of Object.keys(current)) delete current[key]
  Object.assign(current, site)
}

afterEach(() => setSiteConfig({}))

describe('the chrome helpers', () => {
  it('reads a value per language, falling back to English', () => {
    expect(byLanguage({ en: 'a.png', ar: 'b.png' }, 'ar')).toBe('b.png')
    expect(byLanguage({ en: 'a.png', ar: 'b.png' }, 'es')).toBe('a.png')
    expect(byLanguage('one.png', 'fr')).toBe('one.png')
    expect(byLanguage(undefined, 'fr')).toBe('')
  })

  it("picks legacy's line for the day of the year, wrapping round a short list", () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(0)
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(364)
    expect(pickForDay(['a', 'b', 'c'], new Date(2026, 0, 2))).toBe('b')
    expect(pickForDay(['a', 'b', 'c'], new Date(2026, 0, 4))).toBe('a')
    expect(pickForDay([], new Date())).toBeNull()
  })

  it("reads a line of legacy's home item list as the record's legacy key", () => {
    expect(legacyHomeItemKey('object;ISL;uk;Mus02;6;en*1')).toBe('mwnf3:objects:ISL:uk:Mus02:6')
    expect(legacyHomeItemKey('monument;ISL;sy;Mon01;38;en*1\n')).toBe('mwnf3:monuments:ISL:sy:Mon01:38')
    expect(legacyHomeItemKey('')).toBe('')
  })
})

describe('StandaloneShell', () => {
  it("draws the home page as legacy: logo, picture banner, menu, the band, the footer line and year", async () => {
    const wrapper = await mountWith(StandaloneShell, { props: { languages: ['en', 'fr'], language: 'en' }, slots: { default: '<p class="page">page</p>' } })
    const page = wrapper.find('.mwnf-page')
    expect(page.classes()).toEqual(expect.arrayContaining(['mwnf-standalone', 'mwnf-standalone--home']))
    expect(wrapper.find('.mwnf-header__brand-logo').attributes('src')).toBe('/assets/logo_en.png')
    expect(wrapper.find('.mwnf-header__brand-logo').attributes('alt')).toBe('Museum With No Frontiers')
    expect(wrapper.find('.mwnf-standalone__print-logo').attributes('src')).toBe('/assets/logo_print.gif')
    expect(wrapper.find('.mwnf-header__home').attributes('href')).toBe('https://www.museumwnf.org')
    expect(wrapper.find('.mwnf-header__title').exists()).toBe(false)
    expect(wrapper.findAll('.mwnf-header__link').map((l) => l.text())).toEqual(['MWNF Portal'])
    expect(wrapper.find('.mwnf-banner__image').attributes('src')).toBe('/assets/banner.jpg')
    // The menu comes after the home page's picture.
    expect(wrapper.html().indexOf('mwnf-banner')).toBeLessThan(wrapper.html().indexOf('mwnf-nav'))
    expect(wrapper.find('.mwnf-standalone-banner').exists()).toBe(false)
    expect(wrapper.find('.mwnf-sponsors').text()).toContain('Discover Islamic Art was set up with the support of:')
    expect(wrapper.find('.mwnf-footer').text()).toContain(`© Museum With No Frontiers (MWNF) 2004 – ${new Date().getFullYear()}`)
    expect(wrapper.find('.mwnf-header__language-select').exists()).toBe(true)
  })

  it('draws an inner page: the heading, the Home link, the menu, then the titled band', async () => {
    const wrapper = await mountWith(StandaloneShell, { route: '/database', props: { languages: ['en', 'fr'], language: 'en' }, slots: { default: '<p class="page">page</p>' } })
    expect(wrapper.find('.mwnf-page').classes()).toContain('mwnf-standalone--inner')
    expect(wrapper.find('.mwnf-header__title').text()).toBe('Discover Islamic Art')
    expect(wrapper.findAll('.mwnf-header__link').map((l) => l.text())).toEqual(['MWNF Portal', 'Home'])
    expect(wrapper.find('.mwnf-banner__image').exists()).toBe(false)
    const banner = wrapper.find('.mwnf-standalone-banner')
    expect(banner.text()).toBe('Database')
    expect(banner.attributes('style')).toContain('banner_inside.jpg')
    // The menu comes before the band in the page.
    const html = wrapper.html()
    expect(html.indexOf('mwnf-nav')).toBeLessThan(html.indexOf('mwnf-standalone-banner'))
    expect(wrapper.find('.mwnf-nav__link--active').text()).toBe('Database')
    expect(wrapper.find('.mwnf-sponsors').exists()).toBe(false)
  })

  it('draws the band and the banner of the page it navigates to', async () => {
    const wrapper = await mountWith(StandaloneShell, { route: '/database', props: { languages: ['en'], language: 'en' } })
    expect(wrapper.find('.mwnf-sponsors').exists()).toBe(false)
    await wrapper.vm.$router.push('/')
    await settle(() => wrapper.find('.mwnf-sponsors').exists())
    expect(wrapper.find('.mwnf-sponsors').text()).toContain('was set up with the support of:')
    expect(wrapper.find('.mwnf-standalone-banner').exists()).toBe(false)
    await wrapper.vm.$router.push('/partners')
    await settle(() => wrapper.find('.mwnf-standalone-banner').exists())
    expect(wrapper.find('.mwnf-sponsors').exists()).toBe(false)
    expect(wrapper.find('.mwnf-banner__image').exists()).toBe(false)
  })

  it('reads the logo in the language the site is in', async () => {
    const wrapper = await mountWith(StandaloneShell, { locale: 'fr', props: { languages: ['en', 'fr'], language: 'fr' } })
    expect(wrapper.find('.mwnf-header__brand-logo').attributes('src')).toBe('/assets/logo_fr.png')
  })

  it("prints legacy's words over the home page's picture, and none over an inner page's", async () => {
    const site = { ...config, standalone: { ...config.standalone, banner: { ...config.standalone.banner, homeTitle: 'site.banner.title', homeText: 'site.banner.text' }, subheading: 'site.banner.text' } }
    const home = await mountWith(StandaloneShell, { site, slots: { default: '<p>page</p>' } })
    expect(home.find('.mwnf-standalone-home-banner__title').text()).toBe('Sharing History')
    expect(home.find('.mwnf-standalone-home-banner__line').text()).toBe('Arab World – Europe | 1815 – 1918')
    const inner = await mountWith(StandaloneShell, { site, route: '/database', slots: { default: '<p>page</p>' } })
    expect(inner.find('.mwnf-standalone-home-banner').exists()).toBe(false)
    // An inner page's header: the heading and the line under it.
    expect(inner.find('.mwnf-header__subtitle').text()).toBe('Arab World – Europe | 1815 – 1918')
  })

  it("drops a menu entry's own links down under it, named by entry or by the data", async () => {
    const site = {
      ...config,
      navigation: {
        ...config.navigation,
        links: [
          { section: 'database', label: 'site.nav.introduction', to: { name: 'database' }, children: [{ label: 'site.about.project', to: { name: 'database' } }] },
          { section: 'partners', label: 'site.nav.partners', to: { name: 'partners' }, children: () => [{ text: 'Algeria', to: { name: 'partners' } }, { text: 'Austria', to: { name: 'partners' } }] },
        ],
      },
    }
    const wrapper = await mountWith(StandaloneShell, { site, slots: { default: '<p>page</p>' } })
    const parents = wrapper.findAll('.mwnf-nav__item--parent')
    expect(parents).toHaveLength(2)
    expect(parents[0].findAll('.mwnf-nav__sublink').map((a) => a.text())).toEqual(['The Project'])
    expect(parents[1].findAll('.mwnf-nav__sublink').map((a) => a.text())).toEqual(['Algeria', 'Austria'])
    expect(parents[1].find('.mwnf-nav__sublink').attributes('href')).toBe('/partners')
  })

  it('offers no language switcher when the chrome has one language', async () => {
    const site = { ...config, standalone: { ...config.standalone, languages: false } }
    const wrapper = await mountWith(StandaloneShell, { site, props: { languages: ['en', 'fr'], language: 'en' } })
    expect(wrapper.find('.mwnf-header__language-select').exists()).toBe(false)
  })
})

describe('StandaloneSponsors', () => {
  it('lays the band out in columns: an italic lead and its text, then marks linked or explained', async () => {
    const wrapper = await mountWith(StandaloneSponsors, { props: { columns: config.standalone.sponsors.columns } })
    const columns = wrapper.findAll('.mwnf-standalone-sponsors__column')
    expect(columns).toHaveLength(2)
    expect(columns[0].find('i').text()).toBe('Discover Islamic Art')
    expect(columns[0].text()).toBe('Discover Islamic Art was set up with the support of:')
    expect(columns[1].find('a').attributes('href')).toBe('http://www.gulbenkian.pt')
    expect(columns[1].find('details').text()).toContain('The European Commission is the EU’s executive body.')
    expect(columns[1].findAll('img').map((img) => img.attributes('src'))).toEqual(['/assets/euromed.jpg', 'https://example.org/calouste.png'])
  })
})

describe('StandaloneHome', () => {
  it("lists legacy's side links: a prefix, an italic name, a tooltip and a gap", async () => {
    const home = {
      links: [
        { label: 'site.home.recommendedLinks', to: { name: 'partners' } },
        { label: 'site.home.explore', prefix: 'site.home.visit', italic: true, title: 'site.home.exploreTooltip', to: { name: 'partners' }, gap: true },
      ],
    }
    const wrapper = await mountWith(StandaloneHome, { props: { home } })
    const links = wrapper.findAll('.mwnf-standalone-home__links li')
    expect(links[0].text()).toBe('Recommended Links')
    expect(links[0].find('a').attributes('href')).toBe('/partners')
    expect(links[1].text()).toBe('Visit Explore Islamic Art Collections')
    expect(links[1].find('i').text()).toBe('Explore Islamic Art Collections')
    expect(links[1].find('a').attributes('title')).toBe('Discover the world of Islam through masterpieces.')
    expect(links[1].classes()).toContain('mwnf-standalone-home__link--gap')
  })
})

describe('TodayHighlight', () => {
  it("prints legacy's lines, each without its ending period, then the place and the link", async () => {
    const wrapper = await mountWith(TodayHighlight, {
      props: {
        record: { id: 'i1', images: [{ url: 'casket.jpg' }] },
        text: { name: 'Casket.', alternate_name: 'Box', dates: 'Probably shortly after hegira 350 / AD 961', dynasty: 'Spanish Umayyad.', materials: ['Carved ivory', 'silver'], holder: 'Victoria and Albert Museum', location: 'London, England.' },
        country: 'United Kingdom',
        to: { name: 'item', params: { id: 'i1' } },
        heading: 'site.home.highlight',
        alsoKnownAs: 'site.home.alsoKnownAs',
        action: 'site.home.viewDescription',
      },
    })
    expect(wrapper.find('.mwnf-standalone-highlight__heading').text()).toBe('Today’s highlight from the Permanent Collection')
    expect(wrapper.findAll('.mwnf-standalone-highlight__lines span').map((s) => s.text())).toEqual([
      'Casket',
      'Also known as: Box',
      'Probably shortly after hegira 350 / AD 961, Spanish Umayyad',
      'Carved ivory; silver',
      'Victoria and Albert Museum',
    ])
    expect(wrapper.find('.mwnf-standalone-highlight__place').text()).toBe('London, England, United Kingdom')
    expect(wrapper.find('.mwnf-standalone-highlight__image').attributes('src')).toBe('casket.jpg')
    // Legacy's own picture of the day, when the site keeps them, in place of the record's.
    await wrapper.setProps({ picture: '/assets/123.jpg' })
    expect(wrapper.find('.mwnf-standalone-highlight__image').attributes('src')).toBe('/assets/123.jpg')
    expect(wrapper.find('.mwnf-standalone-highlight__action a').attributes('href')).toBe('/item/i1')
  })
})

describe('StandaloneItemSheet', () => {
  const spec = {
    entity: 'objects',
    fields: [
      { key: 'name', label: 'sheet.field.name', value: 'name' },
      { key: 'location', label: 'sheet.field.location', value: 'location' },
    ],
    related: { route: 'objects-detail' },
  }

  it('puts the pictures and the way back on the left, the sheet in the middle, Related Content on the right', async () => {
    // A route's meta loads the entity before its view exists; this test does it by hand.
    await loadEntities(['objects'])
    const wrapper = await mountWith(StandaloneItemSheet, {
      route: '/objects/o1',
      props: {
        spec,
        id: 'o1',
        back: [{ label: 'site.item.back', history: true }, { label: 'site.section.database', to: { name: 'database' } }],
        related: { groups: [{ heading: 'site.item.related' }], download: { heading: 'site.item.download', print: 'site.item.asPdf' } },
      },
      slots: { sidebar: '<p class="own-block">Timeline for this item</p>' },
    })
    await settle(() => wrapper.find('.mwnf-sheet').exists() && wrapper.find('.mwnf-sheet').text().includes('Glazed') && wrapper.find('.mwnf-standalone-related__thumbs').exists(), 200)
    const main = wrapper.find('.mwnf-record__main')
    expect(main.findAll(':scope > .mwnf-media')).toHaveLength(0)
    const left = main.find(':scope > .mwnf-standalone-item__left')
    expect(left.find('.mwnf-media').exists()).toBe(true)
    expect(left.findAll('.mwnf-standalone-item__back-link').map((l) => l.text())).toEqual(['Back', 'Database'])
    expect(main.find(':scope > .mwnf-sheet').text()).toContain('Glazed bowl')
    const related = main.find(':scope > .mwnf-standalone-related')
    expect(related.find('.mwnf-standalone-related__heading').text()).toBe('Related Content')
    expect(related.find('.mwnf-standalone-related__group-heading').text()).toBe('Related objects')
    expect(related.find('.mwnf-standalone-related__thumbs a').attributes('href')).toBe('/item/o2')
    expect(related.find('.own-block').text()).toBe('Timeline for this item')
    expect(related.find('.mwnf-standalone-related__print').text()).toBe('As PDF (including images)')
    expect(wrapper.find('.mwnf-record__title').exists()).toBe(false)
  })
})

describe('RelatedContent', () => {
  it('groups the related records by type, and leaves out a group with none', async () => {
    const records = [
      { id: 'a', image: 'a.jpg', imageAlt: 'A', name: 'A', badge: 'object', to: '/item/a' },
      { id: 'b', image: 'b.jpg', imageAlt: 'B', name: 'B', badge: 'monument', to: '/item/b' },
    ]
    const groups = [{ heading: 'site.item.related', type: 'object' }, { heading: 'site.nav.partners', type: 'thing' }]
    const wrapper = await mountWith(RelatedContent, { props: { records, groups } })
    expect(wrapper.findAll('.mwnf-standalone-related__group')).toHaveLength(1)
    expect(wrapper.findAll('.mwnf-standalone-related__thumbs img').map((i) => i.attributes('src'))).toEqual(['a.jpg'])
  })
})

describe('StandaloneTextPage', () => {
  it('renders the body as Markdown, with its drop cap, its link and print', async () => {
    const wrapper = await mountWith(StandaloneTextPage, {
      props: { body: 'site.page.body', dropCap: true, link: { text: 'Discover Islamic Art', to: { name: 'database' } }, print: 'site.page.print' },
    })
    expect(wrapper.classes()).toContain('mwnf-standalone-page--drop-cap')
    expect(wrapper.find('.mwnf-standalone-page__body em').text()).toBe('world art')
    expect(wrapper.find('.mwnf-standalone-page__link a').text()).toBe('Discover Islamic Art')
    expect(wrapper.find('.mwnf-standalone-page__link a').attributes('href')).toBe('/database')
    expect(wrapper.find('.mwnf-standalone-page__print-button').text()).toBe('Print this page')
  })
})

describe('Sharing History blocks', () => {
  it('draws a tab strip with the active page and a see-also link', async () => {
    const wrapper = await mountWith(StandaloneSubNav, {
      props: {
        tabs: [{ label: 'site.about.team', to: { name: 'database' } }, { label: 'site.about.project', to: { name: 'partners' }, active: true }],
        aside: { label: 'site.about.background', href: '#/background' },
      },
    })
    expect(wrapper.findAll('.mwnf-standalone-subnav__tab').map((t) => t.text())).toEqual(['The Team', 'The Project'])
    expect(wrapper.find('.mwnf-standalone-subnav__tab--active').text()).toBe('The Project')
    expect(wrapper.find('.mwnf-standalone-subnav__aside').attributes('href')).toBe('#/background')
  })

  it('draws a tile per collection, each with its own picture, under the caption', async () => {
    const wrapper = await mountWith(StandaloneTileGrid, {
      props: { caption: 'site.tiles.caption', items: [{ image: 'legacy/homeImg1.jpg', label: 'site.tiles.one', to: { name: 'database' } }] },
    })
    expect(wrapper.find('.mwnf-standalone-tiles__caption').text()).toBe('Ten Virtual Exhibitions')
    expect(wrapper.find('.mwnf-standalone-tiles__image').attributes('src')).toBe('/assets/homeImg1.jpg')
    expect(wrapper.find('.mwnf-standalone-tiles__label').text()).toBe('Lives of the Mighty')
  })

  it("labels a tile with a name from the data package, in place of an entry", async () => {
    const wrapper = await mountWith(StandaloneTileGrid, {
      props: { items: [{ image: 'legacy/homeImg1.jpg', text: 'The *Hospitality* of Sultans', to: { name: 'database' } }] },
    })
    expect(wrapper.find('.mwnf-standalone-tiles__label').text()).toBe('The Hospitality of Sultans')
  })
})
