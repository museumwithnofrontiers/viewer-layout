// What the Artistic Introduction's `dataset.config.js` declares, built once
// here: its routes, the frame's links and its settings.
import { mwnfLinks } from '@museumwnf/viewer-core'
import Zoom from '../Zoom.vue'
import { EXHIBITION_ENTITIES, LABELS } from '../exhibition.js'
import Home from './Home.vue'
import Page from './Page.vue'

/**
 * The routes of the Artistic Introduction: the home page, a theme's pages
 * (`/page/<theme>/<page>`, 1-based like legacy's page.php?theme=&page=, the
 * first page when none is given) and the zoom window, drawn without the frame
 * (`meta.bare`). `meta` is the site's `sectionMeta()`.
 */
export function artintroRoutes(meta) {
  return [
    { path: '/', name: 'home', component: Home, meta: meta('home', 'collections') },
    {
      path: '/page/:theme(\\d+)/:page(\\d+)?',
      name: 'page',
      component: Page,
      props: (route) => ({ theme: Number(route.params.theme), page: Number(route.params.page || 1) }),
      meta: meta('page', ...EXHIBITION_ENTITIES),
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

/**
 * The frame's links — what the mini-site shell reads from `navigation`: the
 * logo and the header's two links, to the MWNF portal and to the parent
 * site's home page (`parent`, its address), each with its tooltip; no menu
 * over the footer; the footer. `languages` is `languageLabels(languages)`.
 */
export function artintroNavigation({ languages, parent, texts = LABELS.GAI }) {
  const footer = [
    ['aboutMwnf', mwnfLinks.about],
    ['contact', mwnfLinks.contact],
    ['legalNotice', mwnfLinks.legalNotice],
    ['credits', mwnfLinks.credits],
    ['cookies', mwnfLinks.cookies],
  ]
  return {
    languages,
    logoHref: `${parent}/#/`,
    logoTip: '',
    headerLinks: [
      { label: `${texts}.header.portal`, href: mwnfLinks.portal, tip: `${texts}.header.portalTip` },
      { label: `${texts}.header.home`, href: `${parent}/#/`, tip: `${texts}.header.homeTip` },
    ],
    menu: [],
    footerLinks: footer.map(([key, href]) => ({ label: `${texts}.footer.${key}`, href })),
    copyright: `${texts}.footer.copyright`,
  }
}

/**
 * The Artistic Introduction's `minisite` settings, what legacy configured for
 * it, with the parent site's addresses filled in:
 * - `parent` — the parent site's address; a record's sheet (`itemHref`) is there;
 * - `menuSecondColumnFrom` — the home menu's second column starts at this
 *   position ($_HOME_MENU_COL2);
 * - `social` — the home page's links to MWNF's social media, each `{ href,
 *   icon, aspect }`: its icon a chrome path, drawn in the token's colour, as
 *   wide as `aspect` times its height;
 * - `noCountry` — the records legacy names no country for (ISLAMICART_NO_COUNTRY).
 */
export function artintroSettings({ parent, ...settings }) {
  return {
    parent,
    family: 'GAI',
    itemHref: (id) => `${parent}/#/item/${encodeURIComponent(id)}`,
    ...settings,
  }
}
