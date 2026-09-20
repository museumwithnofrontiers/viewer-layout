import { beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import { centuryPresets, collectionTreeFromThemes, loadEntities, useDataPackage } from '@museumwnf/viewer-core'
import {
  CatalogueResultsView, EssayView, HomeView, PartnerListView, RecordView, RecordSheetView, LinkListView, SearchFormView, TextPageView, TimelineResultsView,
} from '../src/views/index.js'
import { layoutTexts, withSiteRights } from './helpers.js'

// The composed views render a real page out of the fixture package behind
// `@inventory-data`: an `objects` entity with dates, a country, tags and
// related records, and a glossary. These texts stand in for the website's
// catalogue — the shared bundle plus its own file.
const texts = {
  ...layoutTexts,
  'core.action.viewDetails': 'View details',
  'core.action.back': 'Back',
  'core.action.empty': 'Nothing to show.',
  'core.status.loading': 'Loading…',
  'catalogue.facet.any': 'Any',
  'catalogue.facet.country': 'Country',
  'catalogue.facet.fromYear': 'From year',
  'catalogue.facet.keyword': 'Keyword',
  'catalogue.facet.keywordPlaceholder': 'Search…',
  'catalogue.facet.epm': 'European partners',
  'catalogue.facet.dateFrom': 'Date (from year)',
  'catalogue.facet.dateTo': 'Date (to year)',
  'catalogue.facet.startDate': 'Start date',
  'catalogue.facet.endDate': 'End date',
  'catalogue.field.keywords': 'Keyword(s)',
  'catalogue.search.and': 'AND',
  'catalogue.search.or': 'OR',
  'catalogue.search.anyLanguage': 'Any',
  'catalogue.search.howTo': 'How to search',
  'catalogue.search.keywordOne': 'Keyword 1',
  'catalogue.search.keywordTwo': 'Keyword 2',
  'catalogue.search.keywordPlaceholder': 'keyword…',
  'catalogue.search.language': 'Search language',
  'catalogue.search.showAll': 'Show all',
  'catalogue.filter.heading': 'Filter',
  'catalogue.results.itemsFound': 'Items found',
  'catalogue.results.noResults': 'No results',
  'catalogue.results.noResultsFilter': 'No items match the selected filter.',
  'record.action.backToResults': 'Back to results',
  'record.citation.in': 'in',
  'record.related.items': 'Related items',
  'record.related.onDisplayIn': 'On display in',
  'record.related.exhibitions': 'Exhibitions',
  'record.related.galleries': 'Galleries',
  'record.related.audioVideo': 'Audio / video',
  'record.related.timelineForItem': 'Timeline for this item',
  'record.action.download': 'Download',
  'record.action.downloadPdf': 'As PDF (including images)',
  'record.action.addToCollection': 'Add to my collection',
  'record.sheet.sourceDatabase': 'Source database',
  'record.dynasty.list': 'Dynasties',
  'sheet.field.holdingMuseum': 'Holding museum',
  'gallery.related.title': 'Related content',
  'gallery.related.description': 'What this gallery relates the record to.',
  'gallery.action.seeDatabaseEntry': 'See database entry',
  'gallery.results.notInThisGallery': 'Not in this gallery',
  'gallery.nav.artisticIntroduction': 'Artistic introduction',
  'gallery.search.relatedDatabase': 'Search the related database',
  'gallery.search.overallDatabase': 'Search the overall database',
  'gallery.nav.overallDatabase': 'MWNF database',
  'gallery.item.explorePartnerNote': 'Available in',
  'gallery.item.linkPending': 'link pending',
  'gallery.section.timeline': 'Timeline',
  'exhibition.results.notInThisExhibition': 'Not in this exhibition',
  'timeline.action.beginFullSearch': 'Begin a full search',
  'timeline.results.noEvents': 'No events for this period.',
  'exhibition.theme.previous': 'Previous',
  'exhibition.theme.next': 'Next',
  'exhibition.theme.inThisTheme': 'In This Theme',
  'exhibition.theme.seeAllInTheme': 'See all Items in this Theme',
  'sheet.field.description': 'Description',
  'sheet.field.location': 'Location',
  'sheet.field.name': 'Name',
  'sheet.field.preparedBy': 'Prepared by',
  'sheet.field.type': 'Type',
  'sheet.field.workingNumber': 'MWNF working number',
  'core.project.islamicArt': 'Discover Islamic Art',
  'site.home.title': 'Welcome',
  'site.home.intro': 'A **fixture** museum.',
  'site.home.catalogue': 'Catalogue',
  'site.home.catalogueText': 'Every object.',
  'site.home.onDisplay': 'On display',
  'site.further.reading': 'Further reading',
  'site.about.heading': 'About',
  'site.about.body': 'Information about this collection.',
  'core.action.search': 'Search',
  'timeline.form.allCountries': 'All Countries',
  'timeline.form.selectCountry': 'Select a Country',
  'timeline.form.startDate': 'Start Date',
  'timeline.form.endDate': 'End Date',
  'timeline.form.fromYearHint': 'e.g. 800',
  'timeline.form.toYearHint': 'e.g. 1400',
  'timeline.form.errorSelect': 'Please select a country, or a start and end date.',
  'timeline.form.errorPeriod': 'Please select a valid time period (start must be before end).',
  'timeline.nav.seeGallery': 'See Gallery',
  'timeline.results.eventsFound': 'Events found',
  'timeline.results.noResults': 'No results. Please use the drop-down fields above to start a new search.',
  'catalogue.era.ad': 'AD',
  'catalogue.era.bc': 'BC',
  'partner.list.associated': 'Associated Partners',
  'partner.list.partnersFound': 'Partners found',
  'partner.list.sortAscending': 'Sort A-Z',
  'partner.list.sortDescending': 'Sort Z-A',
  'partner.item.objectsInSite': 'object(s) in this site',
}

const COUNTRY_NAMES = { 'c-eg': 'Egypt', 'c-sy': 'Syria' }
const countryOrOther = (id) => COUNTRY_NAMES[id] ?? 'Other'

async function settle(predicate, tries = 40) {
  for (let i = 0; i < tries && !predicate(); i++) await new Promise((r) => setTimeout(r, 5))
  await nextTick()
}

async function mountView(component, { props = {}, slots = {}, route = '/', locale = 'en' } = {}) {
  const i18n = createI18n({ locale, messages: { en: texts } })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<p>home</p>' } },
      { path: '/objects', name: 'objects-list', component: { template: '<p>list</p>' } },
      { path: '/objects/:id', name: 'objects-detail', component: { template: '<p>detail</p>' } },
      { path: '/item/:id', name: 'item', component: { template: '<p>item</p>' } },
      { path: '/theme/:id', name: 'theme', component: { template: '<p>theme</p>' } },
      { path: '/search-results', name: 'search-results', component: { template: '<p>results</p>' } },
      { path: '/how-to-search', name: 'search-how-to', component: { template: '<p>how to</p>' } },
      { path: '/timeline', name: 'timeline-entrance', component: { template: '<p>timeline entrance</p>' } },
      { path: '/timeline/results', name: 'timeline-results', component: { template: '<p>timeline results</p>' } },
      { path: '/gallery', name: 'timeline-gallery', component: { template: '<p>gallery</p>' } },
      { path: '/partners', name: 'partners', component: { template: '<p>partners</p>' } },
      { path: '/partner/:id', name: 'partner', component: { template: '<p>partner</p>' } },
    ],
  })
  // The view reads its filters from the URL, so the URL is in place first —
  // as it is for a website, where the router has resolved before a view exists.
  await router.push(route)
  await router.isReady()
  const wrapper = mount(component, { props, slots, global: { plugins: [i18n, router] } })
  return { wrapper, router }
}

// What a website's router does before any of these views exists: the
// entities the routes declare, and English, which every list reads.
beforeAll(async () => {
  await loadEntities(['objects', 'glossary', 'collections', 'timelines', 'timeline_events', 'partners'])
  const pkg = useDataPackage()
  await pkg.loadTranslations('objects', 'en')
  await pkg.loadTranslations('glossary', 'en')
  await pkg.loadTranslations('collections', 'en')
  await pkg.loadTranslations('timeline_events', 'en')
  await pkg.loadTranslations('partners', 'en')
})

describe('HomeView', () => {
  it('renders the welcome, the cards and the record on display from the declaration', async () => {
    const { wrapper } = await mountView(HomeView, {
      props: {
        title: 'site.home.title',
        intro: 'site.home.intro',
        cards: [{ title: 'site.home.catalogue', description: 'site.home.catalogueText', action: 'core.action.viewDetails', to: { name: 'objects-list' } }],
        featured: { entity: 'objects', heading: 'site.home.onDisplay', action: 'core.action.viewDetails', route: 'objects-detail', eyebrow: 'type', meta: ['location'], seed: 1 },
      },
    })
    await settle(() => wrapper.text().includes('On display'))
    expect(wrapper.find('h1').text()).toBe('Welcome')
    expect(wrapper.find('.mwnf-home__intro').html()).toContain('<strong>fixture</strong>')
    expect(wrapper.find('.mwnf-cards__title').text()).toBe('Catalogue')
    expect(wrapper.find('.mwnf-cards__text').text()).toBe('Every object.')
    expect(wrapper.find('.mwnf-featured').exists()).toBe(true)
    // The pick has an image, so it is one of o1 and o3, and its name is the translated one.
    expect(wrapper.find('.mwnf-featured__name').text()).toMatch(/Glazed bowl|Fragment/)
    expect(wrapper.find('.mwnf-featured__action').text()).toContain('View details')
  })

  it('renders nothing but the slots when nothing is declared', async () => {
    const { wrapper } = await mountView(HomeView, { slots: { default: '<p class="own">Own content</p>' } })
    expect(wrapper.find('.own').exists()).toBe(true)
    expect(wrapper.find('.mwnf-cards').exists()).toBe(false)
    expect(wrapper.find('.mwnf-featured').exists()).toBe(false)
  })
})

