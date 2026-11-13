// Legacy's "See also" at the foot of a product's item sheet
// (`database_item.php`, M14 D4, inventory-app#2538): Discover Islamic Art's
// "Related MWNF Travel Book" — the Travel Book of the item's country, linked
// in the page's language as legacy's `/book/<id>/<lang>` — and Discover
// Baroque Art's exhibition trails, each "<title> - <subtitle>". The packages
// carry the links: islamicart's `travel_book`, baroqueart's
// `exhibition_trails` (their exporters keep the rules).
import { removeEndingPoint } from '@museumwnf/viewer-core'

/** The entries the block reads; a product may name its own. */
export const SEE_ALSO_LABELS = Object.freeze({
  heading: 'standalone.related.seeAlso',
  travelBook: 'standalone.related.travelBook',
  exhibitionTrail: 'standalone.related.exhibitionTrail',
})

const inLanguage = (map, language) => map?.[language] ?? map?.en ?? Object.values(map ?? {})[0] ?? ''

/** A trail's name as legacy wrote it: its title and its subtitle, without their final period. */
export function trailTitle(trail, language) {
  const title = removeEndingPoint(inLanguage(trail?.titles, language) ?? '')
  const subtitle = removeEndingPoint(inLanguage(trail?.subtitles, language) ?? '')
  return subtitle ? `${title} - ${subtitle}` : title
}

/** An address on another site with the page's language: a path's own (`/<lang>`) or the query's. */
const withPathLanguage = (url, language) => `${String(url).replace(/\/+$/, '')}/${encodeURIComponent(language)}`
const withQueryLanguage = (url, language) => `${url}${String(url).includes('?') ? '&' : '?'}lang=${encodeURIComponent(language)}`

/**
 * The block's content for a record in the page's language, or null when the
 * record has nothing to link (legacy drew no "See also" then).
 */
export function seeAlsoOf(record, language, labels = SEE_ALSO_LABELS) {
  const links = []
  const book = record?.travel_book
  if (book?.url) links.push({ label: labels.travelBook, href: withPathLanguage(book.url, language) })
  const trails = (Array.isArray(record?.exhibition_trails) ? record.exhibition_trails : [])
    .filter((trail) => trail?.url)
    .map((trail) => ({ text: trailTitle(trail, language), href: withQueryLanguage(trail.url, language) }))
  const groups = trails.length ? [{ heading: labels.exhibitionTrail, links: trails }] : []
  if (links.length === 0 && groups.length === 0) return null
  return { heading: labels.heading, links, groups }
}
