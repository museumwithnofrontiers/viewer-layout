import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { loadEntities, partnerView, useDataPackage } from '@museumwnf/viewer-core'
import {
  BackLink,
  DynastyList,
  DynastyPopout,
  FacetSelect,
  FeaturedRecord,
  FilterPanel,
  GlossaryPopover,
  GlossaryTool,
  MediaGallery,
  OnDisplayIn,
  Pagination,
  PartnerMap,
  PartnerPanel,
  RecordCredits,
  RecordGrid,
  RecordLanguages,
  RecordList,
  RecordSheet,
  RelatedMedia,
  RelatedRecords,
  ResultsSummary,
  SectionCards,
  SheetSection,
  SourceCredit,
  SpecialFeatures,
  TimelineEventList,
  TimelineLookup,
} from '../src/content/index.js'
// The DXA family's own blocks, which live under /dxa only (inventory-app#2058).
import FeaturedPartners from '../src/dxa/FeaturedPartners.vue'
import PopupLogo from '../src/dxa/PopupLogo.vue'
import SiblingGalleries from '../src/dxa/SiblingGalleries.vue'
import { globalWithI18n, layoutTexts, withSiteRights } from './helpers.js'

const records = [
  { id: 'a', image: 'a.jpg', imageAlt: 'A', name: 'Glazed <em>bowl</em>', meta: ['Egypt', '900–950'], badge: 'object', href: '#/item/a' },
  { id: 'b', name: 'Lamp', meta: ['Syria'], href: '#/item/b' },
]

