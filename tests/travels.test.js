import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { byId, loadEntities, useDataPackage, useSiteConfig } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import {
  bookLink, countryCode, galleryOf, inMenu, isListed, itineraryNumber, lines, mainLocations, neighbours, projectCode, TRAVEL_ENTITIES, TravelsShell,
  travelsConfig, travelsRoutes,
} from '../src/travels/index.js'
import { layoutTexts } from './helpers.js'
import { settle } from './dxa/helpers.js'

// The Travels site's pages (inventory-app#2543): legacy travels.museumwnf.org's
// Exhibition Trails, mounted against the fixture package's trail tree.

const texts = {
  ...layoutTexts,
  'core.detail.notFound': 'This record does not exist.',
  'core.footer.aboutMwnf': 'About MWNF',
  'core.footer.contact': 'Contact',
  'core.footer.credits': 'Credits',
  'core.footer.cookies': 'Cookies',
  'core.footer.copyright': '© Museum With No Frontiers (MWNF)',
  'travels.header.title': 'MWNF Travel',
  'travels.header.homeTip': 'Return to MWNF Travel homepage',
  'travels.header.portal': 'MWNF Portal',
  'travels.header.portalTip': 'Return to MWNF Portal homepage',
  'travels.header.books': 'MWNF Books',
  'travels.nav.home': 'Home',
  'travels.nav.exhibitionTrails': 'Exhibition Trails',
  'travels.home.about': 'About',
  'travels.home.intro': 'MWNF Exhibition Trails: discover artefacts.',
  'travels.home.country': 'Country',
  'travels.home.theme': 'Theme',
  'travels.home.selectCountry': 'Select Country',
  'travels.home.selectTheme': 'Select Theme',
  'travels.list.countryIntro': 'On these pages you will find information about the MWNF Exhibition Trails in',
  'travels.list.themeIntro': 'Eleven Exhibition Trails invite you.',
  'travels.trail.country': 'Country',
  'travels.trail.region': 'Region',
  'travels.trail.availableIn': 'Available in',
  'travels.trail.mainLocations': 'Main locations visited',
  'travels.trail.virtualVisit': 'Virtual visit in',
  'travels.trail.travelBook': 'Relevant MWNF Travel Book',
  'travels.trail.seeAlso': 'See Also',
  'travels.trail.about': 'About this Exhibition Trail',
  'travels.trail.itineraries': 'View Itineraries',
  'travels.trail.itinerariesTip': 'Take a virtual tour',
  'travels.trail.curators': 'Curators and Photographers',
  'travels.trail.description': 'Description',
  'travels.trail.curatedBy': 'Curators',
  'travels.trail.photographers': 'Photographer(s)',
  'travels.itinerary.label': 'Itinerary',
  'travels.itinerary.gallery': 'View Image Gallery',
  'travels.itinerary.galleryTip': 'To be seen in this Itinerary',
  'travels.itinerary.about': 'About this Itinerary',
  'travels.itinerary.galleryHeading': 'Image Gallery',
  'travels.itinerary.previous': 'Previous Itinerary',
  'travels.itinerary.next': 'Next Itinerary',
  'travels.action.back': 'Back',
  'travels.picture.enlarge': 'Click to see enlarged image',
}

async function mountSite(path) {
  await loadEntities(TRAVEL_ENTITIES)
  const pkg = useDataPackage()
  await Promise.all(['collections', 'countries'].map((entity) => pkg.loadTranslations(entity, 'en')))
  useSiteConfig().languages = ['en']
  const i18n = createI18n({ locale: 'en', messages: { en: texts } })
  const router = createRouter({ history: createMemoryHistory(), routes: travelsRoutes() })
  await router.push(path)
  await router.isReady()
  const App = {
    components: { TravelsShell },
    template: '<TravelsShell :languages="[{ code: \'en\', label: \'English\' }]" language="en"><router-view /></TravelsShell>',
  }
  const wrapper = mount(App, { global: { plugins: [i18n, router] } })
  await settle(() => true, 2)
  return { wrapper, router }
}

