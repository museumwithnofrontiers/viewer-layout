import { beforeAll, describe, expect, it } from 'vitest'
import { loadEntities, useDataPackage } from '@museumwnf/viewer-core'
import ExhibitionSearchHowTo from '../../src/dxa/exhibition/SearchHowTo.vue'
import ExhibitionPartners from '../../src/dxa/exhibition/Partners.vue'
import ExhibitionPartnerProfile from '../../src/dxa/exhibition/PartnerProfile.vue'
import ExhibitionSearchResults from '../../src/dxa/exhibition/SearchResults.vue'
import ExhibitionTimelineResults from '../../src/dxa/exhibition/TimelineResults.vue'
import ExhibitionTimelineGallery from '../../src/dxa/exhibition/TimelineGallery.vue'
import ExhibitionCollectionResults from '../../src/dxa/exhibition/CollectionResults.vue'
import ExhibitionCollectionSearch from '../../src/dxa/exhibition/CollectionSearch.vue'
import ExhibitionPartnerObjects from '../../src/dxa/exhibition/PartnerObjects.vue'
import { mountPage, settle, sharedDxaTexts } from './helpers.js'

// The exhibition family's thin pages (epic inventory-app#1731, from
// the-use-of-colours-in-art/water-in-islam — byte-identical on
// `origin/main` 2026-09-20), mounted against the same fixture package as
// tests/dxa/gallery.test.js.

const partnerObjectsTexts = {
  emptyPartner: 'test.partnerObjects.emptyPartner',
  emptyInstitution: 'test.partnerObjects.emptyInstitution',
  institutionSummary: 'test.partner.monumentsInExhibition',
  partnerProfileLabel: 'test.partnerObjects.partnerProfile',
  institutionProfileLabel: 'test.partnerObjects.institutionProfile',
}

const texts = {
  ...sharedDxaTexts,
  'exhibition.partners.intro': 'Every museum and collection lending to this exhibition.',
  'exhibition.partner.noObjectsInExhibition': 'This partner holds nothing in this exhibition.',
  'exhibition.action.readMore': 'Read more',
  'exhibition.action.viewObjects': 'View objects',
  'exhibition.action.viewItems': 'View items',
  'exhibition.action.institutionHomepage': 'Institution homepage',
  'exhibition.action.seeDatabaseEntry': 'See database entry',
  'exhibition.section.database': 'Database',
  'exhibition.section.collection': 'Collection',
  'exhibition.section.timeline': 'Timeline',
  'exhibition.collection.intro': 'Search this exhibition.',
  'test.partnerObjects.emptyPartner': 'This partner holds nothing in this exhibition.',
  'test.partnerObjects.emptyInstitution': 'This institution holds nothing in this exhibition.',
  'test.partner.monumentsInExhibition': 'monument(s) in this exhibition',
  'test.partnerObjects.partnerProfile': 'Partner profile',
  'test.partnerObjects.institutionProfile': 'Institution profile',
}

beforeAll(async () => {
  await loadEntities(['items', 'partners', 'countries', 'tags', 'dynasties', 'exhibition', 'timelines', 'timeline_events'])
  const pkg = useDataPackage()
  await pkg.loadTranslations('items', 'en')
  await pkg.loadTranslations('partners', 'en')
})

describe('ExhibitionSearchHowTo', () => {
  it('renders the essay and a back link to the collection entrance', async () => {
    const { wrapper } = await mountPage(ExhibitionSearchHowTo, { messages: texts })
    expect(wrapper.text()).toContain('How the search operators work.')
    expect(wrapper.html()).toContain('href="/collection"')
  })
})

describe('ExhibitionPartners', () => {
  it('lists a partner with a working profile link', async () => {
    const { wrapper } = await mountPage(ExhibitionPartners, { messages: texts })
    await settle(() => wrapper.text().includes('Zed Museum'))
    expect(wrapper.html()).toContain('href="/partner/p1"')
  })
})