describe('the content entry point', () => {
  it('brings none of the shell', () => {
    const source = readFileSync(resolve('src/content/index.js'), 'utf8')
    expect(source).not.toMatch(/PageShell|sections\//)
  })
})

describe('SectionCards', () => {
  it('renders one card per section, with its way in', () => {
    const wrapper = mount(SectionCards, {
      props: { cards: [{ title: 'Database', description: 'Search everything', action: 'Search', href: '#/database' }] },
      ...globalWithI18n(),
    })
    expect(wrapper.findAll('.mwnf-cards__card')).toHaveLength(1)
    expect(wrapper.find('a').attributes('href')).toBe('#/database')
    expect(wrapper.text()).toContain('Search everything')
    expect(wrapper.text()).toContain('Search →')
  })

  it('renders title and description as inline Markdown, not plain text', () => {
    const wrapper = mount(SectionCards, {
      props: { cards: [{ title: 'The *Dynasty* Gallery', description: 'Every **object** on display', href: '#/gallery' }] },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-cards__title').html()).toContain('<em>Dynasty</em>')
    expect(wrapper.find('.mwnf-cards__text').html()).toContain('<strong>object</strong>')
    // Inline rendering, not block: no wrapping <p>.
    expect(wrapper.find('.mwnf-cards__text').html()).not.toContain('<p>')
  })

  it('renders nothing for no card', () => {
    expect(mount(SectionCards, globalWithI18n()).html()).not.toContain('mwnf-cards')
  })

  it('renders cards in rows variant with image and number', () => {
    const wrapper = mount(SectionCards, {
      props: {
        variant: 'rows',
        cards: [{ title: 'Item One', number: 'I', image: 'one.jpg', alt: 'First', href: '#/1' }],
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-cards--rows').exists()).toBe(true)
    expect(wrapper.find('.mwnf-cards__image').attributes('src')).toBe('one.jpg')
    expect(wrapper.find('.mwnf-cards__image').attributes('alt')).toBe('First')
    expect(wrapper.text()).toContain('I')
    expect(wrapper.text()).toContain('Item One')
  })

  it('renders cards in covers variant with image overlay and number', () => {
    const wrapper = mount(SectionCards, {
      props: {
        variant: 'covers',
        cards: [{ title: 'Dynasty Two', number: 'II', image: 'two.jpg', alt: 'Second', href: '#/2' }],
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-cards--covers').exists()).toBe(true)
    expect(wrapper.find('.mwnf-cards__image').attributes('src')).toBe('two.jpg')
    expect(wrapper.text()).toContain('II')
    expect(wrapper.text()).toContain('Dynasty Two')
  })

  it('renders accordion variant with collapsible details and child links', async () => {
    const wrapper = mount(SectionCards, {
      props: {
        variant: 'accordion',
        cards: [
          {
            title: 'Section A',
            number: 'I',
            children: [
              { title: 'Sub One', href: '#/a1' },
              { title: 'Sub Two', href: '#/a2' },
            ],
          },
        ],
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-cards--accordion').exists()).toBe(true)
    expect(wrapper.find('details').exists()).toBe(true)
    expect(wrapper.text()).toContain('Section A')
    expect(wrapper.text()).toContain('I')
    const children = wrapper.findAll('.mwnf-cards__child-link')
    expect(children).toHaveLength(2)
    expect(children[0].attributes('href')).toBe('#/a1')
    expect(children[0].text()).toBe('Sub One')
  })
})

describe('FeaturedRecord', () => {
  it('renders the record and its name as HTML', () => {
    const wrapper = mount(FeaturedRecord, {
      props: { heading: 'Item on display', image: 'x.jpg', imageAlt: 'A bowl', eyebrow: 'object', name: 'Glazed <em>bowl</em>', meta: ['Cairo', '900'], action: 'View', href: '#/item/1' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('h2').text()).toBe('Item on display')
    expect(wrapper.find('.mwnf-featured__name').html()).toContain('<em>bowl</em>')
    expect(wrapper.find('img').attributes('alt')).toBe('A bowl')
    expect(wrapper.findAll('.mwnf-featured__meta').map((m) => m.text())).toEqual(['Cairo', '900'])
  })

  it('renders nothing with nothing to show', () => {
    expect(mount(FeaturedRecord, globalWithI18n()).find('section').exists()).toBe(false)
  })
})

describe('RecordList and RecordGrid', () => {
  it('render the same records over one contract', () => {
    const list = mount(RecordList, { props: { records }, ...globalWithI18n() })
    const grid = mount(RecordGrid, { props: { records, actionLabel: 'See' }, ...globalWithI18n() })
    expect(list.findAll('.mwnf-list__row')).toHaveLength(2)
    expect(grid.findAll('.mwnf-grid__tile')).toHaveLength(2)
    expect(list.find('.mwnf-list__name').html()).toContain('<em>bowl</em>')
    expect(grid.find('.mwnf-grid__name').html()).toContain('<em>bowl</em>')
    expect(list.findAll('.mwnf-list__meta-item').map((m) => m.text())).toEqual(['Egypt', '900–950', 'Syria'])
    expect(list.find('.mwnf-list__badge').text()).toBe('object')
    expect(list.find('a').attributes('href')).toBe('#/item/a')
    expect(grid.find('.mwnf-grid__action').attributes('href')).toBe('#/item/a')
  })

  it('show the card of a tile on hover, and cut a long line as legacy did', async () => {
    const long = 'x'.repeat(100)
    const grid = mount(RecordGrid, { props: { records: [{ id: 'a', name: 'A', meta: [long] }] }, ...globalWithI18n() })
    expect(grid.find('.mwnf-grid__tile--hover').exists()).toBe(false)
    await grid.find('.mwnf-grid__tile').trigger('mouseenter')
    expect(grid.find('.mwnf-grid__tile--hover').exists()).toBe(true)
    expect(grid.find('.mwnf-grid__meta').text()).toHaveLength(84)
    expect(grid.find('.mwnf-grid__meta').text().endsWith('[...]')).toBe(true)
  })

  it('say when they are loading, and hand an empty list to the slot', () => {
    const loading = mount(RecordList, { props: { records: [], loading: true, loadingText: 'Loading…' }, ...globalWithI18n() })
    expect(loading.text()).toBe('Loading…')
    expect(loading.attributes('aria-busy')).toBe('true')
    const empty = mount(RecordGrid, { props: { records: [] }, slots: { empty: '<p class="none">Nothing</p>' }, ...globalWithI18n() })
    expect(empty.find('.none').text()).toBe('Nothing')
  })
})

describe('Pagination', () => {
  const page = (currentPage, lastPage) => ({ total: lastPage * 10, lastPage, currentPage, from: 1, to: 10, rows: [] })

  it('renders a window around the current page and the position beside the texts', () => {
    const wrapper = mount(Pagination, { props: { pageInfo: page(7, 20) }, ...globalWithI18n() })
    expect(wrapper.findAll('.mwnf-pagination__number').map((b) => b.text())).toEqual(['5', '6', '7', '8', '9'])
    expect(wrapper.find('[aria-current="page"]').text()).toBe('7')
    expect(wrapper.find('.mwnf-pagination__position').text()).toBe('7 / 20')
    expect(wrapper.text()).toContain('First')
    expect(wrapper.text()).toContain('Previous')
  })

  it('emits the page to go to, clamped, and nothing for the page it is on', async () => {
    const wrapper = mount(Pagination, { props: { pageInfo: page(1, 3), jump: true }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-pagination__button').attributes('disabled')).toBeDefined()
    await wrapper.findAll('.mwnf-pagination__number')[2].trigger('click')
    await wrapper.find('.mwnf-pagination__jump-field').setValue('99')
    await wrapper.find('.mwnf-pagination__jump-field').trigger('keyup.enter')
    await wrapper.findAll('.mwnf-pagination__number')[0].trigger('click')
    expect(wrapper.emitted('navigate')).toEqual([[3], [3]])
  })

  it('renders nothing for a single page', () => {
    expect(mount(Pagination, { props: { pageInfo: page(1, 1) }, ...globalWithI18n() }).find('nav').exists()).toBe(false)
  })
})

describe('FacetSelect, FilterPanel, ResultsSummary', () => {
  it('a facet offers its placeholder and options, and emits the choice', async () => {
    const wrapper = mount(FacetSelect, {
      props: { label: 'Country', placeholder: 'Select a country', options: [{ value: 'eg', label: 'Egypt' }], modelValue: '' },
      ...globalWithI18n(),
    })
    const options = wrapper.findAll('option')
    expect(options[0].attributes('disabled')).toBeDefined()
    expect(options[1].text()).toBe('Egypt')
    await wrapper.find('select').setValue('eg')
    expect(wrapper.emitted('update:modelValue')).toEqual([['eg']])
  })

  it('a facet hides itself when asked and it has nothing to offer', () => {
    expect(mount(FacetSelect, { props: { options: [], hideEmpty: true }, ...globalWithI18n() }).find('label').exists()).toBe(false)
  })

  it('a panel applies and resets in one mode, only resets in the other', async () => {
    const apply = mount(FilterPanel, { props: { title: 'Filter' }, slots: { default: '<input />' }, ...globalWithI18n() })
    expect(apply.findAll('button')).toHaveLength(2)
    expect(apply.text()).toContain('Apply')
    await apply.find('form').trigger('submit')
    await apply.find('.mwnf-filter__button--reset').trigger('click')
    expect(apply.emitted('apply')).toHaveLength(1)
    expect(apply.emitted('reset')).toHaveLength(1)
    const immediate = mount(FilterPanel, { props: { mode: 'immediate', disabled: true }, ...globalWithI18n() })
    expect(immediate.findAll('button')).toHaveLength(1)
    expect(immediate.find('fieldset').attributes('disabled')).toBeDefined()
  })

  it('a summary renders each count beside its label', () => {
    const wrapper = mount(ResultsSummary, {
      props: { parts: [{ label: 'Objects found', count: 12 }, { label: 'out of', count: 340, value: 'objects' }] },
      ...globalWithI18n(),
    })
    expect(wrapper.findAll('.mwnf-summary__part').map((p) => p.text().replace(/\s+/g, ' '))).toEqual(['Objects found 12', 'out of 340 objects'])
  })
})

describe('RecordLanguages', () => {
  it('renders the languages as pressed buttons and emits the choice', async () => {
    const wrapper = mount(RecordLanguages, {
      props: { languages: [{ code: 'ar', label: 'العربية' }, 'en'], language: 'en' },
      ...globalWithI18n(),
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.map((b) => b.text())).toEqual(['العربية', 'EN'])
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(buttons[0].attributes('lang')).toBe('ar')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('select')).toEqual([['ar']])
  })

  it('renders nothing for one language', () => {
    expect(mount(RecordLanguages, { props: { languages: ['en'] }, ...globalWithI18n() }).find('div').exists()).toBe(false)
  })
})

describe('RecordSheet', () => {
  const rows = [
    { key: 'name', label: 'Name', render: 'inline', value: 'Bowl', html: 'Glazed <em>bowl</em>' },
    { key: 'description', label: 'Description', render: 'block', value: '…', html: '<p>A bowl in <span class="gloss-term" data-gid="g1">kufic</span> script.</p>' },
    { key: 'catalogue', label: 'Catalogue', render: 'link', value: 'https://example.org/1', html: null },
    { key: 'museum', label: 'Museum', render: 'custom', value: 'm1', html: null },
  ]

  it('renders rows as a table with HTML values, a link, and a slot for a custom row', () => {
    const wrapper = mount(RecordSheet, {
      props: { rows, dir: 'ltr' },
      slots: { museum: '<a class="museum" href="#/partner/m1">The Museum</a>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('th').map((t) => t.text())).toEqual(['Name', 'Description', 'Catalogue', 'Museum'])
    expect(wrapper.find('.mwnf-sheet__inline').html()).toContain('<em>bowl</em>')
    expect(wrapper.find('.gloss-term').exists()).toBe(true)
    expect(wrapper.find('a[href="https://example.org/1"]').exists()).toBe(true)
    expect(wrapper.find('.museum').text()).toBe('The Museum')
    expect(wrapper.find('.mwnf-sheet').attributes('dir')).toBe('ltr')
  })

  it('renders the same rows as a list', () => {
    const wrapper = mount(RecordSheet, { props: { rows, layout: 'list' }, ...globalWithI18n() })
    expect(wrapper.find('dl').exists()).toBe(true)
    expect(wrapper.findAll('dt').map((t) => t.text())).toEqual(['Name', 'Description', 'Catalogue', 'Museum'])
  })

  it('folds the short description behind a toggle after the description', async () => {
    const wrapper = mount(RecordSheet, {
      props: { rows, shortDescription: { html: '<p>Short.</p>' } },
      ...globalWithI18n(),
    })
    const toggle = wrapper.find('.mwnf-sheet__toggle')
    expect(toggle.text()).toBe('View short description')
    expect(wrapper.text()).not.toContain('Short.')
    await toggle.trigger('click')
    expect(wrapper.text()).toContain('Short.')
    expect(wrapper.find('.mwnf-sheet__toggle').text()).toBe('Hide short description')
    // Directly after the description row, before the catalogue.
    const labels = wrapper.findAll('th').map((t) => t.text())
    expect(labels.indexOf('Hide short description')).toBe(labels.indexOf('Description') + 1)
  })
})

describe('SheetSection, RecordCredits, RelatedRecords', () => {
  it('a section renders a heading and rendered HTML', () => {
    const wrapper = mount(SheetSection, { props: { heading: 'History', html: '<p>Long ago.</p>' }, ...globalWithI18n() })
    expect(wrapper.find('h2').text()).toBe('History')
    expect(wrapper.find('.mwnf-sheet-section__body').html()).toContain('<p>Long ago.</p>')
  })

  it('credits render who made the sheet, the working number and the citation', () => {
    const wrapper = mount(RecordCredits, {
      props: { credits: [{ label: 'Prepared by', value: 'A. Author' }], workingNumber: 'EG 12', workingNumberLabel: 'MWNF working number', citation: 'A. Author "Bowl" in DIA, 2026.' },
      ...globalWithI18n(),
    })
    expect(wrapper.findAll('h2').map((h) => h.text())).toEqual(['Credits', 'Citation'])
    expect(wrapper.find('dd').text()).toBe('A. Author')
    expect(wrapper.find('.mwnf-credits__number').text()).toContain('EG 12')
    expect(wrapper.find('.mwnf-credits__citation').text()).toContain('in DIA')
  })

  it('related records render as rows or tiles, and leave the outside references to the slot', () => {
    const list = mount(RelatedRecords, { props: { heading: 'Related', records }, ...globalWithI18n() })
    expect(list.find('.mwnf-list').exists()).toBe(true)
    const grid = mount(RelatedRecords, {
      props: { heading: 'Related', records, variant: 'grid' },
      slots: { default: '<p class="outside">mwnf3:objects:x9</p>' },
      ...globalWithI18n(),
    })
    expect(grid.find('.mwnf-grid').exists()).toBe(true)
    expect(grid.find('.outside').exists()).toBe(true)
    expect(mount(RelatedRecords, { props: { records: [] }, ...globalWithI18n() }).find('section').exists()).toBe(false)
  })
})

describe('MediaGallery', () => {
  const images = [
    { url: 'a.jpg', alt: 'A', caption: 'Front', photographer: 'P. Photo', copyright: 'The Museum' },
    { url: 'b.jpg', alt: 'B' },
  ]

  it('shows the current image, the thumbnails, the caption and the credit', async () => {
    const wrapper = mount(MediaGallery, { props: { images }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-media__main img').attributes('src')).toBe('a.jpg')
    expect(wrapper.findAll('.mwnf-media__thumb')).toHaveLength(2)
    expect(wrapper.find('.mwnf-media__caption').text()).toContain('Front')
    expect(wrapper.find('.mwnf-media__credit').text()).toBe('Photograph: P. Photo — © The Museum')
    await wrapper.findAll('.mwnf-media__thumb')[1].trigger('click')
    expect(wrapper.find('.mwnf-media__main img').attributes('src')).toBe('b.jpg')
    expect(wrapper.find('.mwnf-media__caption').exists()).toBe(false)
  })

  it('opens a lightbox, moves with the arrows, closes with Escape', async () => {
    const wrapper = mount(MediaGallery, { props: { images }, attachTo: document.body, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-lightbox').exists()).toBe(false)
    await wrapper.find('.mwnf-media__main').trigger('click')
    expect(wrapper.find('.mwnf-lightbox').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await nextTick()
    expect(wrapper.find('.mwnf-lightbox__image').attributes('src')).toBe('b.jpg')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('.mwnf-lightbox').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders every image in a row in the row variant', () => {
    const wrapper = mount(MediaGallery, { props: { images, variant: 'row' }, ...globalWithI18n() })
    expect(wrapper.findAll('figure')).toHaveLength(2)
    expect(wrapper.find('.mwnf-media__thumbs').exists()).toBe(false)
  })
})

describe('GlossaryPopover', () => {
  it('renders the term and closes on Escape or the button', async () => {
    const wrapper = mount(GlossaryPopover, {
      props: { term: { word: 'kufic', spelling: 'Kufic', definition: 'An angular script.' } },
      attachTo: document.body,
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-popover__term').text()).toBe('Kufic')
    expect(wrapper.find('.mwnf-popover__definition').text()).toBe('An angular script.')
    expect(wrapper.find('.mwnf-popover__title').text()).toContain('Glossary')
    await wrapper.find('.mwnf-popover__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    await wrapper.setProps({ term: { word: 'x', spelling: 'x', definition: 'y' } })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(2)
    wrapper.unmount()
  })

  it('renders nothing without a term, and rendered HTML when given', () => {
    expect(mount(GlossaryPopover, globalWithI18n()).find('aside').exists()).toBe(false)
    const wrapper = mount(GlossaryPopover, { props: { term: { word: 'x' }, html: '<p>Rendered <em>text</em></p>' }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-popover__definition').html()).toContain('<em>text</em>')
  })
})

describe('PartnerMap', () => {
  it('renders the map with title, iframe and link when coordinates are present', () => {
    const wrapper = mount(PartnerMap, {
      props: {
        latitude: 48.8566,
        longitude: 2.3522,
        zoom: 15,
        label: 'Louvre Museum',
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-partner-map').exists()).toBe(true)
    expect(wrapper.find('.mwnf-partner-map__embed').attributes('src')).toContain('openstreetmap.org')
    // The frame's title names the partner next to "Map of" (never inside it: texts carry no placeholders).
    expect(wrapper.find('.mwnf-partner-map__embed').attributes('title')).toBe('Map of Louvre Museum')
    expect(wrapper.find('.mwnf-partner-map__link a').attributes('href')).toContain('openstreetmap.org')
  })

  it('renders nothing when coordinates are missing', () => {
    const wrapper = mount(PartnerMap, { props: { latitude: null, longitude: null }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-partner-map').exists()).toBe(false)
  })

  it('builds correct OSM URLs from zoom level', () => {
    const wrapper = mount(PartnerMap, {
      props: { latitude: 51.5074, longitude: -0.1278, zoom: 10 },
      ...globalWithI18n(),
    })
    const iframe = wrapper.find('.mwnf-partner-map__embed')
    expect(iframe.attributes('src')).toContain('bbox=')
    expect(iframe.attributes('src')).toContain('marker=51.5074%2C-0.1278')
  })

  it('renders dictionary texts from default entry names when only coordinates are provided', () => {
    const wrapper = mount(PartnerMap, {
      props: { latitude: 48.8566, longitude: 2.3522 },
      ...globalWithI18n(),
    })
    // Map title should render as "Map" from partner.map.map
    expect(wrapper.find('.mwnf-partner-map__title').text()).toBe('Map')
    // Link text should render as "Open in OpenStreetMap" from partner.map.openInOpenStreetMap
    expect(wrapper.find('.mwnf-partner-map__link a').text()).toContain('Open in OpenStreetMap')
    // iframe title should render as "Map" from partner.map.map (since no label)
    expect(wrapper.find('.mwnf-partner-map__embed').attributes('title')).toBe('Map')
  })
})

describe('PartnerPanel', () => {
  const record = {
    id: 'p-cairo',
    type: 'museum',
    country_id: 'c-eg',
    latitude: 30.0478,
    longitude: 31.2336,
    map_zoom: 16,
    item_count: 12,
    contact_persons: [
      { title: 'Director', name: 'A. First', phone: '+20 1', fax: '+20 2', email: 'first@example.org' },
      { name: 'B. Second' },
    ],
    additional_urls: [{ url: 'www.friends.example.org', title: 'Friends' }],
    images: [{ url: 'courtyard.jpg', alt_text: 'The courtyard', display_order: 1 }],
    logos: [{ url: 'logo.png', logo_type: 'primary', alt_text: null, display_order: 1 }],
  }
  const text = {
    name: 'Museum of *Islamic* Art',
    city: 'Cairo',
    description: 'A museum.',
    address: 'Port Said Street',
    phone: '+20 0',
    fax: '+20 3',
    email: 'info@example.org',
    website: 'www.example.org',
  }
  const partner = partnerView(record, text, {
    countryLabel: () => 'Egypt',
    route: (p) => `#/partner/${p.id}`,
    objectsRoute: (p) => `#/partner/${p.id}/objects`,
  })

  it('line: logo, the name as a link with its city, the count; actions only when turned on', () => {
    const wrapper = mount(PartnerPanel, { props: { partner, variant: 'line' }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-partner-panel__logo').attributes('src')).toBe('logo.png')
    expect(wrapper.find('.mwnf-partner-panel__logo').attributes('alt')).toBe('Museum of Islamic Art')
    const name = wrapper.find('a.mwnf-partner-panel__name')
    expect(name.attributes('href')).toBe('#/partner/p-cairo')
    expect(name.text()).toBe('Museum of Islamic Art, Cairo')
    expect(name.html()).toContain('<em>Islamic</em>')
    expect(wrapper.find('.mwnf-partner-panel__count').text()).toBe('12 object(s) in this site')
    expect(wrapper.find('.mwnf-partner-panel__actions').exists()).toBe(false)

    const withActions = mount(PartnerPanel, { props: { partner, variant: 'line', show: { actions: true } }, ...globalWithI18n() })
    const links = withActions.findAll('.mwnf-partner-panel__actions a')
    expect(links.map((a) => [a.text(), a.attributes('href')])).toEqual([
      ['Read more', '#/partner/p-cairo'],
      ['View objects', '#/partner/p-cairo/objects'],
    ])
  })

  it('line: a partner holding nothing shows the emptyLabel line, and no View objects link', () => {
    const empty = { ...partner, itemCount: 0, objectsRoute: null }
    const wrapper = mount(PartnerPanel, {
      props: { partner: empty, variant: 'line', emptyLabel: 'partner.info.logo', show: { actions: true } },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-partner-panel__count--empty').text()).toBe('Logo')
    expect(wrapper.findAll('.mwnf-partner-panel__actions a').map((a) => a.text())).toEqual(['Read more'])
  })

  it('summary: the label, the name as a link, then "city, country"; no logo unless asked', () => {
    const wrapper = mount(PartnerPanel, { props: { partner, variant: 'summary', label: 'partner.info.about' }, ...globalWithI18n() })
    expect(wrapper.text()).toBe('About Museum of Islamic Art, Cairo, Egypt')
    expect(wrapper.find('a').text()).toBe('About Museum of Islamic Art')
    expect(wrapper.find('.mwnf-partner-panel__logo').exists()).toBe(false)
    const withLogo = mount(PartnerPanel, { props: { partner, variant: 'summary', show: { logo: true } }, ...globalWithI18n() })
    expect(withLogo.find('.mwnf-partner-panel__logo').exists()).toBe(true)
  })

  it('summary with a heading: the name heads the page, over its location', () => {
    const wrapper = mount(PartnerPanel, { props: { partner, variant: 'summary', heading: 1 }, ...globalWithI18n() })
    expect(wrapper.classes()).toContain('mwnf-partner-panel--heading')
    expect(wrapper.find('h1.mwnf-partner-panel__name a').text()).toBe('Museum of Islamic Art')
    expect(wrapper.find('p.mwnf-partner-panel__location').text()).toBe('Cairo, Egypt')
  })

  it('a hidden partner keeps its name and loses its link', () => {
    const hidden = partnerView(record, text, { countryLabel: () => 'Egypt', route: (p) => `#/partner/${p.id}`, hidden: () => true })
    const wrapper = mount(PartnerPanel, { props: { partner: hidden, variant: 'summary' }, ...globalWithI18n() })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('Museum of Islamic Art')
  })

  it('full: the About · Contact · Logo tabs, the homepage link, the pictures, the map', () => {
    const wrapper = mount(PartnerPanel, { props: { partner, heading: 1 }, ...globalWithI18n() })
    expect(wrapper.find('h1.mwnf-partner-panel__name').text()).toBe('Museum of Islamic Art')
    expect(wrapper.find('.mwnf-partner-panel__location').text()).toBe('Cairo, Egypt')
    const tablist = wrapper.find('[role="tablist"]')
    expect(tablist.findAll('[role="tab"]').map((tab) => tab.text())).toEqual(['About', 'Contact', 'Logo'])
    expect(wrapper.find('.mwnf-partner-panel__homepage').attributes('href')).toBe('https://www.example.org')
    expect(wrapper.find('.mwnf-partner-panel__homepage').attributes('target')).toBe('_blank')
    expect(wrapper.find('.mwnf-partner-panel__pictures').exists()).toBe(true)
    expect(wrapper.find('.mwnf-partner-map').exists()).toBe(true)
    // About is open; the other panels are there, hidden.
    const [about, contact] = wrapper.findAll('[role="tabpanel"]')
    expect(about.isVisible()).toBe(true)
    expect(about.text()).toBe('A museum.')
    expect(contact.isVisible()).toBe(false)
  })

  it('full: the contact tab reads in legacy order, fax included, contact persons after', async () => {
    const wrapper = mount(PartnerPanel, { props: { partner }, attachTo: document.body, ...globalWithI18n() })
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    const contact = wrapper.find('.mwnf-partner-panel__panel--contact')
    expect(contact.isVisible()).toBe(true)
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')
    const lines = contact.findAll('p').map((line) => line.text())
    expect(lines).toEqual([
      'Address(es)',
      'Port Said Street',
      'Phone +20 0',
      'Fax +20 3',
      'info@example.org',
      'www.example.org|Friends',
      'Director', 'A. First', 'Phone +20 1', 'Fax +20 2', 'first@example.org',
      'B. Second',
    ])
    wrapper.unmount()
  })

  it('full: the arrow keys move along the strip', async () => {
    const wrapper = mount(PartnerPanel, { props: { partner }, attachTo: document.body, ...globalWithI18n() })
    const tablist = wrapper.find('[role="tablist"]')
    await tablist.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('.mwnf-partner-panel__tab--active').text()).toBe('Contact')
    await tablist.trigger('keydown', { key: 'End' })
    expect(wrapper.find('.mwnf-partner-panel__tab--active').text()).toBe('Logo')
    await tablist.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('.mwnf-partner-panel__tab--active').text()).toBe('About')
    wrapper.unmount()
  })

  it('full: show switches parts off; a partner with no contact gets no Contact tab', () => {
    const wrapper = mount(PartnerPanel, {
      props: { partner, show: { map: false, pictures: false, homepage: false, logos: false } },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-partner-map').exists()).toBe(false)
    expect(wrapper.find('.mwnf-partner-panel__pictures').exists()).toBe(false)
    expect(wrapper.find('.mwnf-partner-panel__homepage').exists()).toBe(false)
    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual(['About', 'Contact'])

    const bare = partnerView({ id: 'p-bare' }, { name: 'Bare' })
    const plain = mount(PartnerPanel, { props: { partner: bare }, ...globalWithI18n() })
    expect(plain.findAll('[role="tab"]').map((tab) => tab.text())).toEqual(['About'])
  })

  it("full, layout 'sections': About, Contact and Logo one after another, under their titles", () => {
    const wrapper = mount(PartnerPanel, { props: { partner, layout: 'sections', heading: 1 }, ...globalWithI18n() })
    expect(wrapper.find('[role="tablist"]').exists()).toBe(false)
    expect(wrapper.findAll('h2.mwnf-partner-panel__section-title').map((h) => h.text())).toEqual(['About', 'Contact', 'Logo'])
    expect(wrapper.findAll('.mwnf-partner-panel__panel').every((panel) => panel.isVisible())).toBe(true)
    // The homepage is still a link, outside any section.
    expect(wrapper.find('.mwnf-partner-panel__homepage').exists()).toBe(true)
  })

  it('fills the badge, meta, actions and after slots', () => {
    const wrapper = mount(PartnerPanel, {
      props: { partner },
      slots: {
        badge: '<span class="own-badge">Museum</span>',
        meta: '<p class="own-meta">Since 1903</p>',
        actions: '<a class="own-action" href="#/objects">View objects (12)</a>',
        after: '<p class="own-after">More</p>',
      },
      ...globalWithI18n(),
    })
    for (const own of ['.own-badge', '.own-meta', '.own-action', '.own-after']) expect(wrapper.find(own).exists()).toBe(true)
    expect(wrapper.find('.mwnf-partner-panel__bar .own-action').exists()).toBe(true)
  })

  it('renders nothing without a partner', () => {
    const wrapper = mount(PartnerPanel, { props: { partner: null }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-partner-panel').exists()).toBe(false)
  })
})

describe('FeaturedPartners', () => {
  it('renders the carousel with records and bullet controls', async () => {
    const records = [
      { id: 'p1', name: 'Partner One', logo: 'logo1.jpg', country: 'France', city: 'Paris', description: 'A museum', route: { name: 'partner', params: { id: 'p1' } } },
      { id: 'p2', name: 'Partner Two', logo: 'logo2.jpg', country: 'Egypt', city: 'Cairo', description: 'Another museum', route: { name: 'partner', params: { id: 'p2' } } },
    ]
    const wrapper = mount(FeaturedPartners, {
      props: { records },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-featured-partners__heading').exists()).toBe(true)
    expect(wrapper.findAll('.mwnf-featured-partners__bullet')).toHaveLength(2)
    expect(wrapper.find('.mwnf-featured-partners__name').text()).toBe('Partner One')
  })

  it('rotates through partners when bullet is clicked', async () => {
    const records = [
      { id: 'p1', name: 'Partner One', logo: 'logo1.jpg', country: 'France', city: 'Paris', description: 'A', route: {} },
      { id: 'p2', name: 'Partner Two', logo: 'logo2.jpg', country: 'Egypt', city: 'Cairo', description: 'B', route: {} },
    ]
    const wrapper = mount(FeaturedPartners, {
      props: { records },
      ...globalWithI18n(),
    })
    // Check that the active bullet is the first one
    expect(wrapper.findAll('.mwnf-featured-partners__bullet')[0].classes()).toContain('mwnf-featured-partners__bullet--active')
    // Click the second bullet
    await wrapper.findAll('.mwnf-featured-partners__bullet')[1].trigger('click')
    await nextTick()
    // Verify the second bullet is now active
    expect(wrapper.findAll('.mwnf-featured-partners__bullet')[1].classes()).toContain('mwnf-featured-partners__bullet--active')
  })

  it('takes the partners as partnerView() builds them: first picture, "city, country", plain description cut short', () => {
    const view = partnerView(
      { id: 'p1', country_id: 'c-fr', images: [{ url: 'hall.jpg', alt_text: 'Hall' }], logos: [{ url: 'logo.png' }] },
      { name: 'Partner *One*', city: 'Paris', description: 'A **grand** museum by the river, with a long history.' },
      { countryLabel: () => 'France', route: () => '#/partner/p1' },
    )
    const wrapper = mount(FeaturedPartners, { props: { partners: [view], descriptionLength: 20 }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-featured-partners__name').text()).toBe('Partner One')
    expect(wrapper.find('.mwnf-featured-partners__logo').attributes('src')).toBe('hall.jpg')
    expect(wrapper.find('.mwnf-featured-partners__location').text()).toBe('Paris, France')
    expect(wrapper.find('.mwnf-featured-partners__description').text()).toBe('A grand museum by...')
    expect(wrapper.find('.mwnf-featured-partners__card').attributes('href')).toBe('#/partner/p1')
  })

  it('renders nothing when no records', () => {
    const wrapper = mount(FeaturedPartners, { props: { records: [] }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-featured-partners').exists()).toBe(false)
  })
})

describe('SiblingGalleries', () => {
  it('renders galleries and museums blocks when data is present', () => {
    const galleries = [
      { id: 'g1', name: 'Gallery One', image: 'g1.jpg', route: { name: 'gallery', params: { id: 'g1' } } },
    ]
    const museums = [
      { name: 'Islamic Art', to: 'https://example.com/islamic' },
    ]
    const wrapper = mount(SiblingGalleries, {
      props: { galleries, museums },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-sibling-galleries__gallery').exists()).toBe(true)
    expect(wrapper.find('.mwnf-sibling-galleries__museum').exists()).toBe(true)
  })

  it('renders galleries without links when route is absent', () => {
    const galleries = [
      { id: 'g1', name: 'Unresolved', route: null },
    ]
    const wrapper = mount(SiblingGalleries, {
      props: { galleries },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-sibling-galleries__gallery--no-link').exists()).toBe(true)
  })

  it('renders empty placeholder for galleries without images', () => {
    const galleries = [
      { id: 'g1', name: 'No Image Gallery', image: null, route: {} },
    ]
    const wrapper = mount(SiblingGalleries, {
      props: { galleries },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-sibling-galleries__image--empty').exists()).toBe(true)
  })
})

describe('PopupLogo', () => {
  it('renders a dismissible popup with markdown content', async () => {
    const wrapper = mount(PopupLogo, {
      props: {
        content: 'Visit our **sponsor**',
        enabled: true,
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-popup-logo').exists()).toBe(true)
    expect(wrapper.find('.mwnf-popup-logo__content').html()).toContain('<strong>sponsor</strong>')
  })

  it('renders nothing when disabled', () => {
    const wrapper = mount(PopupLogo, {
      props: { content: 'Content', enabled: false },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-popup-logo').exists()).toBe(false)
  })

  it('renders nothing when dismissed', async () => {
    const wrapper = mount(PopupLogo, {
      props: { content: 'Content', enabled: true },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-popup-logo').exists()).toBe(true)
    await wrapper.find('.mwnf-popup-logo__close').trigger('click')
    expect(wrapper.find('.mwnf-popup-logo').exists()).toBe(false)
  })

  it('renders raw HTML when rawHtml prop is true', () => {
    const wrapper = mount(PopupLogo, {
      props: {
        content: '<p>Raw <em>HTML</em></p>',
        enabled: true,
        rawHtml: true,
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-popup-logo__content').html()).toContain('<em>HTML</em>')
  })
})

describe('BackLink', () => {
  // The tab's history as a visitor's browser holds it: its length, and the
  // state vue-router writes on every entry of its own (`back` is the previous
  // page of this website, null on the first page the visitor opened).
  function history({ length, back = null }) {
    Object.defineProperty(window.history, 'length', { value: length, configurable: true })
    window.history.replaceState(back === null ? null : { back }, '')
  }

  async function mountWithRouter(props) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<p />' } },
        { path: '/partners', name: 'partners', component: { template: '<p />' } },
        { path: '/partners/:id', name: 'partner', component: { template: '<p />' } },
      ],
    })
    await router.push('/partners/p1')
    const back = vi.spyOn(router, 'back').mockImplementation(() => {})
    const push = vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve())
    const i18n = globalWithI18n().global.plugins
    const wrapper = mount(BackLink, { props, global: { plugins: [...i18n, router] } })
    return { wrapper, back, push }
  }

  afterEach(() => history({ length: 1 }))

  it('renders a button that goes back when the previous page is this website\'s own', async () => {
    history({ length: 3, back: '/partners' })
    const { wrapper, back } = await mountWithRouter({ to: { name: 'partners' } })
    expect(wrapper.find('button.mwnf-back-link__button').exists()).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(back).toHaveBeenCalledOnce()
  })

  it('renders the fallback for a visitor who arrived from another site, who stays on this one', async () => {
    history({ length: 2 })
    const { wrapper, back } = await mountWithRouter({ to: { name: 'partners' } })
    expect(wrapper.find('a.mwnf-back-link__button').attributes('href')).toBe('/partners')
    expect(back).not.toHaveBeenCalled()
  })

  it('goes back through whatever history the tab has when no fallback is given', async () => {
    history({ length: 2 })
    const { wrapper, back } = await mountWithRouter({})
    await wrapper.find('button').trigger('click')
    expect(back).toHaveBeenCalledOnce()
  })

  it('renders a link with fallback route when history is not available', () => {
    Object.defineProperty(window.history, 'length', {
      value: 1,
      configurable: true,
    })
    const wrapper = mount(BackLink, {
      props: { to: { name: 'home' } },
      ...globalWithI18n(),
    })
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('uses custom label entry when provided', () => {
    Object.defineProperty(window.history, 'length', {
      value: 1,
      configurable: true,
    })
    const wrapper = mount(BackLink, {
      props: { label: 'back.label', to: '#/' },
      ...globalWithI18n(),
    })
    expect(wrapper.text()).toContain('back')
  })

  describe('variant="bar"', () => {
    it('is a link carrying the back bar, addressed to the fallback, with the arrow before the label', async () => {
      history({ length: 1 })
      const { wrapper } = await mountWithRouter({ variant: 'bar', label: 'core.action.close', to: { name: 'partners' } })
      const link = wrapper.find('a')
      expect(link.classes()).toEqual(['mwnf-back-bar', 'mwnf-back-bar--link'])
      expect(link.attributes('href')).toBe('/partners')
      expect(link.text()).toBe('← Close')
      expect(link.find('.mwnf-back-bar__arrow').attributes('aria-hidden')).toBe('true')
      expect(wrapper.find('button').exists()).toBe(false)
    })

    it('goes back when the previous page is this website\'s own', async () => {
      history({ length: 3, back: '/partners?page=2' })
      const { wrapper, back, push } = await mountWithRouter({ variant: 'bar', to: { name: 'partners' } })
      await wrapper.find('a').trigger('click')
      expect(back).toHaveBeenCalledOnce()
      expect(push).not.toHaveBeenCalled()
    })

    it('goes to the fallback for a visitor who arrived from another site', async () => {
      history({ length: 2 })
      const { wrapper, back, push } = await mountWithRouter({ variant: 'bar', to: { name: 'partners' } })
      await wrapper.find('a').trigger('click')
      expect(back).not.toHaveBeenCalled()
      expect(push).toHaveBeenCalledWith({ name: 'partners' })
    })

    it('leaves a modified click to the browser, which opens the fallback elsewhere', async () => {
      history({ length: 3, back: '/partners' })
      const { wrapper, back, push } = await mountWithRouter({ variant: 'bar', to: { name: 'partners' } })
      await wrapper.find('a').trigger('click', { ctrlKey: true })
      expect(back).not.toHaveBeenCalled()
      expect(push).not.toHaveBeenCalled()
    })

    it('never lets its bare # reach a hash router when there is no fallback', async () => {
      history({ length: 1 })
      const { wrapper, back } = await mountWithRouter({ variant: 'bar' })
      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('#')
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      link.element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
      expect(back).not.toHaveBeenCalled()
    })

    it('takes its own arrow, and its default slot in place of the label', async () => {
      history({ length: 1 })
      const { wrapper } = await mountWithRouter({ variant: 'bar', arrow: '‹', label: 'core.action.close', to: { name: 'partners' } })
      expect(wrapper.find('a').text()).toBe('‹ Close')
      const slotted = mount(BackLink, {
        props: { variant: 'bar', href: '#/exhibitions/e1' },
        slots: { default: 'Back to The Umayyads' },
        ...globalWithI18n(),
      })
      expect(slotted.find('a').text()).toBe('← Back to The Umayyads')
      expect(slotted.find('a').attributes('href')).toBe('#/exhibitions/e1')
    })
  })
})

describe('SpecialFeatures', () => {
  const texts = {
    d1: { name: 'The *hall*', location: 'East wing', dates: 'c. 1700', description: 'Gilded stucco work.' },
    d2: { name: 'The chapel' },
  }
  const features = [
    { id: 'd2', internal_name: 'chapel', display_order: 2, images: [], artist_names: [] },
    {
      id: 'd1', internal_name: 'hall', display_order: 1, artist_names: ['B. Carlone', 'C. Carlone'],
      images: [{ url: 'https://example.org/hall.jpg', captions: { en: 'The hall', de: 'Der Saal' } }],
    },
    { id: 'd3', internal_name: 'Untranslated room', display_order: null },
  ]
  const mountFeatures = (props = {}) => mount(SpecialFeatures, {
    props: { features, tr: (feature) => texts[feature.id], language: 'de', ...props },
    ...globalWithI18n({ messages: { en: { ...layoutTexts, 'sheet.field.specialFeatures': 'Special features' } } }),
  })

  it('renders nothing for a record with no features', () => {
    expect(mountFeatures({ features: [] }).html()).toBe('<!--v-if-->')
  })

  it('lists the features in their order, each with its name, location, dates, artists and pictures', () => {
    const wrapper = mountFeatures()
    expect(wrapper.find('.mwnf-sheet-section__heading').text()).toBe('Special features')
    const items = wrapper.findAll('.mwnf-special-features__item')
    expect(items.map((item) => item.find('.mwnf-special-features__name').text())).toEqual(['The hall', 'The chapel', 'Untranslated room'])
    expect(items[0].find('.mwnf-special-features__name').html()).toContain('<em>hall</em>')
    expect(items[0].findAll('.mwnf-special-features__meta').map((m) => m.text())).toEqual(['East wing', 'c. 1700', 'B. Carlone, C. Carlone'])
    expect(items[0].find('.mwnf-media img').attributes()).toMatchObject({ src: 'https://example.org/hall.jpg', alt: 'Der Saal' })
    expect(items[1].find('.mwnf-special-features__meta').exists()).toBe(false)
    expect(items[1].find('.mwnf-media').exists()).toBe(false)
  })

  it("highlights the record's glossary terms in a description, as the sheet does", () => {
    const glossary = [{ id: 'g1', spelling: 'stucco', word: 'Stucco', definition: 'Fine plaster.' }]
    const description = mountFeatures({ glossary }).find('.mwnf-special-features__description')
    expect(description.find('.gloss-term').text()).toBe('stucco')
    expect(mountFeatures().find('.mwnf-special-features__description .gloss-term').exists()).toBe(false)
  })
})

describe('RelatedMedia', () => {
  const media = [
    { type: 'video', title: 'A curator presents the carpet', description: 'Filmed in the museum.', url: 'https://example.org/en', language: 'en' },
    { type: 'video', title: 'Une conservatrice présente le tapis', description: null, url: 'https://example.org/fr', language: 'fr' },
    { type: 'audio', title: null, url: 'https://example.org/untitled.mp3', language: null },
  ]
  const texts = { messages: { en: { ...layoutTexts, 'record.related.audioVideo': 'Audio / video', 'record.related.video': 'Video' } } }

  it('links every entry out, marked ↗, under the audio/video heading', () => {
    const wrapper = mount(RelatedMedia, { props: { media }, ...globalWithI18n(texts) })
    expect(wrapper.find('.mwnf-sheet-section__heading').text()).toBe('Audio / video')
    const links = wrapper.findAll('.mwnf-related-media__link')
    expect(links.map((a) => a.text())).toEqual(['↗ A curator presents the carpet', '↗ Une conservatrice présente le tapis', '↗ https://example.org/untitled.mp3'])
    expect(links[0].attributes()).toMatchObject({ href: 'https://example.org/en', target: '_blank', rel: 'noopener' })
    expect(wrapper.find('.mwnf-related-media__description').text()).toBe('Filmed in the museum.')
  })

  it("keeps the language's own entries when it has any, and every entry otherwise", () => {
    const fr = mount(RelatedMedia, { props: { media, language: 'fr' }, ...globalWithI18n(texts) })
    expect(fr.findAll('.mwnf-related-media__link').map((a) => a.attributes('href'))).toEqual(['https://example.org/fr'])
    const de = mount(RelatedMedia, { props: { media, language: 'de' }, ...globalWithI18n(texts) })
    expect(de.findAll('.mwnf-related-media__link')).toHaveLength(3)
  })

  it('takes its heading, leaves the descriptions out when asked, and renders nothing with no entry', () => {
    const wrapper = mount(RelatedMedia, { props: { media, heading: 'record.related.video', descriptions: false }, ...globalWithI18n(texts) })
    expect(wrapper.find('.mwnf-sheet-section__heading').text()).toBe('Video')
    expect(wrapper.find('.mwnf-related-media__description').exists()).toBe(false)
    expect(mount(RelatedMedia, { props: { media: [] }, ...globalWithI18n(texts) }).html()).toBe('<!--v-if-->')
  })
})

describe('OnDisplayIn', () => {
  const texts = {
    messages: {
      en: {
        ...layoutTexts,
        'record.related.onDisplayIn': 'On display in',
        'record.related.exhibitions': 'Exhibitions',
        'record.related.galleries': 'Galleries',
        'record.related.linkPending': 'link pending',
      },
    },
  }
  const withRouter = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/exhibition/:id', name: 'exhibition', component: { template: '<p />' } }],
    })
    await router.push('/exhibition/e0')
    return { global: { plugins: [...globalWithI18n(texts).global.plugins, router] } }
  }

  it('lists the places under its heading, a route as a link inside this site', async () => {
    const wrapper = mount(OnDisplayIn, {
      props: { groups: [{ links: [{ id: 'e1', label: 'The <em>Umayyads</em>', to: { name: 'exhibition', params: { id: 'e1' } } }] }] },
      ...(await withRouter()),
    })
    expect(wrapper.find('.mwnf-sheet-section__heading').text()).toBe('On display in')
    expect(wrapper.find('.mwnf-on-display__subheading').exists()).toBe(false)
    const link = wrapper.find('.mwnf-on-display__item a')
    expect(link.attributes('href')).toBe('/exhibition/e1')
    expect(link.attributes('target')).toBeUndefined()
    expect(link.html()).toContain('<em>Umayyads</em>')
  })

  it('groups the places under their subheadings, marks an external link ↗, and notes a place with no address', () => {
    const wrapper = mount(OnDisplayIn, {
      props: {
        heading: '',
        pendingLabel: 'record.related.linkPending',
        groups: [
          { heading: 'record.related.exhibitions', links: [{ id: 'x1', label: 'Pending Exhibition' }] },
          { heading: 'record.related.galleries', links: [{ id: 'g1', label: 'Textiles', href: 'https://textiles.example.org', external: true }] },
          { heading: 'record.related.galleries', links: [] },
        ],
      },
      ...globalWithI18n(texts),
    })
    // No heading: the groups alone, under the one the page draws.
    expect(wrapper.find('.mwnf-sheet-section').exists()).toBe(false)
    expect(wrapper.findAll('.mwnf-on-display__subheading').map((p) => p.text())).toEqual(['Exhibitions', 'Galleries'])
    const items = wrapper.findAll('.mwnf-on-display__item')
    expect(items[0].text()).toBe('Pending Exhibition link pending')
    expect(items[0].find('a').exists()).toBe(false)
    expect(items[1].text()).toBe('↗ Textiles')
    expect(items[1].find('a').attributes()).toMatchObject({ href: 'https://textiles.example.org', target: '_blank', rel: 'noopener' })
  })

  it('renders a name with no address as plain text when there is no pending note, and nothing with no place', () => {
    const wrapper = mount(OnDisplayIn, {
      props: { heading: 'record.related.galleries', groups: [{ links: [{ label: 'Water in Islam' }] }] },
      ...globalWithI18n(texts),
    })
    expect(wrapper.find('.mwnf-sheet-section__heading').text()).toBe('Galleries')
    expect(wrapper.find('.mwnf-on-display__item').text()).toBe('Water in Islam')
    expect(wrapper.find('.mwnf-on-display__item a').exists()).toBe(false)
    expect(mount(OnDisplayIn, { props: { groups: [{ links: [] }] }, ...globalWithI18n(texts) }).html()).toBe('<!--v-if-->')
  })
})

describe('SourceCredit', () => {
  async function mountAt(route = '/objects/o1') {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/objects/:id', name: 'objects-detail', component: { template: '<p>detail</p>' } }],
    })
    await router.push(route)
    await router.isReady()
    const { global } = globalWithI18n()
    return mount(SourceCredit, { global: { ...global, plugins: [...global.plugins, router] } })
  }

  it('renders nothing when the site declares no origin', async () => {
    const wrapper = await mountAt()
    expect(wrapper.find('.mwnf-source-credit').exists()).toBe(false)
  })

  it('renders the labelled address once the site declares its origin', async () => {
    const restore = withSiteRights()
    try {
      const wrapper = await mountAt('/objects/o1')
      expect(wrapper.find('.mwnf-source-credit__label').text()).toBe('Source')
      const link = wrapper.find('.mwnf-source-credit a')
      expect(link.attributes('href')).toBe('https://example.org/#/objects/o1')
      expect(link.text()).toBe('https://example.org/#/objects/o1')
    } finally {
      restore()
    }
  })
})

describe('GlossaryTool', () => {
  // The fixture glossary behind `@inventory-data` (tests/fixtures/data-package):
  // g1 "kufic"/"kufic script" → "An angular Arabic script.", g2
  // "glaze"/"glazed" → "A vitreous coating." — the same package the composed
  // views' tests load, so a term search here exercises the real
  // `searchGlossary` rather than a stand-in for it.
  beforeAll(async () => {
    await loadEntities(['glossary'])
    await useDataPackage().loadTranslations('glossary', 'en')
  })

  it('finds a term as the visitor types and shows its definition', async () => {
    const wrapper = mount(GlossaryTool, { props: { language: 'en' }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-glossary-tool__toggle').text()).toBe('Glossary tool')
    await wrapper.find('.mwnf-glossary-tool__input').setValue('kuf')
    const hits = wrapper.findAll('.mwnf-glossary-tool__hit')
    expect(hits.map((hit) => hit.text())).toEqual(['kufic'])
    await hits[0].trigger('click')
    expect(wrapper.find('.mwnf-glossary-tool__hits').exists()).toBe(false)
    expect(wrapper.find('.mwnf-glossary-tool__definition-label').text()).toBe('Definition')
    expect(wrapper.find('.mwnf-glossary-tool__definition').text()).toContain('An angular Arabic script.')
  })

  it('is keyboard-usable: arrow to a hit, Enter chooses it', async () => {
    const wrapper = mount(GlossaryTool, { props: { language: 'en' }, ...globalWithI18n() })
    const input = wrapper.find('.mwnf-glossary-tool__input')
    await input.setValue('gla')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.mwnf-glossary-tool__definition').text()).toContain('A vitreous coating.')
  })

  it('shows no hit list and no definition for a term the glossary does not have', async () => {
    const wrapper = mount(GlossaryTool, { props: { language: 'en' }, ...globalWithI18n() })
    await wrapper.find('.mwnf-glossary-tool__input').setValue('zzz')
    expect(wrapper.find('.mwnf-glossary-tool__hits').exists()).toBe(false)
    expect(wrapper.find('.mwnf-glossary-tool__definition').exists()).toBe(false)
  })
})

describe('DynastyPopout', () => {
  const dynasty = { id: 'd1', from_ah: 358, to_ah: 567, from_ad: 969, to_ad: 1171 }
  const text = { name: 'Fatimid', also_known_as: 'Fatimids', area: 'Egypt, North Africa', history: 'A Shia caliphate.' }

  it('opens and shows every field', async () => {
    const wrapper = mount(DynastyPopout, { props: { dynasty, text }, attachTo: document.body, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-dynasty__summary').text()).toBe('Fatimid')
    wrapper.find('details').element.open = true
    await nextTick()
    expect(wrapper.find('.mwnf-dynasty__eyebrow').text()).toBe('Dynasties')
    const body = wrapper.text().replace(/\s+/g, ' ')
    expect(body).toContain('Also known as: Fatimids')
    expect(body).toContain('Area: Egypt, North Africa')
    expect(body).toContain('AH 358–567 / AD 969–1171')
    expect(body).toContain('History')
    expect(wrapper.find('.mwnf-dynasty__history').text()).toContain('A Shia caliphate.')
    wrapper.unmount()
  })

  it('falls back to the id when untranslated, and omits what the record has none of', () => {
    const wrapper = mount(DynastyPopout, { props: { dynasty: { id: 'd2' } }, ...globalWithI18n() })
    expect(wrapper.find('.mwnf-dynasty__summary').text()).toBe('d2')
    expect(wrapper.find('.mwnf-dynasty__dates').exists()).toBe(false)
    expect(wrapper.find('.mwnf-dynasty__field').exists()).toBe(false)
    expect(wrapper.find('.mwnf-dynasty__history').exists()).toBe(false)
  })
})

describe('DynastyList', () => {
  const dynasties = [
    { id: 'd1', from_ad: 969, to_ad: 1171 },
    { id: 'd2', from_ad: 750, to_ad: 1258 },
  ]
  const translations = { d1: { name: 'Fatimid' }, d2: { name: 'Abbasid' } }

  it('renders one popout per dynasty of the record', () => {
    const wrapper = mount(DynastyList, {
      props: { heading: 'Dynasties', dynasties, tr: (dynasty) => translations[dynasty.id] },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-dynasty-list__heading').text()).toBe('Dynasties')
    expect(wrapper.findAllComponents(DynastyPopout)).toHaveLength(2)
    expect(wrapper.findAll('.mwnf-dynasty__summary').map((summary) => summary.text())).toEqual(['Fatimid', 'Abbasid'])
  })

  it('renders nothing without dynasties', () => {
    expect(mount(DynastyList, { props: { dynasties: [] }, ...globalWithI18n() }).find('section').exists()).toBe(false)
  })
})

describe('TimelineEventList', () => {
  const events = [
    {
      id: 'e1',
      date: '900 AD – 950 AD',
      caption: 'Egypt',
      description: '<p>A <em>dynasty</em> rises.</p>',
      media: [
        { image: 'coin.jpg', alt: 'A coin' },
        { image: 'bowl.jpg', alt: 'A bowl', href: '#/item/o1', caption: 'Glazed <em>bowl</em>' },
      ],
      actions: [{ label: 'View items from this period', href: '#/results?begin=900&end=950' }],
    },
    { id: 'e2', date: '1200 AD –', description: '<p>An ongoing period.</p>' },
  ]

  it('renders the date, the caption, the description as HTML, the media strip and the actions', () => {
    const wrapper = mount(TimelineEventList, { props: { events }, ...globalWithI18n() })
    expect(wrapper.findAll('.mwnf-timeline__row')).toHaveLength(2)
    expect(wrapper.findAll('.mwnf-timeline__date').map((d) => d.text())).toEqual(['900 AD – 950 AD', '1200 AD –'])
    expect(wrapper.find('.mwnf-timeline__caption').text()).toBe('Egypt')
    expect(wrapper.find('.mwnf-timeline__description').html()).toContain('<em>dynasty</em>')

    const media = wrapper.findAll('.mwnf-timeline__media-item')
    expect(media).toHaveLength(2)
    expect(media[0].find('img').attributes('alt')).toBe('A coin')
    expect(media[1].attributes('href')).toBe('#/item/o1')
    expect(media[1].find('.mwnf-timeline__media-caption').html()).toContain('<em>bowl</em>')

    const action = wrapper.find('.mwnf-timeline__action')
    expect(action.text()).toBe('View items from this period →')
    expect(action.attributes('href')).toBe('#/results?begin=900&end=950')

    // The second event carries none of caption/media/actions: none render for it.
    const secondRow = wrapper.findAll('.mwnf-timeline__row')[1]
    expect(secondRow.find('.mwnf-timeline__caption').exists()).toBe(false)
    expect(secondRow.find('.mwnf-timeline__media').exists()).toBe(false)
    expect(secondRow.find('.mwnf-timeline__actions').exists()).toBe(false)
  })

  it('hands the empty slot no events, and nothing without one', () => {
    const withSlot = mount(TimelineEventList, { props: { events: [] }, slots: { empty: '<p class="none">Nothing</p>' }, ...globalWithI18n() })
    expect(withSlot.find('.none').text()).toBe('Nothing')
    expect(mount(TimelineEventList, { props: { events: [] }, ...globalWithI18n() }).find('.mwnf-timeline__empty').exists()).toBe(false)
  })

  it('hands #date, #caption, #media and #actions the event, replacing the default rendering', () => {
    const wrapper = mount(TimelineEventList, {
      props: { events: [events[0]] },
      slots: {
        date: '<template #date="{ event }"><span class="own-date">{{ event.date }}!</span></template>',
        caption: '<template #caption="{ event }"><span class="own-caption">{{ event.caption }}?</span></template>',
        media: '<template #media="{ event }"><span class="own-media">{{ event.media.length }} pictures</span></template>',
        actions: '<template #actions="{ event }"><span class="own-actions">{{ event.actions.length }} links</span></template>',
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.own-date').text()).toBe('900 AD – 950 AD!')
    expect(wrapper.find('.own-caption').text()).toBe('Egypt?')
    expect(wrapper.find('.own-media').text()).toBe('2 pictures')
    expect(wrapper.find('.own-actions').text()).toBe('1 links')
    expect(wrapper.find('.mwnf-timeline__media-item').exists()).toBe(false)
    expect(wrapper.find('.mwnf-timeline__action').exists()).toBe(false)
  })
})

describe('TimelineLookup', () => {
  const info = {
    heading: 'Timeline',
    countries: [{ value: 'all', label: 'All Countries' }, { value: 'eg', label: 'Egypt' }],
    defaultCountry: () => 'all',
    events: (country) => (country === 'eg' ? [{ id: 'e1', year_from: 950, text: { description: 'A *dynasty* rises.' } }] : []),
    range: [900, 1000],
    era: (year) => `AD ${year}`,
    searchTo: (country, range) => ({ name: 'timeline-results', query: { country, begin: String(range[0]), end: String(range[1]) } }),
  }

  async function mountLookup(props = {}) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/timeline/results', name: 'timeline-results', component: { template: '<p>results</p>' } }],
    })
    await router.push('/')
    const { global } = globalWithI18n()
    return mount(TimelineLookup, { props: { info, ...props }, global: { ...global, plugins: [...global.plugins, router] } })
  }

  it('opens onto a country select, the event list for the chosen country, and the full-search link', async () => {
    const wrapper = await mountLookup()
    expect(wrapper.find('.mwnf-sheet-timeline__popout').exists()).toBe(false)

    await wrapper.find('.mwnf-sheet-timeline__trigger').trigger('click')
    expect(wrapper.find('.mwnf-sheet-timeline__title').text()).toBe('Timeline')
    expect(wrapper.find('.mwnf-sheet-timeline__subheader').text()).toContain('AD 900')
    expect(wrapper.find('.mwnf-sheet-timeline__empty').exists()).toBe(true)
    expect(wrapper.find('.mwnf-sheet-timeline__link').attributes('href')).toContain('country=all')

    await wrapper.find('select').setValue('eg')
    expect(wrapper.find('.mwnf-sheet-timeline__empty').exists()).toBe(false)
    expect(wrapper.find('.mwnf-sheet-timeline__event').html()).toContain('<em>dynasty</em>')
    expect(wrapper.find('.mwnf-sheet-timeline__link').attributes('href')).toContain('country=eg')

    await wrapper.find('.mwnf-sheet-timeline__close').trigger('click')
    expect(wrapper.find('.mwnf-sheet-timeline__popout').exists()).toBe(false)
  })

  it('resets to the new default country when a new record hands it a new info object', async () => {
    const wrapper = await mountLookup()
    await wrapper.find('.mwnf-sheet-timeline__trigger').trigger('click')
    await wrapper.find('select').setValue('eg')
    expect(wrapper.find('.mwnf-sheet-timeline__event').exists()).toBe(true)

    // A different record's `info` (a fresh object, the way ItemDetailView
    // recomputes it per record) resets the selection to its own default,
    // the way `watch(item, …, { immediate: true })` used to.
    await wrapper.setProps({ info: { ...info, defaultCountry: () => 'all' } })
    expect(wrapper.find('select').element.value).toBe('all')
    expect(wrapper.find('.mwnf-sheet-timeline__event').exists()).toBe(false)
  })
})