describe('the rules legacy printed by', () => {
  it('reads the project and the itinerary’s number from the keys, and hides GPA', () => {
    expect(projectCode({ backward_compatibility: 'mwnf3_travels:trail:IAM:tn:1' })).toBe('IAM')
    expect(itineraryNumber({ backward_compatibility: 'mwnf3_travels:itinerary:IAM:tn:1:IV' })).toBe('IV')
    expect(isListed({ backward_compatibility: 'mwnf3_travels:trail:GPA:pt:1' })).toBe(false)
    expect(isListed({ backward_compatibility: 'mwnf3_travels:trail:IAM:pt:1' })).toBe(true)
  })

  it('leaves Algeria out of the menu, as legacy’s hand-written menu did', () => {
    expect(countryCode({ backward_compatibility: 'mwnf3_travels:trail:IAM:dz:1' })).toBe('dz')
    expect(inMenu({ backward_compatibility: 'mwnf3_travels:trail:IAM:dz:1' })).toBe(false)
    expect(inMenu({ backward_compatibility: 'mwnf3_travels:trail:IAM:tn:1' })).toBe(true)
  })

  it('lists main locations once each, alphabetically, and a text’s lines', () => {
    expect(mainLocations(['TUNIS', 'BIZERTE', 'TUNIS', '', null])).toEqual(['BIZERTE', 'TUNIS'])
    expect(lines('Jamila Binous  \nNaceur Baklouti\n')).toEqual(['Jamila Binous', 'Naceur Baklouti'])
  })

  it('finds an itinerary’s neighbours, and links the book in the page’s language', () => {
    const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(neighbours(rows, 'a')).toEqual({ previous: null, next: { id: 'b' } })
    expect(neighbours(rows, 'b')).toEqual({ previous: { id: 'a' }, next: { id: 'c' } })
    expect(bookLink({ publications: [{ url: 'https://x.org/publications/#/publication/p' }] }, 'fr')).toBe('https://x.org/publications/#/publication/p/fr')
    expect(bookLink({ publications: [] }, 'fr')).toBeNull()
  })

  it('gathers an itinerary’s gallery as legacy did: locations, their monuments, then its own', async () => {
    const [collections] = await loadEntities(['collections', 'items'])
    const itinerary = collections.find((c) => c.id === 'tr-it-2')
    expect(galleryOf(collections, itinerary, byId('items').value).map((p) => [p.url.split('/').pop(), p.caption])).toEqual([
      ['palace-1.jpg', 'Nejma al-Zahra, great salon.'],
      ['palace-2.jpg', 'Cloister.'],
      ['itinerary-2.jpg', 'The itinerary'],
    ])
  })
})

