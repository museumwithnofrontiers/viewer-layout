import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { loadEntities, useDataPackage } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import {
  availableLanguages, displayLanguage, editionsByYear, editionsOf, editionText, formatsOf, homeLimit, inCategory, limitLanguages, PUBLICATION_CATEGORIES,
  PUBLICATION_ENTITIES, PublicationsShell, publicationsConfig, publicationsRoutes, searchPublications, themeKey, truncate,
} from '../src/publications/index.js'
import { layoutTexts } from './helpers.js'
import { settle } from './dxa/helpers.js'

// The Publications site's pages (inventory-app#2542): legacy books.museumwnf.org,
// mounted against the fixture package's publications, editions and texts.

const texts = {
  ...layoutTexts,
  'core.action.search': 'Search',
  'core.detail.notFound': 'This record does not exist.',
  'core.notFound.page': 'This page does not exist.',
  'publications.header.title': 'MWNF BOOKS',
  'publications.header.about': 'About',
  'publications.header.contact': 'Contact',
  'publications.header.home': 'Home',
  'publications.menu.new': 'NEW BOOKS',
  'publications.category.new': 'NEW',
  'publications.category.virtualMuseum': 'VIRTUAL MUSEUM BOOKS',
  'publications.category.travelBooks': 'TRAVEL BOOKS',
  'publications.category.educational': 'EDUCATIONAL BOOKS',
  'publications.category.other': 'OTHER BOOKS',
  'publications.home.seeAll': 'See All',
  'publications.card.hover': 'See Book Details',
  'publications.card.imageComingSoon': 'Image Coming Soon',
  'publications.search.explanation': 'You can combine search fields.',
  'publications.search.title': 'Enter Title Here',
  'publications.search.author': 'Enter Author Here',
  'publications.search.isbn': 'Enter ISBN Here',
  'publications.search.language': 'Select a Language',
  'publications.search.country': 'Select a Country',
  'publications.search.subject': 'Select a Subject',
  'publications.search.type': 'Select a Type',
  'publications.search.publisher': 'Select a Publisher',
  'publications.search.reset': 'Reset Fields',
  'publications.search.submit': 'Submit',
  'publications.results.title': 'Search Results',
  'publications.results.for': 'for',
  'publications.results.none': 'Your search returned no results.',
  'publications.results.reset': 'Please enter your search terms and press Submit.',
  'publications.pagination.first': 'First',
  'publications.pagination.previous': 'Previous',
  'publications.pagination.next': 'Next',
  'publications.pagination.last': 'Last',
  'publications.format.print': 'Book',
  'publications.format.printOnDemand': 'Print on Demand',
  'publications.format.ebook': 'eBook',
  'publications.publication.languages': 'This title is available in',
  'publications.edition.languageVersion': 'English version',
  'publications.edition.editionsOf': 'Editions of',
  'publications.edition.edition': 'Edition',
  'publications.edition.lookInside': 'Look Inside',
  'publications.edition.credits': 'View Credits',
  'publications.edition.authors': 'Author(s)',
  'publications.edition.photographers': 'Photographers',
  'publications.edition.editors': 'Editor(s)',
  'publications.edition.pages': 'Pages',
  'publications.edition.images': 'Images',
  'publications.edition.plans': 'Plans',
  'publications.edition.publishers': 'Publisher(s)',
  'publications.edition.isbn': 'ISBN',
  'publications.edition.about': 'About This Book',
  'publications.edition.moreAbout': 'More About This Book',
  'publications.footer.slogan': 'Museum With No Frontiers (MWNF)',
  'publications.footer.more': 'MORE',
  'publications.footer.contactLink': 'Contact',
}
// A book's own language's labels, as viewer-i18n's partial `fr` file carries them.
const french = {
  'publications.edition.languageVersion': 'version en français',
  'publications.edition.editionsOf': 'Editions de',
}

async function mountSite(path) {
  await loadEntities(PUBLICATION_ENTITIES)
  const pkg = useDataPackage()
  await Promise.all(['en', 'fr', 'ar'].flatMap((code) => [pkg.loadTranslations('publications', code), pkg.loadTranslations('countries', code)]))
  const i18n = createI18n({ locale: 'en', messages: { en: texts, fr: french } })
  const router = createRouter({ history: createMemoryHistory(), routes: publicationsRoutes() })
  await router.push(path)
  await router.isReady()
  const App = { components: { PublicationsShell }, template: '<PublicationsShell><router-view /></PublicationsShell>' }
  const wrapper = mount(App, { global: { plugins: [i18n, router] } })
  await settle(() => true, 2)
  return { wrapper, router }
}

