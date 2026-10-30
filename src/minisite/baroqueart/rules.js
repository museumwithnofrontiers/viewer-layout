// The rules Discover Baroque Art's virtual exhibition pages printed by
// (exhibitions/BAR/libs/class.exhibition.inc.php, generic_exhibition.php):
// its captions, with the artist and material lines; its detail views
// (exhibition_page_image_details), each a view of the placement it details;
// and its curators, named with the city and country legacy wrote after them.
// How the pages are ordered and which record a view opens are every
// mini-site's (../rules.js).
import { removeEndingPoint } from '@museumwnf/viewer-core'
import { cleanText } from '../rules.js'

/**
 * Legacy names no country after a place in Jerusalem
 * (class.exhibition.inc.php, "JERUSALEM - DIPLOMATIC CODE"), a rule Discover
 * Baroque Art's pages kept from Discover Islamic Art's: the objects of the
 * Islamic Museum at Al-Aqsa Mosque, and these monuments, by working number.
 */
export const BAROQUEART_NO_COUNTRY = {
  partners: ['325b7505-1527-5442-99ea-6a40f8c43d3f'],
  monuments: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '14', '18', '19', '20', '21',
    '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'].map((n) => `PA ${n}`),
}

/**
 * The slots of a page: its placements by position, each with its views
 * (legacy's `n` and `n2`). A view shows the picture its placement links, or
 * the page's own picture at that position. A placement that carries detail
 * views (`details`) shows those instead, in their order, each with its own
 * picture: legacy wrote them into the placement's place, one view each.
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
        .flatMap((entry) =>
          entry.details?.length
            ? entry.details.map((view) => ({ entry, view, image: view.image_url ?? pagePicture(n) }))
            : [{ entry, image: entry.image_url ?? pagePicture(n) }],
        ),
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

/** The place printed under a placement: the page's own place and the record's country, or the record's own place. */
function placementPlace({ item, own, caption = {}, countryName, noCountry }) {
  return caption.location
    ? [caption.location, item ? countryName(item) : ''].filter(Boolean).join(', ')
    : ownPlace(item, own, countryName, noCountry)
}

/**
 * One view's caption on an exhibition page: each field the page's own text
 * (`caption`, in the page language) first, the item's own (`own`) otherwise;
 * the museum for an object only; the country after the page's own place
 * whatever the record, as legacy wrote it; and under the place the artist —
 * an object's artist, a monument's architects — and the materials.
 */
export function placementCaption({ item, own, caption = {}, countryName, noCountry }) {
  const museum = item?.type === 'object' ? caption.museum || removeEndingPoint(own.holder ?? '') : ''
  const place = placementPlace({ item, own, caption, countryName, noCountry })
  const record = item?.type === 'object' ? own.artist : own.architects
  const materials = [].concat(own.materials ?? []).filter(Boolean).join(', ')
  return {
    name: cleanText(caption.name ? removeEndingPoint(caption.name) : removeEndingPoint(own.name ?? '')),
    detailName: cleanText(caption.detail_name),
    dateLines: [caption.date || removeEndingPoint(own.dates ?? ''), caption.dynasty || removeEndingPoint(own.dynasty ?? '')]
      .filter(Boolean)
      .map(cleanText),
    details: [museum, place].filter(Boolean).map(cleanText),
    artist: cleanText(caption.artist || removeEndingPoint(record ?? '')),
    material: cleanText(caption.material || removeEndingPoint(materials)),
    justification: cleanText(caption.justification),
  }
}

/**
 * A detail view's caption (class.exhibition.inc.php): each field the view's
 * own text, else the first view's (`first`), else — for its name, date,
 * location and artist — the monument detail it shows (`record`, that
 * detail's own texts). Its date lines are the dynasty, the date, the museum
 * and the location, in that order; under them the placement's place, as the
 * placement's own caption composes it (`placement`).
 */
export function detailViewCaption({ caption = {}, first = {}, record = {}, placement }) {
  const pick = (field, recordValue = '') => caption[field] || first[field] || recordValue || ''
  return {
    name: removeEndingPoint(pick('name', record.name)),
    detailName: caption.detail_name ?? '',
    dateLines: [pick('dynasty'), pick('date', record.dates), pick('museum'), pick('location', record.location)].filter(Boolean),
    details: placement ? [placementPlace(placement)].filter(Boolean).map(cleanText) : [],
    artist: pick('artist', record.artist),
    material: pick('material'),
    justification: caption.justification || first.justification || '',
  }
}

/**
 * A view's caption with each field the first view's where its own is empty
 * (showDetail()) — except its detail name: legacy wrote a space for an empty
 * one (class.exhibition.inc.php), so a view never took the first view's.
 */
export function withFirstView(mine, first) {
  return {
    name: mine.name || first.name,
    detailName: mine.detailName,
    dateLines: mine.dateLines.length ? mine.dateLines : first.dateLines,
    details: mine.details.length ? mine.details : first.details,
    artist: mine.artist || first.artist || '',
    material: mine.material || first.material || '',
    justification: mine.justification || first.justification,
  }
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
 * A curator's name on the home page's band (generic_homelogo.php): the
 * partner's name, then the city and country legacy wrote out after it
 * (`place`, `country`, a country id), else the partner's own country; for a
 * curator that is no partner, the name and country the site's settings give.
 */
export function curatorLabel(curator, { partnerName, partnerCountry, countryName }) {
  const country = (id) => (id ? countryName(id) : '')
  if (!curator.partner) return [curator.name, country(curator.country)].filter(Boolean).join(', ')
  if (curator.place) return [partnerName(curator.partner), curator.place, country(curator.country)].filter(Boolean).join(', ')
  return [partnerName(curator.partner), country(partnerCountry(curator.partner))].filter(Boolean).join(', ')
}
