// A Discover Baroque Art exhibition as its pages read it: every mini-site's
// records (../exhibition.js, the data package's exhibition collection, its
// themes and pages, the items they place), captioned by Discover Baroque
// Art's own rules (./rules.js) and named in its own label set.
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  glossaryEntries, glossaryTermsFor, removeEndingPoint, useI18n, useSiteConfig,
} from '@museumwnf/viewer-core'
import { chromeSource } from '../../chrome.js'
import { exhibitionData, LABELS } from '../exhibition.js'
import { pageWithNeighbours, PLACEHOLDER_TITLE, readingOrder } from '../rules.js'
import { detailViewCaption, introCaption, placementCaption, slotsOf, withFirstView } from './rules.js'

/** The label set Discover Baroque Art's mini-sites read (viewer-i18n's `minisiteBaroque`). */
export const BAROQUEART_LABELS = LABELS.BAR

const TRANSLATED = ['collections', 'items', 'countries', 'partners', 'glossary']

/** Discover Baroque Art's windows: their names and sizes, as its pages opened them. */
export const BAROQUEART_WINDOWS = {
  zoom: ['mwnfing', ''],
  // The introduction opened its pictures in a window of its own (zoomImage.php).
  introZoom: ['BAR', 'scrollbars=no,resize=no,width=565,height=435'],
}

/**
 * The exhibition as the page language shows it. Called in a view's setup: it
 * loads that language's texts (and English, which an item's own texts fall
 * back to, as legacy's Item::LoadLang did) whenever the language changes.
 */
export function useBaroqueartExhibition() {
  const { pkg, data, tree } = exhibitionData()
  const { locale, t } = useI18n()
  const config = useSiteConfig()
  const settings = config.minisite ?? {}
  const texts = settings.texts ?? BAROQUEART_LABELS
  const label = (key) => t(`${texts}.${key}`)
  const router = useRouter()
  const lang = computed(() => locale.value)

  watch(lang, (code) => Promise.all(TRANSLATED.flatMap((e) => [pkg.loadTranslations(e, code), pkg.loadTranslations(e, 'en')])), {
    immediate: true,
  })

  const root = tree.root
  const themes = computed(() => (root.value ? tree.children(root.value.id) : []))
  const pages = computed(() => readingOrder(themes.value, tree.children))

  /**
   * A collection's own texts in the page language: legacy printed nothing
   * where it had none — nor where the importer wrote a placeholder title.
   */
  function text(id) {
    const own = pkg.translations('collections', lang.value)[id] ?? {}
    return PLACEHOLDER_TITLE.test(own.title ?? '') ? { ...own, title: '' } : own
  }

  const countryName = (item) =>
    item?.country_id ? removeEndingPoint(data.tr('countries', item.country_id, lang.value).name ?? '') : ''

  function captionInput(entry) {
    return {
      item: data.itemById.value.get(entry.id),
      own: data.tr('items', entry.id, lang.value),
      caption: entry.caption?.[lang.value] ?? {},
      countryName,
      noCountry: settings.noCountry,
    }
  }

  /**
   * A view's caption as legacy printed it: a detail view's from its own text,
   * the slot's first view's and the record it shows; any other view's from
   * its placement; each field then the first view's where its own is empty
   * (showDetail()).
   */
  function viewCaption(slot, index) {
    const of = (variant) => {
      if (!variant.view) return placementCaption(captionInput(variant.entry))
      const first = slot.variants[0]
      return detailViewCaption({
        caption: variant.view.caption?.[lang.value] ?? {},
        first: first.view ? first.view.caption?.[lang.value] ?? {} : {},
        record: variant.view.id ? data.tr('items', variant.view.id, lang.value) : {},
        placement: captionInput(variant.entry),
      })
    }
    const mine = slot?.variants[index]
    if (!mine) return null
    return withFirstView(of(mine), of(slot.variants[0]))
  }

  /** The glossary terms a collection's text links in the page language, as the renderers take them. */
  function glossaryFor(id) {
    const ids = text(id).glossary_ids ?? []
    if (ids.length === 0) return []
    return glossaryEntries(
      glossaryTermsFor({ glossary_ids: ids }, lang.value, { translations: pkg.translations, byId: data.index('glossary').value }),
    )
  }

  /** A picture of the site's frame, by its path under theme/assets/; `{lang}` stands for the page language. */
  function picture(path) {
    return path ? chromeSource(config.chrome, String(path).replace('{lang}', lang.value)) : null
  }

  /** A route of this website as an address, for the windows legacy opened. */
  function href(route) {
    return new URL(router.resolve({ ...route, query: { ...route.query, lang: lang.value } }).href, window.location.href).href
  }

  return {
    t,
    label,
    lang,
    data,
    root,
    themes,
    pages,
    text,
    settings,
    picture,
    href,
    glossaryFor,
    pageAt: (theme, page) => pageWithNeighbours(pages.value, theme, page),
    slots: slotsOf,
    placementCaption: (entry) => placementCaption(captionInput(entry)),
    viewCaption,
    introCaption: (entry) => introCaption(captionInput(entry)),
    title: computed(() => (root.value ? text(root.value.id).title ?? '' : '')),
  }
}
