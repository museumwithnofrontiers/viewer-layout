// The rules legacy's virtual exhibition pages printed by
// (exhibitions/ISL/libs/class.exhibition.inc.php, generic_exhibition.php),
// as plain functions over the records a mini-site's data package holds: the
// order of the pages, the slots of a page and their views, and every caption.
import { removeEndingPoint } from '@museumwnf/viewer-core'

// cleanText(): typographic quotes, the ellipsis and the bullet printed as
// plain characters, on every caption field legacy prepared for its pages.
// (It also dropped raw line breaks, which HTML never showed; a Markdown text
// keeps its own, which are legacy's <br>.)
const PLAIN = [
  [/[‘’]/g, "'"],
  [/[“”]/g, '"'],
  [/…/g, '...'],
  [/•/g, '*'],
]
export function cleanText(text) {
  return PLAIN.reduce((value, [from, to]) => value.replace(from, to), String(text ?? ''))
}

/** The importer's title for a page or theme legacy has none for in a language: legacy printed none. */
export const PLACEHOLDER_TITLE = /^(Theme|Page) \d+$/

/**
 * Legacy names no country after a place in Jerusalem
 * (class.exhibition.inc.php, "JERUSALEM - DIPLOMATIC CODE"): the objects of the
 * Islamic Museum at Al-Aqsa Mosque, and these monuments, by working number.
 * Discover Islamic Art's exhibitions name it in `minisite.noCountry`.
 */
export const ISLAMICART_NO_COUNTRY = {
  partners: ['325b7505-1527-5442-99ea-6a40f8c43d3f'],
  monuments: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '14', '18', '19', '20', '21',
    '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'].map((n) => `PA ${n}`),
}

/**
 * Every page in reading order — each theme's pages, theme after theme — as
 * `{ theme, page, node, themeNode }`, 1-based like legacy's addresses.
 * `children(id)` is the collection tree's.
 */
export function readingOrder(themes, children) {
  return themes.flatMap((theme, ti) =>
    children(theme.id).map((page, pi) => ({ theme: ti + 1, page: pi + 1, node: page, themeNode: theme })),
  )
}

/**
 * The page `theme`/`page` of `pages` with the routes on either side: before
 * the first page, the introduction; after the last, none.
 */
export function pageWithNeighbours(pages, theme, page) {
  const index = pages.findIndex((p) => p.theme === theme && p.page === page)
  if (index < 0) return null
  const route = (p) => ({ name: 'exhibition', params: { theme: p.theme, page: p.page } })
  return {
    ...pages[index],
    previous: index > 0 ? route(pages[index - 1]) : { name: 'introduction' },
    next: index < pages.length - 1 ? route(pages[index + 1]) : null,
  }
}

/**
 * The slots of a page: its placements by position, each with its views
 * (legacy's `n` and `n2`). A view shows the picture its placement links, or
 * the page's own picture at that position.
 */
export function slotsOf(node) {
  const byPosition = new Map()
  for (const entry of node?.items ?? []) {
    const n = entry.display_order ?? 0
    if (!byPosition.has(n)) byPosition.set(n, [])
    byPosition.get(n).push(entry)
  }
  const pagePicture = (n) => (node?.images ?? []).find((image) => image.display_order === n)?.url ?? null
  return [...byPosition.entries()]
    .sort(([a], [b]) => a - b)
    .map(([n, entries]) => ({
      n,
      variants: [...entries]
        .sort((a, b) => (a.variant_order ?? 0) - (b.variant_order ?? 0))
        .map((entry) => ({ entry, image: entry.image_url ?? pagePicture(n) })),
    }))
}

/**
 * The country printed after an item's place: none for the records legacy's
 * rule names (`noCountry`), the country's name otherwise.
 */
function countryAfter(item, countryName, noCountry) {
  if (!item) return ''
  if (item.type === 'object' && noCountry?.partners?.includes(item.partner_id)) return ''
  if (item.type === 'monument' && noCountry?.monuments?.includes(item.mwnf_reference)) return ''
  return countryName(item)
}

