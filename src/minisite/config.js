// A mini-site's whole declaration, built once per family, as galleryConfig()
// builds a gallery's (../dxa/config.js). What is the site's own stays in the
// site: its data package, its address, its chrome, and minisite.json — what
// legacy configured for that exhibition alone, written by inventory-app's
// scripts/minisites generators. What every site of a family shares — its
// pages, frame, menu, languages rule, parent site, the records legacy names
// no country for and the Word document's title — is here; a site's
// minisite.json may still set either of the last two for itself.
//
//   import { minisiteConfig } from '@museumwnf/viewer-layout/minisite'
//   import exhibition from './minisite.json'
//   const chrome = import.meta.glob('../theme/assets/**/*.{jpg,jpeg,png,gif,svg}', { eager: true, query: '?url', import: 'default' })
//   export default minisiteConfig({ datasetPackage: '@museumwnf/islamicart-women-data',
//     origin: 'https://museumwithnofrontiers.github.io/islamicart-women', exhibition, chrome })
import { languageLabels, offeredLanguages, sectionMeta, useDataPackage } from '@museumwnf/viewer-core'
import ArtIntroHome from './artintro/Home.vue'
import { artintroNavigation, artintroRoutes, artintroSettings } from './artintro/routes.js'
import BaroqueartHome from './baroqueart/Home.vue'
import { baroqueartNavigation, baroqueartRoutes, baroqueartSettings } from './baroqueart/routes.js'
import BaroqueartShell from './baroqueart/Shell.vue'
import Home from './Home.vue'
import { BAROQUEART_NO_COUNTRY } from './baroqueart/rules.js'
import { minisiteNavigation, minisiteRoutes, minisiteSettings } from './routes.js'
import { ISLAMICART_NO_COUNTRY } from './rules.js'
import Shell from './Shell.vue'
import SharingHistoryHome from './sharinghistory/Home.vue'
import { sharinghistoryNavigation, sharinghistoryRoutes, sharinghistorySettings } from './sharinghistory/routes.js'
import SharingHistoryShell from './sharinghistory/Shell.vue'

/**
 * The address of the product a mini-site belongs to, next to the mini-site's
 * own: `https://<host>/<repo>` → `https://<host>/<product>`. The parent's
 * header, menu and record sheets are there.
 */
export function parentSite(origin, product) {
  const base = String(origin ?? '').replace(/\/+$/, '')
  return `${base.slice(0, base.lastIndexOf('/'))}/${product}`
}

/** What every family's config shares: the package, the name, the address, the chrome. */
function common({ datasetPackage, origin, siteName, chrome = {} }, languages) {
  const { manifest } = useDataPackage()
  return {
    // Must match the alias in vite.config.js and the dependency in package.json.
    datasetPackage,
    siteName: manifest.site?.names?.en ?? siteName ?? datasetPackage,
    // The absolute origin this build is deployed at, base path included.
    site: { origin },
    features: { entities: [] },
    languages,
    chrome,
    legacyRoutes: [],
  }
}

/**
 * One of Discover Islamic Art's virtual exhibitions. `exhibition` is the
 * site's minisite.json: `menuSecondColumnFrom`, `curators`, `maps`, and
 * optionally `noCountry` and `documentTitle`.
 */
export function minisiteConfig({ exhibition = {}, ...site }) {
  // The languages the exhibition has a title in: legacy's switcher offered
  // them. Its texts are the collection's, and a language can carry them where
  // none of its items has a translation.
  const languages = offeredLanguages({ entity: 'collections' })
  const parent = parentSite(site.origin, 'islamicart')
  return {
    ...common(site, languages),
    shell: Shell,
    navigation: minisiteNavigation({ languages: languageLabels(languages), parent }),
    minisite: minisiteSettings({
      parent,
      menuSecondColumnFrom: exhibition.menuSecondColumnFrom,
      curators: exhibition.curators,
      // The introduction's map: one picture per language, and one more per
      // further map legacy drew.
      map: exhibition.maps
        ? {
            thumbnail: 'legacy/intro_map_thumb.jpg',
            picture: (lang, n) => (n ? `legacy/map${n}_${lang}.jpg` : `legacy/map_${lang}.jpg`),
            count: exhibition.maps,
          }
        : null,
      // The records legacy names no country for, and the Word document's title,
      // legacy's own: the family's, unless minisite.json sets its own.
      noCountry: exhibition.noCountry ?? ISLAMICART_NO_COUNTRY,
      documentTitle: exhibition.documentTitle ?? 'MWNF DISCOVER ISLAMIC ART: Exhibition',
    }),
    views: { home: Home },
    extraViews: minisiteRoutes(sectionMeta()),
  }
}

/**
 * Discover Islamic Art's Artistic Introduction: its own home page with its
 * menu, a theme's pages, the zoom; no menu over the footer. `exhibition` is
 * its minisite.json: `menuSecondColumnFrom`, `social`, and optionally `noCountry`.
 */
export function artintroConfig({ exhibition = {}, ...site }) {
  const languages = offeredLanguages({ entity: 'collections' })
  const parent = parentSite(site.origin, 'islamicart')
  return {
    ...common(site, languages),
    shell: Shell,
    navigation: artintroNavigation({ languages: languageLabels(languages), parent }),
    minisite: artintroSettings({
      parent,
      menuSecondColumnFrom: exhibition.menuSecondColumnFrom,
      social: exhibition.social,
      noCountry: exhibition.noCountry ?? ISLAMICART_NO_COUNTRY,
    }),
    views: { home: ArtIntroHome },
    extraViews: artintroRoutes(sectionMeta()),
  }
}

/**
 * One of Discover Baroque Art's virtual exhibitions. `exhibition` is the
 * site's minisite.json: `menuSecondColumnFrom`, `curators`, `design`,
 * `banner`, and optionally `noCountry` and `documentTitle`.
 */
export function baroqueartMinisiteConfig({ exhibition = {}, ...site }) {
  const languages = offeredLanguages()
  const parent = parentSite(site.origin, 'baroqueart')
  return {
    ...common(site, languages),
    shell: BaroqueartShell,
    navigation: baroqueartNavigation({ languages: languageLabels(languages), parent }),
    minisite: baroqueartSettings({
      parent,
      menuSecondColumnFrom: exhibition.menuSecondColumnFrom,
      curators: exhibition.curators,
      design: exhibition.design,
      banner: exhibition.banner,
      noCountry: exhibition.noCountry ?? BAROQUEART_NO_COUNTRY,
      documentTitle: exhibition.documentTitle ?? 'MWNF DISCOVER BAROQUE ART - Exhibition',
    }),
    views: { home: BaroqueartHome },
    extraViews: baroqueartRoutes(sectionMeta()),
  }
}

/**
 * One of Sharing History's exhibitions. `exhibition` is the site's
 * minisite.json: the country `profiles` its footer menu lists, its partners'
 * `logos` (files under theme/assets/legacy/logos/) and `partnerLinks`.
 */
export function sharinghistoryMinisiteConfig({ exhibition = {}, ...site }) {
  const languages = offeredLanguages()
  const parent = parentSite(site.origin, 'sharinghistory')
  return {
    ...common(site, languages),
    shell: SharingHistoryShell,
    navigation: sharinghistoryNavigation({ languages: languageLabels(languages), parent, profiles: exhibition.profiles }),
    minisite: sharinghistorySettings({ parent, logos: exhibition.logos, partnerLinks: exhibition.partnerLinks }),
    views: { home: SharingHistoryHome },
    extraViews: sharinghistoryRoutes(sectionMeta()),
  }
}
