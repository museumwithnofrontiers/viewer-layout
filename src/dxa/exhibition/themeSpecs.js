import { themes } from './data.js'

// The theme page's EssayView spec and the About page's — the same node shape
// in two modes (inventory-app#2053; each exhibition carried this as its own
// `composables/themeSpecs.js`). Both share everything but `about`:
//
//   * `tree` is the one tree `useExhibitionThemes` builds, so the tour's
//     `previous`/`next` is the order every page that walks it agrees on;
//   * `panel: true` keeps EssayView's side column; the panel and thumbnails
//     are the theme page's own picture→parent apparatus (several curated
//     crops can share one catalogue parent, or have none), not the default
//     one-record-per-id model;
//   * `numbering: false`: the numeral shown is the owning theme's (`romanFor`),
//     which EssayView cannot supply for a top-level theme of a themes.json
//     package, whose tree has no root.
//
// `aboutSpec` is `about: () => true` because it is only ever mounted at the
// About theme; `themeSpec` is `about: () => false` because a legacy
// `/theme/0` link (the About theme's own route id) must still render as an
// ordinary theme page, panel and all.

const { aboutTheme, owningTheme, subIndexOf, themeRouteId, themeTree } = themes

/** A tree node's own page: the About theme routes to /about, any other to /theme/:id/:sub. */
export function themeNodeRoute(node) {
  if (!node) return null
  if (aboutTheme.value && node.id === aboutTheme.value.id) return { name: 'about' }
  const owner = owningTheme(node)
  const sub = subIndexOf(node)
  return {
    name: 'theme',
    params: { id: String(themeRouteId(owner)), subtheme: sub === null ? 'overview' : String(sub) },
  }
}

const shared = {
  tree: themeTree,
  entity: 'items',
  route: (node) => themeNodeRoute(node),
  quote: 'quote',
  body: 'presentation',
  glossary: true,
  panel: true,
  navigation: 'tree',
  numbering: false,
}

export const themeSpec = { ...shared, about: () => false }
export const aboutSpec = { ...shared, about: () => true }
