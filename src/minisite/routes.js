// What a mini-site's `dataset.config.js` declares, built once here: its
// routes, the frame's links and its exhibition settings.
import { mwnfLinks } from '@museumwnf/viewer-core'
import Credits from './Credits.vue'
import Home from './Home.vue'
import Introduction from './Introduction.vue'
import Map from './Map.vue'
import Page from './Page.vue'
import Zoom from './Zoom.vue'
import { EXHIBITION_ENTITIES, LABELS } from './exhibition.js'

/**
 * The routes of a mini-site: the home page, the introduction, the exhibition
 * pages (`/exhibition/<theme>/<page>`, 1-based like legacy's addresses), and
 * legacy's three windows, drawn without the frame (`meta.bare`). `meta` is the
 * site's `sectionMeta()`.
 */
export function minisiteRoutes(meta) {
  return [
    { path: '/', name: 'home', component: Home, meta: meta('home', 'collections', 'partners', 'countries') },
    {
      path: '/introduction',
      name: 'introduction',
      component: Introduction,
      meta: meta('introduction', ...EXHIBITION_ENTITIES),
    },
    {
      path: '/exhibition/:theme(\\d+)/:page(\\d+)?',
      name: 'exhibition',
      component: Page,
      props: (route) => ({ theme: Number(route.params.theme), page: Number(route.params.page || 1) }),
      meta: meta('exhibition', ...EXHIBITION_ENTITIES),
    },
    {
      path: '/credits',
      name: 'credits',
      component: Credits,
      meta: { ...meta('credits', 'collections'), bare: 'credits' },
    },
    { path: '/map', name: 'map', component: Map, meta: { ...meta('map'), bare: 'map' } },
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
 * The menu over the footer of Discover Islamic Art's exhibitions
 * (generic_footerTop.php), in its order, on the parent site at `parent`.
 * The Artistic Introduction opened in a window of its own.
 */
export function islamicartMenu(parent, texts = LABELS.ISL) {
  return [
    { label: `${texts}.menu.permanentCollection`, href: `${parent}/#/permanent-collection` },
    { label: `${texts}.menu.database`, href: `${parent}/#/database` },
    { label: `${texts}.menu.exhibitions`, href: `${parent}/#/exhibitions` },
    { label: `${texts}.menu.artisticIntroduction`, href: `${parent}/#/artistic-introduction`, window: true },
    { label: `${texts}.menu.timeline`, href: `${parent}/#/timeline` },
    { label: `${texts}.menu.partners`, href: `${parent}/#/partners` },
    { label: `${texts}.menu.myCollection`, href: mwnfLinks.myCollection },
  ]
}

/**
 * The frame's links — what the shell reads from `navigation`: the logo to the
 * MWNF portal and its tooltip, the header's two links to the parent site
 * (`parent`, its address), the menu over the footer (`menu`, legacy's by
 * default) and the footer, each named in Discover Islamic Art's exhibitions'
 * label set (`texts` to name another). `languages` is
 * `languageLabels(languages)`.
 */
export function minisiteNavigation({ languages, parent, texts = LABELS.ISL, menu }) {
  const footer = [
    ['aboutMwnf', mwnfLinks.about],
    ['contact', mwnfLinks.contact],
    ['legalNotice', mwnfLinks.legalNotice],
    ['credits', mwnfLinks.credits],
    ['cookies', mwnfLinks.cookies],
  ]
  return {
    languages,
    logoHref: mwnfLinks.portal,
    logoTip: `${texts}.header.logoTip`,
    headerLinks: [
      { label: `${texts}.header.exhibitionsList`, href: `${parent}/#/exhibitions` },
      { label: `${texts}.header.home`, href: `${parent}/#/`, tip: `${texts}.header.homeTip` },
    ],
    menu: menu ?? islamicartMenu(parent, texts),
    footerLinks: footer.map(([key, href]) => ({ label: `${texts}.footer.${key}`, href })),
    copyright: `${texts}.footer.copyright`,
  }
}

/**
 * A mini-site's `minisite` settings, what legacy configured for one
 * exhibition, with the parent site's addresses filled in:
 * - `parent` — the parent site's address; a record's sheet (`itemHref`) and a
 *   curator's page (`partnerHref`) are there, unless given;
 * - `menuSecondColumnFrom` — the home menu's second column starts at this
 *   position ($_HOME_MENU_COL2); none when omitted;
 * - `curators` — the home page's band (HOMELOGOS), each curator's logo (a chrome
 *   path) and the space after it, and either `partner` (its id: the name,
 *   country and page come from its record) or `name`, `country` (a country
 *   id) and `href`, as legacy wrote them for a curator that is no partner;
 * - `map` — `{ thumbnail, picture(lang, n), count }`, the introduction's map;
 * - `noCountry` — the records legacy names no country for (ISLAMICART_NO_COUNTRY);
 * - `documentTitle` — the Word document's title, legacy's own.
 */
export function minisiteSettings({ parent, ...settings }) {
  return {
    parent,
    itemHref: (id) => `${parent}/#/item/${encodeURIComponent(id)}`,
    partnerHref: (id) => `${parent}/#/partner/${encodeURIComponent(id)}`,
    ...settings,
  }
}