describe('CatalogueResultsView', () => {
  const spec = {
    entity: 'objects',
    facets: { country: { field: 'country_id', label: (id) => COUNTRY_NAMES[id] ?? id } },
    dates: { mode: 'overlap', begin: 'begin', end: 'end' },
    controls: [
      { key: 'country', label: 'catalogue.facet.country', anyLabel: 'catalogue.facet.any' },
      { key: 'begin', type: 'year', label: 'catalogue.facet.fromYear' },
    ],
    filterTitle: 'catalogue.filter.heading',
    pageSize: 2,
    recordRoute: 'objects-detail',
  }

  it('lists the records in chronological order, paged, with the options the records carry', async () => {
    const { wrapper } = await mountView(CatalogueResultsView, { props: { spec }, route: '/objects' })
    await settle(() => wrapper.findAll('.mwnf-list__row').length > 0)
    const names = wrapper.findAll('.mwnf-list__name').map((n) => n.text())
    // Two a page, dated first: the bowl (900), then the lamp (1200).
    expect(names).toEqual(['Glazed bowl', 'Mosque lamp'])
    expect(wrapper.find('.mwnf-summary__count').text()).toBe('4')
    expect(wrapper.find('.mwnf-pagination').exists()).toBe(true)
    const options = wrapper.findAll('.mwnf-facet__select option').map((o) => o.text())
    expect(options).toContain('Egypt')
    expect(options).toContain('Syria')
    expect(wrapper.find('.mwnf-list__link').attributes('href')).toBe('/objects/o1')
  })

  it('reads its filters from the URL and applies the site rule and the date rule', async () => {
    const { wrapper } = await mountView(CatalogueResultsView, {
      props: { spec: { ...spec, scope: (record) => record.id !== 'o4' } },
      route: '/objects?country=c-eg&begin=1000',
    })
    await settle(() => wrapper.text().includes('Items found'))
    // Egypt holds o1 (900–950), o3 (undated) and o4 (scoped out); from 1000
    // under the overlap rule keeps the undated fragment and drops the bowl.
    expect(wrapper.findAll('.mwnf-list__name').map((n) => n.text())).toEqual(['Fragment'])
  })

  it('navigates when a control changes in immediate mode, and hands its slots the state', async () => {
    const { wrapper, router } = await mountView(CatalogueResultsView, {
      props: { spec: { ...spec, filterMode: 'immediate' } },
      slots: { aside: '<template #aside="{ pageInfo, goToPage }"><p class="aside">{{ pageInfo.total }} in the aside</p><button class="own-page" @click="goToPage(2)">2</button></template>' },
      route: '/objects',
    })
    await settle(() => wrapper.text().includes('Items found'))
    expect(wrapper.find('.aside').text()).toBe('4 in the aside')
    // A second pagination of the website's own turns the same pages.
    await wrapper.find('.own-page').trigger('click')
    await settle(() => router.currentRoute.value.query.page === '2')
    expect(router.currentRoute.value.query.page).toBe('2')
    await wrapper.find('.mwnf-facet__select').setValue('c-sy')
    await settle(() => router.currentRoute.value.query.country === 'c-sy')
    expect(router.currentRoute.value.query.country).toBe('c-sy')
  })

  it('hands the whole list to a site rule that narrows it — a keyword index, say', async () => {
    const { wrapper } = await mountView(CatalogueResultsView, {
      props: { spec: { ...spec, narrow: (list, filters) => (filters.country ? list : list.filter((r) => r.id === 'o2')) } },
      route: '/objects',
    })
    await settle(() => wrapper.findAll('.mwnf-list__row').length > 0)
    expect(wrapper.findAll('.mwnf-list__name').map((n) => n.text())).toEqual(['Mosque lamp'])
  })

  it('types into a query control and narrows through narrow when it is submitted', async () => {
    const { wrapper, router } = await mountView(CatalogueResultsView, {
      props: {
        spec: {
          entity: 'objects',
          keys: ['q'],
          controls: [{ key: 'q', type: 'query', label: 'catalogue.facet.keyword', placeholder: 'catalogue.facet.keywordPlaceholder' }],
          narrow: (list, filters) => (filters.q ? list.filter((r) => r.id === 'o2') : list),
          recordRoute: 'objects-detail',
        },
      },
      route: '/objects',
    })
    await settle(() => wrapper.findAll('.mwnf-list__row').length > 0)
    await wrapper.find('.mwnf-facet__select').setValue('lamp')
    await wrapper.find('form').trigger('submit')
    await settle(() => router.currentRoute.value.query.q === 'lamp')
    expect(router.currentRoute.value.query.q).toBe('lamp')
    await settle(() => wrapper.findAll('.mwnf-list__name').length === 1)
    expect(wrapper.findAll('.mwnf-list__name').map((n) => n.text())).toEqual(['Mosque lamp'])
  })

  it('writes 1 to the URL when a checkbox control is checked in immediate mode', async () => {
    const { wrapper, router } = await mountView(CatalogueResultsView, {
      props: {
        spec: {
          entity: 'objects',
          keys: ['epm'],
          controls: [{ key: 'epm', type: 'checkbox', label: 'catalogue.facet.epm' }],
          filterMode: 'immediate',
          recordRoute: 'objects-detail',
        },
      },
      route: '/objects',
    })
    await settle(() => wrapper.findAll('.mwnf-list__row').length > 0)
    await wrapper.find('.mwnf-facet__checkbox').setValue(true)
    await settle(() => router.currentRoute.value.query.epm === '1')
    expect(router.currentRoute.value.query.epm).toBe('1')
  })

  it('renders the tiles when the spec says grid, and the empty text when nothing matches', async () => {
    const { wrapper } = await mountView(CatalogueResultsView, {
      props: { spec: { ...spec, variant: 'grid', match: () => false } },
      route: '/objects',
    })
    await settle(() => wrapper.text().includes('Items found'))
    expect(wrapper.find('.mwnf-grid').exists()).toBe(true)
    expect(wrapper.text()).toContain('No items match the selected filter.')
  })
})

