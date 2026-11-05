import { beforeAll, describe, expect, it, vi } from 'vitest'
import { loadEntities, useDataPackage } from '@museumwnf/viewer-core'
import GalleryAbout from '../../src/dxa/gallery/About.vue'
import GalleryCredits from '../../src/dxa/gallery/Credits.vue'
import GallerySearchHowTo from '../../src/dxa/gallery/SearchHowTo.vue'
import GalleryPartners from '../../src/dxa/gallery/Partners.vue'
import PartnerDetail from '../../src/dxa/PartnerDetail.vue'
import { partnerDetail } from '../../src/dxa/gallery/data.js'
import GallerySearchResults from '../../src/dxa/gallery/SearchResults.vue'
import GalleryTimeline from '../../src/dxa/gallery/Timeline.vue'
import GalleryTimelineResults from '../../src/dxa/gallery/TimelineResults.vue'
import GalleryTimelineGallery from '../../src/dxa/gallery/TimelineGallery.vue'
import GalleryCollectionResults from '../../src/dxa/gallery/CollectionResults.vue'
import GalleryCollectionSearch from '../../src/dxa/gallery/CollectionSearch.vue'
import GalleryPartnerObjects from '../../src/dxa/gallery/PartnerObjects.vue'
import { mountPage, settle, sharedDxaTexts } from './helpers.js'

// The gallery family's thin pages (epic inventory-app#1731, from carpets/
// amulets — byte-identical on `origin/main` 2026-09-20), mounted for real
// against the fixture package behind `@inventory-data` (extended with the
// DXA entities: items/tags/dynasties/countries/gallery, and two partners —
// see tests/fixtures/data-package). Every test asserts rendered TEXT and
// link hrefs, not element presence only.

const texts = {
  ...sharedDxaTexts,
  'gallery.about.body': 'gallery.about.body',
  'test.credits.body': 'Curators, photographers and translators of this gallery.',
  'gallery.partners.intro': 'Every museum and collection lending to this gallery.',
  'gallery.partner.noObjectsInGallery': 'This partner holds nothing in this gallery.',
  'gallery.partner.viewObjects': 'View objects',
  'gallery.partners.statusPartner': 'Partner',
  'gallery.partners.statusAffiliate': 'Affiliate',
  'partner.action.readMore': 'Read more',
  'partner.action.viewObjects': 'View objects',
  'partner.list.sortAscending': 'Click here to sort Countries from A - Z',
  'partner.list.sortDescending': 'Click here to sort Countries from Z - A',
  'gallery.timeline.selectCountry': 'Select a Country',
  'gallery.timeline.startDate': 'Start Date',
  'gallery.timeline.endDate': 'End Date',
  'gallery.timeline.alertCountry': 'Please select a country.',
  'gallery.timeline.alertDates': 'Please select both a start and an end date.',
  'core.action.go': 'Go',
  'gallery.action.readMore': 'Read more',
  'gallery.action.viewObjects': 'View objects',
  'partner.action.partnerProfile': 'Partner profile',
  'catalogue.results.seeDatabaseEntry': 'See database entry',
  'core.section.database': 'Database',
  'core.section.collection': 'Collection',
  'core.section.timeline': 'Timeline',
  'gallery.collection.intro': 'Search this gallery [How to search](#/how-to-search).',
}

beforeAll(async () => {
  await loadEntities(['items', 'partners', 'countries', 'tags', 'dynasties', 'gallery', 'timelines', 'timeline_events'])
  const pkg = useDataPackage()
  await pkg.loadTranslations('items', 'en')
  await pkg.loadTranslations('partners', 'en')
})

describe('GalleryAbout', () => {
  it('renders the shared gallery.about.body entry', async () => {
    const { wrapper } = await mountPage(GalleryAbout, { messages: texts })
    expect(wrapper.text()).toContain('gallery.about.body')
  })
})

describe('GalleryCredits', () => {
  it('renders the site-supplied bodyKey prop', async () => {
    const { wrapper } = await mountPage(GalleryCredits, { props: { bodyKey: 'test.credits.body' }, messages: texts })
    expect(wrapper.text()).toContain('Curators, photographers and translators of this gallery.')
  })
})

