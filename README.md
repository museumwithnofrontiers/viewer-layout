# @museumwnf/viewer-layout

What the pages of an MWNF website are made of: the page frame, the building
blocks, the composed views, and the pages of the DXA family (the galleries and
the exhibitions). Every visual value comes from a `--mwnf-*` token, and a
website sets its own values in `theme/tokens.css`; the package defines none.

## Entry points and layers

Each entry point belongs to one layer of the platform's
[architecture reference](https://github.com/museumwithnofrontiers/inventory-app/issues/1510), which says what goes where across
all the packages:

| Entry | Layer | Holds | Reads |
| --- | --- | --- | --- |
| `@museumwnf/viewer-layout` | building blocks | `PageShell` and its seven sections, and every block of `/content` | its props, and the texts and Markdown renderers of `@museumwnf/viewer-core` |
| `@museumwnf/viewer-layout/content` | building blocks | the blocks alone, without the shell | the same |
| `@museumwnf/viewer-layout/views` | composed views | whole pages driven by a spec the website declares, with slots it fills | viewer-core's data layer, the site config and the router |
| `@museumwnf/viewer-layout/components` | composed views | `SiteShell`, the frame composed from `dataset.config.js` | the site config and the current route |
| `@museumwnf/viewer-layout/dxa` | DXA family layer | the gallery and exhibition pages and shells, the family-only blocks, `standardRoutes`, `galleryConfig` / `exhibitionConfig` | the entries above, `@museumwnf/viewer-core` and `@museumwnf/viewer-core/dxa` |
| `@museumwnf/viewer-layout/style.css` | — | one stylesheet for every entry, the family styles included | — |
| `@museumwnf/viewer-layout/tokens.reference.css` | — | every token the package reads, with its fallback | — |

A block is fed by its props: a plain view-model built by viewer-core or by
the website. Beyond its props it reads only viewer-core's texts and
renderers, and at most the one viewer-core helper its job needs
(`GlossaryTool` searches the glossary, `SourceCredit` builds the page's
address). It declares no route and reads no spec: that is what a composed
view does.

**Where a new component goes:**

1. **Into the lowest layer that fits.** A block comes before a composed view,
   and a composed view before a family page. A block is promoted here when
   several websites need the same thing; a whole page is shared only inside
   the DXA family, under `/dxa`.
2. **A generic component never defaults to one family's texts.** A block or a
   composed view defaults to a shared entry (`core.*`, `record.*`,
   `partner.*`, …) or takes the entry name as a prop; it never defaults to a
   `gallery.*` or `exhibition.*` entry.
3. **A component only the DXA family uses belongs under `/dxa`.**

**The dependency runs one way.** The root, `/content`, `/views` and
`/components` never import from `/dxa`. `/dxa` imports only what the other
entries publish, and `@museumwnf/viewer-core`. A component that moves
between entries keeps its old export as an alias until the websites have
moved; a major release then removes the alias.

`FeaturedPartners`, `SiblingGalleries`, `PopupLogo`, `PictureGallery`,
`PictureNarrative` (blocks) and `ItemDetailView` (the composed view that was
`RecordSheetView`) are used only by the DXA family and live under `/dxa`
only: they moved there in 2.18.0
([inventory-app#2055](https://github.com/museumwithnofrontiers/inventory-app/issues/2055)),
and their old `/content` and `/views` names went in 3.0.0
([inventory-app#2058](https://github.com/museumwithnofrontiers/inventory-app/issues/2058)).
Where the package does not follow the rules yet: `PictureGallery`,
`PictureNarrative` and `EssayView` default to `exhibition.*` entries
(inventory-app#2019).

Two companion docs give a more scannable version of who-owns-what and the
full slot list: [`docs/designer-contract.md`](docs/designer-contract.md) (the
four roles — components, tokens/CSS, site designer, translator — the
token → overrides → slot → own-view decision ladder, and where a new
component goes) and [`docs/slot-catalogue.md`](docs/slot-catalogue.md)
(every prop and slot of `PageShell`, `SiteShell` and the composed views,
plus a one-line purpose for every `/content` component).

## Install

Published to npmjs (`registry.npmjs.org`), publicly — no authentication
needed to install. (Versions up to 2.11.2, published as
`@metanull/viewer-layout`, remain available on GitHub Packages, frozen; no
new version is published there.)

```bash
npm install @museumwnf/viewer-layout
```

`@museumwnf/viewer-core` (2.1.0 or later) is a peer dependency: the layout
reads its texts from the application's catalogue through it, and renders the
one Markdown prop it has (the banner headline) through its pipeline.

## Use

```js
import { PageShell } from '@museumwnf/viewer-layout'
import '@museumwnf/viewer-layout/style.css'
import './theme/tokens.css' // your copy of tokens.reference.css
```

```vue
<PageShell
  header-title="My Museum"
  :nav-links="[{ label: 'Items', href: '#/items', active: true }]"
  :languages="['en', 'fr']"
  language="en"
  footer-text="© MWNF"
  @update:language="switchLanguage"
>
  <router-view />
</PageShell>
```

With `@museumwnf/viewer-core`, a website passes these props from
`dataset.config.js` (`navigation`) or from a thin shell of its own that
computes the ones that depend on the route or the language.

## Texts

The layout carries no texts of its own. It renders six entries, which reach it
from the catalogue the website passes to `createViewer`:

| Entry | Rendered as |
| --- | --- |
| `layout.nav.skipToContent` | the skip link |
| `layout.nav.label` | the navigation's `aria-label` |
| `layout.nav.menu` | the menu button on a narrow screen |
| `layout.language.label` | the label of the language chooser |
| `layout.hyperlinks.label` | the related-links `aria-label`, unless a `title` is given |
| `layout.sponsors.label` | the sponsors `aria-label`, unless a `title` is given |

They are published in the `layout` namespace of
[`@museumwnf/viewer-i18n`](https://github.com/museumwithnofrontiers/viewer-i18n), which every
website receives; a website overloads any of them in its own `locales/` file.
A language that has not translated one falls back to English.

Every other text a section shows — a link label, a search placeholder, a
notice, a sponsor heading — is a prop, and the website passes it through its
own `t()`.

## PageShell

`PageShell` covers the needs of every website from props. A website fills the
sections it has and leaves the rest empty; a slot is for the *content* of a
section — the mark in the header, the active view — not for rebuilding the
section. A website that needs something no prop expresses adds the prop
here, so the next website has it too.

Sections render top to bottom in this fixed order. Every section is optional: it renders nothing unless its slot or driving props are set. The default slot (→ `AppContent`) is where the router-view goes.

| Section | Slot | Props (on PageShell) | Events |
|---|---|---|---|
| `AppHeader` | `#header`, `#header-brand` | `header-home`, `header-brand`, `header-eyebrow`, `header-title`, `header-title-href`, `header-subtitle`, `header-logos`, `header-logos-title`, `header-links`, `search`, `languages`, `language`, `language-placement`, `language-style` | `search`, `update:language` |
| `AppBanner` | `#banner` | `banner-variant`, `banner-image`, `banner-image-alt`, `banner-text`, `banner-caption`, `banner-caption-label`, `banner-eyebrow`, `banner-title`, `banner-title-href`, `banner-subtitle`, `banner-headline`, `banner-enter`, `banner-strapline` | — |
| `AppNavigation` | `#navigation` | `nav-links`, `notice`, `languages`, `language` | `update:language` |
| `AppContent` | default | — | — |
| `AppHyperlinks` | `#hyperlinks` | `hyperlinks-variant`, `hyperlinks-title`, `hyperlinks-title-href`, `hyperlinks-subtitle`, `hyperlinks` | — |
| `AppSponsors` | `#sponsors` | `sponsors-title`, `sponsors`, `sponsor-groups` | — |
| `AppFooter` | `#footer` | `footer-text`, `footer-links`, `footer-attribution-label`, `footer-attribution-text`, `footer-terms-href`, `footer-terms-label` | — |

### The language switcher

`languages` is `['en']` or `[{ code, label }]`, `language` the active code.
`language-placement` says where the switcher renders: `navigation` (the
default, a select at the end of the navigation bar) or `header`;
`language-style` says how, `select` or `buttons`. Whichever renders emits
`update:language` with the code chosen.

### Links

Every link list — `header-links`, `nav-links`, `hyperlinks`, `footer-links`
— takes `{ label, href, external? }`; `external: true` opens the link in a
new window. `nav-links` also takes `active: true`, marked with
`aria-current="page"`. Links are plain `href`s: with viewer-core's hash
router, `#/items` navigates without any router coupling here.

## Site shell

`SiteShell` composes `PageShell` from a website's `dataset.config.js`
instead of a shell the site writes by hand — the menu, the header/footer
link lists, the search submit, the banner caption and section-title map,
and (an exhibition's) logos bucketed into header logos and sponsor groups.
It reads `config.navigation`, `config.logos` and `config.banner` through
`@museumwnf/viewer-core`'s `useSiteConfig()`, and the active section through
its `useSection()`.

It reads `@museumwnf/viewer-core` itself, the same reason the composed views
do (see below): it is exported from `@museumwnf/viewer-layout/components`,
not from the package root, and a website using it lists
`@museumwnf/viewer-layout` next to `@museumwnf/viewer-core` in its Vitest
`server.deps.inline`.

```js
import { SiteShell } from '@museumwnf/viewer-layout/components'
```

```vue
<SiteShell footer-text="© MWNF 2004–2026">
  <template #brand><span class="mark">MWNF</span></template>
  <router-view />
</SiteShell>
```

```js
// dataset.config.js
export default {
  navigation: {
    languages: ['en', 'fr'],
    links: [
      { section: 'home', label: 'core.nav.home', to: { name: 'home' } },
      { section: 'collection', label: 'gallery.nav.collection', to: { name: 'collection' } },
      { label: 'gallery.nav.myCollection', href: mwnfLinks.myCollection, external: true },
    ],
    headerLinks: [{ label: 'core.nav.home', to: { name: 'home' } }],
    footerLinks: [{ label: 'gallery.footer.aboutMwnf', href: mwnfLinks.about, external: true }],
    sectionTitles: { collection: 'gallery.section.collection', partners: 'gallery.section.partners' },
    search: { route: 'search-results', key: 'q', placeholder: 'gallery.search.placeholder', submitLabel: 'catalogue.search.submit', empty: 'all-objects' },
  },
  banner: {
    variant: ({ section }) => (section === 'home' ? 'strip' : 'section'),
  },
}
```

A field the config leaves out stays whatever the caller passed `PageShell`
directly through `$attrs` — a page's own `banner-image`/`banner-caption`,
say, which only the loaded record knows.

| Part | Shape | Notes |
| --- | --- | --- |
| `config.navigation.links` | `[{ section, label, to \| href, external?, when? }]` | `label` is an entry name, resolved through `t()`; `to` a route name/location resolved through the router, `href` used as-is; the entry whose `section` equals `useSection()` gets `active: true`; `when(ctx)` (`ctx` is `{ section, locale }`) optionally hides the entry — one whose visibility depends on loaded data closes over its own composable's ref instead, as the DXA shells already did for "hasTimeline" |
| `config.navigation.headerLinks` / `.footerLinks` | `[{ label, to \| href, external? }]` | no `when`, no `active` |
| `config.navigation.sectionTitles` | `{ [section]: entryName }` | the banner title over a section page, when `config.banner.title` sets none |
| `config.navigation.search` | `{ route, key, placeholder, submitLabel, empty }` | `key` defaults to `'q'`; a submit navigates to `route` with `{ [key]: term \|\| empty }` — `empty` is legacy's sentinel for a blank submit (`'all-objects'`) |
| `config.logos` | `{ header(logo) => boolean, sponsorGroups(logos, t) => [{ title, sponsors }], headerTitle: entryName }` | a predicate and a mapper over the `logos` prop (below); `headerTitle` shows only once `header()` kept at least one |
| `config.banner` | `{ variant, image, imageAlt, caption, captionLabel, title, subtitle, headline, enter, strapline }` | each value a string (an entry name, resolved through `t()`) or a function of `{ section, locale, t }`; optional field by field |

The `logos` prop is the page's own data (an exhibition's logo list) — not
something a static config can declare — already in `PageShell`'s logo
shape (`{ image, alt, href? }`) plus whatever extra field (a legacy
`category_id`, a `visible` flag) the site's own `header`/`sponsorGroups`
bucket by; turning legacy's `image_url`/`labels` into that shape is the
site's own job, the same as it already is for `AppSponsors`' shape.

Slots: `#brand` is the header lockup — `PageShell`'s `#header-brand`, so the
computed header links/search/logos still render beside it, unlike a full
`#header` override; `#banner` replaces `AppBanner`'s content; `#notice`
renders before the routed content, `#after-content` after it (a dismissible
sponsor notice next to the router-view, say); `#header`, `#navigation`,
`#hyperlinks`, `#sponsors`, `#footer` pass straight through to `PageShell`.

Once the loaded package's `manifest.rights` names a holder (`useSiteRights()`),
the footer also renders the attribution sentence — `rights.attribution`, or
the holder's name when the package carries no separate attribution text —
labelled `record.source.rightsHolder`, with a link labelled
`record.source.termsOfUse` to `rights.termsUrl`. A package built before the
`rights` block existed carries no holder, so the footer renders exactly as
it did before: `footer-text` alone.

## Sections (standalone use)

All sections are also exported individually.

| Component | Props | Slot behavior |
|---|---|---|
| `AppHeader` | `home`, `brand`, `eyebrow`, `title`, `titleHref`, `subtitle`, `logos: [{ image, alt, href? }]`, `logosTitle`, `links`, `search: { placeholder, submitLabel, submitText? }`, `languages`, `language`, `languageStyle: 'select' \| 'buttons' \| ''`; emits `search(term)`, `update:language` | Default slot replaces the whole header; `brand` slot is the mark |
| `AppBanner` | `variant: '' \| 'strip' \| 'split' \| 'section'`, `image`, `imageAlt`, `text`, `caption` (a string or `{ name, partner, location, country }`), `captionLabel`, `eyebrow`, `title`, `titleHref`, `subtitle`, `headline` (Markdown), `enter: { label, href, ariaLabel? }`, `strapline` | Slot replaces the banner |
| `AppNavigation` | `links`, `languages`, `language`, `languageSwitcher` (Boolean), `notice: { title?, text }`; emits `update:language` | Slot replaces the link list; the menu button, the switcher and the notice stay |
| `AppContent` | — | Default slot only; renders `<main id="mwnf-content">` |
| `AppHyperlinks` | `variant: '' \| 'tiles'`, `title`, `titleHref`, `subtitle`, `links: [{ label, href, description?, external? }]` | Slot replaces the link list |
| `AppSponsors` | `title`, `sponsors: [{ name, href?, logo? }]`, `groups: [{ title, sponsors }]` | Slot replaces the sponsor lists |
| `AppFooter` | `text`, `links` | Slot replaces text and links |

### Banner variants

- `''` — an image with a line of text under it.
- `strip` — a tall image with the site's name over it: `eyebrow` above
  `title`, `enter` rendered after the title as the way in, the `caption` in
  a box that shows on hover. A gallery's home.
- `split` — the image beside a text column: `title`, `subtitle`, `headline`
  (Markdown, rendered through viewer-core's pipeline), `enter`, `strapline`.
  An exhibition's home.
- `section` — a narrow strip with `title` over its lower edge and the
  `caption` at the other end. Every other page. The title is data the
  website derives from the route; the component only renders it.

The image's `alt` is `imageAlt`, else the caption's name (with
`captionLabel` before it), else the title.

### Hyperlinks variants

- `''` — a titled list of links.
- `tiles` — a title block (`title`, `subtitle`, linking to `titleHref`) beside
  one tile per link, each with its `label` and `description`. An exhibition's
  bottom banner.

## Content components

What renders *inside* a page, from props: the pieces every website's landing
page, results pages and record page are made of. Behaviour is viewer-core's
(`useListQuery`, `paginate`, `useFacets`, `useRecordSheet`, `sheetRows`, …);
what a page holds — which cards, which fields, which filters — is the site's;
these render it. They are exported from the package and, on their own,
from `@museumwnf/viewer-layout/content`, which brings none of the shell.

```js
import { RecordList, Pagination } from '@museumwnf/viewer-layout/content'
```

Links take an `href` the website's router produced — the same rule as the
sections. A route location (`to`) is honoured too, through the `RouterLink`
the application registered, without any router coupling here.

| Component | Props | Notes |
|---|---|---|
| `SectionCards` | `cards: [{ title, description, action, image?, alt?, number?, children?, href \| to }]`, `variant: 'cards' \| 'rows' \| 'covers' \| 'accordion'` | a landing page's grid of section cards, themed by variant; `title`/`description` are Markdown, rendered inline (no block elements); `number` is formatted by the caller (Roman or decimal); `children` (accordion only) are subsections with their own `to`/`href` |
| `FeaturedRecord` | `heading`, `image`, `imageAlt`, `eyebrow`, `name` (inline HTML), `meta: [string]`, `action`, `href \| to` | the "item on display" spotlight; the default slot replaces the record |
| `RecordList` | `records`, `loading`, `loadingText` | records as rows; `#empty` slot |
| `RecordGrid` | `records`, `loading`, `loadingText`, `actionLabel`, `dateCutoff` (80) | records as tiles with a hover card, shown under the image on a narrow screen; `#empty` slot |
| `Pagination` | `pageInfo` (viewer-core's `paginate()` result), `window` (5), `jump`, `ends`; emits `navigate(page)` | first / previous / a window of pages / next / last, the position beside the texts |
| `FacetSelect` | `label`, `options: [{ value, label }]`, `modelValue`, `placeholder`, `anyLabel`, `disabled`, `hideEmpty`; emits `update:modelValue` | one labelled select for one facet |
| `FilterPanel` | `title`, `mode: 'apply' \| 'immediate'`, `applyLabel`, `resetLabel`, `disabled`; emits `apply`, `reset` | the box the controls (default slot) sit in; `apply` has both buttons, `immediate` only Reset |
| `ResultsSummary` | `parts: [{ label, count?, value? }]` | each count beside its label, never inside a text; `#actions` slot |
| `RecordLanguages` | `languages`, `language`; emits `select(code)` | the languages one record carries, as pressed buttons |
| `RecordSheet` | `rows` (viewer-core's `sheetRows()`), `layout: 'table' \| 'list'`, `dir`, `shortDescription: { html }`, `shortDescriptionAfter`, `shortDescriptionOpen` | a row rendered `custom` or `link` is handed to a slot named after its key |
| `SheetSection` | `heading`, `html`, `dir` | a headed block under the sheet |
| `RecordCredits` | `credits: [{ label, value }]`, `workingNumber`, `workingNumberLabel`, `citation`, `heading`, `citationHeading` | who made the sheet, the working number, the citation |
| `SourceCredit` | `route` (a resolved route, or a raw location; defaults to the current route via `useRoute()`), `labelEntry` ('record.source.label') | the "Source: `<address>`" line — `viewer-core`'s `sourceUrl(route)`; renders nothing until the website declares `site.origin` |
| `RelatedRecords` | `heading`, `records`, `variant: 'list' \| 'grid'`, `actionLabel` | the same two presentations as a results page; outside references go in the default slot |
| `MediaGallery` | `images: [{ url, alt, caption, photographer, copyright }]`, `start`, `variant: '' \| 'row'` | the current image, thumbnails, caption, a lightbox (Escape closes, arrows move, focus returns); `row` renders every image in a row |
| `GlossaryPopover` | `term: { word, spelling, definition }`, `html`, `dir`; emits `close` | the definition of a clicked term, fixed in a corner; Escape closes, focus returns |
| `PartnerMap` | `latitude`, `longitude`, `zoom` (15), `mapTitleEntry` ('partner.map.map'), `mapOfEntry` ('partner.map.mapOf'), `openMapLinkEntry` ('partner.map.openInOpenStreetMap'), `label` | an OpenStreetMap embed centred on coordinates with a zoom level; builds a bounding box for OSM's embed and a full-map link; uses keyless public tiles |
| `PartnerPanel` | `partner` (viewer-core's `partnerView()`), `variant: 'line' \| 'summary' \| 'full'`, `layout: 'tabs' \| 'sections'` (`full`), `show: { part: false }` (`logo`, `location`, `count`, `pictures`, `description`, `contact`, `persons`, `logos`, `homepage`, `map`; `actions: true` turns on the line's links, `logo: true` the summary's logo), `heading` (level of the name; 0 = none), `label` (summary: the entry before the name), `objectsLabel` ('partner.item.objectsInSite'), `emptyLabel`, `homepageLabel` ('partner.nav.homepage'), `readMoreLabel` ('partner.action.readMore'), `viewObjectsLabel` ('partner.action.viewObjects'), `dir` | one partner, wherever it appears (decisions D2/D3). `line`: a list's row — logo, the name as a link with its city, the object count or `emptyLabel`, the actions. `summary`: the line under an item's holder text — `label`, the name as a link, "city, country"; with `heading`, the name heads the page over its location. `full`: the partner page — the name and location, a band with the About · Contact · Logo tabs (accessible, arrow keys move along), the ↗ homepage link and the `actions` slot, the pictures beside the open panel, the map below; `sections` shows About, Contact and Logo one after another under their titles. The contact reads in legacy order: address, phone, fax, email, website and links, then the contact persons. Slots `badge`, `meta`, `actions`, `after`, each given `{ partner }`; tokens `--mwnf-partner-*` |
| `FeaturedPartners` | `records: [{ id, name, logo, city, country, description, route }]`, or `partners` (view-models from viewer-core's `partnerView()`: the first picture or logo, "city, country", the description as plain text cut at `descriptionLength`, 420), `headingEntry` ('partner.featured') | a carousel of partners with bullet controls, rotated on an 8-second timer; the site provides filtered/shuffled records and routes |
| `SiblingGalleries` | `galleries: [{ id, name, image?, route }]`, `museums: [{ name, to \| href, accent?, textColor? }]`, `galleriesHeadingEntry`, `seeMoreGalleriesEntry`, `seeMoreGalleriesHref`, `museumsHeadingEntry` | two blocks of links: sibling galleries (may be unresolved, rendering as non-clickable tiles) and MWNF virtual museums (text initials over a coloured background) |
| `PopupLogo` | `content` (Markdown or raw HTML), `rawHtml` (false), `enabled` (true), `closeLabel` ('core.action.close') | a dismissible fixed modal for sponsor notices; renders content through `renderInline` by default (escaping, Markdown); when `rawHtml: true`, passes content as-is (for trusted HTML from the importer) |
| `BackLink` | `label` ('core.action.back'), `to \| href` (the fallback), `variant: 'button' \| 'bar'`, `arrow` ('←', the bar's leading mark) | a "back" link: `router.back()` when the previous page is one of this website's own (vue-router's `history.state.back`), the fallback otherwise, so a visitor who arrived from another site stays on this one; with no fallback, back through whatever history the tab has. The default is a button (`.mwnf-back-link`); `bar` is a link carrying `.mwnf-back-bar`, addressed to the fallback so it also opens in a new tab, whose default slot replaces the label |
| `GlossaryTool` | `language`, `entity` ('glossary'), `labels` (entry-name overrides), `dir` | the search box four item sheets and a theme page each wrote for themselves: an input, the hits viewer-core's `searchGlossary` finds, the chosen definition as Markdown; a native `<details>` toggle |
| `DynastyPopout` | `dynasty` (record: `from_ah`/`to_ah`/`from_ad`/`to_ad`), `text` (its translation: `name`, `also_known_as`, `area`, `history`), `dir` | one dynasty, collapsed behind a native `<details>` toggle: name, also known as, area, AH/AD dates, history as Markdown |
| `DynastyList` | `heading`, `dynasties`, `tr` (dynasty → its translation), `dir` | one `DynastyPopout` per dynasty of a record, `RelatedRecords`'s shape |
| `TimelineEventList` | `events: [{ id, date, caption?, description? (block HTML), media?: [{ image, alt?, to? \| href?, caption? }], actions?: [{ label, to? \| href? }] }]` | one row per event; `caption`/`description` are rendered output, the same convention `RecordList`'s `name` follows; `#date`, `#caption`, `#media`, `#actions` slots (each given `{ event }`), `#empty` slot |
| `PictureGallery` | `pictures: [{ id, image, imageAlt?, name (inline HTML), imageCaption?, detail?, fields?: [{ label, value }], to (route \| null), backRelated?: [{ picture, reciprocalText }] }]`, `selectedId` (v-model), `seeItemEntry`/`unresolvedEntry`/`emptyEntry`/`addRelatedEntry`/`hideRelatedEntry` (entry names) | a DXA exhibition theme page's curated-picture side panel + thumbnail strip: the selected picture large, its fields, a link to the parent record (or the "not in this exhibition" message when `to` is `null`); a picture that is the target of some other picture's related link (`backRelated`) starts hidden behind an "Add related works" toggle |
| `PictureNarrative` | `picture` (the selected picture, `PictureGallery`'s shape plus `related: [{ picture, text }]` and `backRelated: [{ picture, reciprocalText }]`), `contextualDescription` (Markdown), `relatedHeadingEntry`/`reciprocalFallbackEntry` (entry names); emits `select(id)` | the same page's narrative body, below `EssayView`'s own prose: the selected picture's own curated text, then the pictures it relates to (forward) and, when one points at it, the one it is related to (backward) — either direction may cross a theme boundary, which is why the website resolves the target/source picture rather than this component |
| `TimelineLookup` | `info: { trigger? (entry, default `record.related.timelineForItem`), heading (entry), countries: [{ value, label }], defaultCountry?() => value, events(value) => [{ id?, year_from, text: { description } }], range: [from, to], era?(year) => string, searchTo(value, range) => to }` | the timeline popout `ItemDetailView`'s related block opens onto (see below): a trigger line, a country select, the events for the chosen country within the record's own date range (rendered through `md()`), and a "begin a full search" link — the DXA gallery/exhibition pair's shared shape, parameterized by the site's own timeline composable |
| `SpecialFeatures` | `features` (the record's `details`: `{ id, internal_name, display_order, images, artist_names }`), `tr` (feature → its translation: `name`, `location`, `dates`, `description`), `language` (the pictures' captions), `glossary` (`RecordView`'s), `heading` ('sheet.field.specialFeatures'), `dir` | a monument's sub-details, as the data package embeds them on it: each one's name, location, dates and artists, its description as Markdown with the record's glossary terms, its pictures in a row; `DynastyList`'s shape |
| `RelatedMedia` | `media` (the record's `media`: `{ title, description, url, language }`), `language` (the entries in it when there are any, all otherwise), `descriptions` (true), `heading` ('record.related.audioVideo'), `dir` | a record's audio and video, each a ↗ link opening elsewhere, its description under it |
| `OnDisplayIn` | `groups: [{ heading? (entry), links: [{ id?, label (inline HTML), to? \| href?, external? }] }]`, `heading` ('record.related.onDisplayIn'; '' renders the groups alone), `pendingLabel` (entry, after a name with no address), `dir` | the exhibitions, chapters and galleries that show a record: a route links inside the site, an `external` address opens elsewhere marked ↗, a name with neither is plain text |
The record contract `RecordList`, `RecordGrid` and `RelatedRecords` share:
`{ id, image?, imageAlt?, name (inline HTML), meta: [string], badge?, href? | to? }`.
`PictureGallery` and `PictureNarrative` share a narrower one — a curated
picture is not a catalogue record (several can share one parent, or none) —
documented above and in [`docs/theme-components.md`](docs/theme-components.md).

The texts they read — `core.action.apply`, `.reset`, `.close`,
`core.pagination.*`, `catalogue.pagination.*`, `record.action.*ShortDescription`,
`record.citation.heading`, `record.glossary.heading`, `.close`,
`record.media.photograph`, `record.sheet.credits`, `.languages` — are in
every bundle of `@museumwnf/viewer-i18n` from 1.7.0. `GlossaryTool` also reads
`record.glossary.instructions`, `.definition` (1.7.0) and `record.glossary.tool`
(2.3.0); `PartnerPanel` reads `partner.info.about`, `.contact`, `.logo`,
`.addresses`, `.phone`, `.fax`, `partner.nav.homepage`,
`partner.item.objectsInSite` and `partner.action.readMore`, `.viewObjects` (4.2.0); `SpecialFeatures`, `RelatedMedia` and `OnDisplayIn` default to `sheet.field.specialFeatures`, `record.related.audioVideo` and `record.related.onDisplayIn`; `DynastyPopout` reads `record.dynasty.heading` (2.3.0) and
`sheet.field.alsoKnownAs`, `.area`, `.history`. `SourceCredit` reads
`record.source.label` (2.5.0); the footer attribution (`SiteShell`) reads
`record.source.rightsHolder` and `.termsOfUse` (2.5.0). `PictureGallery`/
`PictureNarrative` default to `exhibition.theme.seeItemEntry`, `.recordNotInSite`,
`.additionalContent`, `.addRelatedWorks`, `.hideRelatedWorks` and
`exhibition.related.items`, `.reciprocal`, which only the `exhibition` and
`standalone` bundles of `@museumwnf/viewer-i18n` carry — a family default
in the family's entry now, where the two live since 2.18.0 (see
[Entry points and layers](#entry-points-and-layers)). Every other text is a
prop.

`FeaturedPartners`, `SiblingGalleries`, `PopupLogo`, `PictureGallery` and
`PictureNarrative` are used only by the DXA family, and live under `/dxa`
(since 2.18.0; their exports here went in 3.0.0). `FeaturedPartners`' heading defaults to `partner.list.featured`
(viewer-i18n 4.3.0).

## Content classes

Building blocks copied from the legacy sites' own `site.css` files, available as utility classes for websites to assemble search entrances, list pages and custom layouts:

| Class | Purpose |
|---|---|
| `.mwnf-panel` | White content box; a container for grouped content with border and padding |
| `.mwnf-heading` | Section heading with underline; variants `.mwnf-heading--page` (large page title, no underline) and `.mwnf-heading--label` (large label) |
| `.mwnf-form-table` | Table layout for label/value pairs in search and filter forms; header cells left-aligned, data cells right-padded |
| `.mwnf-button` | Styled button for primary actions; variant `.mwnf-button--secondary` for secondary/destructive actions |
| `.mwnf-select` | Legacy-styled select element with fixed height and padding |
| `.mwnf-back-bar` | Container for back-link buttons with standard padding and hover styling; `.mwnf-back-bar--link` is `BackLink`'s `bar` variant, the link itself as the bar (`--mwnf-back-bar-margin`) |
| `.mwnf-chip` | Inline project/source chip; variants `.mwnf-chip--<family>` where family is one of `ISLandEPM`, `DBA`, `AWE`, `DCA`, `DGA`, `EXH`, `Galleries`, or `Explore` (a record with no project), each with its own project-colour token |
| `.mwnf-popout` | Detail box for sheet data; used in record detail popups and panels |
| `.mwnf-loader` | Loading/spinner message container with centered text and standard padding |
| `.mwnf-link` | Link text colour for DXA sites; not a interactive element wrapper, a colour utility |

## Composed views

Whole pages, made of the content components on viewer-core's
composables and driven by a declaration the website writes instead of a
page. They are the broad page structures every kind of website shares;
`ItemDetailView`, the item page's view (`RecordSheetView` before 2.18.0), is used
only by the DXA family and exported from `/dxa` alone; its row stays in the
table below.
They are exported from `@museumwnf/viewer-layout/views` — and only from
there: they read the records and the engine from `@museumwnf/viewer-core`
itself, whose entry point carries `.vue` files, and a website's test runner
that loads this package natively would fail on the first one if the package
root imported them. A website that names the composed views imports the
`/views` entry point and lists `@museumwnf/viewer-layout` next to
`@museumwnf/viewer-core` in its Vitest `server.deps.inline` (the template
does both). A website names them in viewer-core's `config.views` — the
`home`, `list` and `detail` slots of the router — or on its own routes, with
the spec as route props. A website whose page is not this shape writes its
own component on the same content components: the escape hatch stays open.
They live here rather than in viewer-core because they are made of this
package's components, and viewer-core does not depend on the layout.

Every text in a declaration is an **entry name, written out**, resolved by
the view through `t`; a number is placed beside its text by the view, never
inside it.

```js
import {
  CatalogueResultsView, EssayView, HomeView, PartnerListView, RecordView, LinkListView, SearchFormView, TextPageView, TimelineResultsView,
} from '@museumwnf/viewer-layout/views'

export default {
  views: { home: HomeView },
  home: {
    title: 'mysite.home.title',
    intro: 'mysite.home.intro',
    cards: [{ title: 'mysite.nav.catalogue', description: 'mysite.home.catalogueText', action: 'core.action.browse', to: { name: 'catalogue' } }],
    featured: { entity: 'items', heading: 'mysite.home.itemOnDisplay', action: 'core.action.viewDetails', route: 'item', eyebrow: 'type', meta: ['location', 'dates'] },
  },
  extraViews: [
    { path: '/catalogue', name: 'catalogue', component: CatalogueResultsView, props: { spec: catalogue }, meta: { section: 'catalogue', entities: ['items', 'countries'] } },
    { path: '/item/:id', name: 'item', component: RecordView, props: (route) => ({ spec: sheet, id: route.params.id }), meta: { section: 'catalogue', entities: ['items', 'countries'] } },
  ],
}
```

| View | Declaration | Slots |
|---|---|---|
| `HomeView` | `config.home` or the same as props: `title`, `intro` (Markdown), `cards: [{ title, description, action, to \| href }]`, `featured: { entity, heading, action, route, eyebrow, meta, seed, filter }` — the pick is `useFeaturedRecord`, among the records `filter` keeps (viewer-core 2.2.0) — `panels` (the welcome and the record as `.mwnf-panel` boxes) | `before`, default, `after` |
| `CatalogueResultsView` | `spec`: `entity`, `keys`, `facets` (viewer-core's facet spec), `facetScope: 'all' \| 'matching'`, `controls: [{ key, type: 'select' \| 'year' \| 'query' \| 'checkbox', label, placeholder, anyLabel, hideEmpty }]`, `filterMode: 'apply' \| 'immediate'`, `scope(record, filters)`, `match(record, filters)`, `narrow(list, filters, helpers)` (a rule over the whole list — a keyword index, say), `dates: { mode, begin, end }`, `sort`, `pageSize`, `variant: 'list' \| 'grid'`, `record(record, helpers)`, `recordRoute`, `summary(context)`, `title`, `filterTitle`, `empty`, `actionLabel`, `pagination` | `before`, `filters`, `actions`, `aside`, `empty`, `after` — each given `{ filters, active, apply, reset, goToPage, matching, pageInfo, options }`, enough to compose the panel in the aside or a second pagination |
| `RecordView` | `spec` and `id`: `entity`, `translations`, `attribution`, `fields` (viewer-core's `sheetRows` spec, or a function of the context), `sections`, `layout`, `shortDescription`, `media(record, ctx)`, `mediaVariant`, `credits`, `workingNumber`, `citation: { project, permalink: true \| false \| string, heading } \| false` (the permalink is `sourceUrl(currentRoute)` — null, so no address, until the website declares `site.origin` — unless the spec disables it with `false` or overrides it with a string), `related: { variant, heading, record, route } \| false`, `back: { label, to \| href }`, `title(ctx)` | `header`, `before-sheet`, `after-sheet`, `aside`, `source` (under the citation; default `SourceCredit`), `related`, `after`, and one named after every `custom` or `link` row — each given `{ record, text, language, languages, select, dir, glossary, ready, attribution, t, tr }`; `related` also `records` (the rows) and `outside` (the related records the package does not carry) |
| `ItemDetailView` (`/dxa`) | Every `RecordView` prop (`spec`, `id`, `entity`) plus `dataGetter(id) => record \| null \| undefined` — a website's own language-subset record lookup (an exhibition's per-build `itemById.get`); omitted, every `id` `RecordView` itself finds is treated as present (the gallery shape); supplied and it reports `id` missing, `NotFoundView` renders before `RecordView` ever mounts (the exhibition shape's per-language-build 404), and it also narrows the related block's `records`/outside-reference split the same way. The DXA gallery/exhibition item sheet's own blocks, on top of `spec`: `sourceDatabase: { label?, chipClass(record, ctx), addToCollection: { label? } \| false } \| false` (the source-database line + `backward_compatibility` code + "add to my collection" link — `chipClass` is a site's own project→colour map, the name comes from `useProjects()`), `notice: { show(record, ctx), label } \| false` (the Explore-partner notice), `museum: { route(partnerId, ctx) } \| false` (the holding-museum row: the item's holder text, then the partner as `PartnerPanel`'s `summary` — "About {name}, {city}, {country}" — linked through `route`; `route` returning null keeps the name without a link, for a hidden partner; `false` keeps the holder text alone; decision D3), and on `spec.related`: `title`, `description` (entries, above the block), `notInPackageLabel`, `outsideChip(ref, ctx)` (an outside reference's chip — `TODO(#1727)`, no `project_id` on a stub yet), `artisticIntroductionLabel` (with `useProjects().links(record.project_id).artisticIntroductionUrl`), `databaseLabel` (ditto, `.relatedDatabaseUrl`), `overallDatabase: { label, linkLabel } \| false` (`mwnfLinks.overallDatabase`), `onDisplayIn: { linkPendingLabel } \| false` (`record.gallery_references`, by `kind`), `download: false` (default on, `record.action.download`/`.downloadPdf`, prints), `glossary: false` (default on, `GlossaryTool`), `dynasties(record, language, ctx) => { records, tr } \| null` (`DynastyList`), `media: false` (default on, `record.media`, a `SheetSection`), `timeline(record, ctx) => TimelineInfo \| null` (`TimelineLookup` — see `docs/slot-catalogue.md`) | Every `RecordView` slot, forwarded straight through by name, unmodified, **except** `before-sheet`/`museum`/`related`: each always has this view's own default content (above), which a website's own slot still replaces entirely — "a slot fills, the default content renders otherwise" |
| `EssayView` | `spec` and `id`: `tree` (a `useCollectionTree` result, or `{ purpose \| rootId, childType?, entity?, order? }` / `{ themes: true \| 'themes', childType? }` for the view to build one), `entity` (the tree's items — also the tree's own translations entity when `tree` carries none of its own, a pre-built tree or a declarative form with no `entity`/`themes`; falls back to `'collections'`), `route` (a node's own page: a route name or `(node, ctx) => to \| href`), `heading(ctx)`, `placeholder` (a regex a synthesized title matches, falling back to the English title, then the internal name), `quote` / `body` (a field of the node's translation, a dotted path into it such as `'extra.intro_text'`, or a function `(ctx) => Markdown`; default `'quote'`/`'description'`, `false` to drop), `glossary`, `items: { of(node) => ids, caption(item, node, ctx) => override, meta(item, ctx) => [string] (the grid's caption lines), badge(item, ctx) => string, route }`, `panel: { variants(item, ctx) => [{ id, image, alt, caption: { title, justification, fields: [{ label (entry name), value }] } }], fields(item, node, ctx) => [{ label, value }] (the fallback when a variant carries no fields of its own) } \| false`, `navigation: 'tree' \| 'siblings' \| false` (`tree` crosses a branch boundary, `siblings` stays inside the parent), `breadcrumb`, `tabs: true \| 'siblings' \| 'children'` (the strip: `true`/`'siblings'` — the node's own siblings, the default; `'children'` — the node's own children, e.g. a theme's chapters), `about(node) => boolean \| { panel?, navigation? }` (essay only; a plain boolean drops both the picture panel and the navigation, an object keeps the named piece instead), `aboutKeeps: ['panel' \| 'navigation']` (the spec-wide equivalent, when every about page in this spec keeps the same piece), `numbering: 'roman' \| 'decimal' \| false` (counts a node among its true siblings — for a themes-package tree, whose `root` is `null`, that's every node whose own `tree.parents(id)` is also empty, so a themes tree numbers its top-level themes I, II, III); `previous`, `next`, `backTo`, `inThisTheme`, `seeAll` (entry names, defaulting to `exhibition.theme.previous`/`.next`/`.inThisTheme`/`.seeAllInTheme` and `record.action.backToResults`) | `header`, `before-body`, `after-body`, `panel`, `thumbnails`, `aside`, `justifications`, `navigation`, `after` (default `SourceCredit` — nothing until the website declares `site.origin`) — each given `{ node, text, language, tree, items, selected, select, selectedVariant, selectVariant, breadcrumb, previous, next, t, tr }` |
| `LinkListView` | `spec`: `title` (entry), `groups: [{ heading (entry), links: [{ label, href \| to, note? }] }] \| (ctx) => groups` (`label`/`note` are Markdown, rendered inline through `mdInline`), `back: { label, to \| href } \| false`, `empty` (entry) | `before`, `group` (given `{ group }`; the default renders the heading and its links — replace it for a citation list that is not link-shaped), `after` |
| `PartnerListView` | `spec`: `entity` (default `'partners'`), `scope(partner, ctx)` (a site's own axis — museum/institution, a curated project — filtered before grouping), `group: { tier: 'level' \| false, order: 'country' \| 'name' }` (over viewer-core's `groupByCountry`; `'name'`: one flat, alphabetical group, no country carries this today), `orderToggle` (an A-Z/Z-A control, mirrored in the query as `order`; every tier is always sorted by name, the toggle reverses the country order or the one flat list), `nested` (an associated partner rendered under its own parent through `partnerHierarchy`, instead of the flat tier column; one whose parent is missing or in another group stays flat), `label(countryId, ctx)` (a group's own country label, required when `group.order` is `'country'`), `record(partner, ctx) => { name, city, logo, count, route }` (the row, when a site builds it itself), `route` (a route name or `(partner, ctx) => to \| href`, read by the default row only), `objectsRoute(partner, ctx)` (the line's View objects link), `actions: true` (the line's Read more · View objects links), `emptyLabel` (the line for a partner holding nothing), `variant: 'accordion' \| 'open'`, `count` (the "Partners found: N" line), `associatedLabel`/`foundLabel`/`objectsLabel`/`sortAscendingLabel`/`sortDescendingLabel`/`empty`/`title` (entry names, overriding the shared `partner.*` defaults) | `before`, `group-heading` (given `{ group }`; the default renders `group.label`), `row` (given `{ group, partner, row, view }`, once per partner — main, associated and, when nested, a child row too; the default is `PartnerPanel`'s `line` over `view`, viewer-core's `partnerView()`), `after` — every slot also given `{ t, locale, groups, orderDir, toggleOrder }` |
| `TextPageView` | `spec`: `heading?` (entry), `body` (entry \| (ctx) => Markdown, `ctx` the same `{ t, tr, language }` shape `EssayView`'s spec functions read), `back: { label, to \| href } \| true \| false` | none |
| `SearchFormView` | `spec`: `mode: 'rows' \| 'facets' \| 'radio'`, `entity` (records an entity-backed facet or `dates: 'buckets'` read), `rows` (`'rows'`: keyword-row count, default 3), `fields: [{ key, label }]` (`'rows'`: the field select), `operators: [{ key, label }]` (`'rows'`: the AND/OR select, default AND/OR), `dates: { presets } \| 'buckets' \| false` (a from/to year select — `centuryPresets`'s asymmetric boundaries, or one `yearBuckets` list used for both ends), `language: entity \| false` (the search-language select, over `useSearchLanguage`), `extras: [{ key, type: 'checkbox', label }]`, `facets: [{ key, label, type: 'select' \| 'year', options: [{ value, label }] }]` (`'facets'`/`'radio'`: options given directly, or derived from `entity`'s own records when left out; `type: 'year'` is a plain number input), `target` (the results route this form writes into), `submitLabel`, `showAllLabel`, `howTo: routeName \| false` (a link to the search-syntax essay) | `intro`, `before`, `extras`, `actions` — each given `{ mode, submit, showAll }` |
| `TimelineResultsView` | `spec`: `scope: 'country' \| 'local' \| 'collection'` (viewer-core's `useTimelineEvents` axis), `countryLabel(id)`, `countryIdForCode(code)` (DXA's legacy 2-letter code), `collections(ctx) => [{ value, label }]` (Sharing History's exhibition/PC picker — `'pc'` is the Permanent Collection sentinel), `tr(id)` (an event's translation, the site's own), `timelinesEntity`/`eventsEntity` (data package file names), `keys` (default: every control's key), `controls: [{ key: 'country' \| 'collection' \| 'begin' \| 'end', label, placeholder, anyLabel, hideEmpty, options? }]` (`options` on `'begin'`/`'end'`: an array `[{ value, label }]` or function `(ctx) => [...]` for bucketed year selects; without `options`, a free-year number input), `pageSize`, `entrance: false \| true` (renders the form alone, with validation, navigating to `route` on submit), `route` (the entrance's own target route), `event(event, ctx) => { date, caption, description, media, actions }` (the row, see `TimelineEventList`), `gallery: { route, items(ctx) => count \| array \| boolean, label } \| false` (the "See gallery" cross-link — an item's own shape stays the site's), `summary(ctx)`, `errorSelect`, `errorPeriod` (the entrance's own validation entries), `title`, `filterTitle`, `applyLabel`, `resetLabel`, `submitLabel`, `empty`, `pagination` | `summary`, `cross-link`, `event` (replaces the whole events list), `before`, `after` — each given `{ filters, active, apply, reset, goToPage, events, pageInfo, countries, collections, gallery, t, tr }` |

The tokens they read — `--mwnf-view-*` — arrange the parts; a website themes
a composed page by theming the parts.

### `PartnerListView` and the two site families

`PartnerListView` is the shape behind islamicart's and sharinghistory's
`PartnersResults.vue` and the DXA family's `Partners.vue`:

| Page | What it declares |
| --- | --- |
| islamicart / sharinghistory `PartnersResults` | `group: { tier: 'level', order: 'country' }` for the main/associated accordion, `variant: 'accordion'` (the default), `count: true` for the "Partners found: N" line; islamicart's own museum/institution and ISL/EPM axes are `scope`, read from its own route |
| DXA `Partners` | `group: { tier: false, order: 'country' }` (no tiers at all), `variant: 'open'`, `orderToggle: true` for the A-Z/Z-A button; a partner with `item_count: 0` still gets a row (only the "View objects" link is a site's own `#row` concern) |

### `EssayView` and the seven site pages

`EssayView` is the shape behind islamicart's `ExhibitionTheme.vue` and
`ArtIntroTheme.vue`, baroqueart's `ExhibitionTheme.vue`, sharinghistory's
`ExhibitionTheme.vue`, `ExhibitionChapter.vue` and
`HistoricalBackgroundCountry.vue`, and the DXA family's `Theme.vue` (over
`themes.json`). No page is special-cased; each reaches the shape through the
spec and the slots, not a branch in the view:

| Page | What it declares |
| --- | --- |
| islamicart / baroqueart `ExhibitionTheme` | `navigation: 'siblings'` (legacy's Previous/Next-page row, not tabs), `panel.variants` for the "detail" close-up selector — each variant's image, title, justification and fields swap together, not just the picture — `items.caption` for the caption override merged with the item's own translation |
| islamicart `ArtIntroTheme` | the same, plus `tabs: true` (a fixed Monuments/Objects-style tab strip, specific to this theme) |
| sharinghistory `ExhibitionTheme` | `tabs: 'children'` over its chapters (a vertical list, themed through the tab tokens rather than a horizontal strip), no `panel.variants`, `breadcrumb: true` |
| sharinghistory `ExhibitionChapter` | `navigation: 'siblings'` over the theme's chapters, `breadcrumb: true` (exhibition › theme), the `justifications` slot for the curator/partner pair the default panel does not carry, `after-body` for the see-also and further-reading blocks |
| sharinghistory `HistoricalBackgroundCountry` | `items` with no `panel` (a plain `RecordGrid` of illustrating items, not a selector), `navigation: 'siblings'` over its pages; the bibliography and the maps are `after-body`/`after`, outside this view's declaration |
| DXA `Theme` (`themes.json`) | `tree: { themes: true }`, `numbering: 'roman'`, `about(node)` for theme zero, `navigation: 'tree'` for the tour's Previous/Next (which crosses from a theme's last sub-theme into the next theme); the related-works toggle and the picture→parent indirection are specific to this family and stay in the `thumbnails` slot and `items.of`/`items.caption`, not in the view itself |

### `SearchFormView` and legacy's three entrance shapes

| Page | Mode | What it declares |
| --- | --- | --- |
| islamicart / sharinghistory / baroqueart `Database` | `rows` | three keyword rows over `fields`/`operators`, `dates: { presets: centuryPresets }` for the from/to century selects, `language: 'items'` for the search-language select, an `extras` checkbox for islamicart's "include EPM" |
| carpets / water-in-islam / the-use-of-colours-in-art / amulets `CollectionSearch` | `facets` | one `facets` entry a category, `dates: 'buckets'` for the shared start/end year list (`yearBuckets` over `entity`'s own records, as legacy's client-side bucket algorithm built it) |
| islamicart / sharinghistory `PcEntrance` | `radio` | `facets` again, but chosen one at a time — country, dynasty (or sharinghistory's theme, its own `options`), holding institution, and `begin`/`end` as `type: 'year'` rows; islamicart's "include EPM" is again an `extras` checkbox |

### `TimelineResultsView` and the seven site pages

Two instances of the one view per site — `entrance: true` for the form-only
page, `entrance: false` (default) for the results — over `scope: 'country'`
except where noted:

| Page | What it declares |
| --- | --- |
| DXA `Timeline`/`TimelineResults` | `controls: [{ key: 'country' }, { key: 'begin' }, { key: 'end' }]`; the results instance adds `gallery: { route: 'timeline-gallery', items: (ctx) => site's own country/period join }` for the "See Gallery" box; water-in-islam's suppressed country column and `hasTimeline`/`usesLocalTimeline` gate are a `controls` without `'country'` and the site's own guard before the route renders this view at all |
| islamicart/baroqueart `TimelineEntrance`/`TimelineResults` | the same controls, `event: (event, ctx) => ({ ..., actions: [{ label: 'timeline.action.viewItemsFromPeriod', to: itemsLink(event) }] })` for the per-event "View items from this period" link |
| sharinghistory `TimelineResults` (no separate entrance page in legacy; `entrance: true` on the same spec shape covers it) | `scope: 'collection'`, `controls` adding `{ key: 'collection', label: 'sharinghistory.nav.timeline' }` fed by `collections: (ctx) => [{ value: 'pc', label: t('sharinghistory.nav.permanentCollection') }, ...exhibitions]`, `event(...)` composing the "Country \| Theme" `caption` and the image/item strip as `media` |

## DXA family pages

`@museumwnf/viewer-layout/dxa` is the DXA family layer: the only place
where whole pages are shared. The galleries are one site with different
data, and so are the exhibitions — the legacy served each family from one
application — so a page that is the same on every site of a family lives
here once, beside the data composables of `@museumwnf/viewer-core/dxa`.

What may go here: a page, a component or a style that only the gallery or
the exhibition family uses, and that is the same on every site of that
family. A difference between two sites of a family is a config value or a
token, not a second copy of the page. Nothing outside `/dxa` imports from
it, and a website can still replace any family page with its own component
on the same route name. Texts stay in `@museumwnf/viewer-i18n`'s `gallery`
and `exhibition` sections.

Since 2.18.0 it holds a whole DXA site but its values. A gallery's or an
exhibition's `dataset.config.js` is one call:

```js
import { galleryConfig } from '@museumwnf/viewer-layout/dxa'

export default galleryConfig({
  datasetPackage: '@museumwnf/carpets-data',
  siteName: 'Carpets',                                   // for a package without manifest.site
  origin: 'https://museumwithnofrontiers.github.io/carpets',
  projectColors: { '<project id>': 'mwnf-chip--DCA' },  // one of the mwnf-chip--* classes
  noticeProjects: ['<project id>'],                      // sheets with the Explore-partner notice
  creditsBody: 'carpets.credits.body',
})
```

`exhibitionConfig` takes the same values (and `partnerObjects`, overrides of
the shared `exhibition.partnerObjects.*` entries). The config carries the
family's shell (`GalleryShell` / `ExhibitionShell`), menu, banner, sponsor
strip, legacy redirects, and every page through
`standardRoutes(family, { pages: true, … })`:

- the eleven pages every site of a family already served from here
  (search, partners, partner and institution pages, timeline results and
  gallery, collection search and results, and a gallery's about and
  credits);
- with `pages: true`, the pages each site used to carry itself: the home
  page, the item page (`GalleryItemDetail` / `ExhibitionItemDetail`, on
  `ItemDetailView` and viewer-core's `useGalleryItemDetail` /
  `useExhibitionItemDetail`), the timeline entrance, and an exhibition's
  about page, themes, theme pages, theme galleries, related content and
  credits.

One page serves both families: `PartnerDetail`, the partner page
(`PartnerPanel`'s `full` variant), fed by each family's own half —
`galleryPartnerDetail` / `exhibitionPartnerDetail`, which `standardRoutes`
passes as its `family` prop.

An exhibition's theme pages read its three theme colours as
`--mwnf-dxa-theme-*` tokens; a record with no project gets the
`mwnf-chip--Explore` chip.

Route names and paths are pinned to what every live DXA site already
registers, so adopting the factory keeps every existing deep link (and
every `legacyRoutes` resolver targeting those names) working unmodified.
Full page-by-page prop/slot/entry table in
[`docs/slot-catalogue.md`](docs/slot-catalogue.md#dxa-family-pages-museumwnfviewer-layoutdxa).

## Theming

Every color, font, spacing, radius comes from a `--mwnf-*` CSS custom property with a neutral fallback. Full list: [`tokens.reference.css`](src/tokens.reference.css) (also exported as `@museumwnf/viewer-layout/tokens.reference.css`) — copy it into your website as `theme/tokens.css` and set values.

Below `48rem` the navigation folds its links behind a menu button, the
`split` banner stacks its two columns, and the banner captions are hidden.

## Licence

This package is Content of the MWNF Website under the [MWNF legal
notice](https://www.museumwnf.org/about/legal-notice), which governs its use
(non-commercial, personal, educational and scientific use is permitted, with
attribution and mandatory reporting — see the notice for the full terms). The
notice text also ships in this package as `LICENSE.md`.

## Release

1. PR to `main` (direct pushes are blocked); CI must be green.
2. Bump `version` in `package.json` + `CHANGELOG.md` entry (strict semver).
3. Create a GitHub release with tag `vX.Y.Z` — CI publishes to npmjs.