describe('RecordView', () => {
  const spec = {
    entity: 'objects',
    translations: ['glossary'],
    fields: [
      { key: 'name', label: 'sheet.field.name', value: 'name' },
      { key: 'location', label: 'sheet.field.location', value: 'location' },
      { key: 'type', label: 'sheet.field.type', value: 'type', render: 'custom' },
    ],
    sections: [{ key: 'description', label: 'sheet.field.description', value: 'description' }],
    citation: { project: 'ISL' },
    back: { label: 'record.action.backToResults', to: { name: 'objects-list' } },
    related: { route: 'objects-detail' },
  }

  it('renders the sheet, the sections, the credits, the citation and the related records', async () => {
    const { wrapper } = await mountView(RecordView, {
      props: { spec, id: 'o1' },
      slots: { type: '<template #type="{ row }"><em class="own-type">{{ row.value }}</em></template>' },
      route: '/objects/o1',
    })
    await settle(() => wrapper.text().includes('Prepared by'))
    expect(wrapper.find('h1').html()).toContain('Glazed <em>bowl</em>')
    expect(wrapper.findAll('.mwnf-sheet__label').map((l) => l.text())).toEqual(['Name', 'Location', 'Type'])
    expect(wrapper.find('.own-type').text()).toBe('Ceramic')
    // The description reaches the glossary: the term is marked while it renders.
    expect(wrapper.find('.mwnf-sheet-section').html()).toContain('gloss-term')
    expect(wrapper.text()).toContain('A. Author')
    expect(wrapper.find('.mwnf-credits__citation').text()).toContain('in Discover Islamic Art')
    expect(wrapper.find('.mwnf-related .mwnf-list__name').text()).toBe('Mosque lamp')
    expect(wrapper.find('.mwnf-related .mwnf-list__meta').text()).toContain('Same workshop')
    expect(wrapper.find('.mwnf-record__back').text()).toContain('Back to results')
    expect(wrapper.find('.mwnf-media').exists()).toBe(true)
  })

  it("reads the citation's project name from the data package manifest when the spec sets no project override", async () => {
    const { wrapper } = await mountView(RecordView, {
      props: { spec: { ...spec, citation: {} }, id: 'o3' },
      route: '/objects/o3',
    })
    await settle(() => wrapper.find('.mwnf-credits__citation').text().length > 0)
    expect(wrapper.find('.mwnf-credits__citation').text()).toContain('in Discover Islamic Art (package)')
  })

  it("reads the manifest project name in the record's active language", async () => {
    const { wrapper } = await mountView(RecordView, {
      props: { spec: { ...spec, citation: {} }, id: 'o3' },
      route: '/objects/o3',
      locale: 'fr',
    })
    await settle(() => wrapper.find('.mwnf-credits__citation').text().length > 0)
    expect(wrapper.find('.mwnf-credits__citation').text()).toContain("in Découvrir l'art islamique (paquet)")
  })

  it('falls back to the legacy project name when the project id is absent from the manifest', async () => {
    // `o4` carries a `project_id` the fixture manifest has no `projects` entry
    // for (and a legacy `project_key`), the shape of a data package that
    // predates inventory-app#1727 phase 2.
    const { wrapper } = await mountView(RecordView, {
      props: { spec: { ...spec, citation: {} }, id: 'o4' },
      route: '/objects/o4',
    })
    await settle(() => wrapper.find('.mwnf-credits__citation').text().length > 0)
    expect(wrapper.find('.mwnf-credits__citation').text()).toContain('in Discover Islamic Art')
    expect(wrapper.find('.mwnf-credits__citation').text()).not.toContain('(package)')
  })

  it("hands a related block of the site's own the rows and the records outside the package", async () => {
    const { wrapper } = await mountView(RecordView, {
      props: { spec, id: 'o1' },
      slots: { related: '<template #related="{ records, outside }"><p class="own-related">{{ records.map((r) => r.name).join("+") }} / {{ outside.length }} outside</p></template>' },
      route: '/objects/o1',
    })
    await settle(() => wrapper.text().includes('Prepared by'))
    // The fixture relates o1 to a record it does not carry, as a gallery does.
    expect(wrapper.find('.own-related').text()).toBe('Mosque lamp / 1 outside')
    expect(wrapper.find('.mwnf-related').exists()).toBe(false)
  })

  it("gives a header of the site's own the record's languages and the switch", async () => {
    const { wrapper } = await mountView(RecordView, {
      props: { spec, id: 'o1' },
      slots: { header: '<template #header="{ languages, select, text }"><p class="own-header">{{ text.name }} in {{ languages.map((l) => l.code).join("+") }}</p><button class="own-switch" @click="select(\'fr\')">fr</button></template>' },
      route: '/objects/o1',
    })
    await settle(() => wrapper.text().includes('Prepared by'))
    expect(wrapper.find('.own-header').text()).toContain('in en+fr')
    await wrapper.find('.own-switch').trigger('click')
    await settle(() => wrapper.find('.own-header').text().includes('Bol'))
    expect(wrapper.find('.own-header').text()).toContain('Bol glaçuré')
  })

  it('reads a monument and an object with different fields when the spec is a function', async () => {
    const { wrapper } = await mountView(RecordView, {
      props: {
        spec: { ...spec, fields: ({ record }) => (record.id === 'o2' ? [{ key: 'type', label: 'sheet.field.type', value: 'type' }] : spec.fields) },
        id: 'o2',
      },
      route: '/objects/o2',
    })
    await settle(() => wrapper.findAll('.mwnf-sheet__label').length > 0)
    expect(wrapper.findAll('.mwnf-sheet__label').map((l) => l.text())).toEqual(['Type'])
  })

  it('opens the glossary popover on a marked term', async () => {
    const { wrapper } = await mountView(RecordView, { props: { spec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.find('.gloss-term').exists())
    await wrapper.find('.gloss-term').trigger('click')
    await settle(() => wrapper.find('.mwnf-popover').exists())
    expect(wrapper.find('.mwnf-popover').text()).toContain('An angular Arabic script.')
  })

  it('shows the not-found view for an id the entity does not carry', async () => {
    const { wrapper } = await mountView(RecordView, { props: { spec, id: 'nope' }, route: '/objects/nope' })
    await nextTick()
    expect(wrapper.find('.vc-not-found').exists()).toBe(true)
  })

  it('renders no source address or credit line without a declared site origin', async () => {
    const { wrapper } = await mountView(RecordView, { props: { spec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.text().includes('Prepared by'))
    expect(wrapper.find('.mwnf-credits__citation').text()).not.toContain('https://')
    expect(wrapper.find('.mwnf-source-credit').exists()).toBe(false)
  })

  it("reads the citation's permalink and the source credit from the site's declared origin", async () => {
    const restore = withSiteRights()
    try {
      const { wrapper } = await mountView(RecordView, { props: { spec, id: 'o1' }, route: '/objects/o1' })
      await settle(() => wrapper.text().includes('Prepared by'))
      expect(wrapper.find('.mwnf-credits__citation').text()).toContain('https://example.org/#/objects/o1')
      const source = wrapper.find('.mwnf-source-credit')
      expect(source.find('.mwnf-source-credit__label').text()).toBe('Source')
      expect(source.find('a').attributes('href')).toBe('https://example.org/#/objects/o1')
    } finally {
      restore()
    }
  })

  it("keeps an explicit citation.permalink string, and drops it entirely at 'false' — the site's origin never overrides either", async () => {
    const restore = withSiteRights()
    try {
      const { wrapper: withString } = await mountView(RecordView, {
        props: { spec: { ...spec, citation: { project: 'ISL', permalink: 'https://own.example/fixed' } }, id: 'o1' },
        route: '/objects/o1',
      })
      await settle(() => withString.text().includes('Prepared by'))
      expect(withString.find('.mwnf-credits__citation').text()).toContain('https://own.example/fixed')

      const { wrapper: withFalse } = await mountView(RecordView, {
        props: { spec: { ...spec, citation: { project: 'ISL', permalink: false } }, id: 'o1' },
        route: '/objects/o1',
      })
      await settle(() => withFalse.text().includes('Prepared by'))
      expect(withFalse.find('.mwnf-credits__citation').text()).not.toContain('https://')
    } finally {
      restore()
    }
  })

  it('lets a #source slot of its own replace the default SourceCredit', async () => {
    const restore = withSiteRights()
    try {
      const { wrapper } = await mountView(RecordView, {
        props: { spec, id: 'o1' },
        slots: { source: '<template #source><p class="own-source">mine</p></template>' },
        route: '/objects/o1',
      })
      await settle(() => wrapper.text().includes('Prepared by'))
      expect(wrapper.find('.own-source').text()).toBe('mine')
      expect(wrapper.find('.mwnf-source-credit').exists()).toBe(false)
    } finally {
      restore()
    }
  })
})

describe('RecordSheetView', () => {
  const spec = {
    entity: 'objects',
    translations: ['glossary'],
    fields: [
      { key: 'name', label: 'sheet.field.name', value: 'name' },
      { key: 'location', label: 'sheet.field.location', value: 'location' },
    ],
    citation: { project: 'ISL' },
    related: { route: 'objects-detail' },
  }

  // A gallery/exhibition item-sheet spec, the shape carpets/amulets and
  // the-use-of-colours-in-art/water-in-islam each build in their own
  // composables/sheet.js — every block inventory-app#1728 asks
  // RecordSheetView to own, driven by spec keys and by data the fixture
  // package already carries (see docs/slot-catalogue.md for each key).
  const sheetSpec = {
    entity: 'objects',
    translations: ['glossary'],
    fields: [
      { key: 'name', label: 'sheet.field.name', value: 'name' },
      { key: 'museum', label: 'sheet.field.holdingMuseum', value: (c) => c.record.partner_id, render: 'custom' },
      { key: 'location', label: 'sheet.field.location', value: 'location' },
    ],
    citation: { project: 'ISL' },
    sourceDatabase: {
      chipClass: (record) => (record.project_id === 'p-isl' ? 'mwnf-chip--ISLandEPM' : null),
      addToCollection: {},
    },
    notice: { show: (record) => record.id === 'o1', label: 'gallery.item.explorePartnerNote' },
    museum: {
      route: (partnerId) => (partnerId === 'm1' ? { name: 'objects-detail', params: { id: 'partner-m1' } } : null),
      label: (partnerId) => (partnerId === 'm1' ? 'Zed Museum' : 'Hidden Museum'),
    },
    related: {
      route: 'objects-detail',
      title: 'gallery.related.title',
      description: 'gallery.related.description',
      actionLabel: 'gallery.action.seeDatabaseEntry',
      notInPackageLabel: 'gallery.results.notInThisGallery',
      outsideChip: (ref) => (ref.project_key ? 'mwnf-chip--ISLandEPM' : null),
      artisticIntroductionLabel: 'gallery.nav.artisticIntroduction',
      databaseLabel: 'gallery.search.relatedDatabase',
      overallDatabase: { label: 'gallery.search.overallDatabase', linkLabel: 'gallery.nav.overallDatabase' },
      onDisplayIn: { linkPendingLabel: 'gallery.item.linkPending' },
      dynasties: () => ({ records: [{ id: 'd1', from_ad: 900, to_ad: 1000 }], tr: (d) => ({ name: `Dynasty ${d.id}` }) }),
      timeline: (record) => ({
        heading: 'gallery.section.timeline',
        countries: [{ value: 'all', label: 'All Countries' }, { value: 'eg', label: 'Egypt' }],
        defaultCountry: () => 'all',
        events: (country) => (country === 'eg' ? [{ year_from: 950, text: { description: 'An event in *Egypt*.' } }] : []),
        range: [record.start_date ?? null, record.end_date ?? null],
        era: (year) => (year == null ? '?' : String(year)),
        searchTo: (country, range) => ({ name: 'timeline-results', query: { country, begin: String(range[0] ?? ''), end: String(range[1] ?? '') } }),
      }),
    },
  }

  it('renders the sheet through a bare spec when no dataGetter is passed — the gallery shape', async () => {
    const { wrapper } = await mountView(RecordSheetView, { props: { spec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.text().includes('Prepared by'))
    expect(wrapper.find('h1').html()).toContain('Glazed <em>bowl</em>')
    expect(wrapper.findAll('.mwnf-sheet__label').map((l) => l.text())).toEqual(['Name', 'Location'])
    expect(wrapper.find('.mwnf-related .mwnf-grid__name').text()).toBe('Mosque lamp')
    // None of the DXA-only blocks render without their spec keys.
    expect(wrapper.find('.mwnf-sheet-source').exists()).toBe(false)
    expect(wrapper.find('.mwnf-sheet-notice').exists()).toBe(false)
    expect(wrapper.find('.vc-not-found').exists()).toBe(false)
  })

  it("forwards a website's slots straight through to RecordView, by name, unmodified", async () => {
    const { wrapper } = await mountView(RecordSheetView, {
      props: { spec, id: 'o1' },
      slots: {
        header: '<template #header="{ text }"><p class="own-header">{{ text.name }}</p></template>',
        related: '<template #related="{ records, outside }"><p class="own-related">{{ records.map((r) => r.name).join("+") }} / {{ outside.length }} outside</p></template>',
      },
      route: '/objects/o1',
    })
    await settle(() => wrapper.find('.own-header').exists())
    expect(wrapper.find('.own-header').text()).toBe('Glazed *bowl*')
    expect(wrapper.find('.own-related').text()).toBe('Mosque lamp / 1 outside')
  })

  it('still shows RecordView\'s own not-found view for an id the entity does not carry at all, with no dataGetter set', async () => {
    const { wrapper } = await mountView(RecordSheetView, { props: { spec, id: 'nope' }, route: '/objects/nope' })
    await nextTick()
    expect(wrapper.find('.vc-not-found').exists()).toBe(true)
  })

  it('shows the not-found view without ever mounting RecordView when dataGetter reports the id missing from this language build', async () => {
    // `o1` is a perfectly real record in the fixture package — this stands
    // in for an exhibition's per-build `itemById`, which can say "not in
    // this build" for an id the whole package still carries.
    const { wrapper } = await mountView(RecordSheetView, {
      props: { spec, id: 'o1', dataGetter: () => null },
      route: '/objects/o1',
    })
    await nextTick()
    expect(wrapper.find('.vc-not-found').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(false)
    expect(wrapper.find('.mwnf-sheet__label').exists()).toBe(false)
  })

  it('renders RecordView as usual when dataGetter reports the id present', async () => {
    const { wrapper } = await mountView(RecordSheetView, {
      props: { spec, id: 'o1', dataGetter: (id) => (id === 'o1' ? { id } : null) },
      route: '/objects/o1',
    })
    await settle(() => wrapper.text().includes('Prepared by'))
    expect(wrapper.find('h1').html()).toContain('Glazed <em>bowl</em>')
    expect(wrapper.find('.vc-not-found').exists()).toBe(false)
  })

  it('renders the source-database chip, the backward-compatibility code and the add-to-collection link — spec.sourceDatabase', async () => {
    const { wrapper } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.find('.mwnf-sheet-source').exists())
    const source = wrapper.find('.mwnf-sheet-source')
    expect(source.find('.mwnf-chip').classes()).toContain('mwnf-chip--ISLandEPM')
    expect(source.find('.mwnf-sheet-source__line').text()).toContain('Discover Islamic Art (package)')
    expect(source.find('.mwnf-sheet-source__uid code').text()).toBe('mwnf3:objects:o1')
    const collectionLink = source.find('.mwnf-sheet-source__collection a')
    expect(collectionLink.text()).toContain('Add to my collection')
    expect(collectionLink.attributes('href')).toBe('https://www.museumwnf.org/mycollection/index.php')
  })

  it('shows the explore-partner notice only when spec.notice.show says yes — spec.notice', async () => {
    const { wrapper } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.find('.mwnf-sheet-notice').exists())
    expect(wrapper.find('.mwnf-sheet-notice').text()).toContain('Available in')

    const { wrapper: o2Wrapper } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o2' }, route: '/objects/o2' })
    await settle(() => o2Wrapper.find('.mwnf-sheet__label').exists())
    expect(o2Wrapper.find('.mwnf-sheet-notice').exists()).toBe(false)
  })

  it("links the holding museum's page, or falls back to plain text when spec.museum.route says no — spec.museum", async () => {
    const { wrapper: withLink } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => withLink.text().includes('Prepared by'))
    expect(withLink.text()).toContain('Zed Museum')
    expect(withLink.html()).toMatch(/<a[^>]*href="\/objects\/partner-m1"[^>]*>Zed Museum<\/a>/)

    const { wrapper: withoutLink } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o4' }, route: '/objects/o4' })
    await settle(() => withoutLink.text().includes('Prepared by'))
    expect(withoutLink.text()).toContain('Hidden Museum')
    expect(withoutLink.html()).not.toContain('Hidden Museum</a>')
  })

  it('renders the related block — objects in the grid, the outside reference, the artistic-introduction/related-database/overall-database links, on-display-in, and the print action — spec.related', async () => {
    const { wrapper } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.find('.mwnf-sheet-related').exists())
    const rel = wrapper.find('.mwnf-sheet-related')
    expect(rel.find('.mwnf-sheet-related__heading').text()).toBe('Related content')
    expect(rel.find('.mwnf-sheet-related__description').text()).toBe('What this gallery relates the record to.')
    expect(rel.find('.mwnf-grid__name').text()).toBe('Mosque lamp')

    const reference = rel.find('.mwnf-sheet-related__references li')
    expect(reference.find('.mwnf-chip').classes()).toContain('mwnf-chip--ISLandEPM')
    expect(reference.text()).toContain('Discover Islamic Art (package)')
    expect(reference.find('code').exists()).toBe(false)
    expect(reference.text()).toContain('Not in this gallery')

    const links = rel.findAll('.mwnf-sheet-related__line a')
    const hrefs = links.map((a) => a.attributes('href'))
    expect(hrefs).toContain('https://islamicart.example.org/artistic-introduction')
    expect(hrefs).toContain('https://islamicart.example.org/database')
    expect(hrefs).toContain('https://www.museumwnf.org/database_searchform.php')

    expect(rel.text()).toContain('Sister Gallery')
    const galleryLink = rel.findAll('a').find((a) => a.text().includes('Sister Gallery'))
    expect(galleryLink.attributes('href')).toBe('https://sister.example.org')
    expect(rel.text()).toContain('Pending Exhibition')
    expect(rel.text()).toContain('link pending')

    const printLine = rel.findAll('.mwnf-sheet-related__line--action').at(0)
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    await printLine.trigger('click')
    expect(printSpy).toHaveBeenCalledOnce()
    printSpy.mockRestore()
  })

  it("falls back to the outside reference's backward-compatibility code when its stub carries no project_id", async () => {
    const { wrapper } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o4' }, route: '/objects/o4' })
    await settle(() => wrapper.find('.mwnf-sheet-related').exists())
    const reference = wrapper.find('.mwnf-sheet-related__references li')
    expect(reference.find('code').text()).toBe('mwnf3:objects:x7')
    expect(reference.text()).not.toContain('Discover Islamic Art')
  })

  it('renders the audio/video section, the glossary tool and the dynasty popouts from spec.related', async () => {
    const { wrapper } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.find('.mwnf-sheet-related').exists())
    const audio = wrapper.find('.mwnf-sheet-section')
    expect(audio.find('.mwnf-sheet-section__heading').text()).toBe('Audio / video')
    const audioLink = audio.find('a')
    expect(audioLink.text()).toContain('An audio guide')
    expect(audioLink.attributes('href')).toBe('https://example.org/audio.mp3')

    expect(wrapper.find('.mwnf-glossary-tool').exists()).toBe(true)

    const dynasty = wrapper.find('.mwnf-dynasty-list')
    expect(dynasty.find('.mwnf-dynasty-list__heading').text()).toBe('Dynasties')
    expect(dynasty.find('.mwnf-dynasty__summary').text()).toBe('Dynasty d1')
  })

  it('opens the timeline popout, filters events by the chosen country, and links the full search — spec.related.timeline', async () => {
    const { wrapper } = await mountView(RecordSheetView, { props: { spec: sheetSpec, id: 'o1' }, route: '/objects/o1' })
    await settle(() => wrapper.find('.mwnf-sheet-timeline__trigger').exists())
    expect(wrapper.find('.mwnf-sheet-timeline__popout').exists()).toBe(false)

    await wrapper.find('.mwnf-sheet-timeline__trigger').trigger('click')
    const popout = wrapper.find('.mwnf-sheet-timeline__popout')
    expect(popout.exists()).toBe(true)
    expect(popout.find('.mwnf-sheet-timeline__title').text()).toBe('Timeline')
    expect(popout.find('.mwnf-sheet-timeline__empty').exists()).toBe(true)

    await popout.find('select').setValue('eg')
    await nextTick()
    expect(popout.find('.mwnf-sheet-timeline__empty').exists()).toBe(false)
    expect(popout.find('.mwnf-sheet-timeline__event').html()).toContain('An event in <em>Egypt</em>.')
    const link = popout.find('.mwnf-sheet-timeline__link')
    expect(link.attributes('href')).toContain('/timeline/results')
    expect(link.attributes('href')).toContain('country=eg')
  })

  it("narrows the related grid to this build's own language subset and moves the rest into the outside references — the exhibition shape", async () => {
    // `o2` stands in for a related record the whole package carries but this
    // particular language build does not — RecordView's own related/outside
    // split resolves against the whole package, so a real dataGetter (an
    // exhibition's per-build `itemById.get`) is what narrows it further.
    const exhibitionDataGetter = (id) => (id === 'o2' ? null : { id })
    const { wrapper } = await mountView(RecordSheetView, {
      props: { spec: sheetSpec, id: 'o1', dataGetter: exhibitionDataGetter },
      route: '/objects/o1',
    })
    await settle(() => wrapper.find('.mwnf-sheet-related').exists())
    expect(wrapper.find('.mwnf-grid__name').exists()).toBe(false)
    expect(wrapper.findAll('.mwnf-sheet-related__references li')).toHaveLength(2)
  })
})

// LinkListView: groups of categorized links
describe('LinkListView', () => {
  it('renders title, grouped links with notes, and back link', async () => {
    const { wrapper } = await mountView(LinkListView, {
      props: {
        spec: {
          title: 'site.further.reading',
          groups: [
            {
              heading: 'catalogue.facet.country',
              links: [
                { label: 'Egypt', href: '#/country/c-eg', note: 'Lower Nile' },
                { label: 'Syria', href: '#/country/c-sy' },
              ],
            },
          ],
          back: { label: 'record.action.backToResults', href: '#/results' },
        },
      },
    })
    expect(wrapper.find('.mwnf-link-list__title').text()).toBe('Further reading')
    expect(wrapper.find('.mwnf-link-list__heading').text()).toBe('Country')
    const links = wrapper.findAll('.mwnf-link-list__link')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('Egypt')
    expect(links[0].attributes('href')).toBe('#/country/c-eg')
    expect(wrapper.find('.mwnf-link-list__note').text()).toBe('Lower Nile')
    expect(wrapper.find('.mwnf-link-list__back').text()).toContain('Back to results')
  })

  it('filters out groups with no links and shows empty state', async () => {
    const { wrapper } = await mountView(LinkListView, {
      props: {
        spec: {
          title: 'site.further.reading',
          groups: [{ heading: 'catalogue.facet.country', links: [] }],
          empty: 'core.action.empty',
        },
      },
    })
    expect(wrapper.find('.mwnf-link-list__empty').exists()).toBe(true)
    expect(wrapper.find('.mwnf-link-list__groups').exists()).toBe(false)
  })

  it('renders label and note as Markdown — a citation entry keeps its emphasis, not stripped to plain text', async () => {
    const { wrapper } = await mountView(LinkListView, {
      props: {
        spec: {
          groups: [
            {
              heading: 'catalogue.facet.country',
              links: [{ label: 'Blair, S., *Rivers of Paradise*', href: '#/bib/1', note: 'in **Egypt**' }],
            },
          ],
        },
      },
    })
    expect(wrapper.find('.mwnf-link-list__link').html()).toContain('Blair, S., <em>Rivers of Paradise</em>')
    expect(wrapper.find('.mwnf-link-list__note').html()).toContain('in <strong>Egypt</strong>')
  })

  it('hands #before/#group/#after slots the groups, #group replacing the default heading/links markup', async () => {
    const { wrapper } = await mountView(LinkListView, {
      props: {
        spec: {
          title: 'site.further.reading',
          groups: [{ heading: 'catalogue.facet.country', links: [{ label: 'Egypt', href: '#/country/c-eg' }] }],
        },
      },
      slots: {
        before: '<p class="own-before">Before the groups</p>',
        group: '<template #group="{ group }"><p class="own-group">{{ group.heading }} x{{ group.links.length }}</p></template>',
        after: '<p class="own-after">After the groups</p>',
      },
    })
    expect(wrapper.find('.own-before').exists()).toBe(true)
    expect(wrapper.find('.own-group').text()).toBe('catalogue.facet.country x1')
    expect(wrapper.find('.mwnf-link-list__heading').exists()).toBe(false)
    expect(wrapper.find('.own-after').exists()).toBe(true)
  })
})

// TextPageView: heading and markdown body with prose styling
describe('TextPageView', () => {
  it('renders heading, prose body with entry name, and back link', async () => {
    const { wrapper } = await mountView(TextPageView, {
      props: {
        spec: {
          heading: 'site.about.heading',
          body: 'site.about.body',
          back: { label: 'record.action.backToResults', href: '#/' },
        },
      },
    })
    expect(wrapper.find('.mwnf-text-page__heading').text()).toBe('About')
    // Body text is fetched from catalogue
    expect(wrapper.find('.mwnf-prose').exists()).toBe(true)
    expect(wrapper.find('.mwnf-text-page__back').text()).toContain('Back to results')
  })

  it('renders nothing without a heading and supports back: true for history back', async () => {
    const { wrapper } = await mountView(TextPageView, {
      props: {
        spec: {
          body: 'site.about.body',
          back: true,
        },
      },
    })
    expect(wrapper.find('.mwnf-text-page__heading').exists()).toBe(false)
    expect(wrapper.find('.mwnf-text-page__back').exists()).toBe(true)
  })

  it('calls a function body with a real context — t, tr and language — so a per-record text can be rendered', async () => {
    const { wrapper } = await mountView(TextPageView, {
      props: {
        spec: {
          // `tr` reaches the same data package EssayView reads; `objects.en`
          // is already loaded by `beforeAll` above.
          body: (ctx) => `${ctx.t('site.about.heading')} in ${ctx.language}: ${ctx.tr('objects', 'o1').name}`,
        },
      },
    })
    expect(wrapper.find('.mwnf-prose').text()).toBe('About in en: Glazed bowl')
    expect(wrapper.find('.mwnf-prose').html()).toContain('Glazed <em>bowl</em>')
  })

  it('renders a string body through I18nText with the keypath prop', async () => {
    const { wrapper } = await mountView(TextPageView, {
      props: {
        spec: {
          body: 'site.about.body',
        },
      },
    })
    // The string body is resolved through I18nText using the keypath prop
    expect(wrapper.find('.mwnf-prose').text()).toContain('Information about this collection.')
  })
})

describe('SearchFormView', () => {
  it('rows mode: writes q/field per row, from/to, lang and an extra, and navigates to target on submit', async () => {
    const { wrapper, router } = await mountView(SearchFormView, {
      props: {
        spec: {
          mode: 'rows',
          rows: 2,
          fields: [{ key: 'keyword', label: 'catalogue.field.keywords' }, { key: 'name', label: 'sheet.field.name' }],
          dates: { presets: centuryPresets },
          language: 'objects',
          extras: [{ key: 'epm', type: 'checkbox', label: 'catalogue.facet.epm' }],
          target: 'search-results',
          showAllLabel: 'catalogue.search.showAll',
        },
      },
    })
    const keywords = wrapper.findAll('.mwnf-search-form__keyword')
    const fields = wrapper.findAll('.mwnf-search-form__field')
    expect(keywords).toHaveLength(2)
    await keywords[0].setValue('bowl')
    await fields[0].setValue('name')
    await keywords[1].setValue('glass')
    await wrapper.find('.mwnf-search-form__operator').setValue('OR')
    const dateSelects = wrapper.findAll('.mwnf-search-form__dates .mwnf-facet__select')
    await dateSelects[0].setValue('1001')
    await dateSelects[1].setValue('1600')
    await wrapper.find('.mwnf-search-form__language').setValue('fr')
    await wrapper.find('.mwnf-facet__checkbox').setValue(true)

    await wrapper.find('form').trigger('submit')
    await settle(() => router.currentRoute.value.name === 'search-results')

    expect(router.currentRoute.value.query).toMatchObject({
      q: 'bowl',
      field: 'name',
      q2: 'glass',
      field2: 'keyword',
      op2: 'OR',
      from: '1001',
      to: '1600',
      lang: 'fr',
      epm: '1',
    })
  })

  it('rows mode: the from/to selects offer centuryPresets\' asymmetric boundaries', async () => {
    const { wrapper } = await mountView(SearchFormView, {
      props: { spec: { mode: 'rows', dates: { presets: centuryPresets }, target: 'search-results' } },
    })
    const [fromSelect, toSelect] = wrapper.findAll('.mwnf-search-form__dates .mwnf-facet__select')
    const fromValues = fromSelect.findAll('option').map((o) => o.element.value).filter(Boolean)
    const toValues = toSelect.findAll('option').map((o) => o.element.value).filter(Boolean)
    expect(fromValues).toHaveLength(16)
    expect(toValues).toHaveLength(15)
    expect(fromValues[0]).toBe('501')
    expect(toValues[0]).toBe('600')
  })

  it('rows mode: the search-language select lists the entity\'s own translated languages', async () => {
    const { wrapper } = await mountView(SearchFormView, {
      props: { spec: { mode: 'rows', language: 'objects', target: 'search-results' } },
    })
    const options = wrapper.find('.mwnf-search-form__language').findAll('option').map((o) => o.text())
    expect(options).toEqual(['Any', 'EN', 'FR'])
  })

  it('facets mode: choosing a facet or a date bucket navigates immediately, with only that one key', async () => {
    const { wrapper, router } = await mountView(SearchFormView, {
      props: {
        spec: {
          mode: 'facets',
          entity: 'objects',
          facets: [{ key: 'country', label: 'catalogue.facet.country', field: 'country_id' }],
          dates: 'buckets',
          target: 'search-results',
        },
      },
      route: '/objects',
    })
    await settle(() => wrapper.findAll('.mwnf-facet__select').length > 0)
    const selects = wrapper.findAll('.mwnf-facet__select')
    await selects[0].setValue('c-eg')
    await settle(() => router.currentRoute.value.query.country === 'c-eg')
    expect(router.currentRoute.value.query).toEqual({ country: 'c-eg' })

    // A second choice — the date bucket — replaces the query with its own
    // one key, exactly as legacy's `CollectionSearch.vue` always did.
    const dateSelects = wrapper.findAll('.mwnf-search-form__dates .mwnf-facet__select')
    await dateSelects[0].setValue(dateSelects[0].findAll('option')[1].element.value)
    await settle(() => Boolean(router.currentRoute.value.query.from))
    expect(router.currentRoute.value.query).toEqual({ from: router.currentRoute.value.query.from })
  })

  it('radio mode: the active radio names the query key the chosen value is written under', async () => {
    const { wrapper, router } = await mountView(SearchFormView, {
      props: {
        spec: {
          mode: 'radio',
          facets: [
            { key: 'country', label: 'catalogue.facet.country', options: [{ value: 'c-eg', label: 'Egypt' }] },
            { key: 'begin', label: 'catalogue.facet.startDate', type: 'year' },
          ],
          target: 'search-results',
        },
      },
    })
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(2)
    await radios[1].setValue(true)
    await wrapper.find('.mwnf-search-form__year').setValue('1200')
    await wrapper.find('form').trigger('submit')
    await settle(() => router.currentRoute.value.query.begin === '1200')
    expect(router.currentRoute.value.query).toEqual({ begin: '1200' })
  })

  it('"show all" keeps a checked extra but drops everything else, and the how-to link points at its route', async () => {
    const { wrapper, router } = await mountView(SearchFormView, {
      props: {
        spec: {
          mode: 'rows',
          extras: [{ key: 'epm', type: 'checkbox', label: 'catalogue.facet.epm' }],
          target: 'search-results',
          howTo: 'search-how-to',
          showAllLabel: 'catalogue.search.showAll',
        },
      },
    })
    expect(wrapper.find('.mwnf-search-form__how-to a').attributes('href')).toBe('/how-to-search')
    await wrapper.find('.mwnf-facet__checkbox').setValue(true)
    await wrapper.findAll('.mwnf-search-form__keyword')[0].setValue('bowl')
    await wrapper.find('.mwnf-filter__button--reset').trigger('click')
    await settle(() => router.currentRoute.value.name === 'search-results')
    expect(router.currentRoute.value.query).toEqual({ epm: '1' })
  })

  it('renders no how-to link when the spec says false', async () => {
    const { wrapper } = await mountView(SearchFormView, {
      props: { spec: { mode: 'rows', target: 'search-results', howTo: false } },
    })
    expect(wrapper.find('.mwnf-search-form__how-to').exists()).toBe(false)
  })

  it('hands #intro/#before/#extras/#actions their slot content', async () => {
    const { wrapper } = await mountView(SearchFormView, {
      props: { spec: { mode: 'rows', target: 'search-results' } },
      slots: {
        intro: '<p class="own-intro">Intro</p>',
        before: '<p class="own-before">Before</p>',
        extras: '<label class="own-extra">Extra</label>',
        actions: '<button class="own-action">Own action</button>',
      },
    })
    expect(wrapper.find('.own-intro').exists()).toBe(true)
    expect(wrapper.find('.own-before').exists()).toBe(true)
    expect(wrapper.find('.own-extra').exists()).toBe(true)
    expect(wrapper.find('.own-action').exists()).toBe(true)
  })
})

describe('EssayView', () => {
  // The fixture tree (`test-tree-root`): theme-a (page-a1[o1], page-a2[o2],
  // page-a3[]) and theme-b (page-b1[o3]), with a third child (extra-a) that
  // is not a theme — `childType: ['theme', 'page']` holds every level to its
  // own type, the way sharinghistory's themes-and-chapters and DXA's
  // themes-and-subthemes both need.
  const spec = {
    // `tree.entity: 'collections'` pins the tree's own translations entity
    // explicitly — it would otherwise fall back to `spec.entity` ('objects',
    // the items entity below), which is a different entity entirely; see
    // the "reads spec.entity as the tree's translations entity" test below,
    // which exercises that fallback deliberately, on a pre-built tree.
    tree: { purpose: 'test-tree-root', childType: ['theme', 'page'], entity: 'collections' },
    entity: 'objects',
    route: 'theme',
    glossary: true,
    items: { route: 'objects-detail' },
    panel: {},
    navigation: 'tree',
    breadcrumb: true,
    tabs: true,
  }

  it('renders the essay — the breadcrumb, the tabs, the quote, the glossary in the body, and the selected item panel', async () => {
    const { wrapper } = await mountView(EssayView, { props: { spec, id: 'page-a1' }, route: '/theme/page-a1' })
    await settle(() => wrapper.find('.mwnf-essay__quote').exists())

    expect(wrapper.find('h1').text()).toContain('Page A1')
    expect(wrapper.find('.mwnf-essay__quote').text()).toBe('An opening page.')
    // The description carries a glossary term with no `glossary_ids` column
    // of its own to read: `glossaryTermsForText` scans the whole glossary.
    expect(wrapper.find('.mwnf-essay__prose').html()).toContain('gloss-term')

    const crumbs = wrapper.findAll('.mwnf-essay__breadcrumb-link').map((c) => c.text())
    expect(crumbs).toEqual(['Test Tree Root', 'Theme A'])

    // page-a3's English title is the importer's synthesized "Page 999" — real
    // here, since this spec sets no `placeholder` rule to catch it.
    const tabs = wrapper.findAll('.mwnf-essay__tab').map((tab) => tab.text())
    expect(tabs).toEqual(['Page A1', 'Page A2', 'Page 999'])
    expect(wrapper.find('.mwnf-essay__tab--active').text()).toBe('Page A1')

    // The panel: page-a1's only item is o1, whose translation renders through
    // the same Markdown pipeline as everywhere else.
    expect(wrapper.find('.mwnf-essay__panel-name').html()).toContain('Glazed <em>bowl</em>')
    expect(wrapper.find('.mwnf-essay__panel-link').attributes('href')).toBe('/objects/o1')
  })

  it("crosses a branch boundary in 'tree' navigation and stays inside the parent in 'siblings'", async () => {
    const { wrapper: treeWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false }, id: 'page-a3' },
      route: '/theme/page-a3',
    })
    await settle(() => treeWrapper.find('.mwnf-essay__nav').exists())
    // theme-a's last page is followed by theme-b itself in the flattened
    // walk — decision D2: the walk crosses the branch "for free".
    expect(treeWrapper.find('.mwnf-essay__nav-link--next').attributes('href')).toBe('/theme/theme-b')

    const { wrapper: siblingsWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, navigation: 'siblings' }, id: 'page-a2' },
      route: '/theme/page-a2',
    })
    await settle(() => siblingsWrapper.find('.mwnf-essay__nav').exists())
    expect(siblingsWrapper.find('.mwnf-essay__nav-link--previous').attributes('href')).toBe('/theme/page-a1')
    expect(siblingsWrapper.find('.mwnf-essay__nav-link--next').attributes('href')).toBe('/theme/page-a3')

    const { wrapper: lastWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, navigation: 'siblings' }, id: 'page-a3' },
      route: '/theme/page-a3',
    })
    await settle(() => lastWrapper.find('.mwnf-essay__nav').exists())
    expect(lastWrapper.find('.mwnf-essay__nav-link--next').exists()).toBe(false)
  })

  it('falls back through the placeholder rule: a synthesized title in the record language, then English, then the internal name', async () => {
    const { wrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, placeholder: /^(Theme|Page) \d+$/ }, id: 'page-a3' },
      route: '/theme/page-a3',
    })
    // page-a3's only title, in English, is "Page 999" — synthesized, and
    // matched by the placeholder rule in both the record language and its
    // English fallback, so the heading falls back to the internal name.
    await settle(() => wrapper.find('h1').text().includes('Page A3'))
    expect(wrapper.find('h1').text()).toContain('Page A3 (unordered)')
  })

  it('renders essay only in about mode — no panel, no navigation', async () => {
    const { wrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, about: (node) => node.type === 'theme' }, id: 'theme-a' },
      route: '/theme/theme-a',
    })
    await settle(() => wrapper.find('.mwnf-essay__quote').exists())
    expect(wrapper.find('h1').text()).toContain('Theme A')
    expect(wrapper.find('.mwnf-essay__panel').exists()).toBe(false)
    expect(wrapper.find('.mwnf-essay__nav').exists()).toBe(false)
  })

  it('hands a slot the context — the node, the selected item, the items it was resolved from, and the selected variant', async () => {
    const { wrapper } = await mountView(EssayView, {
      props: { spec, id: 'page-a1' },
      slots: {
        panel:
          '<template #panel="{ node, selected, items, selectedVariant }"><p class="own-panel">{{ node.id }} / {{ selected.id }} / {{ items.length }} / {{ selectedVariant.id }}</p></template>',
      },
      route: '/theme/page-a1',
    })
    await settle(() => wrapper.find('.own-panel').exists())
    // No `panel.variants` in this spec: the item's own picture is the only
    // variant, carrying the synthetic id the view gives it.
    expect(wrapper.find('.own-panel').text()).toBe('page-a1 / o1 / 1 / __primary')
    expect(wrapper.find('.mwnf-essay__panel').exists()).toBe(false)
  })

  it('quote/body accept a dotted path into the translation, and a function of the base context — for a field a flat name cannot reach', async () => {
    const { wrapper: pathWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, quote: false, body: 'extra.intro_text' }, id: 'page-a2' },
      route: '/theme/page-a2',
    })
    await settle(() => pathWrapper.find('.mwnf-essay__prose').exists())
    expect(pathWrapper.find('.mwnf-essay__prose').text()).toBe('An introduction nested under extra.')

    const { wrapper: fnWrapper } = await mountView(EssayView, {
      props: {
        spec: { ...spec, tabs: false, quote: (ctx) => `${ctx.language}!`, body: (ctx) => ctx.text.extra?.intro_text ?? '' },
        id: 'page-a2',
      },
      route: '/theme/page-a2',
    })
    await settle(() => fnWrapper.find('.mwnf-essay__quote').exists())
    expect(fnWrapper.find('.mwnf-essay__quote').text()).toBe('en!')
    expect(fnWrapper.find('.mwnf-essay__prose').text()).toBe('An introduction nested under extra.')
  })

  it('adds meta lines and a badge to the item grid through items.meta/items.badge', async () => {
    const { wrapper } = await mountView(EssayView, {
      props: {
        spec: { ...spec, tabs: false, panel: false, items: { ...spec.items, meta: (item) => [`Meta for ${item.id}`], badge: () => 'New' } },
        id: 'page-a1',
      },
      route: '/theme/page-a1',
    })
    await settle(() => wrapper.find('.mwnf-grid__tile').exists())
    expect(wrapper.find('.mwnf-grid__meta').text()).toBe('Meta for o1')
    expect(wrapper.find('.mwnf-grid__badge').text()).toBe('New')
  })

  it('panel.variants can carry a caption: selecting a variant swaps the image, title, justification and fields together', async () => {
    const variantSpec = {
      ...spec,
      tabs: false,
      panel: {
        variants: (item) =>
          item.id === 'o1'
            ? [
                {
                  id: 'detail-1',
                  image: 'https://example.test/detail.jpg',
                  alt: 'A close-up',
                  caption: {
                    title: 'A closer <em>detail</em>',
                    justification: 'A closer look at *this* bowl.',
                    fields: [{ label: 'sheet.field.location', value: 'Cairo, detail' }],
                  },
                },
              ]
            : [],
      },
    }
    const { wrapper } = await mountView(EssayView, { props: { spec: variantSpec, id: 'page-a1' }, route: '/theme/page-a1' })
    await settle(() => wrapper.find('.mwnf-essay__variants').exists())

    // The item's own picture is variant zero — no caption of its own, so the
    // panel starts on the item's default name and no field/justification row.
    const variantButtons = wrapper.findAll('.mwnf-essay__variant')
    expect(variantButtons).toHaveLength(2)
    expect(wrapper.find('.mwnf-essay__panel-name').html()).toContain('Glazed <em>bowl</em>')
    expect(wrapper.find('.mwnf-essay__panel-field').exists()).toBe(false)
    expect(wrapper.find('.mwnf-essay__panel-justification').exists()).toBe(false)

    await variantButtons[1].trigger('click')

    // Picking the detail variant swaps the title, the field (its label an
    // entry name, resolved through `t`) and the Markdown justification —
    // together, not just the image.
    expect(wrapper.find('.mwnf-essay__panel-name').html()).toContain('A closer <em>detail</em>')
    expect(wrapper.find('.mwnf-essay__panel-field').text()).toBe('LocationCairo, detail')
    expect(wrapper.find('.mwnf-essay__panel-justification').html()).toContain('A closer look at <em>this</em> bowl.')
  })

  it("tabs: 'children' lists the node's own children; tabs: true (or 'siblings') keeps listing its siblings", async () => {
    const { wrapper: childrenWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: 'children', navigation: false, breadcrumb: false }, id: 'theme-a' },
      route: '/theme/theme-a',
    })
    await settle(() => childrenWrapper.findAll('.mwnf-essay__tab').length > 0)
    // theme-a's chapters — page-a1/a2/a3 — not its sibling themes.
    expect(childrenWrapper.findAll('.mwnf-essay__tab').map((tab) => tab.text())).toEqual(['Page A1', 'Page A2', 'Page 999'])

    const { wrapper: siblingsWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: true, navigation: false, breadcrumb: false }, id: 'theme-a' },
      route: '/theme/theme-a',
    })
    await settle(() => siblingsWrapper.findAll('.mwnf-essay__tab').length > 0)
    expect(siblingsWrapper.findAll('.mwnf-essay__tab').map((tab) => tab.text())).toEqual(['Theme A', 'Theme B'])
  })

  it("numbers a themes-package tree's top-level nodes (numbering: 'roman'), and reads spec.entity as the tree's translations entity for a pre-built tree", async () => {
    // A themes.json-shaped tree, built inline (`root` is null for this shape —
    // see collectionTree.js): two top-level themes, no sub-themes needed for
    // this test. Ids reuse the fixture's `things` entity on purpose — that
    // entity's translations carry a `title`, unlike `collections`, so a
    // themeSpec whose tree carries no `entity` of its own proves it is
    // `spec.entity` ('things') resolving the title, not the hardcoded
    // `'collections'` fallback (which has no entry for these ids and would
    // fall back to the internal name instead).
    // `EssayView` reads a pre-built tree's `root`/`byId` as refs (what
    // `useCollectionTree()` returns); `collectionTreeFromThemes` itself is
    // the pure, non-reactive indexer, so its static result is wrapped the
    // same way a site's own `useCollectionTree({ source: 'themes', ... })`
    // would be. `collectionTreeFromThemes` (viewer-core 1.12.0+) now names
    // its own default entity ('themes') on the tree it returns, so its
    // `entity` is dropped here to still stand for a tree genuinely carrying
    // none of its own — a site's pre-1.12.0 build, say.
    const { entity: _themesTreeEntity, ...plainTree } = collectionTreeFromThemes([
      { id: '1', display_order: 1, internal_name: 'First (fallback name)' },
      { id: '2', display_order: 2, internal_name: 'Second (fallback name)' },
    ])
    const themesTree = { ...plainTree, root: ref(plainTree.root), byId: ref(plainTree.byId) }
    const themeSpec = { tree: themesTree, entity: 'things', route: 'theme', numbering: 'roman', panel: false, navigation: false }

    const { wrapper: firstWrapper } = await mountView(EssayView, { props: { spec: themeSpec, id: '1' }, route: '/theme/1' })
    await settle(() => firstWrapper.find('h1').text().includes('First Thing'))
    expect(firstWrapper.find('.mwnf-essay__number').text()).toBe('I')
    expect(firstWrapper.find('h1').text()).toContain('First Thing (EN)')

    const { wrapper: secondWrapper } = await mountView(EssayView, { props: { spec: themeSpec, id: '2' }, route: '/theme/2' })
    await settle(() => secondWrapper.find('h1').text().includes('Second Thing'))
    expect(secondWrapper.find('.mwnf-essay__number').text()).toBe('II')
  })

  it('about mode keeps the panel or the navigation when told to, instead of always dropping both', async () => {
    // The function form returns `{ panel, navigation }` instead of a plain
    // boolean: page-a1 keeps its picture panel (it has an item, o1) but
    // still loses the navigation row.
    const { wrapper: objectWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, about: () => ({ panel: true, navigation: false }) }, id: 'page-a1' },
      route: '/theme/page-a1',
    })
    await settle(() => objectWrapper.find('.mwnf-essay__quote').exists())
    expect(objectWrapper.find('.mwnf-essay--about').exists()).toBe(true)
    expect(objectWrapper.find('.mwnf-essay__panel').exists()).toBe(true)
    expect(objectWrapper.find('.mwnf-essay__nav').exists()).toBe(false)

    // `aboutKeeps` is the spec-wide equivalent, for a family whose about
    // pages all keep the same piece — `about` stays a plain boolean.
    const { wrapper: keepsWrapper } = await mountView(EssayView, {
      props: { spec: { ...spec, tabs: false, about: () => true, aboutKeeps: ['panel'] }, id: 'page-a1' },
      route: '/theme/page-a1',
    })
    await settle(() => keepsWrapper.find('.mwnf-essay__quote').exists())
    expect(keepsWrapper.find('.mwnf-essay__panel').exists()).toBe(true)
    expect(keepsWrapper.find('.mwnf-essay__nav').exists()).toBe(false)
  })

  it('renders no source credit without a declared site origin, and the address once one is declared', async () => {
    const { wrapper: withoutOrigin } = await mountView(EssayView, { props: { spec, id: 'page-a1' }, route: '/theme/page-a1' })
    await settle(() => withoutOrigin.find('.mwnf-essay__quote').exists())
    expect(withoutOrigin.find('.mwnf-source-credit').exists()).toBe(false)

    const restore = withSiteRights()
    try {
      const { wrapper } = await mountView(EssayView, { props: { spec, id: 'page-a1' }, route: '/theme/page-a1' })
      await settle(() => wrapper.find('.mwnf-source-credit').exists())
      expect(wrapper.find('.mwnf-source-credit__label').text()).toBe('Source')
      expect(wrapper.find('.mwnf-source-credit a').attributes('href')).toBe('https://example.org/#/theme/page-a1')
    } finally {
      restore()
    }
  })

  it("lets an #after slot of its own replace the default SourceCredit", async () => {
    const restore = withSiteRights()
    try {
      const { wrapper } = await mountView(EssayView, {
        props: { spec, id: 'page-a1' },
        slots: { after: '<template #after><p class="own-after">mine</p></template>' },
        route: '/theme/page-a1',
      })
      await settle(() => wrapper.find('.own-after').exists())
      expect(wrapper.find('.own-after').text()).toBe('mine')
      expect(wrapper.find('.mwnf-source-credit').exists()).toBe(false)
    } finally {
      restore()
    }
  })
})