/** An item's own place: location, province and country. */
function ownPlace(item, own, countryName, noCountry) {
  return [removeEndingPoint(own.location ?? ''), removeEndingPoint(own.province ?? ''), countryAfter(item, countryName, noCountry)]
    .filter(Boolean)
    .join(', ')
}

/**
 * One view's caption on an exhibition page: each field the page's own text
 * (`caption`, in the page language) first, the item's own (`own`) otherwise;
 * the museum for an object only; the country after the page's own place
 * whatever the record, as legacy wrote it.
 */
export function placementCaption({ item, own, caption = {}, countryName, noCountry }) {
  const museum = item?.type === 'object' ? caption.museum || removeEndingPoint(own.holder ?? '') : ''
  const place = caption.location
    ? [caption.location, item ? countryName(item) : ''].filter(Boolean).join(', ')
    : ownPlace(item, own, countryName, noCountry)
  return {
    name: cleanText(caption.name ? removeEndingPoint(caption.name) : removeEndingPoint(own.name ?? '')),
    detailName: cleanText(caption.detail_name),
    dateLines: [caption.date || removeEndingPoint(own.dates ?? ''), caption.dynasty || removeEndingPoint(own.dynasty ?? '')]
      .filter(Boolean)
      .map(cleanText),
    details: [museum, place].filter(Boolean).map(cleanText),
    justification: cleanText(caption.justification),
  }
}

/** A view's caption with each field the first view's where its own is empty (showDetail()). */
export function withFirstView(mine, first) {
  return {
    name: mine.name || first.name,
    detailName: mine.detailName || first.detailName,
    dateLines: mine.dateLines.length ? mine.dateLines : first.dateLines,
    details: mine.details.length ? mine.details : first.details,
    justification: mine.justification || first.justification,
  }
}

/** The picture a view shows: its own, or the first view's where it has none (showDetail()). */
export function viewPicture(slot, index) {
  return slot?.variants[index]?.image || slot?.variants[0]?.image || null
}

/**
 * An introduction picture's caption lines: the item's name, date, dynasty,
 * museum (an object's) and place, each replaced by the exhibition's own text
 * where it has one. Legacy cleaned the exhibition's texts and the item's
 * dynasty, nothing else.
 */
export function introCaption({ item, own, caption = {}, countryName, noCountry }) {
  const pick = (override, value) => (override ? cleanText(removeEndingPoint(override)) : value)
  return [
    pick(caption.name, removeEndingPoint(own.name ?? '')),
    pick(caption.date, removeEndingPoint(own.dates ?? '')),
    pick(caption.dynasty, cleanText(removeEndingPoint(own.dynasty ?? ''))),
    item?.type === 'object' ? pick(caption.museum, removeEndingPoint(own.holder ?? '')) : '',
    pick(caption.location, ownPlace(item, own, countryName, noCountry)),
  ]
}

/**
 * A curator's tooltip on the home page's band: the partner's name and its
 * country (MuseumTool::getMuseumName), or, for a curator that is no partner,
 * the name and country (`country`, an id) the site's settings give.
 */
export function curatorLabel(curator, { partnerName, partnerCountry, countryName }) {
  const country = (id) => (id ? countryName(id) : '')
  if (!curator.partner) return [curator.name, country(curator.country)].filter(Boolean).join(', ')
  return [partnerName(curator.partner), country(partnerCountry(curator.partner))].filter(Boolean).join(', ')
}

/**
 * Where a curator's logo leads: the address the settings give (legacy wrote
 * "#" or nothing for some), else the partner's page on the parent site.
 */
export function curatorLink(curator, partnerHref) {
  return 'href' in curator ? curator.href : partnerHref?.(curator.partner)
}

/** Legacy set a quote in italics unless the quote marked its own. */
export function quoteHasItalics(quote) {
  return /(^|[^*])\*[^*\s][^*]*\*/.test(quote ?? '') || /\b_[^_]+_\b/.test(quote ?? '')
}
