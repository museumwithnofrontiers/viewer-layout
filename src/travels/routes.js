// What the Travels site's `dataset.config.js` declares, built once here:
// its routes and its whole configuration (inventory-app#2543).
import { languageLabels, offeredLanguages, sectionMeta, useDataPackage } from '@museumwnf/viewer-core'
import Home from './Home.vue'
import Itinerary from './Itinerary.vue'
import { TRAVEL_ENTITIES } from './rules.js'
import Shell from './Shell.vue'
import Trail from './Trail.vue'
import Trails from './Trails.vue'

const tabOf = (route) => (typeof route.query.tab === 'string' ? route.query.tab : undefined)

/**
 * The routes of the Travels site, legacy's Exhibition Trails pages under the
 * addresses the packages' links assume (`/trail/:id`,
 * travels-data-package.md): the home page (travel_et_home.php), a country's
 * or a theme's trails (`/trails?country=<id>` / `?project=<code>`,
 * travel_et_trail.php), a trail (`/trail/<id>?tab=desc|its|cur`,
 * travel_et_trailDetail.php) and an itinerary (`/itinerary/<id>?tab=des|vl`,
 * travel_et_itenary.php). `meta` is the site's `sectionMeta()`.
 */
export function travelsRoutes(meta = sectionMeta()) {
  return [
    { path: '/', name: 'home', component: Home, meta: meta('home', ...TRAVEL_ENTITIES) },
    { path: '/trails', name: 'trails', component: Trails, meta: meta('trails', ...TRAVEL_ENTITIES) },
    {
      path: '/trail/:id',
      name: 'trail',
      component: Trail,
      props: (route) => ({ id: String(route.params.id), tab: tabOf(route) }),
      meta: meta('trail', ...TRAVEL_ENTITIES),
    },
    {
      path: '/itinerary/:id',
      name: 'itinerary',
      component: Itinerary,
      props: (route) => ({ id: String(route.params.id), tab: tabOf(route) }),
      meta: meta('itinerary', ...TRAVEL_ENTITIES),
    },
  ]
}

/**
 * The Travels site's whole declaration. What is the site's own stays in the
 * site: its data package, its address and its name. `travels` may name the
 * Publications site's address (`books`), the portal's (`portal`), or other
 * projects to leave out of the lists (`hiddenProjects`, legacy's GPA by
 * default).
 *
 *   import { travelsConfig } from '@museumwnf/viewer-layout/travels'
 *   export default travelsConfig({ datasetPackage: '@museumwnf/travels-data',
 *     origin: 'https://museumwithnofrontiers.github.io/travels' })
 */
export function travelsConfig({ datasetPackage, origin, siteName, chrome = {}, travels = {} }) {
  const { manifest } = useDataPackage()
  // The languages the trails' texts are in: legacy's trail pages were drawn
  // in the trail's language, labels and texts alike.
  const languages = offeredLanguages({ entity: 'collections' })
  return {
    datasetPackage,
    siteName: manifest.site?.names?.en ?? siteName ?? datasetPackage,
    site: { origin },
    features: { entities: [] },
    languages,
    chrome,
    travels,
    shell: Shell,
    navigation: { languages: languageLabels(languages) },
    views: { home: Home },
    extraViews: travelsRoutes(sectionMeta()),
    legacyRoutes: [],
  }
}