// PartnerListView: islamicart's/sharinghistory's country accordion with
// main/associated tiers, and the DXA family's plain country groups with an
// A-Z toggle, both over the fixture's `partners` entity (see
// tests/fixtures/data-package/partners.json): p1 "Zed Museum" and p7 "Alpha
// Museum" are Egyptian main partners, p2 "Attached Gallery" is associated to
// p1; p3 "Damascus Museum" is a Syrian main partner, p4 "Aleppo Annex" is
// associated to it, p5 "Homs Collection" is associated to a parent id the
// fixture does not carry; p6 "International Foundation" carries no country
// and no translation, so its row falls back to `internal_name`.
describe('PartnerListView', () => {
  it('groups by country into tiers, sorted by name; the country order and item counts are the caller\'s', async () => {
    const { wrapper } = await mountView(PartnerListView, {
      props: {
        spec: {
          entity: 'partners',
          group: { tier: 'level', order: 'country' },
          label: countryOrOther,
          route: 'partner',
          count: true,
        },
      },
      route: '/partners',
    })
    await settle(() => wrapper.findAll('.mwnf-partner-list__group').length > 0)

    expect(wrapper.find('.mwnf-partner-list__count').text()).toBe('Partners found: 7')

    const groups = wrapper.findAll('.mwnf-partner-list__group')
    expect(groups.map((g) => g.find('.mwnf-partner-list__group-title').text())).toEqual(['Egypt', 'Other', 'Syria'])
    // Every group is a collapsible, expanded <details> - the accordion variant.
    expect(groups.every((g) => g.element.tagName === 'DETAILS' && g.attributes('open') !== undefined)).toBe(true)

    const egypt = groups[0]
    expect(egypt.findAll('.mwnf-partner-list__tier')[0].findAll('.mwnf-partner-list__name').map((n) => n.text())).toEqual([
      'Alpha Museum, Giza',
      'Zed Museum, Cairo',
    ])
    expect(egypt.find('.mwnf-partner-list__tier--associated .mwnf-partner-list__tier-label').text()).toBe('Associated Partners')
    expect(egypt.find('.mwnf-partner-list__tier--associated .mwnf-partner-list__name').text()).toBe('Attached Gallery, Cairo')
    // p1 carries a logo; the alt text is the plain name, not the HTML.
    expect(egypt.find('.mwnf-partner-list__logo').attributes('src')).toBe('p1-logo.png')
    expect(egypt.find('.mwnf-partner-list__logo').attributes('alt')).toBe('Zed Museum')
    // p1's own item_count (12) prints against the shared entry; p7's (0) prints nothing.
    expect(egypt.findAll('.mwnf-partner-list__meta').map((m) => m.text())).toEqual(['12 object(s) in this site'])
    // Links go through the row's own route.
    const link = egypt.findAll('.mwnf-partner-list__name')[1]
    expect(link.attributes('href')).toBe('/partner/p1')

    // No translation at all: falls back to internal_name, and to no country.
    const other = groups[1]
    expect(other.find('.mwnf-partner-list__name').text()).toBe('International Foundation')
    expect(other.find('.mwnf-partner-list__tier--associated').exists()).toBe(false)

    const syria = groups[2]
    expect(syria.findAll('.mwnf-partner-list__tier--associated .mwnf-partner-list__name').map((n) => n.text())).toEqual([
      'Aleppo Annex, Aleppo',
      'Homs Collection, Homs',
    ])
  })

  it('nested: true moves an associated partner under its own parent (partnerHierarchy); one with no match in the group stays flat', async () => {
    const { wrapper } = await mountView(PartnerListView, {
      props: {
        spec: {
          entity: 'partners',
          group: { tier: 'level', order: 'country' },
          label: countryOrOther,
          route: 'partner',
          nested: true,
        },
      },
      route: '/partners',
    })
    await settle(() => wrapper.findAll('.mwnf-partner-list__group').length > 0)

    const groups = wrapper.findAll('.mwnf-partner-list__group')
    const egypt = groups[0]
    // p2 is parented to p1 ("Zed Museum"): nested under it, not in the flat column.
    expect(egypt.find('.mwnf-partner-list__tier--associated').exists()).toBe(false)
    const zed = egypt.findAll('.mwnf-partner-list__row-block')[1]
    expect(zed.find('.mwnf-partner-list__name').text()).toBe('Zed Museum, Cairo')
    expect(zed.find('.mwnf-partner-list__children .mwnf-partner-list__name').text()).toBe('Attached Gallery, Cairo')

    const syria = groups[2]
    // p5's parent_id ("px-missing") is not in the fixture: it keeps its place
    // in the flat column rather than being dropped.
    expect(syria.find('.mwnf-partner-list__tier--associated').exists()).toBe(true)
    expect(syria.find('.mwnf-partner-list__tier--associated .mwnf-partner-list__name').text()).toBe('Homs Collection, Homs')
    const damascus = syria.findAll('.mwnf-partner-list__row-block')[0]
    expect(damascus.find('.mwnf-partner-list__children .mwnf-partner-list__name').text()).toBe('Aleppo Annex, Aleppo')
  })

  it('the open, untiered A-Z list (the DXA shape): no tiers, a variant with no accordion, and an order toggle mirrored in the query', async () => {
    const spec = {
      entity: 'partners',
      group: { tier: false, order: 'country' },
      label: countryOrOther,
      route: 'partner',
      orderToggle: true,
      variant: 'open',
    }
    const { wrapper, router } = await mountView(PartnerListView, { props: { spec }, route: '/partners' })
    await settle(() => wrapper.findAll('.mwnf-partner-list__group').length > 0)

    const groups = wrapper.findAll('.mwnf-partner-list__group')
    expect(groups.every((g) => g.element.tagName === 'SECTION')).toBe(true)
    expect(groups.map((g) => g.find('.mwnf-partner-list__group-title').text())).toEqual(['Egypt', 'Other', 'Syria'])
    // No tier at all: every partner - main and what would be associated - is one list.
    expect(wrapper.findAll('.mwnf-partner-list__tier--associated')).toHaveLength(0)
    expect(groups[0].findAll('.mwnf-partner-list__name').map((n) => n.text())).toEqual([
      'Alpha Museum, Giza',
      'Attached Gallery, Cairo',
      'Zed Museum, Cairo',
    ])

    // The label names the action the click performs (as legacy's own button
    // does), not the current direction: ascending by default, so a click
    // switches to Z-A.
    const toggle = wrapper.find('.mwnf-partner-list__toggle-button')
    expect(toggle.text()).toBe('Sort Z-A')
    await toggle.trigger('click')
    await settle(() => router.currentRoute.value.query.order === 'desc')
    expect(wrapper.find('.mwnf-partner-list__toggle-button').text()).toBe('Sort A-Z')
    expect(wrapper.findAll('.mwnf-partner-list__group-title').map((g) => g.text())).toEqual(['Syria', 'Other', 'Egypt'])
  })

  it("group.order: 'name' groups everything into one flat, alphabetical list with no country heading", async () => {
    const { wrapper } = await mountView(PartnerListView, {
      props: {
        spec: {
          entity: 'partners',
          group: { tier: false, order: 'name' },
          route: 'partner',
          orderToggle: true,
        },
      },
      route: '/partners?order=desc',
    })
    await settle(() => wrapper.findAll('.mwnf-partner-list__name').length > 0)

    expect(wrapper.findAll('.mwnf-partner-list__group')).toHaveLength(1)
    expect(wrapper.find('.mwnf-partner-list__group-title').exists()).toBe(false)
    expect(wrapper.findAll('.mwnf-partner-list__name').map((n) => n.text())).toEqual([
      'Zed Museum, Cairo',
      'International Foundation',
      'Homs Collection, Homs',
      'Damascus Museum, Damascus',
      'Attached Gallery, Cairo',
      'Alpha Museum, Giza',
      'Aleppo Annex, Aleppo',
    ])
  })

  it('shows the empty state when scope leaves nothing, and the caller can name its own entry', async () => {
    const { wrapper } = await mountView(PartnerListView, {
      props: {
        spec: {
          entity: 'partners',
          scope: (partner) => partner.project_ids?.includes('nope'),
          empty: 'core.action.empty',
        },
      },
      route: '/partners',
    })
    await settle(() => wrapper.find('.mwnf-partner-list__empty').exists())
    expect(wrapper.find('.mwnf-partner-list__empty').text()).toBe('Nothing to show.')
    expect(wrapper.find('.mwnf-partner-list__groups').exists()).toBe(false)
  })

  it('scope is a plain predicate (a site\'s own axis, whatever it reads it from), and record/route are the caller\'s to build', async () => {
    const { wrapper } = await mountView(PartnerListView, {
      props: {
        spec: {
          entity: 'partners',
          scope: (partner) => partner.project_ids?.includes('EPM'),
          group: { tier: 'level', order: 'country' },
          label: countryOrOther,
          record: (partner, ctx) => ({ name: ctx.renderInline(`Museum: ${ctx.tr(partner.id).name ?? partner.internal_name}`), route: { name: 'partner', params: { id: partner.id }, query: { lang: 'fr' } } }),
        },
      },
      route: '/partners',
    })
    await settle(() => wrapper.findAll('.mwnf-partner-list__name').length > 0)
    // Only the EPM partners (Syria's) match the scope.
    expect(wrapper.findAll('.mwnf-partner-list__group-title').map((g) => g.text())).toEqual(['Syria'])
    expect(wrapper.find('.mwnf-partner-list__name').text()).toBe('Museum: Damascus Museum')
    expect(wrapper.find('.mwnf-partner-list__name').attributes('href')).toBe('/partner/p3?lang=fr')
  })

  it('hands #before/#group-heading/#row/#after slots the group, partner and row, replacing the default markup', async () => {
    const { wrapper } = await mountView(PartnerListView, {
      props: {
        spec: {
          entity: 'partners',
          scope: (partner) => partner.id === 'p1' || partner.id === 'p2',
          group: { tier: 'level', order: 'country' },
          label: countryOrOther,
          route: 'partner',
        },
      },
      route: '/partners',
      slots: {
        before: '<p class="own-before">Before the groups</p>',
        'group-heading': '<template #group-heading="{ group }"><h2 class="own-heading">{{ group.label }}</h2></template>',
        row: '<template #row="{ partner, row }"><p class="own-row">{{ partner.id }}: {{ row.name }}</p></template>',
        after: '<p class="own-after">After the groups</p>',
      },
    })
    await settle(() => wrapper.findAll('.own-row').length > 0)
    expect(wrapper.find('.own-before').exists()).toBe(true)
    expect(wrapper.find('.own-heading').text()).toBe('Egypt')
    expect(wrapper.find('.mwnf-partner-list__group-title').exists()).toBe(false)
    expect(wrapper.findAll('.own-row').map((r) => r.text())).toEqual(['p1: Zed Museum', 'p2: Attached Gallery'])
    expect(wrapper.find('.own-after').exists()).toBe(true)
  })
})

