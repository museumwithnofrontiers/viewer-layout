import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { loadEntities, partnerView, useDataPackage, useSiteConfig } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import {
  RelatedContent, StandaloneHome, StandaloneItemSheet, StandalonePartnerPage, StandaloneShell, StandaloneSponsors, StandaloneSubNav,
  StandalonePagination, StandaloneResultsGrid, StandaloneTextPage, StandaloneTileGrid, TodayHighlight, byLanguage, dayOfYear, legacyHomeItemKey, pickForDay,
  StandaloneGlossarySpelling, StandalonePartnerList, StandaloneRefine, StandaloneResultsList, StandaloneSponsorList, StandaloneWindow,
  StandaloneDatabaseForm, StandaloneTimelineEntrance, StandaloneTimelineResults, StandaloneHistoricalCrossRef, StandalonePartnersEntrance,
} from '../src/standalone/index.js'
import { timelineDocument } from '../src/standalone/wordExport.js'
import { sheetDocument } from '../src/standalone/wordExport.js'
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
  'site.section.results': 'Results of your search',
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
  'site.partner.contact': 'Contact us',
  'site.partner.phone': 'Tel.',
  'site.partner.map': 'The Partner on Google Maps',
  'site.partner.viewObjects': 'View Objects',
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
  { path: '/database/results', name: 'database-results', component: { template: '<p>results</p>' }, meta: { section: 'database', bannerTitle: 'site.section.results' } },
  { path: '/partners', name: 'partners', component: { template: '<p>partners</p>' }, meta: { section: 'partners' } },
  { path: '/objects/:id', name: 'objects-detail', component: { template: '<p>detail</p>' } },
  { path: '/item/:id', name: 'item', component: { template: '<p>item</p>' } },
  { path: '/partner/:id', name: 'partner', component: { template: '<p>partner</p>' } },
  { path: '/partner/:id/items', name: 'partner-items', component: { template: '<p>items</p>' } },
  { path: '/glossary-spelling', name: 'glossary-spelling', component: { template: '<p>window</p>' }, meta: { section: 'database', bare: true } },
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

  it("titles the band with the route's own banner title over its section's", async () => {
    const wrapper = await mountWith(StandaloneShell, { route: '/database/results', props: { languages: ['en'], language: 'en' }, slots: { default: '<p>page</p>' } })
    expect(wrapper.find('.mwnf-standalone-banner').text()).toBe('Results of your search')
    expect(wrapper.find('.mwnf-nav__link--active').text()).toBe('Database')
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

  it("draws a site's own band and footer in place of the configured ones", async () => {
    const wrapper = await mountWith(StandaloneShell, {
      slots: { default: '<p>page</p>', sponsors: '<div class="own-band">band</div>', footer: '<p class="own-footer">footer</p>' },
    })
    expect(wrapper.find('.own-band').exists()).toBe(true)
    expect(wrapper.find('.mwnf-standalone-sponsors').exists()).toBe(false)
    expect(wrapper.find('.own-footer').exists()).toBe(true)
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
    // The site's own place line, where its legacy composed one.
    await wrapper.setProps({ place: 'London, England, United Kingdom' })
    expect(wrapper.find('.mwnf-standalone-highlight__place').text()).toBe('London, England, United Kingdom')
    await wrapper.setProps({ place: '' })
    expect(wrapper.find('.mwnf-standalone-highlight__place').exists()).toBe(false)
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

// v-show's display: none (the mounts are not attached, so isVisible cannot tell).
const shown = (element) => !(element.attributes('style') ?? '').includes('display: none')

describe('StandalonePartnerPage', () => {
  const props = {
    id: 'p1',
    view: (record, text) => partnerView(record, text, { countryLabel: () => 'Egypt' }),
    back: [{ label: 'site.item.back', history: true }, { label: 'site.nav.partners', to: { name: 'partners' } }],
    items: (record) => (record.item_count ? { label: 'site.partner.viewObjects', to: { name: 'partner-items', params: { id: record.id } } } : null),
    labels: { contact: 'site.partner.contact', phone: 'site.partner.phone', map: 'site.partner.map' },
    // The fixture partner carries no type: the default draws a museum's map only.
    map: () => true,
  }

  it("draws legacy's profile: the way back, the name and place, the pills, the pictures beside the open tab, the map", async () => {
    await loadEntities(['partners'])
    const wrapper = await mountWith(StandalonePartnerPage, { route: '/partner/p1', props })
    await settle(() => wrapper.find('.mwnf-standalone-partner__location').exists() && wrapper.find('.mwnf-standalone-partner__location').text() === 'Cairo, Egypt', 200)
    expect(wrapper.findAll('.mwnf-standalone-item__back-link').map((l) => l.text())).toEqual(['Back', 'Partners'])
    expect(wrapper.find('.mwnf-standalone-partner__location').text()).toBe('Cairo, Egypt')
    expect(wrapper.findAll('.mwnf-standalone-partner__tab').map((tab) => tab.text())).toEqual(['About', 'Contact us', 'Logo'])
    expect(wrapper.find('.mwnf-standalone-partner__homepage').attributes('href')).toBe('https://p1.example.org')
    expect(wrapper.find('.mwnf-standalone-partner__items').text()).toBe('View Objects')
    expect(wrapper.find('.mwnf-standalone-partner__items').attributes('href')).toBe('/partner/p1/items')
    expect(wrapper.find('.mwnf-standalone-partner__pictures .mwnf-media').exists()).toBe(true)
    expect(wrapper.find('.mwnf-standalone-partner__pictures .mwnf-media__caption').exists()).toBe(false)
    expect(wrapper.find('.mwnf-standalone-partner__about').html()).toContain('<strong>fixture</strong>')
    expect(shown(wrapper.find('.mwnf-standalone-partner__contact'))).toBe(false)

    await wrapper.findAll('.mwnf-standalone-partner__tab')[1].trigger('click')
    const contact = wrapper.find('.mwnf-standalone-partner__contact')
    expect(shown(contact)).toBe(true)
    expect(contact.text()).toContain('1 Fixture Street')
    expect(contact.text()).toContain('Tel. +20 000 0000')
    expect(contact.find('strong').text()).toBe('Curator')
    expect(contact.text()).not.toContain('p1.example.org/extra')

    expect(wrapper.find('.mwnf-standalone-partner__map-heading').text()).toBe('The Partner on Google Maps')
    expect(wrapper.find('.mwnf-partner-map__embed').attributes('src')).toBe('https://maps.google.com/maps?q=30.0444,31.2357&z=10&t=h&hl=en&output=embed')
    expect(wrapper.find('.mwnf-sheet__value').exists()).toBe(false)
    // Only a museum offers its languages, as legacy's; the fixture partner has no type.
    expect(wrapper.find('.mwnf-standalone-item__top').exists()).toBe(false)
    expect(wrapper.find('.mwnf-record__title').exists()).toBe(false)
  })

  it('lists no About tab where the product says so, and draws no map where it says so', async () => {
    await loadEntities(['partners'])
    const wrapper = await mountWith(StandalonePartnerPage, {
      route: '/partner/p1',
      props: { ...props, about: () => false, map: () => false, links: true, bands: () => true },
    })
    await settle(() => wrapper.find('.mwnf-standalone-partner__location').exists() && wrapper.find('.mwnf-standalone-partner__location').text() === 'Cairo, Egypt', 200)
    expect(wrapper.findAll('.mwnf-standalone-partner__tab').map((tab) => tab.text())).toEqual(['Contact us', 'Logo'])
    expect(shown(wrapper.find('.mwnf-standalone-partner__about'))).toBe(true)
    expect(wrapper.find('.mwnf-standalone-partner__contact').text()).toContain('p1.example.org/extra')
    expect(wrapper.find('.mwnf-standalone-partner__map').exists()).toBe(false)
    expect(wrapper.find('.mwnf-standalone-item__top').exists()).toBe(true)
  })

  it('offers on the band only the languages the product keeps', async () => {
    await loadEntities(['partners'])
    const labels = async (languages) => {
      const wrapper = await mountWith(StandalonePartnerPage, { route: '/partner/p1', props: { ...props, bands: () => true, ...(languages ? { languages } : {}) } })
      await settle(() => wrapper.find('.mwnf-standalone-partner__location').exists(), 200)
      return wrapper.findAll('.mwnf-standalone-item__top .mwnf-languages__button').map((b) => b.text())
    }
    const all = await labels()
    // Legacy's band showed a single language too.
    expect(all).toHaveLength(1)
    expect(await labels((record, code) => code === 'en')).toEqual(all)
    expect(await labels(() => false)).toEqual([])
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

describe('StandaloneResultsGrid', () => {
  const rows = [
    { id: 'a', to: { name: 'item', params: { id: 'a' } }, image: 'a.jpg', name: 'Coin (<i>dirham</i>)', lines: ['Hegira 91 / AD 709, Umayyad'], holder: 'Museum of Civilisations', location: 'Rome, Italy' },
    { id: 'b', href: '#/item/b', image: '', name: 'Jar', lines: [] },
  ]

  it("draws legacy's tiles: the picture, then on hover the name, date line, holder, location and the sheet link", async () => {
    const wrapper = await mountWith(StandaloneResultsGrid, { props: { rows, seeLabel: 'See Database Entry', noImage: 'none.gif' } })
    const tiles = wrapper.findAll('.mwnf-standalone-results__tile')
    expect(tiles).toHaveLength(2)
    const panel = tiles[0].find('.mwnf-standalone-results__panel')
    expect(panel.find('.mwnf-standalone-results__name').html()).toContain('Coin (<i>dirham</i>)')
    expect(panel.text()).toContain('Hegira 91 / AD 709, Umayyad')
    expect(panel.find('.mwnf-standalone-results__holder').text()).toBe('Museum of Civilisations')
    expect(panel.text()).toContain('Rome, Italy')
    expect(panel.find('.mwnf-standalone-results__see').text()).toBe('See Database Entry')
    // A record with no picture shows the site's placeholder.
    expect(tiles[1].find('.mwnf-standalone-results__frame img').attributes('src')).toBe('none.gif')
  })

  it('says so when there is no row', async () => {
    const wrapper = await mountWith(StandaloneResultsGrid, { props: { rows: [], seeLabel: 'See', empty: 'No result' } })
    expect(wrapper.find('.mwnf-standalone-results__empty').text()).toBe('No result')
  })
})

describe('StandaloneResultsList', () => {
  const rows = [
    {
      id: 'a', to: { name: 'item', params: { id: 'a' } }, image: 'a.jpg', name: 'Coin (<i>dirham</i>)', place: 'Rome, Italy', dates: 'Hegira 91 / AD 709',
      preview: { lines: ['Hegira 91 / AD 709, Umayyad'], holder: 'Museum of Civilisations', location: 'Rome, Lazio, Italy' },
    },
    { id: 'b', href: '#/item/b', image: '', name: 'Mosque', place: 'Cairo, Egypt', dates: '', preview: { lines: ['AD 879'], location: 'Cairo, Egypt' } },
  ]

  it("draws legacy's list: each record's picture beside its name, place and date, the first one in the preview", async () => {
    const wrapper = await mountWith(StandaloneResultsList, { props: { rows, noImage: 'none.gif' } })
    const cells = wrapper.findAll('.mwnf-standalone-list__cell')
    expect(cells).toHaveLength(2)
    expect(cells[0].find('.mwnf-standalone-list__name').html()).toContain('Coin (<i>dirham</i>),')
    expect(cells[0].find('.mwnf-standalone-list__content p').text()).toBe('Coin (dirham), Rome, Italy')
    expect(cells[0].find('.mwnf-standalone-list__content > div i').text()).toBe('Hegira 91 / AD 709')
    // No date, no date line; no picture, the site's placeholder.
    expect(cells[1].find('.mwnf-standalone-list__content div').exists()).toBe(false)
    expect(cells[1].find('.mwnf-standalone-list__frame img').attributes('src')).toBe('none.gif')
    const preview = wrapper.find('.mwnf-standalone-list__preview')
    expect(preview.find('img').attributes('src')).toBe('a.jpg')
    expect(preview.findAll('p').map((p) => p.text())).toEqual(['Coin (dirham)', 'Hegira 91 / AD 709, Umayyad', 'Museum of Civilisations', 'Rome, Lazio, Italy'])
  })

  it("shows a record's preview while its picture or words are hovered, then the first one's again", async () => {
    const wrapper = await mountWith(StandaloneResultsList, { props: { rows } })
    const link = wrapper.findAll('.mwnf-standalone-list__content a')[1]
    await link.trigger('mouseenter')
    expect(wrapper.find('.mwnf-standalone-list__preview').findAll('p').map((p) => p.text())).toEqual(['Mosque', 'AD 879', 'Cairo, Egypt'])
    await link.trigger('mouseleave')
    expect(wrapper.find('.mwnf-standalone-list__preview p').text()).toBe('Coin (dirham)')
  })

  it('says so when there is no row', async () => {
    const wrapper = await mountWith(StandaloneResultsList, { props: { rows: [], empty: 'No result' } })
    expect(wrapper.find('.mwnf-standalone-list__empty').text()).toBe('No result')
    expect(wrapper.find('.mwnf-standalone-list__preview').exists()).toBe(false)
  })
})

describe('StandalonePartnerList', () => {
  const groups = [
    { label: 'Croatia', main: [{ id: 'a', label: 'Museum of Arts and Crafts, Zagreb', href: '#/partner/a' }], associated: [] },
    {
      label: 'Hungary',
      main: [{ id: 'b', label: 'Hungarian National Gallery, Budapest', href: '#/partner/b' }],
      associated: [{ id: 'c', label: 'Esterházy Palace, Fertőd', href: '#/partner/c' }],
    },
  ]
  const props = {
    groups, back: [{ label: 'Back', history: true }, { label: 'Other Partners', href: '#/partners/results?type=institution' }],
    heads: ['Partner Museums', 'Associated Museums'], seeAssociated: 'See Associated Museums', noAssociated: 'No associated museum',
  }

  it("draws legacy's museum list: each group beside its band, which opens its associated museums and closes the others", async () => {
    const wrapper = await mountWith(StandalonePartnerList, { props: { ...props, type: 'museum' } })
    expect(wrapper.findAll('.mwnf-standalone-item__back-link').map((l) => l.text())).toEqual(['Back', 'Other Partners'])
    expect(wrapper.findAll('.mwnf-standalone-pl__heads h3').map((h) => h.text())).toEqual(['Partner Museums', 'Associated Museums'])
    const heads = wrapper.findAll('.mwnf-standalone-pl__head')
    expect(heads.map((h) => h.find('h3').text())).toEqual(['Croatia', 'Hungary'])
    expect(heads[0].find('.mwnf-standalone-pl__toggle').text()).toBe('See Associated Museums')
    const associated = () => wrapper.findAll('.mwnf-standalone-pl__associated').map((a) => a.element.style.display !== 'none')
    expect(associated()).toEqual([false, false])
    await heads[1].find('.mwnf-standalone-pl__toggle').trigger('click')
    expect(associated()).toEqual([false, true])
    expect(wrapper.findAll('.mwnf-standalone-pl__associated')[1].text()).toBe('Esterházy Palace, Fertőd')
    await heads[0].find('.mwnf-standalone-pl__toggle').trigger('click')
    expect(associated()).toEqual([true, false])
    expect(wrapper.find('.mwnf-standalone-pl__none').text()).toBe('No associated museum')
  })

  it("draws legacy's institution list: each group its own title, every one open at first", async () => {
    const wrapper = await mountWith(StandalonePartnerList, { props: { ...props, type: 'institution' } })
    const titles = wrapper.findAll('.mwnf-standalone-pl__toggle')
    expect(titles.map((t) => t.text())).toEqual(['Croatia', 'Hungary'])
    expect(wrapper.findAll('.mwnf-standalone-pl__row').map((r) => r.element.style.display !== 'none')).toEqual([true, true])
    await titles[1].trigger('click')
    expect(wrapper.findAll('.mwnf-standalone-pl__row').map((r) => r.element.style.display !== 'none')).toEqual([false, true])
  })
})

describe('StandaloneHistoricalCrossRef', () => {
  const props = {
    labels: { heading: 'Timeline', close: 'Close', country: 'Get dates for', range: 'Time Range' },
    start: 1450,
    end: 1500,
    countries: [{ value: 'egy', label: 'Egypt' }, { value: 'syr', label: 'Syria' }],
    country: 'egy',
    ranges: [{ value: 1400, label: '1400 - 1450 A.D.' }, { value: 1450, label: '1450 - 1500 A.D.' }],
    range: 1450,
    item: { image: '/sword.jpg', name: 'Sword', lines: ['Hegira 855–86 / AD 1451–81, Ottoman', '', 'Museum of Islamic Art', 'Cairo, Egypt'] },
    heading: 'Egypt - 1450 - 1500 A.D.',
    events: [{ id: 'a', date: '1468 A.D.', html: '<p>A cultural revival.</p>' }, { id: 'b', date: '1492 A.D.', html: '<p>The Cape.</p>' }],
  }

  it("draws legacy's window: the years with the period's marked, the lists, the item and the events", async () => {
    const wrapper = await mountWith(StandaloneHistoricalCrossRef, { props })
    expect(wrapper.find('.mwnf-standalone-window__heading').text()).toBe('Timeline')
    const years = wrapper.findAll('.mwnf-standalone-hcr__years span')
    expect(years.map((y) => Number(y.text()))).toEqual(Array.from({ length: 14 }, (_, i) => 1350 + 50 * i))
    expect(years.filter((y) => y.classes('mwnf-standalone-hcr__year--active')).map((y) => y.text())).toEqual(['1450'])
    expect(wrapper.findAll('.mwnf-standalone-hcr__title').map((p) => p.text())).toEqual(['Get dates for', 'Time Range'])
    expect(wrapper.find('select').element.value).toBe('egy')
    expect(wrapper.findAll('select')[1].element.value).toBe('1450')
    expect(wrapper.find('.mwnf-standalone-hcr__left strong').text()).toBe('Sword')
    expect(wrapper.findAll('.mwnf-standalone-hcr__left br')).toHaveLength(4)
    expect(wrapper.find('.mwnf-standalone-hcr__main h3').text()).toBe('Egypt - 1450 - 1500 A.D.')
    expect(wrapper.findAll('.mwnf-standalone-hcr__event b').map((b) => b.text())).toEqual(['1468 A.D.', '1492 A.D.'])
    await wrapper.findAll('select')[1].setValue('1400')
    expect(wrapper.emitted('change')[0][0]).toEqual({ key: 'start', value: '1400' })
  })

  it("keeps legacy's scale inside 2000 for a late period", async () => {
    const wrapper = await mountWith(StandaloneHistoricalCrossRef, { props: { ...props, start: 1900, end: 2000 } })
    expect(wrapper.find('.mwnf-standalone-hcr__years span').text()).toBe('1350')
  })
})

describe('StandaloneTimelineEntrance', () => {
  const props = {
    labels: { selectCountry: 'Select a Country', allCountries: 'All countries', startDate: 'Start Date', endDate: 'End Date', go: 'Go' },
    alerts: { country: 'Please select country', countryOrDates: 'Please select country or dates', startDate: 'Please select start date', endDate: 'Please select end date', period: 'Please select correct time period' },
    countries: [{ value: 'egy', label: 'Egypt' }],
    starts: [{ value: 1000, label: '1000 A.D.' }, { value: 1100, label: '1100 A.D.' }],
    ends: [{ value: 1100, label: '1100 A.D.' }, { value: 1200, label: '1200 A.D.' }],
  }

  it("draws legacy's three lists and Go, and says what is missing as legacy's alert did", async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const wrapper = await mountWith(StandaloneTimelineEntrance, { props })
    const selects = wrapper.findAll('select')
    expect(selects[0].findAll('option').map((o) => o.text())).toEqual(['Select a Country', 'All countries', 'Egypt'])
    expect(selects[1].findAll('option').map((o) => o.text())).toEqual(['Start Date', '1000 A.D.', '1100 A.D.'])
    await wrapper.find('form').trigger('submit')
    expect(alert).toHaveBeenLastCalledWith('Please select country')
    await selects[0].setValue('')
    await wrapper.find('form').trigger('submit')
    expect(alert).toHaveBeenLastCalledWith('Please select country or dates')
    await selects[1].setValue('1100')
    await wrapper.find('form').trigger('submit')
    expect(alert).toHaveBeenLastCalledWith('Please select end date')
    expect(wrapper.emitted('search')).toBeUndefined()
    await selects[2].setValue('1100')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('search')[0][0]).toEqual({ country: '', start: 1100, end: 1100 })
    await selects[0].setValue('egy')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('search')[1][0]).toEqual({ country: 'egy', start: 1100, end: 1100 })
    alert.mockRestore()
  })
})

describe('StandaloneTimelineResults', () => {
  const props = {
    heading: 'Timeline',
    summary: '1000 A.D.to 1200 A.D. | EGYPT',
    selects: [
      { key: 'start', label: 'Start Date', value: '1000', options: [{ value: '1000', label: '1000 A.D.' }] },
      { key: 'country', label: 'Country', value: 'egy', options: [{ value: '', label: 'All countries' }, { value: 'egy', label: 'Egypt' }] },
      { key: 'theme', label: 'Theme', value: '', disabled: true, options: [{ value: '', label: 'Select a Theme' }] },
    ],
    back: [{ label: 'Back', history: true }, { label: 'Timeline start page', href: '#/timeline' }],
    heads: { date: 'Date', countryDescription: 'Country | Description' },
    rows: [{ id: 'a', date: '1087 A.D.', country: 'Egypt', html: '<p>Badr Al-Jamali consolidates Cairo’s walls.</p>' }],
    empty: 'No data',
    related: { heading: 'Related Content', gallery: { label: 'See Gallery', href: '#/timeline/gallery', title: 'The objects' } },
    download: { heading: 'Download', pdf: 'As PDF (including images)', word: 'As Word (text only)', file: 'DIA_egy-1000-1200-en.doc', title: 'MWNF', line: 'TIMELINE | 1000 to 1200 | EGYPT' },
  }

  it("draws legacy's band, the way back, the events and the Related Content column", async () => {
    const wrapper = await mountWith(StandaloneTimelineResults, { props })
    expect(wrapper.find('.mwnf-standalone-tlr__summary').text()).toBe('Timeline | 1000 A.D.to 1200 A.D. | EGYPT')
    expect(wrapper.findAll('.mwnf-standalone-tlr__selects label').map((l) => l.text())).toEqual(['Start Date', 'Country', 'Theme'])
    expect(wrapper.findAll('select')[2].element.disabled).toBe(true)
    expect(wrapper.findAll('.mwnf-standalone-item__back-link').map((l) => l.text())).toEqual(['Back', 'Timeline start page'])
    expect(wrapper.findAll('.mwnf-standalone-tlr__heads h3').map((h) => h.text())).toEqual(['Date', 'Country | Description'])
    const row = wrapper.find('.mwnf-standalone-tlr__row')
    expect(row.find('.mwnf-standalone-tlr__date span').text()).toBe('1087 A.D.')
    expect(row.find('.mwnf-standalone-tlr__content span').text()).toBe('Egypt')
    expect(row.find('.mwnf-standalone-tlr__content div').text()).toContain('Badr Al-Jamali')
    expect(wrapper.find('.mwnf-standalone-tlr__related strong').text()).toBe('Related Content')
    expect(wrapper.findAll('.mwnf-standalone-tlr__related a').map((a) => a.text())).toEqual(['See Gallery', 'As PDF (including images)', 'As Word (text only)'])
    await wrapper.findAll('select')[1].setValue('')
    expect(wrapper.emitted('change')[0][0]).toEqual({ key: 'country', value: '' })
  })

  it("lists the product's related links in their order, and its pictures under each date", async () => {
    const related = {
      heading: 'Related Context',
      links: [
        { label: 'Add Thematic Timeline', href: '#/timeline/results?theme=all' },
        { label: 'See Gallery', href: '#/timeline/gallery', target: '_blank' },
      ],
    }
    const wrapper = await mountWith(StandaloneTimelineResults, {
      props: { ...props, related },
      slots: { media: '<template #media="{ row }"><p class="media">{{ row.id }}</p></template>' },
    })
    expect(wrapper.find('.mwnf-standalone-tlr__date .media').text()).toBe('a')
    const links = wrapper.findAll('.mwnf-standalone-tlr__related a')
    expect(links.map((a) => a.text())).toEqual(['Add Thematic Timeline', 'See Gallery', 'As PDF (including images)', 'As Word (text only)'])
    expect(links[1].attributes('target')).toBe('_blank')
  })

  it('prints for As PDF, and says when nothing matched', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = await mountWith(StandaloneTimelineResults, { props: { ...props, rows: [], related: null } })
    expect(wrapper.find('.mwnf-standalone-tlr__heads').exists()).toBe(false)
    expect(wrapper.find('.mwnf-standalone-tlr__empty').text()).toBe('No data')
    await wrapper.findAll('.mwnf-standalone-tlr__related a')[0].trigger('click')
    expect(print).toHaveBeenCalled()
    print.mockRestore()
  })

  it("writes every event into legacy's Word table", () => {
    const html = timelineDocument({
      title: 'MWNF', heading: 'TIMELINE | 1000 to 1200 | EGYPT', heads: props.heads,
      rows: [...props.rows, { id: 'b', date: '1099 A.D.', country: 'Egypt', html: '<p>Fall of Jerusalem.</p>' }],
    })
    expect(html).toContain('<b>TIMELINE </b>| 1000 to 1200 | EGYPT')
    expect(html).toContain('<b>Country | Description</b>')
    expect(html.match(/&nbsp;1\d{3} A\.D\./g)).toEqual(['&nbsp;1087 A.D.', '&nbsp;1099 A.D.'])
    expect(html).toContain('<span>Fall of Jerusalem.</span>')
    expect(timelineDocument({ empty: 'No data' })).toContain('No data')
  })

  it("writes Sharing History's three columns, the theme beside the country", () => {
    const html = timelineDocument({
      heading: 'TIMELINE / Before 1800 to After 1930 / AUSTRIA / POLITICAL CONTEXT',
      heads: { date: 'Date', country: 'Country', theme: 'Theme' },
      rows: [{ id: 'a', date: '1797', country: 'Austria', theme: 'Political Context', html: '<p>Peace of Campo Formio.</p>' }],
    })
    expect(html).toContain('<b>TIMELINE </b>/ Before 1800 to After 1930 / AUSTRIA / POLITICAL CONTEXT')
    expect(html).toContain('<b>Theme</b>')
    expect(html).toContain('<td style="padding:5px;">Political Context</td>')
    expect(html).toContain('colspan="3">Peace of Campo Formio.</td>')
  })
})

describe('StandaloneDatabaseForm', () => {
  const labels = {
    criteria: 'Enter your criteria:', keywords: 'Keywords', category: 'Category', in: 'in', and: 'and', or: 'or',
    date: 'Date', from: 'From', to: 'To', language: 'Language', go: 'Go', listing: 'Complete listing', listingTooltip: 'All of it',
  }
  const props = {
    labels,
    fields: [{ value: 'keyword', label: 'Keyword(s)' }, { value: 'name', label: 'Name' }],
    fromYears: [1501, 1601], toYears: [1600, 1700],
    languages: [{ code: 'cs', name: 'Czech' }, { code: 'en', name: 'English' }],
    listingHref: 'https://example.org/listing',
  }

  it("draws legacy's three keyword rows, the dates, the language, Go and the listing link", async () => {
    const wrapper = await mountWith(StandaloneDatabaseForm, { props })
    expect(wrapper.find('.mwnf-standalone-db__criteria').text()).toBe('Enter your criteria:')
    expect(wrapper.findAll('.mwnf-standalone-db__keyword')).toHaveLength(3)
    expect(wrapper.findAll('.mwnf-standalone-db__cond')).toHaveLength(2)
    expect(wrapper.findAll('.mwnf-standalone-db__field option').map((o) => o.text()).slice(0, 2)).toEqual(['Keyword(s)', 'Name'])
    expect(wrapper.findAll('.mwnf-standalone-db__language option').map((o) => o.text())).toEqual(['', 'Czech', 'English'])
    expect(wrapper.find('.mwnf-standalone-db__listing a').attributes()).toMatchObject({ href: 'https://example.org/listing', title: 'All of it' })
    expect(wrapper.classes()).not.toContain('mwnf-standalone-db--options')
    expect(wrapper.find('.mwnf-standalone-db__aside').exists()).toBe(false)
  })

  it('emits the rows, the dates and the language on Go', async () => {
    const wrapper = await mountWith(StandaloneDatabaseForm, { props })
    const inputs = wrapper.findAll('.mwnf-standalone-db__keyword')
    await inputs[0].setValue(' angel ')
    await inputs[1].setValue('Brno')
    await wrapper.findAll('.mwnf-standalone-db__field select')[1].setValue('name')
    await wrapper.findAll('.mwnf-standalone-db__cond')[0].setValue('OR')
    await wrapper.findAll('.mwnf-standalone-db__dates select')[0].setValue('1601')
    await wrapper.find('.mwnf-standalone-db__language select').setValue('cs')
    await wrapper.find('form').trigger('submit')
    const [payload] = wrapper.emitted('search')[0]
    expect(payload.rows.slice(0, 2)).toEqual([
      { keyword: 'angel', field: 'keyword', cond: 'AND' },
      { keyword: 'Brno', field: 'name', cond: 'OR' },
    ])
    expect(payload).toMatchObject({ from: 1601, to: '' })
    expect(wrapper.emitted('update:language')[0]).toEqual(['cs'])
  })

  it('names a year by its own label', async () => {
    const wrapper = await mountWith(StandaloneDatabaseForm, {
      props: { ...props, fromYears: [{ value: 0, label: 'Before 1800' }, 1800], toYears: [1800, { value: 2100, label: 'After 1930' }] },
    })
    const [from, to] = wrapper.findAll('.mwnf-standalone-db__dates select')
    expect(from.findAll('option').map((o) => [o.attributes('value'), o.text()])).toEqual([['', 'From'], ['0', 'Before 1800'], ['1800', '1800']])
    expect(to.findAll('option').map((o) => o.text())).toEqual(['To', '1800', 'After 1930'])
  })

  it('takes an options row and a last-column link', async () => {
    const wrapper = await mountWith(StandaloneDatabaseForm, {
      props,
      slots: { options: '<label class="opt">Include more</label>', aside: '<a href="#/glossary">Glossary</a>' },
    })
    expect(wrapper.classes()).toContain('mwnf-standalone-db--options')
    expect(wrapper.find('.mwnf-standalone-db__options .opt').text()).toBe('Include more')
    expect(wrapper.find('.mwnf-standalone-db__aside a').text()).toBe('Glossary')
  })
})

describe('StandaloneSponsorList', () => {
  const back = [{ label: 'Back', history: true }, { label: 'Partner Museums', href: '#/partners/results?type=museum' }]

  it("draws legacy's international list: a sponsor's name, web address and logo, no label column", async () => {
    const rows = [{ name: 'Euromed Heritage', web: 'www.euromedheritage.net', remarks: '', logo: '/s/21.jpg' }]
    const wrapper = await mountWith(StandaloneSponsorList, { props: { heading: 'International Sponsors', rows, back } })
    expect(wrapper.findAll('.mwnf-standalone-item__back-link').map((l) => l.text())).toEqual(['Back', 'Partner Museums'])
    expect(wrapper.find('.mwnf-standalone-sp__heading').text()).toBe('International Sponsors')
    expect(wrapper.classes()).not.toContain('mwnf-standalone-sp--labels')
    expect(wrapper.find('.mwnf-standalone-sp__label').exists()).toBe(false)
    expect(wrapper.findAll('.mwnf-standalone-sp__text p').map((p) => p.text())).toEqual(['Euromed Heritage', 'www.euromedheritage.net'])
    expect(wrapper.find('.mwnf-standalone-sp__text a').attributes('href')).toBe('http://www.euromedheritage.net')
    expect(wrapper.find('.mwnf-standalone-sp__logo img').attributes()).toMatchObject({ src: '/s/21.jpg', alt: 'Euromed Heritage' })
  })

  it("draws the local list's label column, the region line and the remarks in italics", async () => {
    const rows = [
      { label: 'ITALY/  \nROME', region: '', name: 'Comune di Roma', web: '', remarks: '*Main* sponsor', logo: '' },
      { label: '', region: 'Tyrol', name: 'Land Tirol', web: '', remarks: '', logo: '' },
    ]
    const wrapper = await mountWith(StandaloneSponsorList, { props: { heading: 'Local Sponsors', rows } })
    expect(wrapper.classes()).toContain('mwnf-standalone-sp--labels')
    const labels = wrapper.findAll('.mwnf-standalone-sp__label')
    expect(labels[0].html()).toContain('ITALY/<br')
    expect(labels[1].text()).toBe('')
    expect(wrapper.find('.mwnf-standalone-sp__remarks em').text()).toBe('Main')
    expect(wrapper.findAll('.mwnf-standalone-sp__row')[1].findAll('.mwnf-standalone-sp__text p').map((p) => p.text())).toEqual(['Tyrol', 'Land Tirol'])
    expect(wrapper.find('.mwnf-standalone-sp__logo img').exists()).toBe(false)
  })
})

describe('StandalonePartnersEntrance', () => {
  const projects = [
    {
      name: 'Discover Islamic Art',
      about: 'Information about the Partners who set up *Discover Islamic Art*.',
      links: [
        { label: 'Partner Museums', href: '#/partners/results?type=museum' },
        { label: 'Credits', href: 'https://www.museumwnf.org/about/credits' },
      ],
    },
    { name: 'Explore Islamic Art Collections', about: '', links: [{ label: 'Partners', href: '#/partners/explore' }] },
  ]

  it("draws legacy's rows: the name in its box, a blank line, About, then the links", async () => {
    const wrapper = await mountWith(StandalonePartnersEntrance, { props: { projects, aboutLabel: 'About', closeLabel: 'Close' } })
    const rows = wrapper.findAll('.mwnf-standalone-pe__row')
    expect(rows.map((row) => row.find('.mwnf-standalone-pe__name').text())).toEqual(['Discover Islamic Art', 'Explore Islamic Art Collections'])
    expect(rows[0].findAll('.mwnf-standalone-pe__links p').map((p) => p.text())).toEqual(['', 'About', 'Partner Museums', 'Credits'])
    expect(rows[0].findAll('.mwnf-standalone-pe__links a').map((a) => a.attributes('href'))).toEqual(['#/partners/results?type=museum', 'https://www.museumwnf.org/about/credits'])
    // A project without a text has no About.
    expect(rows[1].find('.mwnf-standalone-pe__about').exists()).toBe(false)
    expect(wrapper.find('.mwnf-standalone-pe__popup').exists()).toBe(false)
  })

  it('opens the text over the dimmed page, and closes it from the × or the page', async () => {
    const wrapper = await mountWith(StandalonePartnersEntrance, { props: { projects, aboutLabel: 'About', closeLabel: 'Close' } })
    await wrapper.find('.mwnf-standalone-pe__about button').trigger('click')
    expect(wrapper.find('.mwnf-standalone-pe__text em').text()).toBe('Discover Islamic Art')
    expect(wrapper.find('.mwnf-standalone-pe__close').attributes('aria-label')).toBe('Close')
    await wrapper.find('.mwnf-standalone-pe__close').trigger('click')
    expect(wrapper.find('.mwnf-standalone-pe__popup').exists()).toBe(false)
    await wrapper.find('.mwnf-standalone-pe__about button').trigger('click')
    await wrapper.find('.mwnf-standalone-pe__shade').trigger('click')
    expect(wrapper.find('.mwnf-standalone-pe__shade').exists()).toBe(false)
  })
})

describe('StandaloneRefine', () => {
  const props = {
    label: 'Refine your search:', inLabel: 'in', searchLabel: 'Search', newSearchLabel: 'New Search', newSearch: '/database',
    fields: [{ value: 'keyword', label: 'Keyword(s)' }, { value: 'name', label: 'Name' }],
  }

  it("draws legacy's band and searches within the results for a word in a field", async () => {
    const wrapper = await mountWith(StandaloneRefine, { props })
    expect(wrapper.findAll('.mwnf-standalone-refine__label').map((l) => l.text())).toEqual(['Refine your search:', 'in'])
    expect(wrapper.find('.mwnf-standalone-refine__button--new').attributes('href')).toContain('/database')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('search')).toBeUndefined()
    await wrapper.find('input').setValue(' Cairo ')
    await wrapper.find('select').setValue('name')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('search')).toEqual([[{ keyword: 'Cairo', field: 'name' }]])
  })
})

describe('StandalonePagination', () => {
  const labels = { previousLabel: 'Previous', nextLabel: 'Next' }
  const at = (currentPage, lastPage) => ({ pageInfo: { currentPage, lastPage }, ...labels })
  const numbers = (wrapper) => wrapper.findAll('.mwnf-standalone-pages__number').map((a) => a.text())

  it("lists legacy's block of twenty pages around the current one, the current underlined", async () => {
    const first = await mountWith(StandalonePagination, { props: at(11, 27) })
    expect(numbers(first)).toEqual(Array.from({ length: 20 }, (_, i) => String(i + 1)))
    expect(first.find('.mwnf-standalone-pages__number--active').text()).toBe('11')
    const second = await mountWith(StandalonePagination, { props: at(21, 27) })
    expect(numbers(second)).toEqual(['21', '22', '23', '24', '25', '26', '27'])
  })

  it('leaves "Previous" and "Next" as plain words at the ends, and links them elsewhere', async () => {
    const start = await mountWith(StandalonePagination, { props: at(1, 7) })
    expect(start.find('.mwnf-standalone-pages__previous a').exists()).toBe(false)
    expect(start.find('.mwnf-standalone-pages__previous').text()).toBe('Previous')
    await start.find('.mwnf-standalone-pages__next a').trigger('click')
    expect(start.emitted('navigate')).toEqual([[2]])

    const end = await mountWith(StandalonePagination, { props: at(7, 7) })
    expect(end.find('.mwnf-standalone-pages__next a').exists()).toBe(false)
    await end.findAll('.mwnf-standalone-pages__number')[2].trigger('click')
    expect(end.emitted('navigate')).toEqual([[3]])
  })

  it('draws nothing for a single page', async () => {
    const wrapper = await mountWith(StandalonePagination, { props: at(1, 1) })
    expect(wrapper.find('.mwnf-standalone-pages').exists()).toBe(false)
  })
})

describe('the sheet as a Word document', () => {
  it('writes each label as a heading and each value as a paragraph, the page’s controls and links left out', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <dl class="mwnf-sheet">
        <dt class="mwnf-sheet__label">Name of Object:</dt>
        <dd class="mwnf-sheet__value">Five <i>textile</i> fragments<button>×</button></dd>
      </dl>
      <section class="mwnf-sheet-section"><h2 class="mwnf-sheet-section__heading">Description:</h2>
        <div class="mwnf-sheet-section__body"><p>About the <a href="#/glossary">Tulunids</a>.</p><p>Second part.</p><img src="x.jpg"></div></section>
      <section class="mwnf-credits"><h2 class="mwnf-credits__heading" hidden>Credits</h2>
        <dl class="mwnf-credits__list"><dt>Prepared by:</dt><dd>A. Author<span role="tooltip">Bio</span></dd></dl></section>
      <div class="mwnf-standalone-related"><dt class="mwnf-sheet__label">Related</dt></div>`
    const html = sheetDocument(root, { title: 'MWNF - Discover Islamic Art' })
    expect(html).toContain('<title>MWNF - Discover Islamic Art</title>')
    expect(html).toContain('<h3>Name of Object:</h3>')
    expect(html).toContain('<p>Five <i>textile</i> fragments</p>')
    expect(html).toContain('<h3>Description:</h3>')
    expect(html).toContain('<p>About the Tulunids.<br/>\n<br/>Second part.</p>')
    expect(html).toContain('<p>Prepared by: A. Author</p>')
    expect(html).not.toContain('Credits</h3>')
    expect(html).not.toContain('Related')
    expect(html).not.toContain('<img')
  })

  it('offers As Word only where the site names it', async () => {
    const without = await mountWith(RelatedContent, { props: { download: { heading: 'site.nav.database', print: 'site.nav.home' } } })
    expect(without.find('.mwnf-standalone-related__word').exists()).toBe(false)
    const withWord = await mountWith(RelatedContent, { props: { download: { heading: 'site.nav.database', print: 'site.nav.home', word: 'site.nav.portal' } } })
    expect(withWord.find('.mwnf-standalone-related__word').text()).toBe('MWNF Portal')
  })
})

describe('the standalone windows', () => {
  const labels = {
    heading: 'Glossary & Spelling',
    intro: 'Enter the first letter(s) of the term.',
    definition: 'Definition',
    spellings: 'Spellings used in the database',
    spellingsNote: 'The list below refers to all languages.',
    close: 'Close',
  }

  it('draws a route marked bare alone, without the chrome', async () => {
    const wrapper = await mountWith(StandaloneShell, { route: '/glossary-spelling', props: { languages: ['en'], language: 'en' }, slots: { default: '<p class="page">window</p>' } })
    expect(wrapper.find('.mwnf-standalone--bare .page').exists()).toBe(true)
    expect(wrapper.find('header').exists()).toBe(false)
    expect(wrapper.find('footer').exists()).toBe(false)
  })

  it('heads the window and closes it from its ×', async () => {
    const wrapper = await mountWith(StandaloneWindow, { props: { heading: 'Glossary & Spelling', closeLabel: 'Close' }, slots: { default: '<p class="body">body</p>' } })
    expect(wrapper.find('.mwnf-standalone-window__heading').text()).toBe('Glossary & Spelling')
    expect(wrapper.find('.mwnf-standalone-window__close').attributes('aria-label')).toBe('Close')
    expect(wrapper.find('.mwnf-standalone-window__article .body').exists()).toBe(true)
  })

  it('suggests the spellings the letters start, then shows the term and every spelling it has', async () => {
    await loadEntities(['glossary'])
    const { loadTranslations } = useDataPackage()
    await Promise.all(['en', 'fr'].map((language) => loadTranslations('glossary', language)))
    const wrapper = await mountWith(StandaloneGlossarySpelling, { props: { language: 'en', labels } })
    expect(wrapper.find('.mwnf-standalone-glossary__intro').text()).toBe(labels.intro)
    const input = wrapper.find('.mwnf-standalone-glossary__input')
    await input.setValue('KU')
    await settle(() => wrapper.find('.mwnf-standalone-glossary__suggestion').exists())
    const suggestions = wrapper.findAll('.mwnf-standalone-glossary__suggestion')
    expect(suggestions.map((s) => s.text())).toEqual(['kufic', 'kufic script'])
    await suggestions[0].trigger('mousedown')
    expect(input.element.value).toBe('kufic')
    expect(wrapper.find('.mwnf-standalone-glossary__suggestions').exists()).toBe(false)
    expect(wrapper.find('.mwnf-standalone-glossary__definition').text()).toBe('An angular Arabic script.')
    expect(wrapper.findAll('.mwnf-standalone-glossary__spellings li').map((li) => li.text())).toEqual(['kufic', 'kufic script', 'coufique', 'écriture coufique'])
  })

  it('suggests nothing for letters no spelling starts', async () => {
    const wrapper = await mountWith(StandaloneGlossarySpelling, { props: { language: 'en', labels } })
    await settle(() => true, 50)
    await wrapper.find('.mwnf-standalone-glossary__input').setValue('zz')
    expect(wrapper.find('.mwnf-standalone-glossary__suggestions').exists()).toBe(false)
    expect(wrapper.find('.mwnf-standalone-glossary__label').exists()).toBe(false)
  })
})