describe('the rules legacy printed by', () => {
  const index = new Map()
  const loadIndex = async () => {
    const [, editions] = await loadEntities(['publications', 'editions'])
    for (const edition of editions) index.set(edition.id, edition)
    return (await loadEntities(['publications']))[0]
  }

  it('lists six language codes and a "+" for the rest, and truncates at the last space', () => {
    expect(limitLanguages(['ar', 'de', 'en', 'es', 'fr', 'it', 'pt'])).toEqual({ shown: ['ar', 'de', 'en', 'es', 'fr', 'it'], more: true })
    expect(limitLanguages(['en'])).toEqual({ shown: ['en'], more: false })
    expect(truncate(20, 'Islamic Art in the Mediterranean')).toBe('Islamic Art in the...')
    expect(truncate(55, 'Short')).toBe('Short')
  })

  it('reads a book’s versions in one language, its languages from its versions, and its formats', async () => {
    const [trail] = await loadIndex()
    expect(editionsOf(trail, index, 'en').map((e) => e.id)).toEqual(['ed-en-1', 'ed-en-2'])
    expect(availableLanguages(trail, index)).toEqual(['en', 'fr'])
    expect(displayLanguage(trail, index)).toBe('en')
    expect(displayLanguage(trail, index, 'fr')).toBe('fr')
    expect(displayLanguage(trail, index, 'de')).toBe('en')
    expect(formatsOf(editionsOf(trail, index, 'en'))).toEqual(['Paperback', 'eBook'])
  })

  it('lists a book’s editions on its page newest year first, as legacy’s API read them', () => {
    // Andalusian Morocco (book 5): the 2000 print edition comes first in the
    // package's order; legacy's page opened on the 2010 paperback.
    const editions = new Map([
      ['print-2000', { id: 'print-2000', language: 'en', publish_year: 2000, display_order: 60 }],
      ['digp-2010', { id: 'digp-2010', language: 'en', publish_year: 2010, display_order: 61 }],
      ['ebook-2010', { id: 'ebook-2010', language: 'en', publish_year: 2010, display_order: 62 }],
      ['fr-2003', { id: 'fr-2003', language: 'fr', publish_year: 2003, display_order: 63 }],
      ['no-year', { id: 'no-year', language: 'en', publish_year: null, display_order: 1 }],
    ])
    const book = { edition_ids: ['print-2000', 'digp-2010', 'ebook-2010', 'fr-2003', 'no-year'] }
    expect(editionsByYear(book, editions, 'en').map((e) => e.id)).toEqual(['digp-2010', 'ebook-2010', 'print-2000', 'no-year'])
    // The tiles keep the package's order, which legacy's lists printed the formats in.
    expect(editionsOf(book, editions, 'en').map((e) => e.id)).toEqual(['no-year', 'print-2000', 'digp-2010', 'ebook-2010'])
  })

  it('keeps as many home tiles per band as legacy’s widths did', () => {
    expect([1920, 1350, 1349, 1124, 899, 699, 474, 390].map(homeLimit)).toEqual([6, 6, 5, 4, 3, 2, 1, 1])
  })
  it('takes a version’s own texts over the book’s, field by field, as legacy’s API named them', () => {
    const book = { title: 'Book', subtitle: 'Sub', description: 'About', introduction: 'More', author_credit: 'A' }
    // about_this_book is description2, more_about_this_book description1 (BookDetailResource).
    expect(editionText(book, { texts: { title: 'Own', description2: 'Own about' } })).toMatchObject({
      title: 'Own', subtitle: 'Sub', about: 'Own about', moreAbout: 'More', authors: 'A',
    })
    expect(editionText(book, { texts: { description1: 'Own more' } })).toMatchObject({ about: 'About', moreAbout: 'Own more' })
  })

  it('leaves a version’s empty text empty, and prints a count as legacy wrote it', () => {
    const book = { title: 'Book', author_credit: 'MWNF' }
    expect(editionText(book, { texts: { author: '' } }).authors).toBe('')
    const edition = { image_count: 868, page_count: 300, texts: { count_images: '868 + a DVD' } }
    expect(editionText(book, edition)).toMatchObject({ images: '868 + a DVD', pages: 300, plans: null })
  })

  it('files a book under the category legacy named, and lists nothing as NEW without a rule', async () => {
    const [trail] = await loadIndex()
    const travel = PUBLICATION_CATEGORIES.find((entry) => entry.slug === 'travel-books')
    const fresh = PUBLICATION_CATEGORIES.find((entry) => entry.slug === 'new')
    expect(inCategory(trail, travel)).toBe(true)
    expect(inCategory(trail, fresh)).toBe(false)
    expect(inCategory(trail, { ...fresh, match: (p) => p.id === 'pub-trail' })).toBe(true)
  })

  it('names a theme tag’s entry after its English name', () => {
    expect(themeKey({ internal_name: 'the great patrons of the arts' })).toBe('publications.theme.theGreatPatronsOfTheArts')
    expect(themeKey({ internal_name: 'islamic art' })).toBe('publications.theme.islamicArt')
  })

  it('searches every field it is given, all of them at once', async () => {
    const all = await loadIndex()
    const pkg = useDataPackage()
    await Promise.all(['en', 'fr', 'ar'].map((code) => pkg.loadTranslations('publications', code)))
    const textsOf = (p) => p.languages.map((code) => pkg.translations('publications', code)[p.id] ?? {})
    const find = (query) => searchPublications(all, query, { editionById: index, textsOf }).map((p) => p.id)
    expect(find({ title: 'lumiere' })).toEqual(['pub-trail'])
    expect(find({ author: 'benouis', isbn: '978-3902782229' })).toEqual(['pub-trail'])
    expect(find({ language: 'ar' })).toEqual(['pub-vm'])
    expect(find({ type: 'ebook', country: 'c-dz' })).toEqual(['pub-trail'])
    expect(find({ type: 'ebook', country: 'c-tn' })).toEqual([])
    expect(find({ subject: 'tag-architecture' })).toEqual(['pub-trail'])
    expect(find({ publisher: 'Éditions Fixture' })).toEqual(['pub-trail'])
    expect(find({})).toEqual([])
  })
})