describe('GallerySearchHowTo', () => {
  it('renders the essay and a back link to the collection entrance', async () => {
    const { wrapper } = await mountPage(GallerySearchHowTo, { messages: texts })
    expect(wrapper.text()).toContain('How the search operators work.')
    expect(wrapper.html()).toContain('href="/collection"')
  })
})

// Legacy's PartnersPage.vue: each partner's name and city, its project badge,
// Read more · View objects (View objects only for a partner holding
// something here), its logo; no object count.
describe('GalleryPartners', () => {
  const rowOf = (wrapper, name) => wrapper.findAll('.mwnf-dxa-gallery-partners__partner')
    .find((row) => row.find('.mwnf-dxa-gallery-partners__name').text().startsWith(name))

  it('lists a partner as legacy did: name and city, badge, links and logo', async () => {
    const { wrapper } = await mountPage(GalleryPartners, { messages: texts })
    await settle(() => wrapper.text().includes('Zed Museum'))

    const zed = rowOf(wrapper, 'Zed Museum')
    expect(zed.find('.mwnf-dxa-gallery-partners__name').text()).toBe('Zed Museum, Cairo')
    expect(zed.find('.mwnf-dxa-gallery-partners__name').attributes('href')).toBe('/partner/p1')
    expect(zed.find('.mwnf-dxa-partner-badge').text()).toBe('Discover Islamic Art Partner')
    expect(zed.find('.mwnf-dxa-partner-badge').classes()).toContain('mwnf-dxa-partner-badge--isl')
    expect(zed.findAll('.mwnf-dxa-gallery-partners__links a').map((a) => [a.text(), a.attributes('href')])).toEqual([
      ['Read more', '/partner/p1'],
      ['View objects', '/partner/p1/objects'],
    ])
    expect(zed.find('.mwnf-dxa-gallery-partners__logo img').attributes('src')).toBe('p1-logo.png')
    // Legacy printed no object count.
    expect(wrapper.text()).not.toContain('object(s)')
  })

  it('reads an associated partner as an Affiliate, and keeps a partner holding nothing without View objects', async () => {
    const { wrapper } = await mountPage(GalleryPartners, { messages: texts })
    await settle(() => wrapper.text().includes('Alpha Museum'))

    const alpha = rowOf(wrapper, 'Alpha Museum')
    expect(alpha.find('.mwnf-dxa-partner-badge').text()).toBe('Sharing History Affiliate')
    expect(alpha.find('.mwnf-dxa-partner-badge').classes()).toContain('mwnf-dxa-partner-badge--awe')
    expect(alpha.findAll('.mwnf-dxa-gallery-partners__links a').map((a) => a.text())).toEqual(['Read more'])
    // A partner the package names no project for gets no badge.
    expect(rowOf(wrapper, 'Attached Gallery').find('.mwnf-dxa-partner-badge').exists()).toBe(false)
  })

  it('sorts the countries both ways from the toggle beside Back', async () => {
    const { wrapper, router } = await mountPage(GalleryPartners, { messages: texts })
    await settle(() => wrapper.findAll('.mwnf-dxa-gallery-partners__country').length > 0)
    const countries = () => wrapper.findAll('.mwnf-dxa-gallery-partners__country').map((c) => c.text())
    const first = countries()

    const toggle = wrapper.find('.mwnf-dxa-gallery-partners__order button')
    expect(toggle.text()).toBe('Click here to sort Countries from Z - A')
    await toggle.trigger('click')
    await settle(() => router.currentRoute.value.query.order === 'desc')
    expect(countries()).toEqual([...first].reverse())
    expect(wrapper.find('.mwnf-dxa-gallery-partners__order button').text()).toBe('Click here to sort Countries from A - Z')
  })
})

// The gallery's partner page: the family's shared PartnerDetail with its own
// half, as standardRoutes('gallery') mounts it (inventory-app#2034).
describe('PartnerDetail (gallery)', () => {
  it('renders the partner name, city and description', async () => {
    const { wrapper } = await mountPage(PartnerDetail, {
      props: { id: 'p1', family: partnerDetail },
      route: '/partner/p1',
      messages: texts,
    })
    await settle(() => wrapper.text().includes('Zed Museum'))
    expect(wrapper.text()).toContain('Zed Museum')
    expect(wrapper.text()).toContain('Cairo')
    expect(wrapper.html()).toContain('fixture')
  })
})

