// What the Publications site's `dataset.config.js` declares, built once
// here: its routes and its whole configuration (inventory-app#2542).
import { languageLabels, offeredLanguages, sectionMeta, useDataPackage } from '@museumwnf/viewer-core'
import Category from './Category.vue'
import Home from './Home.vue'
import Publication from './Publication.vue'
import Results from './Results.vue'
import { PUBLICATION_ENTITIES } from './rules.js'
import Shell from './Shell.vue'

/**
 * The routes of the Publications site, legacy's pages under the addresses its
 * package links assume (`/publication/:id`, publications-data-package.md):
 * the home page, a category (`/category/<legacy's name>`, the page in
 * `?page=`), the search results (`/results`, the search in the query) and a
 * book (`/publication/<id>/<language>`, the version's language optional, as
 * legacy's `/book/<id>/<language>`). `meta` is the site's `sectionMeta()`.
 */
export function publicationsRoutes(meta = sectionMeta()) {
  return [
    { path: '/', name: 'home', component: Home, meta: meta('home', ...PUBLICATION_ENTITIES) },
    {
      path: '/category/:category',
      name: 'category',
      component: Category,
      props: (route) => ({ category: String(route.params.category) }),
      meta: meta('category', ...PUBLICATION_ENTITIES),
    },
    { path: '/results', name: 'results', component: Results, meta: meta('results', ...PUBLICATION_ENTITIES) },
    {
      path: '/publication/:id/:language?',
      name: 'publication',
      component: Publication,
      props: (route) => ({ id: String(route.params.id), language: String(route.params.language ?? '') }),
      meta: meta('publication', ...PUBLICATION_ENTITIES),
    },
  ]
}

/**
 * The Publications site's whole declaration. What is the site's own stays in
 * the site: its data package, its address, its name and its chrome files
 * (`legacy/logo-blue.png`, `legacy/logo-white.png`). `publications` may name
 * other categories (`categories`, PUBLICATION_CATEGORIES' shape), another
 * footer or portal address.
 *
 *   import { publicationsConfig } from '@museumwnf/viewer-layout/publications'
 *   const chrome = import.meta.glob('../theme/assets/**\/*.{jpg,png,gif,svg}', { eager: true, query: '?url', import: 'default' })
 *   export default publicationsConfig({ datasetPackage: '@museumwnf/publications-data',
 *     origin: 'https://museumwithnofrontiers.github.io/publications', siteName: 'MWNF Books', chrome })
 */
export function publicationsConfig({ datasetPackage, origin, siteName, chrome = {}, publications = {} }) {
  const { manifest } = useDataPackage()
  // Legacy's pages are English, whatever the book: the labels of a book's page
  // follow its version's language, its texts too; the site offers English.
  const languages = offeredLanguages({ declared: ['en'], entity: 'publications' })
  return {
    datasetPackage,
    siteName: manifest.site?.names?.en ?? siteName ?? datasetPackage,
    site: { origin },
    features: { entities: [] },
    languages,
    chrome,
    publications,
    shell: Shell,
    navigation: { languages: languageLabels(languages) },
    views: { home: Home },
    extraViews: publicationsRoutes(sectionMeta()),
    legacyRoutes: [],
  }
}
