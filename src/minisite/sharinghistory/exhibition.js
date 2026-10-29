// A Sharing History mini-site's exhibition: one of legacy's virtual
// exhibitions of Sharing History (exhibitions/AWE/), a website of its own.
// Its pages are not Discover Islamic Art's: the exhibition has themes, each
// with an overview (theme_items.php) and subthemes (subtheme_items.php),
// inside the Sharing History site's frame. The records come the one way every
// mini-site reads them (../exhibition.js).
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { removeEndingPoint, useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { chromeSource } from '../../chrome.js'
import { exhibitionData } from '../exhibition.js'

/** The label set Sharing History's mini-sites read (viewer-i18n). */
export const SHARINGHISTORY_LABELS = 'minisiteSharingHistory'

const TRANSLATED = ['collections', 'items', 'countries', 'partners']

/**
 * The exhibition's pages in reading order, as legacy's Next Page walked them:
 * each theme's overview, then its subthemes. `theme` and `page` are 1-based,
 * like legacy's addresses; the overview is page 0.
 */
export function readingOrder(themes, children) {
  return themes.flatMap((theme, ti) => [
    { theme: ti + 1, page: 0, node: theme, themeNode: theme },
    ...children(theme.id).map((sub, si) => ({ theme: ti + 1, page: si + 1, node: sub, themeNode: theme })),
  ])
}

/** The route of a page of the exhibition. */
export function pageRoute(page) {
  return page.page === 0
    ? { name: 'theme', params: { theme: page.theme } }
    : { name: 'subtheme', params: { theme: page.theme, page: page.page } }
}

/** The page `theme`/`page` of `pages`, with the next one: after the last, none. */
export function pageWithNext(pages, theme, page) {
  const index = pages.findIndex((p) => p.theme === theme && p.page === page)
  if (index < 0) return null
  return { ...pages[index], next: index < pages.length - 1 ? pageRoute(pages[index + 1]) : null }
}

/**
 * The slots of a theme or subtheme page: the pictures its image table placed,
 * by position (`display_order`), each with its views in their order
 * (`variant_order`, legacy's rel_sort_order). The first view is the
 * thumbnail; the item panel shows the others as "Related". A placement with
 * no picture of its own is a relation only (the rel_* tables): legacy's pages
 * never drew it. Legacy drew a view only when the curator had approved its
 * relation (curator_status 'Y'), and a position only when its main view was.
 */
export function slotsOf(node) {
  const byPosition = new Map()
  for (const entry of node?.items ?? []) {
    if (!entry.image_url || entry.curator_status !== 'Y') continue
    const n = entry.display_order ?? 0
    if (!byPosition.has(n)) byPosition.set(n, [])
    byPosition.get(n).push(entry)
  }
  return [...byPosition.entries()]
    .sort(([a], [b]) => a - b)
    .map(([n, entries]) => ({
      n,
      variants: [...entries].sort((a, b) => (a.variant_order ?? 0) - (b.variant_order ?? 0)),
    }))
    .filter((slot) => (slot.variants[0].variant_order ?? 1) === 1)
}

/**
 * The item panel's caption, as legacy's showItem() wrote it: the name, the
 * date; for an object, the museum line (holding museum, city, present-day
 * country, country) then the artist and the material; for a monument, the
 * place line (city, present-day country, country) then the architects; and
 * the curator's justification, when the relation's curator status is "Y".
 */
export function placementCaption({ item, own, entry, lang, countryName }) {
  const isObject = item?.type !== 'monument'
  const place = [isObject ? own.holder : '', own.location, countryName(own.country_id_present_days), countryName(item?.country_id)]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(', ')
  const curator = entry?.curator_status === 'Y' ? (entry.justifications?.[lang]?.curator ?? '').trim() : ''
  return {
    name: own.name ?? '',
    date: own.dates ?? '',
    place,
    artist: isObject ? (own.artist ?? '') : '',
    material: isObject ? (own.materials ?? '') : '',
    architects: isObject ? '' : (own.architects ?? ''),
    justification: curator.replace(/\s+/g, ' '),
  }
}

/**
 * The Related Content box of the home page, the introduction and the
 * exhibition pages: the parent site's political context timeline, this
 * exhibition's thematic timeline (its tooltip the exhibition's title, as
 * PHP's ucwords(strtolower()) wrote it), its gallery (the parent's collection,
 * narrowed to the page's theme and subtheme, as legacy's pclist_all.php was)
 * and its further reading (this website's own page). A theme's overview
 * listed the thematic timeline first.
 */
export function relatedLinks({ parent, exhibitionId, themeId = null, subthemeId = null, title = '', furtherReading }) {
  const id = encodeURIComponent(exhibitionId)
  const gallery = [`exhibition=${id}`]
  if (themeId) gallery.push(`theme=${encodeURIComponent(themeId)}`)
  if (subthemeId) gallery.push(`chapter=${encodeURIComponent(subthemeId)}`)
  const political = { key: 'politicalTimeline', href: `${parent}/#/timeline/results?collection=pc` }
  const thematic = {
    key: 'thematicTimeline',
    href: `${parent}/#/timeline/results?collection=${id}`,
    tipText: title.toLowerCase().replace(/(^|[\s])(\S)/g, (_, space, letter) => space + letter.toUpperCase()),
  }
  return [
    ...(themeId && !subthemeId ? [thematic, political] : [political, thematic]),
    { key: 'gallery', href: `${parent}/#/permanent-collection/results?${gallery.join('&')}`, tip: 'galleryTip' },
    { key: 'furtherReading', to: furtherReading, tip: 'furtherReadingTip' },
  ]
}

/**
 * The exhibition as a Sharing History mini-site page shows it. Called in a
 * view's setup: it loads the page language's texts, and English, which an
 * item's own texts fall back to.
 */
export function useSharingHistoryExhibition() {
  const { pkg, data, tree } = exhibitionData()
  const { locale, t } = useI18n()
  const config = useSiteConfig()
  const settings = config.minisite ?? {}
  const texts = settings.texts ?? SHARINGHISTORY_LABELS
  const label = (key) => t(`${texts}.${key}`)
  const router = useRouter()
  const lang = computed(() => locale.value)

  watch(lang, (code) => Promise.all(TRANSLATED.flatMap((e) => [pkg.loadTranslations(e, code), pkg.loadTranslations(e, 'en')])), {
    immediate: true,
  })

  const root = tree.root
  const themes = computed(() => (root.value ? tree.children(root.value.id) : []))
  const pages = computed(() => readingOrder(themes.value, tree.children))

  const text = (id) => pkg.translations('collections', lang.value)[id] ?? {}
  /** The languages this website offers, and a language's name, as the data package's site lists them. */
  const offered = (pkg.manifest.site?.languages ?? []).map((l) => l.code)
  const languageName = (code) => pkg.manifest.site?.languages?.find((l) => l.code === code)?.label ?? code
  const countryName = (id) => (id ? removeEndingPoint(data.tr('countries', id, lang.value).name ?? '') : '')

  function caption(entry) {
    return placementCaption({
      item: data.itemById.value.get(entry.id),
      own: data.tr('items', entry.id, lang.value),
      entry,
      lang: lang.value,
      countryName,
    })
  }

  /** The picture of the site's frame at `path` under theme/assets/. */
  const picture = (path) => (path ? chromeSource(config.chrome, path) : null)

  /** A route of this website as an address, for the windows legacy opened. */
  function href(route) {
    return new URL(router.resolve({ ...route, query: { ...route.query, lang: lang.value } }).href, window.location.href).href
  }

  /** The exhibition's images of one role (`type`: `logo`, `home image`…), in their order. */
  const imagesOf = (type) =>
    [...(root.value?.images ?? [])].filter((image) => image.type === type).sort((a, b) => a.display_order - b.display_order)

  return {
    t,
    label,
    lang,
    data,
    tree,
    root,
    themes,
    pages,
    text,
    offered,
    languageName,
    settings,
    caption,
    picture,
    href,
    imagesOf,
    slots: slotsOf,
    pageAt: (theme, page) => pageWithNext(pages.value, theme, page),
    title: computed(() => (root.value ? text(root.value.id).title ?? '' : '')),
    /** The Related Content links of a page: of the exhibition, or of one theme or subtheme. */
    related: (themeId = null, subthemeId = null) =>
      root.value
        ? relatedLinks({
            parent: settings.parent,
            exhibitionId: root.value.id,
            themeId,
            subthemeId,
            title: text(root.value.id).title ?? '',
            furtherReading: { name: 'further-reading' },
          })
        : [],
  }
}

/** Legacy's windows: their names and sizes, as its pages opened them. */
export const SHARINGHISTORY_WINDOWS = {
  credits: ['exhcredits', 'scrollbars=auto, resizable=1, width=520, height=530'],
  coverImage: ['exhCoverImage', 'scrollbars=auto, resizable=1, width=520, height=530'],
  zoom: ['SHImages', 'scrollbars=no,resize=no,width=565,height=435'],
}