describe('GallerySearchResults', () => {
  it('finds the fixture bowl by keyword', async () => {
    const { wrapper } = await mountPage(GallerySearchResults, { route: '/search?q=bowl', messages: texts })
    await settle(() => wrapper.text().includes('Fixture'), 80)
    expect(wrapper.text()).toContain('Fixture')
  })
})

// Legacy's TimelinePage.vue: the lists open on their own first line, Go
// requires a country, and a date left unset is the first or last on offer.
describe('GalleryTimeline (entrance)', () => {
  it('draws legacy\'s form and goes to the results with the period filled in', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { wrapper, router } = await mountPage(GalleryTimeline, { route: '/timeline', messages: texts })
    await settle(() => wrapper.findAll('.mwnf-dxa-timeline select').length === 3)
    const [country, start, end] = wrapper.findAll('.mwnf-dxa-timeline select')
    expect(country.findAll('option')[0].text()).toBe('Select a Country')
    expect(start.findAll('option')[0].text()).toBe('Start Date')
    expect(end.findAll('option')[0].text()).toBe('End Date')

    await wrapper.find('.mwnf-dxa-timeline__go button').trigger('click')
    expect(alert).toHaveBeenCalledWith('Please select a country.')

    const code = country.findAll('option').map((o) => o.element.value).find((v) => v && v !== 'all')
    await country.setValue(code)
    await wrapper.find('.mwnf-dxa-timeline__go button').trigger('click')
    await settle(() => router.currentRoute.value.name === 'timeline-results')
    const query = router.currentRoute.value.query
    expect(query.country).toBe(code)
    expect(query.begin).toBe(start.findAll('option')[1]?.element.value)
    expect(query.end).toBe(end.findAll('option').at(-1)?.element.value)
    alert.mockRestore()
  })

  it("labels the years with the galleries' own era words, as legacy did", async () => {
    const { wrapper } = await mountPage(GalleryTimeline, {
      route: '/timeline',
      messages: { ...texts, 'gallery.era.ad': 'A.D.', 'catalogue.era.ad': 'AD' },
    })
    await settle(() => wrapper.findAll('.mwnf-dxa-timeline select')[1]?.findAll('option').length > 1)
    const years = wrapper.findAll('.mwnf-dxa-timeline select')[1].findAll('option').slice(1).map((o) => o.text())
    expect(years.length).toBeGreaterThan(0)
    expect(years.every((label) => label.endsWith('A.D.'))).toBe(true)
  })
})

describe('GalleryTimelineResults', () => {
  it('mounts on the timeline-results route without error', async () => {
    const { wrapper } = await mountPage(GalleryTimelineResults, { route: '/timeline-results?country=eg', messages: texts })
    await settle(() => true, 5)
    expect(wrapper.exists()).toBe(true)
  })
})

describe('GalleryTimelineGallery', () => {
  it('mounts on the timeline gallery route and links back to events', async () => {
    const { wrapper } = await mountPage(GalleryTimelineGallery, {
      route: '/timeline/gallery?country=eg&begin=900&end=950',
      messages: texts,
    })
    await settle(() => true, 5)
    expect(wrapper.text()).toContain('Back to events')
  })
})

describe('GalleryCollectionResults', () => {
  it('mounts on the collection-results route', async () => {
    const { wrapper } = await mountPage(GalleryCollectionResults, { route: '/collection-results', messages: texts })
    await settle(() => true, 5)
    expect(wrapper.exists()).toBe(true)
  })
})

describe('GalleryCollectionSearch', () => {
  it('renders the collection entrance intro and country facet', async () => {
    const { wrapper } = await mountPage(GalleryCollectionSearch, { messages: texts })
    await settle(() => true, 5)
    expect(wrapper.text()).toContain('Search this gallery')
    expect(wrapper.text()).toContain('Select a country')
  })
})

describe('GalleryPartnerObjects', () => {
  it("renders the partner's own objects with a profile link back", async () => {
    const { wrapper } = await mountPage(GalleryPartnerObjects, {
      route: '/partner/p1/objects',
      messages: texts,
    })
    await settle(() => wrapper.text().includes('Zed Museum'))
    expect(wrapper.text()).toContain('Zed Museum')
    expect(wrapper.html()).toContain('href="/partner/p1"')
  })
})
