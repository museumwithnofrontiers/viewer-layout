// What legacy books.museumwnf.org printed, as pure functions over the
// Publications package (inventory-app#2542): the categories its menu and its
// home page list, a book's tile, its editions in one language, the search.
// The legacy client is `book-client` (HomePage.vue, CategoryPage.vue,
// ResultsPage.vue, BookPage.vue, HeaderComponent.vue).

/** The entities every Publications page reads. */
export const PUBLICATION_ENTITIES = ['publications', 'editions', 'tags', 'countries', 'languages']

/** Legacy's page size (site_lang `book_api_item_per_page`). */
export const PAGE_SIZE = 12

/**
 * Legacy's categories, in its menu's order, under the addresses its client
 * gave them (`/category/<name in lowercase, hyphenated>/<page>`). `category`
 * is the package's value; `new` is legacy's "NEW" list, which the package
 * carries no flag for, so it lists nothing unless a site says which books are
 * new (`match`). `label` is the title over the list and on the home page,
 * `menu` the header's word when it differs.
 */
export const PUBLICATION_CATEGORIES = Object.freeze([
  { slug: 'new', label: 'publications.category.new', menu: 'publications.menu.new', match: null },
  { slug: 'virtual-museum-books', category: 'virtual-museum', label: 'publications.category.virtualMuseum' },
  { slug: 'travel-books', category: 'exhibition-trail', label: 'publications.category.travelBooks' },
  { slug: 'educational-books', category: 'educational', label: 'publications.category.educational' },
  { slug: 'other-books', category: 'other', label: 'publications.category.other' },
])

/**
 * How many tiles a home page band shows at a window's width: legacy cut its
 * first page to 3 under 900px, 4 under 1125px, 5 under 1350px (assignBooks).
 */
export function homeLimit(width) {
  if (width < 900) return 3
  if (width < 1125) return 4
  if (width < 1350) return 5
  return Infinity
}

/** The search form's keys, as legacy's client wrote them in the results' address. */
export const SEARCH_KEYS = ['title', 'author', 'isbn', 'language', 'country', 'subject', 'type', 'publisher']

/** The formats legacy's type select offered (`/api/type`), as the package names them. */
export const FORMATS = Object.freeze([
  { value: 'print', label: 'publications.format.print' },
  { value: 'print-on-demand', label: 'publications.format.printOnDemand' },
  { value: 'ebook', label: 'publications.format.ebook' },
])

/** Whether a book is in a category entry (its own predicate, else the package's category). */
export function inCategory(publication, entry) {
  if (!publication || !entry) return false
  if (typeof entry.match === 'function') return Boolean(entry.match(publication))
  if (entry.match === null) return false
  return publication.category === entry.category
}

/** A category entry by its address, among `categories`. */
export function categoryBySlug(slug, categories = PUBLICATION_CATEGORIES) {
  return categories.find((entry) => entry.slug === slug) ?? null
}

/**
 * The language chips of a tile: legacy listed six codes and a "+" for the
 * rest (limitLangs).
 */
export function limitLanguages(codes, max = 6) {
  const list = Array.isArray(codes) ? codes : []
  return list.length > max ? { shown: list.slice(0, max), more: true } : { shown: list, more: false }
}

/**
 * Legacy's truncate(): the text up to the last space before `chars`, and
 * "..." — the home page's subtitles.
 */
export function truncate(chars, text) {
  if (!text) return text ?? ''
  if (text.length <= chars) return text
  return `${text.substring(0, text.lastIndexOf(' ', chars))}...`
}

const byOrder = (a, b) => (a.display_order ?? Infinity) - (b.display_order ?? Infinity)

/** A book's editions, in their order; in one language when `language` is given. */
export function editionsOf(publication, editionById, language = null) {
  const out = []
  for (const id of publication?.edition_ids ?? []) {
    const edition = editionById.get(id)
    if (edition && (!language || edition.language === language)) out.push(edition)
  }
  return out.sort(byOrder)
}

/**
 * The languages a book is available in — legacy's `available_languages`, the
 * languages it has a version in — sorted by code, as legacy listed them.
 * A book with no edition offers the languages of its texts.
 */
export function availableLanguages(publication, editionById) {
  const fromEditions = new Set(editionsOf(publication, editionById).map((edition) => edition.language).filter(Boolean))
  const list = fromEditions.size ? [...fromEditions] : [...(publication?.languages ?? [])]
  return list.sort()
}

