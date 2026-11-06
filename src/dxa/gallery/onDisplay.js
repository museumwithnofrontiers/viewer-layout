import { renderInline, siblingSiteUrl } from '@museumwnf/viewer-core'

// A gallery item sheet's "On display in → Exhibition(s)", as legacy's
// (dxa-client DatabaseItem.vue) drew it from the record's
// `exhibition_references` (the gallery exporter's, inventory-app#2423):
//
// - the virtual exhibitions of Discover Islamic Art and Discover Baroque Art,
//   or Sharing History's: the project in italics, then one line per place,
//   "Exhibition | *theme*" (and " | *subtheme*"), in the exhibition's English
//   name, as legacy printed it in every language;
// - the online exhibitions: each exhibition's title in italics, then
//   "Theme | *sub-theme*" per picture, in the page's language where the
//   exhibition has it, else in English; the exhibitions in alphabetical
//   order leaving out "a", "an" and "the", as legacy sorted them.
//
// Each line links to the page of our site that shows the item.

const ITALIC = 'mwnf-on-display__theme'

const inline = (text) => renderInline(text ?? '')
const english = (titled) => titled?.titles?.en ?? Object.values(titled?.titles ?? {})[0] ?? ''
const italic = (html) => `<span class="${ITALIC}">${html}</span>`

function link(ref, label) {
  return { id: `${ref.site}${ref.path}`, label, href: siblingSiteUrl(ref.site, ref.path), external: true }
}

/** Legacy's `sortAlphabetical` key: lower case, without the words "a", "an" and "the". */
function sortKey(title) {
  return title.toLowerCase().split(' ').filter((word) => !['a', 'an', 'the'].includes(word)).join(' ')
}

/** The sections (OnDisplayIn's `sections`) for a record in the page language `lang`. */
export function galleryExhibitionSections(record, lang) {
  const refs = record?.exhibition_references ?? []
  const sections = []

  const placed = refs.filter((ref) => ref.list === 'virtual' || ref.list === 'sharing_history')
  if (placed.length) {
    sections.push({
      caption: placed[0].project ? inline(placed[0].project.name) : '',
      links: placed.map((ref) => link(ref, [
        inline(english(ref.exhibition)),
        italic(inline(english(ref.theme))),
        ...(ref.subtheme ? [italic(inline(english(ref.subtheme)))] : []),
      ].join(' | '))),
    })
  }

  const online = refs.filter((ref) => ref.list === 'exhibition')
  const own = online.filter((ref) => ref.exhibition?.titles?.[lang])
  const shown = own.length ? { refs: own, lang } : { refs: online.filter((ref) => ref.exhibition?.titles?.en), lang: 'en' }
  const title = (titled) => titled?.titles?.[shown.lang] ?? titled?.titles?.en ?? ''
  const ordered = [...shown.refs].sort((a, b) => (
    sortKey(title(a.exhibition)).localeCompare(sortKey(title(b.exhibition)), 'en', { sensitivity: 'base' })
    || (a.legacy_order?.[0] ?? 0) - (b.legacy_order?.[0] ?? 0)
  ))
  for (const ref of ordered) {
    const caption = inline(title(ref.exhibition))
    const line = link(ref, `${inline(title(ref.theme))} | ${italic(inline(title(ref.subtheme)))}`)
    const last = sections[sections.length - 1]
    if (last?.exhibition === ref.exhibition.id) last.links.push(line)
    else sections.push({ exhibition: ref.exhibition.id, caption, links: [line] })
  }
  return sections
}
