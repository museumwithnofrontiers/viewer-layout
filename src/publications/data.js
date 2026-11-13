// The Publications package, read the one way every website reads records:
// through viewer-core's data layer. Every page of the site reads the same
// four things — the books, their versions, their subjects and the countries —
// and the books' texts in the languages a page shows them in.
import { computed, watch } from 'vue'
import { byId, entityRef, useDataPackage, useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import {
  availableLanguages, displayLanguage, editionsOf, formatsOf, limitLanguages, PUBLICATION_CATEGORIES,
} from './rules.js'

const publications = entityRef('publications')
const editions = entityRef('editions')
const tags = entityRef('tags')
const countries = entityRef('countries')
const languages = entityRef('languages')

/** The site's categories: its settings' own (`publications.categories`), else legacy's. */
export function categoriesOf(config) {
  return config?.publications?.categories ?? PUBLICATION_CATEGORIES
}

/**
 * The books and what every page derives from them. `languagesToLoad` (a
 * getter) names the languages whose texts the page needs on top of English.
 */
export function usePublications({ languagesToLoad = () => [] } = {}) {
  const pkg = useDataPackage()
  const config = useSiteConfig()
  const { locale } = useI18n()
  const editionById = byId('editions')
  const publicationById = byId('publications')

  watch(
    () => [...new Set(['en', locale.value, ...languagesToLoad()])],
    (codes) => Promise.all(codes.flatMap((code) => [pkg.loadTranslations('publications', code), pkg.loadTranslations('countries', code)])),
    { immediate: true },
  )

  const all = computed(() => publications.value ?? [])
  const categories = computed(() => categoriesOf(config))

  /** A book's texts in one language, `{}` where it has none. */
  const text = (publication, code) => pkg.translations('publications', code)[publication?.id] ?? {}

  /** A country's name in the page language, else English (legacy printed English). */
  function countryName(id) {
    if (!id) return ''
    return pkg.translations('countries', locale.value)[id]?.name ?? pkg.translations('countries', 'en')[id]?.name ?? ''
  }

  /** A project's name, in English as legacy's book API gave it. */
  function projectName(id) {
    const names = pkg.manifest.projects?.[id]?.name
    return names?.[locale.value] ?? names?.en ?? ''
  }

  /** A language's name in `inLanguage` (its own name when not given), else its code in capitals. */
  function languageName(code, inLanguage = code) {
    const entry = (languages.value ?? []).find((row) => row.code === code)
    return entry?.names?.[inLanguage] ?? entry?.names?.[code] ?? String(code ?? '').toUpperCase()
  }

  /**
   * A book's tile, as legacy's home, category and results pages drew it: the
   * cover and texts of the version in `language` (its main language when none
   * is asked for), the language chips, its country and project, the formats.
   */
  function tile(publication, requested = null) {
    const index = editionById.value
    const lang = displayLanguage(publication, index, requested)
    const versions = editionsOf(publication, index, lang)
    const own = text(publication, lang)
    const versionText = versions[0]?.texts ?? {}
    // Legacy drew the first version's cover, and "Image Coming Soon" without one.
    const cover = versions.length ? versions[0].cover : publication.cover
    return {
      id: publication.id,
      language: lang,
      to: { name: 'publication', params: { id: publication.id, language: lang } },
      cover: cover?.url ?? null,
      languages: limitLanguages(availableLanguages(publication, index)),
      country: countryName(publication.country_id),
      project: projectName(publication.project_id),
      title: versionText.title || own.title || '',
      subtitle: versionText.subtitle || own.subtitle || '',
      author: versionText.author || own.author_credit || '',
      formats: formatsOf(versions).join(', '),
    }
  }

  /**
   * The books of a category entry, as legacy's book API listed them: by
   * their country's English name (a book with none first), then in the
   * package's order.
   */
  function inCategory(entry, match) {
    const country = (publication) => pkg.translations('countries', 'en')[publication.country_id]?.name ?? ''
    return all.value
      .filter((publication) => match(publication, entry))
      .map((publication, order) => ({ publication, order, key: country(publication) }))
      .sort((a, b) => a.key.localeCompare(b.key) || a.order - b.order)
      .map((row) => row.publication)
  }

  return {
    pkg,
    config,
    publications: all,
    editions,
    tags,
    countries,
    languages,
    editionById,
    publicationById,
    categories,
    text,
    tile,
    inCategory,
    countryName,
    projectName,
    languageName,
  }
}