describe('the Publications pages', () => {
  it('draws legacy’s header, menu, search panel and footer around a page', async () => {
    const { wrapper } = await mountSite('/')
    expect(wrapper.find('.mwnf-books-header__slogan').text()).toBe('MWNF BOOKS')
    expect(wrapper.findAll('.mwnf-books-menu__item').map((n) => n.text())).toEqual([
      'NEW BOOKS', 'VIRTUAL MUSEUM BOOKS', 'TRAVEL BOOKS', 'EDUCATIONAL BOOKS', 'OTHER BOOKS',
    ])
    expect(wrapper.find('.mwnf-books-menu__item a').attributes('href')).toBe('/category/new')
    expect(wrapper.find('.mwnf-books-search__explanation').text()).toBe('You can combine search fields.')
    const selects = wrapper.findAll('select')
    expect(selects.map((s) => s.find('option').text())).toEqual([
      'Select a Language', 'Select a Country', 'Select a Subject', 'Select a Type', 'Select a Publisher',
    ])
    expect(selects[0].findAll('option').slice(1).map((o) => o.text())).toEqual(['Arabic', 'English', 'French'])
    expect(selects[3].findAll('option').slice(1).map((o) => o.text())).toEqual(['Book', 'eBook', 'Print on Demand'])
    expect(wrapper.find('.mwnf-books-footer__brand').text()).toContain('Museum With No Frontiers (MWNF)')
    wrapper.unmount()
  })

  it('lists a band per category that has books, each tile as legacy drew it', async () => {
    const { wrapper } = await mountSite('/')
    await settle(() => wrapper.findAll('.mwnf-books-home__band').length === 3)
    const bands = wrapper.findAll('.mwnf-books-home__band')
    expect(bands.map((b) => b.find('.mwnf-books-home__label').text().replace(/\s+See All.*/, ''))).toEqual([
      'VIRTUAL MUSEUM BOOKS', 'TRAVEL BOOKS', 'OTHER BOOKS',
    ])
    const tile = bands[1].find('.mwnf-books-tile')
    expect(tile.find('a').attributes('href')).toBe('/publication/pub-trail/en')
    expect(tile.find('img').attributes('src')).toContain('cover-en-1.jpg')
    expect(tile.findAll('.mwnf-books-tile__language').map((n) => n.text())).toEqual(['EN', 'FR'])
    expect(tile.find('.mwnf-books-tile__country').text()).toBe('Algeria')
    expect(tile.find('.mwnf-books-tile__project').text()).toBe('Discover Islamic Art (package)')
    expect(tile.find('.mwnf-books-tile__title').text()).toBe('An Architecture of Light')
    expect(tile.find('.mwnf-books-tile__formats').text()).toBe('Paperback, eBook')
    expect(tile.find('.mwnf-books-tile__tooltip').text()).toBe('See Book Details')
    // No cover: legacy's words instead; the home page shortens the subtitle.
    const other = bands[2].find('.mwnf-books-tile')
    expect(other.find('.mwnf-books-tile__cover--none').text()).toBe('Image Coming Soon')
    expect(other.find('.mwnf-books-tile__subtitle').text()).toBe('A subtitle that is long enough to be shortened on the...')
    wrapper.unmount()
  })

  it('lists a category under its name, its tiles with their authors', async () => {
    const { wrapper } = await mountSite('/category/travel-books')
    await settle(() => wrapper.find('.mwnf-books-tile').exists())
    expect(wrapper.find('.mwnf-books-list__title').text()).toBe('TRAVEL BOOKS')
    expect(wrapper.find('.mwnf-books-tile__author').text()).toBe('Author(s): Farida Benouis, Houria Chérid')
    expect(wrapper.find('.mwnf-books-pages').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows the results of a search and its terms, the tiles in the language searched for', async () => {
    const { wrapper } = await mountSite('/results?language=fr&type=print-on-demand')
    await settle(() => wrapper.find('.mwnf-books-tile').exists())
    expect(wrapper.find('.mwnf-books-list__title').text()).toBe('Search Results for "French, Print on Demand"')
    expect(wrapper.find('.mwnf-books-tile a').attributes('href')).toBe('/publication/pub-trail/fr')
    expect(wrapper.find('.mwnf-books-tile__title').text()).toBe('Une architecture de lumière')
    wrapper.unmount()
  })

  it('says when a search found nothing, and asks for terms when there are none', async () => {
    let { wrapper } = await mountSite('/results?title=nothing-like-this')
    expect(wrapper.find('.mwnf-books-list__empty').text()).toBe('Your search returned no results.')
    wrapper.unmount();
    ({ wrapper } = await mountSite('/results'))
    expect(wrapper.find('.mwnf-books-list__empty').text()).toBe('Please enter your search terms and press Submit.')
    wrapper.unmount()
  })

  it('submits the search form to the results page, the fields filled in the address', async () => {
    const { wrapper, router } = await mountSite('/')
    await wrapper.find('input[type="search"]').setValue(' light ')
    await wrapper.findAll('select')[3].setValue('ebook')
    await wrapper.find('form').trigger('submit')
    await settle(() => router.currentRoute.value.name === 'results')
    expect(router.currentRoute.value.query).toEqual({ title: 'light', type: 'ebook' })
    wrapper.unmount()
  })

  it('draws a book’s page: its languages, its current version, its editions', async () => {
    const { wrapper } = await mountSite('/publication/pub-trail')
    await settle(() => wrapper.find('.mwnf-books-edition').exists())
    expect(wrapper.find('.mwnf-books-publication__header').text()).toBe('TRAVEL BOOKS, English version')
    expect(wrapper.find('.mwnf-books-publication__versions').text()).toContain('This title is available in:')
    expect(wrapper.findAll('.mwnf-books-publication__version').map((n) => n.text())).toEqual(['English', 'Français'])
    expect(wrapper.find('.mwnf-books-publication__version--current').text()).toBe('English')
    const edition = wrapper.find('.mwnf-books-edition')
    expect(edition.find('.mwnf-books-edition__cover img').attributes('src')).toContain('cover-en-1.jpg')
    expect(edition.find('.mwnf-books-edition__cover-info').text()).toContain('2022, English version')
    const pdfs = edition.findAll('.mwnf-books-edition__pdf a')
    expect(pdfs.map((a) => [a.text(), a.attributes('href')])).toEqual([
      ['Look Inside', 'https://inventory.example.org/doc/doc-sample.pdf'],
      ['View Credits', 'https://inventory.example.org/doc/doc-credits.pdf'],
    ])
    expect(edition.find('.mwnf-books-edition__country').text()).toBe('Algeria')
    expect(edition.find('.mwnf-books-edition__title').text()).toBe('AN ARCHITECTURE OF LIGHT')
    expect(edition.text()).toContain('Author(s): Farida Benouis, Houria Chérid')
    expect(edition.text()).toContain('Photographers: Kamredine Nasser Medjkane')
    expect(edition.text()).toContain('Editor(s): Farida Benouis; Boussad Ouadi')
    expect(edition.text()).toContain('Plans: 26')
    expect(edition.find('.mwnf-books-edition__isbn').text()).toBe('ISBN: 9783902966131')
    // The book's description is Markdown, rendered escaped.
    expect(edition.find('.mwnf-books-edition__about em').text()).toBe('armchair guide')
    expect(edition.find('.mwnf-books-edition__more-about div').isVisible()).toBe(false)
    const list = wrapper.find('.mwnf-books-editions')
    expect(list.find('.mwnf-books-editions__information').text()).toBe('Editions of An Architecture of Light. Islamic Art in Algeria, English version')
    expect(list.findAll('.mwnf-books-editions__item')).toHaveLength(2)
    // A version's own title is its own; its plan count of 0 is printed, as legacy did.
    await list.findAll('.mwnf-books-editions__item')[1].trigger('click')
    expect(wrapper.find('.mwnf-books-edition__title').text()).toBe('AN ARCHITECTURE OF LIGHT (EBOOK)')
    expect(wrapper.find('.mwnf-books-edition').text()).toContain('Plans: 0')
    expect(wrapper.find('.mwnf-books-edition .mwnf-books-edition__pdf').exists()).toBe(false)
    wrapper.unmount()
  })

  it('reads a version’s labels in its own language, English where legacy had none', async () => {
    const { wrapper, router } = await mountSite('/publication/pub-trail/en')
    await settle(() => wrapper.find('.mwnf-books-edition').exists())
    await wrapper.findAll('.mwnf-books-publication__version')[1].trigger('click')
    await settle(() => router.currentRoute.value.params.language === 'fr')
    await settle(() => wrapper.find('.mwnf-books-edition').attributes('lang') === 'fr')
    expect(router.currentRoute.value.fullPath).toBe('/publication/pub-trail/fr')
    expect(wrapper.find('.mwnf-books-publication__header').text()).toBe('TRAVEL BOOKS, version en français')
    expect(wrapper.find('.mwnf-books-edition__title').text()).toBe('UNE ARCHITECTURE DE LUMIÈRE')
    expect(wrapper.find('.mwnf-books-edition').text()).toContain('Author(s): Farida Benouis')
    expect(wrapper.find('.mwnf-books-edition__format').text()).toBe('Paperback (15.2 x 22.9 cm)')
    // One French version: no list of editions.
    expect(wrapper.find('.mwnf-books-editions').exists()).toBe(false)
    wrapper.unmount()
  })

  it('draws an Arabic book right to left, and says when a book does not exist', async () => {
    let { wrapper } = await mountSite('/publication/pub-vm')
    await settle(() => wrapper.find('.mwnf-books-edition').exists())
    expect(wrapper.find('.mwnf-books-edition').attributes('dir')).toBe('rtl')
    expect(wrapper.find('.mwnf-books-edition__cover--none').text()).toBe('Image Coming Soon')
    wrapper.unmount();
    ({ wrapper } = await mountSite('/publication/nope'))
    expect(wrapper.find('.mwnf-books-publication').text()).toBe('This record does not exist.')
    wrapper.unmount()
  })
})

describe('publicationsConfig', () => {
  it('declares the routes the packages’ links assume, English only, on the site’s own shell', () => {
    const config = publicationsConfig({ datasetPackage: '@museumwnf/publications-data', origin: 'https://example.org/publications', siteName: 'MWNF Books' })
    expect(config.extraViews.map((r) => [r.name, r.path])).toEqual([
      ['home', '/'], ['category', '/category/:category'], ['results', '/results'], ['publication', '/publication/:id/:language?'],
    ])
    expect(config.languages).toEqual(['en'])
    expect(config.shell).toBe(PublicationsShell)
    expect(config.site.origin).toBe('https://example.org/publications')
    expect(config.siteName).toBe('Fixture Museum')
    for (const route of config.extraViews) expect(route.meta.entities).toEqual(PUBLICATION_ENTITIES)
  })
})
