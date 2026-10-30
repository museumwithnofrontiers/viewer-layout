// What a Discover Baroque Art mini-site's `dataset.config.js` declares, built
// once here: its routes, the frame's links and its exhibition settings.
import { mwnfLinks } from '@museumwnf/viewer-core'
import { EXHIBITION_ENTITIES } from '../exhibition.js'
import { BAROQUEART_LABELS } from './exhibition.js'
import Home from './Home.vue'
import Introduction from './Introduction.vue'
import Page from './Page.vue'
import Zoom from './Zoom.vue'

/**
 * The routes of a mini-site: the home page, the introduction, the exhibition
 * pages (`/exhibition/<theme>/<page>`, 1-based like legacy's addresses), and
 * the zoom window its pages opened, drawn without the frame (`meta.bare`).
 * `meta` is the site's `sectionMeta()`.
 */
export function baroqueartRoutes(meta) {
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
      path: '/zoom',
      name: 'zoom',
      component: Zoom,
      props: (route) => ({ image: String(route.query.img ?? '') }),
      meta: { ...meta('zoom', 'collections'), bare: 'zoom' },
    },
  ]
}

/**
 * The menu over the footer (exhibitions/BAR/generic_footerTop.php), in its
 * order, on the parent site at `parent`: its Exhibitions led to the
 * exhibition's own home page.
 */
export function baroqueartMenu(parent, texts = BAROQUEART_LABELS) {
  return [
    { label: `${texts}.menu.permanentCollection`, href: `${parent}/#/permanent-collection` },
    { label: `${texts}.menu.database`, href: `${parent}/#/database` },
    { label: `${texts}.menu.exhibitions`, href: '#/' },
    { label: `${texts}.menu.timeline`, href: `${parent}/#/timeline` },
    { label: `${texts}.menu.partners`, href: `${parent}/#/partners` },
    { label: `${texts}.menu.myCollection`, href: mwnfLinks.myCollection },
  ]
}

// The footer's language-policy link: the MWNF page it named.
const LANGUAGE_POLICY = 'https://www.museumwnf.org/about/language-policy'

/**
 * The frame's links — what the shell reads from `navigation`: the logo to the
 * MWNF portal and its tooltip, the header's two links to the parent site
 * (`parent`, its address), the menu over the footer (`menu`, legacy's by
 * default) and the footer, each named in Discover Baroque Art's label set
 * (`texts` to name another). `languages` is `languageLabels(languages)`.
 */
export function baroqueartNavigation({ languages, parent, texts = BAROQUEART_LABELS, menu }) {
  const footer = [
    ['aboutMwnf', mwnfLinks.about],
    ['contact', mwnfLinks.contact],
    ['legalNotice', mwnfLinks.legalNotice],
    ['credits', mwnfLinks.credits],
    ['languagePolicy', LANGUAGE_POLICY],
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
    menu: menu ?? baroqueartMenu(parent, texts),
    footerLinks: footer.map(([key, href]) => ({ label: `${texts}.footer.${key}`, href })),
    copyright: `${texts}.footer.copyright`,
  }
}

/**
 * A mini-site's `minisite` settings, what legacy configured for one
 * exhibition, with the parent site's addresses filled in:
 * - `parent` — the parent site's address; a record's sheet (`itemHref`), a
 *   curator's page (`partnerHref`) and the partner institutions' list
 *   (`partnerListHref`) are there, unless given;
 * - `menuSecondColumnFrom` — the home menu's second column starts at this
 *   position ($_HOME_MENU_COL2); none when omitted;
 * - `curators` — the home page's band (HOMELOGOS), each curator's logo (a
 *   chrome path) and the space after it, and either `partner` (its id: the
 *   name comes from its record, followed by the `place` and `country` legacy
 *   printed after it) or `name`, `country` (a country id) and `href`, as
 *   legacy wrote them for a curator that is no partner;
 * - `design` — the designer credited beside the curators: `name`, `logo` (a
 *   chrome path) and `href`;
 * - `banner` — the home picture (a chrome path), drawn in the frame's footer
 *   where the exhibition's stylesheet placed it;
 * - `noCountry` — the records legacy names no country for (BAROQUEART_NO_COUNTRY);
 * - `documentTitle` — the Word document's title, legacy's own;
 * - `texts` — the label set, Discover Baroque Art's unless given.
 */
export function baroqueartSettings({ parent, ...settings }) {
  return {
    parent,
    itemHref: (id) => `${parent}/#/item/${encodeURIComponent(id)}`,
    partnerHref: (id) => `${parent}/#/partner/${encodeURIComponent(id)}`,
    partnerListHref: `${parent}/#/partners`,
    texts: BAROQUEART_LABELS,
    family: 'BAR',
    ...settings,
  }
}
