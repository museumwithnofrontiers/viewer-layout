import { beforeAll, describe, expect, it } from 'vitest'
import { loadEntities, useDataPackage } from '@museumwnf/viewer-core'
import GalleryAbout from '../../src/dxa/gallery/About.vue'
import GalleryCredits from '../../src/dxa/gallery/Credits.vue'
import GallerySearchHowTo from '../../src/dxa/gallery/SearchHowTo.vue'
import GalleryPartners from '../../src/dxa/gallery/Partners.vue'
import PartnerDetail from '../../src/dxa/PartnerDetail.vue'
import { partnerDetail } from '../../src/dxa/gallery/data.js'
import GallerySearchResults from '../../src/dxa/gallery/SearchResults.vue'
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
  'gallery.action.readMore': 'Read more',
  'gallery.action.viewObjects': 'View objects',
  'gallery.action.partnerProfile': 'Partner profile',
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

describe('GalleryPartners', () => {
  it('lists a partner with a working profile link and object count', async () => {
    const { wrapper } = await mountPage(GalleryPartners, { messages: texts })
    await settle(() => wrapper.text().includes('Zed Museum'))
    expect(wrapper.text()).toContain('Zed Museum')
    expect(wrapper.html()).toContain('href="/partner/p1"')
    expect(wrapper.html()).toContain('href="/partner/p1/objects"')
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