/**
 * The language a book is shown in when none is asked for: its main language
 * where it has a version in it, else its first (legacy's display_lang_id,
 * determineLanguage()).
 */
export function displayLanguage(publication, editionById, requested = null) {
  const languages = availableLanguages(publication, editionById)
  if (requested && languages.includes(requested)) return requested
  if (publication?.language && languages.includes(publication.language)) return publication.language
  return languages[0] ?? publication?.language ?? 'en'
}

/** A version's formats, as legacy listed them on a tile: the bindings, once each. */
export function formatsOf(editions) {
  const out = []
  for (const edition of editions ?? []) {
    const value = String(edition?.binding ?? '').trim()
    if (value && !out.includes(value)) out.push(value)
  }
  return out
}

/**
 * An edition's texts: the book's in that language, with the edition's own
 * where legacy kept a version's apart (`texts`, D-P9). Legacy's fields:
 * about_this_book (description1), more_about_this_book (description2), note
 * (remarks1), author, photographer and editors (local_coordinator).
 */
export function editionText(bookText = {}, edition = null) {
  const own = edition?.texts ?? {}
  const pick = (value, fallback) => (value !== undefined && value !== null && value !== '' ? value : fallback ?? null)
  return {
    title: pick(own.title, bookText.title),
    subtitle: pick(own.subtitle, bookText.subtitle),
    about: pick(own.description1, bookText.description),
    moreAbout: pick(own.description2, bookText.introduction),
    note: pick(own.remarks1, null),
    authors: pick(own.author, bookText.author_credit),
    photographers: pick(own.photographer, bookText.photography_credit),
    editors: pick(own.local_coordinator, bookText.coordination_credit),
  }
}

/** A version's sample and credits PDFs, legacy's path_catalogue and path_credits. */
export function documentsOf(edition) {
  const docs = edition?.documents ?? []
  return {
    sample: docs.find((doc) => doc?.kind === 'sample')?.url ?? null,
    credits: docs.find((doc) => doc?.kind === 'credits')?.url ?? null,
  }
}

/** Legacy's checkExists(): a value it printed — anything but empty, so a 0 count shows. */
export function present(value) {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

/** The entry name of a theme tag: `publications.theme.<its English name in camelCase>`. */
export function themeKey(tag) {
  const words = String(tag?.internal_name ?? '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  if (words.length === 0) return ''
  return `publications.theme.${words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('')}`
}

const fold = (value) => String(value ?? '').toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const digits = (value) => String(value ?? '').replace(/[^0-9xX]/g, '').toLowerCase()

/** Whether the search has anything to search for. */
export function hasSearch(query) {
  return SEARCH_KEYS.some((key) => present(query?.[key]))
}

/**
 * The books a search finds, in the package's order: every field the visitor
 * filled must match (legacy's book API combined them with AND). Title and
 * author match a part of a version's title, subtitle or author line in any
 * language, the ISBN a version's ISBN; the selects match a version's
 * language, format or publisher, the book's country or a subject.
 *
 * `textsOf(publication)` answers the book's texts in every language
 * (`[{ title, subtitle, author_credit }, …]`).
 */
export function searchPublications(publications, query, { editionById, textsOf }) {
  if (!hasSearch(query)) return []
  const title = fold(query.title).trim()
  const author = fold(query.author).trim()
  const isbn = digits(query.isbn)
  return (publications ?? []).filter((publication) => {
    const editions = editionsOf(publication, editionById)
    const texts = textsOf(publication)
    const versionTexts = editions.map((edition) => edition.texts ?? {})
    if (title && ![...texts, ...versionTexts].some((text) => fold(text.title).includes(title) || fold(text.subtitle).includes(title))) {
      return false
    }
    if (author && ![...texts.map((text) => text.author_credit), ...versionTexts.map((text) => text.author)].some((line) => fold(line).includes(author))) {
      return false
    }
    if (isbn && !editions.some((edition) => digits(edition.isbn).includes(isbn))) return false
    if (present(query.language) && !editions.some((edition) => edition.language === query.language)) return false
    if (present(query.type) && !editions.some((edition) => edition.format === query.type)) return false
    if (present(query.publisher) && !editions.some((edition) => edition.publisher === query.publisher)) return false
    if (present(query.country) && publication.country_id !== query.country) return false
    if (present(query.subject) && !(publication.tag_ids ?? []).includes(query.subject)) return false
    return true
  })
}
