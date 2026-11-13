// What legacy travels.museumwnf.org's Exhibition Trails printed, as pure
// functions over the Travels package (inventory-app#2543): the trails and
// their tree (trail → itinerary → location → monument), the numbers legacy
// read from its keys, the main locations, the gallery's pictures. The legacy
// pages are travel_et_home.php, travel_et_trail.php, travel_et_trailDetail.php
// and travel_et_itenary.php.

/** The entities every Travels page reads. */
export const TRAVEL_ENTITIES = ['collections', 'items', 'countries', 'languages']

export const TRAIL_TYPE = 'exhibition trail'
export const ITINERARY_TYPE = 'itinerary'
export const LOCATION_TYPE = 'location'

/**
 * The projects legacy left out of its lists: its theme select and its
 * country pages skipped the GPA trail ("Comment for avoiding display GPA").
 */
export const HIDDEN_PROJECTS = Object.freeze(['GPA'])

/** The trail pages' tabs (legacy's `fl`), in the order of its "See Also" menu. */
export const TRAIL_TABS = Object.freeze(['desc', 'its', 'cur'])
/** The itinerary pages' tabs. */
export const ITINERARY_TABS = Object.freeze(['des', 'vl'])

/** A key's segments after its prefix: `mwnf3_travels:trail:IAM:tn:1` → ['IAM', 'tn', '1']. */
function segments(record) {
  return String(record?.backward_compatibility ?? '').split(':').slice(2)
}

/** The project code a trail's key names (legacy's `tid`), e.g. `IAM`. */
export function projectCode(trail) {
  return segments(trail)[0] ?? ''
}

/** An itinerary's number as legacy printed it, its key's last segment (`I`, `II`, …). */
export function itineraryNumber(itinerary) {
  const parts = segments(itinerary)
  return parts[parts.length - 1] ?? ''
}

/** Whether legacy listed a trail (its project is not one it left out). */
export function isListed(trail, hidden = HIDDEN_PROJECTS) {
  return !hidden.includes(projectCode(trail))
}

/** A collection's children, in the package's order (parents first, siblings in display order). */
export function childrenOf(collections, parentId, type = null) {
  return (collections ?? []).filter((c) => c.parent_id === parentId && (!type || c.type === type))
}

/** The trails of the package, in its order. */
export function trailsOf(collections) {
  return (collections ?? []).filter((c) => c.type === TRAIL_TYPE)
}

/** A trail's locations, itinerary after itinerary. */
export function locationsOfTrail(collections, trail) {
  return childrenOf(collections, trail?.id, ITINERARY_TYPE).flatMap((itinerary) => childrenOf(collections, itinerary.id, LOCATION_TYPE))
}

/**
 * The project of a trail, as its monuments name it (a trail names none of
 * its own): the first monument's under it, else null.
 */
export function projectOfTrail(collections, trail, itemById) {
  for (const location of locationsOfTrail(collections, trail)) {
    for (const entry of location.items ?? []) {
      const project = itemById.get(entry.id)?.project_id
      if (project) return project
    }
  }
  return null
}

/**
 * Legacy's "Main locations visited" on a country's list: the trail's
 * locations' names, once each, in alphabetical order (LoadLocations).
 */
export function mainLocations(names) {
  return [...new Set((names ?? []).map((name) => String(name ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

/** An itinerary's neighbours among its trail's itineraries. */
export function neighbours(itineraries, id) {
  const index = (itineraries ?? []).findIndex((row) => row.id === id)
  if (index < 0) return { previous: null, next: null }
  return { previous: itineraries[index - 1] ?? null, next: itineraries[index + 1] ?? null }
}

/**
 * The pictures of an itinerary's gallery, as legacy's `vl` page listed them:
 * location after location, its own pictures then each of its monuments',
 * and the itinerary's own pictures last. `captionOf(image)` answers a
 * picture's caption in the page language (a collection's picture has only
 * its `alt_text`).
 */
export function galleryOf(collections, itinerary, itemById, captionOf = (image) => image?.captions?.en ?? image?.alt_text ?? '') {
  const out = []
  const byOrder = (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  const add = (images) => {
    for (const image of [...(images ?? [])].sort(byOrder)) out.push({ url: image.url, caption: captionOf(image) ?? '' })
  }
  for (const location of childrenOf(collections, itinerary?.id, LOCATION_TYPE)) {
    add(location.images)
    for (const entry of location.items ?? []) add(itemById.get(entry.id)?.images)
  }
  add(itinerary?.images)
  return out.filter((picture) => picture.url)
}

/** The picture legacy put beside an itinerary on its trail's page: its gallery's first. */
export function itineraryPicture(collections, itinerary, itemById) {
  return galleryOf(collections, itinerary, itemById)[0]?.url ?? null
}

/**
 * The trail's book, linked as legacy linked it: its page on the Publications
 * site, in the page's language (legacy's `/book/<id>/<language>`).
 */
export function bookLink(trail, language) {
  const publication = trail?.publications?.[0]
  if (!publication?.url) return null
  return language ? `${publication.url}/${encodeURIComponent(language)}` : publication.url
}

/** The lines of a text legacy printed one per line (curators, photographers). */
export function lines(text) {
  return String(text ?? '').split(/\s*\n\s*/).map((line) => line.trim()).filter(Boolean)
}