describe('ExhibitionPartnerProfile', () => {
  it('renders the partner variant by default', async () => {
    const { wrapper } = await mountPage(ExhibitionPartnerProfile, {
      route: '/partner/p1',
      messages: texts,
    })
    await settle(() => wrapper.text().includes('fixture'))
    expect(wrapper.text()).toContain('fixture')
  })

  it('heads the page with the partner name and "city, country"', async () => {
    const { wrapper } = await mountPage(ExhibitionPartnerProfile, {
      route: '/partner/p1',
      messages: texts,
    })
    await settle(() => wrapper.text().includes('fixture'))
    expect(wrapper.find('.mwnf-dxa-partner-name').text()).toBe('Zed Museum')
    expect(wrapper.find('.mwnf-dxa-partner-location').text()).toBe('Cairo, Egypt')
  })

  it('renders the institution variant with its own homepage label', async () => {
    const { wrapper } = await mountPage(ExhibitionPartnerProfile, {
      props: { variant: 'institution' },
      route: '/institution/p1',
      messages: texts,
    })
    await settle(() => wrapper.text().includes('fixture'))
    expect(wrapper.text()).toContain('fixture')
    expect(wrapper.find('.mwnf-dxa-partner-name').text()).toBe('Zed Museum')
  })
})

describe('ExhibitionSearchResults', () => {
  it('finds the fixture bowl by keyword', async () => {
    const { wrapper } = await mountPage(ExhibitionSearchResults, { route: '/search?q=bowl', messages: texts })
    await settle(() => wrapper.text().includes('Fixture'), 80)
    expect(wrapper.text()).toContain('Fixture')
  })
})

describe('ExhibitionTimelineResults', () => {
  it('mounts on the timeline-results route without error', async () => {
    const { wrapper } = await mountPage(ExhibitionTimelineResults, { route: '/timeline-results?country=eg', messages: texts })
    await settle(() => true, 5)
    expect(wrapper.exists()).toBe(true)
  })
})

describe('ExhibitionTimelineGallery', () => {
  it('mounts on the timeline gallery route', async () => {
    const { wrapper } = await mountPage(ExhibitionTimelineGallery, {
      route: '/timeline/gallery?country=eg&begin=900&end=950',
      messages: texts,
    })
    await settle(() => true, 5)
    expect(wrapper.exists()).toBe(true)
  })
})

describe('ExhibitionCollectionResults', () => {
  it('mounts on the collection-results route', async () => {
    const { wrapper } = await mountPage(ExhibitionCollectionResults, { route: '/collection-results', messages: texts })
    await settle(() => true, 5)
    expect(wrapper.exists()).toBe(true)
  })
})

describe('ExhibitionCollectionSearch', () => {
  it('renders the collection entrance intro and country facet', async () => {
    const { wrapper } = await mountPage(ExhibitionCollectionSearch, { messages: texts })
    await settle(() => true, 5)
    expect(wrapper.text()).toContain('Search this exhibition.')
    expect(wrapper.text()).toContain('Select a country')
  })
})

describe('ExhibitionPartnerObjects', () => {
  it('renders the partner-variant summary (the shared partner.item.objectsInSite entry) and profile link', async () => {
    const { wrapper } = await mountPage(ExhibitionPartnerObjects, {
      props: { texts: partnerObjectsTexts },
      route: '/partner/p1/objects',
      messages: texts,
    })
    await settle(() => wrapper.text().includes('Zed Museum'))
    expect(wrapper.text()).toContain('Zed Museum')
    expect(wrapper.text()).toContain('object(s) in this site')
    expect(wrapper.text()).toContain('Partner profile')
    expect(wrapper.html()).toContain('href="/partner/p1"')
  })

  it('renders the institution-variant summary (config.partnerObjects.institutionSummary) and profile link', async () => {
    const { wrapper } = await mountPage(ExhibitionPartnerObjects, {
      props: { variant: 'institution', texts: partnerObjectsTexts },
      route: '/institution/p1/monuments',
      messages: texts,
    })
    await settle(() => wrapper.text().includes('Zed Museum'))
    expect(wrapper.text()).toContain('monument(s) in this exhibition')
    expect(wrapper.text()).toContain('Institution profile')
  })

  it('renders config.partnerObjects.emptyPartner when the partner holds nothing', async () => {
    const { wrapper } = await mountPage(ExhibitionPartnerObjects, {
      props: { texts: partnerObjectsTexts },
      route: '/partner/p3/objects',
      messages: texts,
    })
    await settle(() => wrapper.text().includes('Damascus Museum'))
    expect(wrapper.text()).toContain('This partner holds nothing in this exhibition.')
  })
})