// The views are a promise to the websites' configurations: what is exported
// from `/views` is what `config.views` names.
describe('TimelineResultsView', () => {
  // Fixture events (tests/fixtures/data-package/timeline_events.json):
  // e1 tl-eg/c-eg 900–950, e2 tl-eg/c-eg 1200–open, e3 tl-sy/c-sy 1000–1100,
  // e4 tl-theme-a/c-eg 1300–1350 (bound to the 'theme-a' collection),
  // e5 tl-local (no country) 500–600, the narrative chronology's own event.
  const trTimelineEvents = (id) => useDataPackage().tr('timeline_events', id, 'en')
  const countrySpec = {
    scope: 'country',
    countryLabel: (id) => COUNTRY_NAMES[id] ?? id,
    tr: trTimelineEvents,
    controls: [
      { key: 'country' },
      { key: 'begin' },
      { key: 'end' },
    ],
    pageSize: 2,
  }

  it('lists events chronologically, paged, with the summary and the country/date row', async () => {
    const { wrapper } = await mountView(TimelineResultsView, { props: { spec: countrySpec }, route: '/timeline/results' })
    await settle(() => wrapper.findAll('.mwnf-timeline__row').length > 0)
    // Local scope's e5 is excluded from the country merge; the rest sort by year_from.
    const dates = wrapper.findAll('.mwnf-timeline__date').map((d) => d.text())
    expect(dates).toEqual(['900 AD – 950 AD', '1000 AD – 1100 AD'])
    expect(wrapper.findAll('.mwnf-timeline__caption').map((c) => c.text())).toEqual(['Egypt', 'Syria'])
    expect(wrapper.find('.mwnf-timeline__description').html()).toContain('<em>dynasty</em>')
    expect(wrapper.find('.mwnf-summary__count').text()).toBe('4')
    expect(wrapper.find('.mwnf-pagination').exists()).toBe(true)
  })

  it('filters by country and period from the URL, under the overlap rule', async () => {
    const { wrapper } = await mountView(TimelineResultsView, {
      props: { spec: countrySpec },
      route: '/timeline/results?country=c-eg&begin=1000',
    })
    await settle(() => wrapper.findAll('.mwnf-timeline__row').length > 0)
    // Egypt holds e1 (900–950, dropped: ends before 1000) and e2 (1200–open) and e4 (1300–1350).
    expect(wrapper.findAll('.mwnf-timeline__date').map((d) => d.text())).toEqual(['1200 AD –', '1300 AD – 1350 AD'])
  })

  it('navigates a control choice through the panel, like the catalogue results view', async () => {
    const { wrapper, router } = await mountView(TimelineResultsView, { props: { spec: countrySpec }, route: '/timeline/results' })
    await settle(() => wrapper.findAll('.mwnf-timeline__row').length > 0)
    await wrapper.find('.mwnf-facet__select').setValue('c-sy')
    await wrapper.find('form').trigger('submit')
    await settle(() => router.currentRoute.value.query.country === 'c-sy')
    expect(router.currentRoute.value.query.country).toBe('c-sy')
    await settle(() => wrapper.findAll('.mwnf-timeline__row').length === 1)
    expect(wrapper.find('.mwnf-timeline__caption').text()).toBe('Syria')
  })

  it('shows the empty state when nothing matches, default or through the slot', async () => {
    const { wrapper } = await mountView(TimelineResultsView, {
      props: { spec: countrySpec },
      route: '/timeline/results?country=c-xx',
    })
    await settle(() => wrapper.text().includes('No results'))
    expect(wrapper.find('.mwnf-timeline__rows').exists()).toBe(false)

    const { wrapper: ownEmpty } = await mountView(TimelineResultsView, {
      props: { spec: countrySpec },
      slots: { empty: '<template #empty><p class="own-empty">Nothing here</p></template>' },
      route: '/timeline/results?country=c-xx',
    })
    await settle(() => ownEmpty.find('.own-empty').exists())
    expect(ownEmpty.find('.own-empty').text()).toBe('Nothing here')
  })

  it('shows the "See gallery" cross-link once the site says objects exist, and not otherwise', async () => {
    const { wrapper } = await mountView(TimelineResultsView, {
      props: { spec: { ...countrySpec, gallery: { route: 'timeline-gallery', items: () => 3 } } },
      route: '/timeline/results?country=c-eg',
    })
    await settle(() => wrapper.find('.mwnf-timeline__gallery').exists())
    expect(wrapper.find('.mwnf-timeline__gallery').text()).toContain('See Gallery')
    expect(wrapper.find('.mwnf-timeline__gallery').text()).toContain('3')
    expect(wrapper.find('.mwnf-timeline__gallery').attributes('href')).toBe('/gallery?country=c-eg')

    const { wrapper: hidden } = await mountView(TimelineResultsView, {
      props: { spec: { ...countrySpec, gallery: { route: 'timeline-gallery', items: () => 0 } } },
      route: '/timeline/results?country=c-eg',
    })
    await settle(() => hidden.findAll('.mwnf-timeline__row').length > 0)
    expect(hidden.find('.mwnf-timeline__gallery').exists()).toBe(false)

    const { wrapper: off } = await mountView(TimelineResultsView, { props: { spec: countrySpec }, route: '/timeline/results' })
    await settle(() => off.findAll('.mwnf-timeline__row').length > 0)
    expect(off.find('.mwnf-timeline__gallery').exists()).toBe(false)
  })

  it("filters Sharing History's collection axis, the Permanent Collection sentinel included", async () => {
    const collectionSpec = {
      scope: 'collection',
      countryLabel: (id) => COUNTRY_NAMES[id] ?? id,
      tr: trTimelineEvents,
      collections: () => [
        { value: '', label: 'All' },
        { value: 'pc', label: 'Permanent Collection' },
        { value: 'theme-a', label: 'Theme A' },
      ],
      controls: [{ key: 'collection', label: 'timeline.results.eventsFound' }],
    }
    const { wrapper: all } = await mountView(TimelineResultsView, { props: { spec: collectionSpec }, route: '/timeline/results' })
    await settle(() => all.findAll('.mwnf-timeline__row').length > 0)
    expect(all.findAll('.mwnf-timeline__row')).toHaveLength(4)

    const { wrapper: pc } = await mountView(TimelineResultsView, {
      props: { spec: collectionSpec },
      route: '/timeline/results?collection=pc',
    })
    await settle(() => pc.findAll('.mwnf-timeline__row').length > 0)
    expect(pc.findAll('.mwnf-timeline__row')).toHaveLength(3)

    const { wrapper: themed } = await mountView(TimelineResultsView, {
      props: { spec: collectionSpec },
      route: '/timeline/results?collection=theme-a',
    })
    await settle(() => themed.findAll('.mwnf-timeline__row').length > 0)
    expect(themed.findAll('.mwnf-timeline__row')).toHaveLength(1)
    expect(themed.find('.mwnf-timeline__description').text()).toBe('A themed exhibition event.')
  })

  describe('entrance mode', () => {
    const entranceSpec = {
      scope: 'country',
      countryLabel: (id) => COUNTRY_NAMES[id] ?? id,
      tr: trTimelineEvents,
      controls: [{ key: 'country' }, { key: 'begin' }, { key: 'end' }],
      entrance: true,
      route: 'timeline-results',
    }

    it('renders only the form, with no results and no pagination', async () => {
      const { wrapper } = await mountView(TimelineResultsView, { props: { spec: entranceSpec }, route: '/timeline' })
      expect(wrapper.find('.mwnf-timeline__filters').exists()).toBe(true)
      expect(wrapper.find('.mwnf-timeline__rows').exists()).toBe(false)
      expect(wrapper.find('.mwnf-pagination').exists()).toBe(false)
      expect(wrapper.find('.mwnf-filter__button--apply').text()).toBe('Search')
    })

    it('rejects an empty search and an inverted period, without navigating', async () => {
      const { wrapper, router } = await mountView(TimelineResultsView, { props: { spec: entranceSpec }, route: '/timeline' })
      await wrapper.find('form').trigger('submit')
      expect(wrapper.find('.mwnf-timeline__error').text()).toBe('Please select a country, or a start and end date.')
      expect(router.currentRoute.value.name).toBe('timeline-entrance')

      const numberInputs = wrapper.findAll('input[type="number"]')
      await numberInputs[0].setValue('1400')
      await numberInputs[1].setValue('900')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.find('.mwnf-timeline__error').text()).toBe('Please select a valid time period (start must be before end).')
      expect(router.currentRoute.value.name).toBe('timeline-entrance')
    })

    it('navigates to the target route with the query once the search is valid', async () => {
      const { wrapper, router } = await mountView(TimelineResultsView, { props: { spec: entranceSpec }, route: '/timeline' })
      await wrapper.find('.mwnf-facet__select').setValue('c-eg')
      await wrapper.find('form').trigger('submit')
      await settle(() => router.currentRoute.value.name === 'timeline-results')
      expect(router.currentRoute.value.query).toEqual({ country: 'c-eg' })
    })

    it('entrance offers bucketed year selects with the full data range, not the (empty) entrance list', async () => {
      const { wrapper } = await mountView(TimelineResultsView, {
        props: {
          spec: {
            ...entranceSpec,
            controls: [
              { key: 'country' },
              { key: 'begin', options: (ctx) => Number.isFinite(ctx.years.min) ? [{ value: String(ctx.years.min), label: 'x' }] : [] },
              { key: 'end' },
            ],
          },
        },
        route: '/timeline',
      })
      await settle(() => wrapper.findAll('.mwnf-facet__select').length >= 1)
      // The `begin` control's options function receives the year range and renders it.
      // Before the fix, ctx.years.min is null (entrance mode short-circuits the range),
      // so the select has no options beyond the placeholder.
      // After the fix, ctx.years.min is the data's span (900), so it renders the option.
      const selects = wrapper.findAll('.mwnf-facet__select')
      const beginSelect = selects[1]
      const beginOptions = beginSelect.findAll('option')
      expect(beginOptions.length).toBeGreaterThan(1)
    })
  })

  it('begin/end controls with options render a FacetSelect; without options, a number input', async () => {
    // With options (array): renders as FacetSelect
    const { wrapper: withOptions } = await mountView(TimelineResultsView, {
      props: {
        spec: {
          ...countrySpec,
          controls: [
            { key: 'country' },
            { key: 'begin', options: [{ value: '500', label: '500–599' }, { value: '1500', label: '1500–1599' }] },
            { key: 'end', options: [{ value: '599', label: '500–599' }, { value: '1599', label: '1500–1599' }] },
          ],
        },
      },
      route: '/timeline/results',
    })
    await settle(() => withOptions.findAll('.mwnf-facet__select').length >= 3)
    // All three controls render as FacetSelect
    expect(withOptions.findAll('.mwnf-facet__select')).toHaveLength(3)
    expect(withOptions.findAll('input[type="number"]')).toHaveLength(0)

    // Without options: renders as number input
    const { wrapper: withoutOptions } = await mountView(TimelineResultsView, {
      props: { spec: countrySpec },
      route: '/timeline/results',
    })
    await settle(() => withoutOptions.findAll('input[type="number"]').length > 0)
    // Two number inputs for begin and end (plus the selects for country)
    expect(withoutOptions.findAll('input[type="number"]')).toHaveLength(2)
  })

  it('begin/end controls write the chosen option value to the query', async () => {
    const { wrapper, router } = await mountView(TimelineResultsView, {
      props: {
        spec: {
          ...countrySpec,
          controls: [
            { key: 'country' },
            { key: 'begin', options: [{ value: '500', label: '500–599' }, { value: '1500', label: '1500–1599' }] },
            { key: 'end', options: [{ value: '599', label: '500–599' }, { value: '1599', label: '1500–1599' }] },
          ],
        },
      },
      route: '/timeline/results',
    })
    await settle(() => wrapper.findAll('.mwnf-facet__select').length >= 3)
    const selects = wrapper.findAll('.mwnf-facet__select')
    // First select is country, second is begin, third is end
    await selects[1].setValue('1500')
    await selects[2].setValue('1599')
    await wrapper.find('form').trigger('submit')
    await settle(() => router.currentRoute.value.query.begin === '1500')
    expect(router.currentRoute.value.query).toMatchObject({ begin: '1500', end: '1599' })
  })

  it('begin/end controls accept options as a function receiving the helpers context', async () => {
    const { wrapper } = await mountView(TimelineResultsView, {
      props: {
        spec: {
          ...countrySpec,
          controls: [
            { key: 'country' },
            { key: 'begin', options: (ctx) => ctx.years.min ? [{ value: String(ctx.years.min), label: `From ${ctx.years.min}` }] : [] },
            { key: 'end', options: (ctx) => ctx.years.max ? [{ value: String(ctx.years.max), label: `Until ${ctx.years.max}` }] : [] },
          ],
        },
      },
      route: '/timeline/results',
    })
    await settle(() => wrapper.findAll('.mwnf-facet__select').length >= 3)
    // The options function receives the year range and builds options from it.
    // Fixture years for country scope: 900 (min) to 1350 (max).
    const selects = wrapper.findAll('.mwnf-facet__select')
    const beginOptions = selects[1].findAll('option').map((o) => o.text())
    const endOptions = selects[2].findAll('option').map((o) => o.text())
    expect(beginOptions).toContain('From 900')
    expect(endOptions).toContain('Until 1300')
  })

  it('hands #summary, #cross-link, #event, #before and #after the shared context', async () => {
    const { wrapper } = await mountView(TimelineResultsView, {
      props: { spec: { ...countrySpec, gallery: { route: 'timeline-gallery', items: () => 1 } } },
      slots: {
        before: '<p class="own-before">Before</p>',
        summary: '<template #summary="{ pageInfo }"><p class="own-summary">{{ pageInfo.total }} found</p></template>',
        'cross-link': '<template #cross-link="{ gallery }"><span class="own-cross-link">{{ gallery.count }} objects</span></template>',
        event: '<template #event="{ events }"><ul class="own-events"><li v-for="e in events" :key="e.id">{{ e.date }}</li></ul></template>',
        after: '<p class="own-after">After</p>',
      },
      route: '/timeline/results?country=c-eg',
    })
    await settle(() => wrapper.find('.own-events').exists())
    expect(wrapper.find('.own-before').exists()).toBe(true)
    expect(wrapper.find('.own-summary').text()).toBe('3 found')
    expect(wrapper.find('.own-cross-link').text()).toBe('1 objects')
    expect(wrapper.find('.own-events').findAll('li')).toHaveLength(3)
    expect(wrapper.find('.mwnf-timeline__rows').exists()).toBe(false)
    expect(wrapper.find('.own-after').exists()).toBe(true)
  })

  it('event() receives the plain context — t function and years object — not the helpers ref', async () => {
    const receivedCtx = {}
    const customEventFn = (event, ctx) => {
      // Capture the context for assertions
      receivedCtx.ctx = ctx
      return {
        id: event.id,
        date: 'test',
        caption: '',
        description: '',
      }
    }
    const { wrapper } = await mountView(TimelineResultsView, {
      props: { spec: { ...countrySpec, event: customEventFn } },
      route: '/timeline/results',
    })
    await settle(() => wrapper.findAll('.mwnf-timeline__row').length > 0)
    // The context should have t as a function
    expect(typeof receivedCtx.ctx.t).toBe('function')
    // The context should have years with min and max
    expect(receivedCtx.ctx.years).toHaveProperty('min')
    expect(receivedCtx.ctx.years).toHaveProperty('max')
    expect(typeof receivedCtx.ctx.years.min).toBe('number')
    expect(typeof receivedCtx.ctx.years.max).toBe('number')
  })
})

describe('the views entry point', () => {
  it('exports the ten views and no shell', async () => {
    const entry = await import('../src/views/index.js')
    expect(Object.keys(entry).sort()).toEqual([
      'CatalogueResultsView', 'EssayView', 'HomeView', 'LinkListView', 'PartnerListView', 'RecordSheetView', 'RecordView', 'SearchFormView', 'TextPageView', 'TimelineResultsView',
    ])
    vi.restoreAllMocks()
  })
})
