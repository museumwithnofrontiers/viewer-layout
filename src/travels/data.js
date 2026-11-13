// The Travels package, read through viewer-core's data layer: the collection
// tree (trails, itineraries, locations), the monuments, the countries, and
// the tree's texts in the languages a page shows.
import { computed, watch } from 'vue'
import { byId, entityRef, useDataPackage, useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import {
  childrenOf, HIDDEN_PROJECTS, isListed, ITINERARY_TYPE, LOCATION_TYPE, projectCode, projectOfTrail, trailsOf,
} from './rules.js'

const collections = entityRef('collections')
const languages = entityRef('languages')

const TRANSLATED = ['collections', 'countries']

export function useTravels({ languagesToLoad = () => [] } = {}) {
  const pkg = useDataPackage()
  const config = useSiteConfig()
  const { locale } = useI18n()
  const collectionById = byId('collections')
  const itemById = byId('items')

  watch(
    () => [...new Set(['en', locale.value, ...languagesToLoad()])],
    (codes) => Promise.all(codes.flatMap((code) => TRANSLATED.map((entity) => pkg.loadTranslations(entity, code)))),
    { immediate: true },
  )

  const all = computed(() => collections.value ?? [])
  const hidden = computed(() => config.travels?.hiddenProjects ?? HIDDEN_PROJECTS)
  /** Every trail, in the package's order. */
  const trails = computed(() => trailsOf(all.value))
  /** The trails legacy listed. */
  const listed = computed(() => trails.value.filter((trail) => isListed(trail, hidden.value)))

  /** A collection's texts in the page language (or `code`), `{}` where it has none. */
  const text = (record, code = locale.value) => pkg.translations('collections', code)[record?.id] ?? {}
  const extra = (record, code) => text(record, code).extra ?? {}

  function countryName(id) {
    if (!id) return ''
    return pkg.translations('countries', locale.value)[id]?.name ?? pkg.translations('countries', 'en')[id]?.name ?? ''
  }

  function projectName(id) {
    const names = pkg.manifest.projects?.[id]?.name
    return names?.[locale.value] ?? names?.en ?? ''
  }

  /** A language's own name, else its code in capitals. */
  function languageName(code) {
    const entry = (languages.value ?? []).find((row) => row.code === code)
    return entry?.names?.[code] ?? entry?.names?.en ?? String(code ?? '').toUpperCase()
  }

  const itineraries = (trail) => childrenOf(all.value, trail?.id, ITINERARY_TYPE)
  const locations = (itinerary) => childrenOf(all.value, itinerary?.id, LOCATION_TYPE)
  const trailProject = (trail) => projectOfTrail(all.value, trail, itemById.value)

  /** The projects legacy's theme select offered: its listed trails', once each, by code. */
  const projects = computed(() => {
    const out = new Map()
    for (const trail of listed.value) {
      const code = projectCode(trail)
      if (code && !out.has(code)) out.set(code, { code, id: trailProject(trail) })
    }
    return [...out.values()]
  })

  /** The languages a collection has texts in, among those loaded. */
  const textLanguages = (record, codes) => codes.filter((code) => Boolean(pkg.translations('collections', code)[record?.id]))

  return {
    pkg,
    config,
    locale,
    collections: all,
    collectionById,
    itemById,
    trails,
    listed,
    projects,
    text,
    extra,
    countryName,
    projectName,
    languageName,
    itineraries,
    locations,
    trailProject,
    textLanguages,
  }
}
