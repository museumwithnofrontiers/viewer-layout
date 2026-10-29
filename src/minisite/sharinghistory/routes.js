// What a Sharing History mini-site's `dataset.config.js` declares, built once
// here: its routes, the frame's links and its exhibition settings.
import { mwnfLinks } from '@museumwnf/viewer-core'
import FurtherReading from './FurtherReading.vue'
import Home from './Home.vue'
import Introduction from './Introduction.vue'
import Page from './Page.vue'
import Window from './Window.vue'
import Zoom from './Zoom.vue'
import { SHARINGHISTORY_LABELS } from './exhibition.js'

const ENTITIES = ['collections', 'items', 'countries', 'partners']

/**
 * The routes of a Sharing History mini-site: the home page, the introduction,
 * a theme's overview (`/theme/<n>`) and its subthemes (`/theme/<n>/<m>`),
 * 1-based like legacy's addresses, the further reading, and legacy's windows,
 * drawn without the frame (`meta.bare`). `meta` is the site's `sectionMeta()`.
 */
export function sharinghistoryRoutes(meta) {
  return [
    { path: '/', name: 'home', component: Home, meta: meta('home', ...ENTITIES) },
    { path: '/introduction', name: 'introduction', component: Introduction, meta: meta('introduction', ...ENTITIES) },
    {
      path: '/theme/:theme(\\d+)',
      name: 'theme',
      component: Page,
      props: (route) => ({ theme: Number(route.params.theme), page: 0 }),
      meta: meta('theme', ...ENTITIES),
    },
    {
      path: '/theme/:theme(\\d+)/:page(\\d+)',
      name: 'subtheme',
      component: Page,
      props: (route) => ({ theme: Number(route.params.theme), page: Number(route.params.page) }),
      meta: meta('subtheme', ...ENTITIES),
    },
    { path: '/further-reading', name: 'further-reading', component: FurtherReading, meta: meta('further-reading', 'collections') },
    {
      path: '/credits',
      name: 'credits',
      component: Window,
      props: { kind: 'curators' },
      meta: { ...meta('credits', 'collections'), bare: 'credits' },
    },
    {
      path: '/cover-image',
      name: 'cover-image',
      component: Window,
      props: { kind: 'coverImage' },
      meta: { ...meta('cover-image', 'collections'), bare: 'cover-image' },
    },
    {
      path: '/zoom',
      name: 'zoom',
      component: Zoom,
      props: (route) => ({ image: String(route.query.img ?? '') }),
      meta: { ...meta('zoom', 'collections'), bare: 'zoom' },
    },
  ]
}

const LANGUAGE_POLICY = 'https://www.museumwnf.org/about/language-policy'

/**
 * The frame's links — what the Sharing History shell reads from `navigation`:
 * the MWNF portal, the parent site's home page and About pages, the menu
 * over the footer (_menuFooterEx.php) with its Historical Profiles
 * (`profiles`: `{ text, href }`, the parent site's country profiles, as its
 * own menu lists them) and the footer. `parent` is the parent site's address.
 */
export function sharinghistoryNavigation({ languages, parent, profiles = [], texts = SHARINGHISTORY_LABELS }) {
  const about = [
    { label: 'header.project', href: `${parent}/#/about` },
    { label: 'header.historicalBackground', href: `${parent}/#/historical-background` },
  ]
  return {
    languages,
    texts,
    portalHref: mwnfLinks.portal,
    homeHref: `${parent}/#/`,
    aboutLinks: about,
    menu: [
      { label: 'menu.about', href: `${parent}/#/about`, links: about },
      { label: 'menu.exhibitions', tip: 'menu.exhibitionsTip', href: `${parent}/#/exhibitions` },
      { label: 'menu.collections', tip: 'menu.collectionsTip', href: `${parent}/#/permanent-collection` },
      { label: 'menu.database', tip: 'menu.databaseTip', href: `${parent}/#/database` },
      { label: 'menu.timeline', tip: 'menu.timelineTip', href: `${parent}/#/timeline` },
      { label: 'menu.historicalProfiles', links: profiles },
      { label: 'menu.partners', tip: 'menu.partnersTip', href: `${parent}/#/partners` },
      { label: 'menu.myCollection', tip: 'menu.myCollectionTip', href: mwnfLinks.myCollection },
    ],
    footerLinks: [
      { label: 'footer.aboutMwnf', href: mwnfLinks.about },
      { label: 'footer.contact', href: mwnfLinks.contact },
      { label: 'footer.legalNotice', href: mwnfLinks.legalNotice },
      { label: 'footer.credits', href: mwnfLinks.credits },
      { label: 'footer.languagePolicy', href: LANGUAGE_POLICY },
      { label: 'footer.cookies', href: mwnfLinks.cookies },
    ],
  }
}

/**
 * A Sharing History mini-site's `minisite` settings: `parent`, the parent
 * site's address (its timelines, gallery, exhibitions and record sheets are
 * there), and the label set it reads (`texts`, Sharing History's own unless
 * another).
 */
export function sharinghistorySettings({ parent, texts = SHARINGHISTORY_LABELS, ...settings }) {
  return { parent, texts, family: 'SH', ...settings }
}