describe('the Travels pages', () => {
  it('draws the frame: its heading, the Exhibition Trails menu, and the footer', async () => {
    const { wrapper } = await mountSite('/')
    await settle(() => wrapper.find('.mwnf-travels-menu__children a').exists())
    expect(wrapper.find('.mwnf-travels-header__title').text().replace(/\s+/g, ' ')).toBe('MWNF Travel')
    const children = wrapper.findAll('.mwnf-travels-menu__children a')
    expect(children.map((a) => [a.text().replace(/\s+/g, ' '), a.attributes('href')])).toEqual([
      ['Discover Islamic Art (package)', '/trails?project=IAM'],
      ['Tunisia', '/trails?country=c-tn'],
    ])
    // The Publications site's address, from the trails' book links.
    expect(wrapper.findAll('.mwnf-travels-menu__entry > a')[1].attributes('href')).toBe('https://example.org/publications/')
    // One language: no switcher.
    expect(wrapper.find('.mwnf-travels-menu__language').exists()).toBe(false)
    expect(wrapper.find('.mwnf-travels-footer').text().replace(/\s+/g, ' ')).toContain('© Museum With No Frontiers (MWNF) 2004–')
    wrapper.unmount()
  })

  it('draws the Exhibition Trails page with its country and theme selects', async () => {
    const { wrapper, router } = await mountSite('/')
    expect(wrapper.find('.mwnf-travels-home__heading').text().replace(/\s+/g, ' ')).toBe('Exhibition Trails')
    expect(wrapper.find('.mwnf-travels-crumbs').text().replace(/\s+/g, ' ')).toBe('Home > Exhibition Trails')
    expect(wrapper.find('.mwnf-travels-home__about').text().replace(/\s+/g, ' ')).toContain('MWNF Exhibition Trails: discover artefacts.')
    const [countries, themes] = wrapper.findAll('.mwnf-travels-home select')
    expect(countries.findAll('option').map((o) => o.text().replace(/\s+/g, ' '))).toEqual(['Select Country', 'Tunisia'])
    expect(themes.findAll('option').map((o) => o.text().replace(/\s+/g, ' '))).toEqual(['Select Theme', 'Discover Islamic Art (package)'])
    await countries.setValue('c-tn')
    await settle(() => router.currentRoute.value.name === 'trails')
    expect(router.currentRoute.value.fullPath).toBe('/trails?country=c-tn')
    wrapper.unmount()
  })

  it('lists a country’s trails as legacy did', async () => {
    const { wrapper } = await mountSite('/trails?country=c-tn')
    await settle(() => wrapper.find('.mwnf-travels-trails__row').exists())
    expect(wrapper.find('.mwnf-travels-banner__heading').text().replace(/\s+/g, ' ')).toBe('Tunisia')
    expect(wrapper.find('.mwnf-travels-banner__about').text().replace(/\s+/g, ' ')).toContain('MWNF Exhibition Trails in Tunisia.')
    const rows = wrapper.findAll('.mwnf-travels-trails__row')
    expect(rows).toHaveLength(1)
    const row = rows[0]
    expect(row.find('img').attributes('src')).toContain('trail-cover.jpg')
    expect(row.find('.mwnf-travels-trails__title').text().replace(/\s+/g, ' ')).toBe('IFRIQIYA')
    expect(row.text().replace(/\s+/g, ' ')).toContain('Thirteen Centuries of Art')
    expect(row.text().replace(/\s+/g, ' ')).toContain('Region: all of Tunisia')
    expect(row.text().replace(/\s+/g, ' ')).toContain('Available in: English, Français')
    expect(row.text().replace(/\s+/g, ' ')).toContain('Main locations visited: SIDI BOU SAID, THE MARSA, TUNIS')
    expect(row.text().replace(/\s+/g, ' ')).not.toContain('Country:')
    const visit = row.find('.mwnf-travels-trails__visit a')
    expect(visit.text().replace(/\s+/g, ' ')).toBe('English >>')
    expect(visit.attributes('href')).toBe('/trail/tr-trail?lang=en')
    wrapper.unmount()
  })

  it('lists a theme’s trails with their country', async () => {
    const { wrapper } = await mountSite('/trails?project=IAM')
    await settle(() => wrapper.find('.mwnf-travels-trails__row').exists())
    expect(wrapper.find('.mwnf-travels-banner__heading').text().replace(/\s+/g, ' ')).toBe('Discover Islamic Art (package)')
    expect(wrapper.find('.mwnf-travels-banner__about').text().replace(/\s+/g, ' ')).toContain('Eleven Exhibition Trails invite you.')
    expect(wrapper.find('.mwnf-travels-trails__row').text().replace(/\s+/g, ' ')).toContain('Country: Tunisia')
    wrapper.unmount()
  })

  it('draws a trail’s itineraries, its book linked in the page’s language', async () => {
    const { wrapper } = await mountSite('/trail/tr-trail')
    await settle(() => wrapper.find('.mwnf-travels-itinerary-row').exists())
    expect(wrapper.find('.mwnf-travels-crumbs').text().replace(/\s+/g, ' ')).toBe('Home > Exhibition Trails > Tunisia > IFRIQIYA')
    const band = wrapper.find('.mwnf-travels-detail-band')
    expect(band.text().replace(/\s+/g, ' ')).toContain('IFRIQIYA')
    expect(band.text().replace(/\s+/g, ' ')).toContain('Region: all of Tunisia')
    expect(band.find('.mwnf-travels-detail-band__book a').attributes('href')).toBe('https://example.org/publications/#/publication/pub-trail/en')
    expect(band.find('.mwnf-travels-detail-band__book-label').text().replace(/\s+/g, ' ')).toBe('Relevant MWNF Travel Book')
    const tabs = wrapper.findAll('.mwnf-travels-see-also__tab')
    expect(tabs.map((tab) => tab.text().replace(/\s+/g, ' '))).toEqual(['About this Exhibition Trail', 'View Itineraries', 'Curators and Photographers'])
    expect(wrapper.find('.mwnf-travels-see-also__tab--active').text().replace(/\s+/g, ' ')).toBe('View Itineraries')
    const rows = wrapper.findAll('.mwnf-travels-itinerary-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].text().replace(/\s+/g, ' ')).toContain('Itinerary I :')
    expect(rows[0].text().replace(/\s+/g, ' ')).toContain('The Medina >>')
    expect(rows[0].text().replace(/\s+/g, ' ')).toContain('Main locations visited: TUNIS')
    expect(rows[0].find('img').attributes('src')).toContain('medina-1.jpg')
    expect(rows[1].findAll('a').map((a) => a.attributes('href'))).toEqual(['/itinerary/tr-it-2?tab=des', '/itinerary/tr-it-2?tab=vl'])
    expect(rows[1].text().replace(/\s+/g, ' ')).toContain('Main locations visited: SIDI BOU SAID, THE MARSA')
    wrapper.unmount()
  })

  it('draws a trail’s description and its curators', async () => {
    let { wrapper } = await mountSite('/trail/tr-trail?tab=desc')
    await settle(() => wrapper.find('.mwnf-travels-content__prose').exists())
    expect(wrapper.find('.mwnf-travels-content h2').text().replace(/\s+/g, ' ')).toBe('Description')
    expect(wrapper.find('.mwnf-travels-content__prose em').text().replace(/\s+/g, ' ')).toBe('Aghlabid')
    wrapper.unmount();
    ({ wrapper } = await mountSite('/trail/tr-trail?tab=cur'))
    await settle(() => wrapper.find('.mwnf-travels-content__prose').exists())
    const prose = wrapper.find('.mwnf-travels-content__prose')
    expect(prose.findAll('strong').map((s) => s.text().replace(/\s+/g, ' '))).toEqual(['Curators', 'Photographer(s)'])
    expect(prose.text().replace(/\s+/g, ' ')).toContain('Jamila Binous')
    expect(prose.text().replace(/\s+/g, ' ')).toContain('Salah Jabeur')
    wrapper.unmount()
  })

  it('draws an itinerary’s description and its neighbours', async () => {
    const { wrapper } = await mountSite('/itinerary/tr-it-2')
    await settle(() => wrapper.find('.mwnf-travels-content__prose').exists())
    expect(wrapper.find('.mwnf-travels-crumbs').text().replace(/\s+/g, ' ')).toBe('Home > Exhibition Trails > Tunisia > IFRIQIYA > Itinerary II')
    expect(wrapper.find('.mwnf-travels-detail-band__itinerary').text().replace(/\s+/g, ' ')).toBe('ITINERARY II: The Summer Palaces')
    const neighbours = wrapper.find('.mwnf-travels-content__neighbours')
    expect(neighbours.text().replace(/\s+/g, ' ')).toBe('<< Previous Itinerary')
    expect(neighbours.find('a').attributes('href')).toBe('/itinerary/tr-it-1?tab=des')
    expect(wrapper.find('.mwnf-travels-content__prose').text().replace(/\s+/g, ' ')).toBe('A. Adorne describes the surroundings of Tunis.')
    wrapper.unmount()
  })

  it('draws an itinerary’s gallery: the picture, its caption, the thumbnails', async () => {
    const { wrapper } = await mountSite('/itinerary/tr-it-2?tab=vl')
    await settle(() => wrapper.find('.mwnf-travels-gallery__thumb').exists())
    expect(wrapper.find('.mwnf-travels-content h2').text().replace(/\s+/g, ' ')).toBe('Image Gallery')
    expect(wrapper.find('.mwnf-travels-gallery__picture').attributes('src')).toContain('palace-1.jpg')
    expect(wrapper.find('.mwnf-travels-gallery__caption').text().replace(/\s+/g, ' ')).toBe('Nejma al-Zahra, great salon.')
    const thumbs = wrapper.findAll('.mwnf-travels-gallery__thumb')
    expect(thumbs).toHaveLength(3)
    await thumbs[1].trigger('mouseover')
    expect(wrapper.find('.mwnf-travels-gallery__picture').attributes('src')).toContain('palace-2.jpg')
    expect(wrapper.find('.mwnf-travels-gallery__caption').text().replace(/\s+/g, ' ')).toBe('Cloister.')
    expect(wrapper.find('.mwnf-travels-content__neighbours a').text().replace(/\s+/g, ' ')).toBe('<< Previous Itinerary')
    expect(wrapper.find('.mwnf-travels-content__neighbours a').attributes('href')).toBe('/itinerary/tr-it-1?tab=vl')
    wrapper.unmount()
  })

  it('says when a trail does not exist', async () => {
    const { wrapper } = await mountSite('/trail/nope')
    expect(wrapper.find('.mwnf-travels-trail').text().replace(/\s+/g, ' ')).toBe('This record does not exist.')
    wrapper.unmount()
  })
})

describe('travelsConfig', () => {
  it('declares the routes the packages’ links assume, on the site’s own shell', () => {
    const config = travelsConfig({ datasetPackage: '@museumwnf/travels-data', origin: 'https://example.org/travels' })
    expect(config.extraViews.map((r) => [r.name, r.path])).toEqual([
      ['home', '/'], ['trails', '/trails'], ['trail', '/trail/:id'], ['itinerary', '/itinerary/:id'],
    ])
    expect(config.shell).toBe(TravelsShell)
    expect(config.languages).toEqual(['en'])
    for (const route of config.extraViews) expect(route.meta.entities).toEqual(TRAVEL_ENTITIES)
  })
})
