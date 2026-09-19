# Slot catalogue

Every prop and slot of `PageShell`, `SiteShell`, and the ten composed views
exported from `@museumwnf/viewer-layout/views`, extracted from `main`'s
source — plus a one-line purpose for every `/content` component. Read
[`designer-contract.md`](./designer-contract.md) first for who owns what and
when to reach for a slot at all.

A slot's "slot props" column is what it hands to whatever fills it (via
`v-bind` / `v-slot="{ ... }"`), so a site's own content can read the same
data the default content would have used.

## PageShell

`src/PageShell.vue` — seven optional sections, top to bottom; a section
renders nothing unless its own slot or driving props are set.

### Props

| Prop | Type | Purpose |
|---|---|---|
| `headerTitle` | String | The header's title text |
| `headerSubtitle` | String | Text under the header title |
| `headerEyebrow` | String | Small line above the header title |
| `headerTitleHref` | String | Makes the header title a link |
| `headerHome` | String | Href for the header mark/home link |
| `headerBrand` | String | Plain-text brand mark (use `#header-brand` slot for markup) |
| `headerLogos` | Array | `{ image, alt, href? }[]` shown beside the brand |
| `headerLogosTitle` | String | Heading above the header logo group |
| `headerLinks` | Array | `{ label, href, external? }[]` in the header |
| `search` | Object | `{ placeholder, submitLabel }`; emits `search(term)` |
| `languages` | Array | `['en']` or `{ code, label }[]` offered by the switcher |
| `language` | String | The active language code |
| `languagePlacement` | String | `'navigation'` (default) or `'header'` |
| `languageStyle` | String | `'select'` (default) or `'buttons'` |
| `bannerVariant` | String | `''`, `'strip'`, `'split'`, or `'section'` |
| `bannerImage` | String | Banner image URL |
| `bannerImageAlt` | String | Banner image alt text |
| `bannerText` | String | Legacy plain banner text |
| `bannerCaption` | String \| Object | A string, or `{ name, partner, location, country }` |
| `bannerCaptionLabel` | String | Label shown before the caption |
| `bannerEyebrow` | String | Small line above the banner title (`strip` variant) |
| `bannerTitle` | String | The banner's title |
| `bannerTitleHref` | String | Makes the banner title a link |
| `bannerSubtitle` | String | Text under the banner title (`split` variant) |
| `bannerHeadline` | String | Markdown, rendered through the content pipeline (`split`) |
| `bannerEnter` | Object | `{ label, href, ariaLabel? }` — the way in (`strip`) |
| `bannerStrapline` | String | Closing line (`split` variant) |
| `navLinks` | Array | The main navigation's link list |
| `notice` | Object | `{ title?, text }` shown in the navigation bar |
| `hyperlinksVariant` | String | `''` or `'tiles'` |
| `hyperlinksTitle` | String | Hyperlinks section title |
| `hyperlinksTitleHref` | String | Makes the hyperlinks title a link |
| `hyperlinksSubtitle` | String | Text under the hyperlinks title |
| `hyperlinks` | Array | `{ label, href, description?, external? }[]` |
| `sponsorsTitle` | String | Sponsors section title |
| `sponsors` | Array | `{ name, href?, logo? }[]`, flat list |
| `sponsorGroups` | Array | `{ title, sponsors }[]`, grouped |
| `footerText` | String | The footer's own text (e.g. copyright line) |
| `footerLinks` | Array | `{ label, href, external? }[]` in the footer |
| `footerAttributionLabel` | String | Rights-holder attribution label — set by `SiteShell` only, from the loaded package's `manifest.rights` |
| `footerAttributionText` | String | The rights holder's name/attribution text |
| `footerTermsHref` | String | Link to the package's terms-of-use address |
| `footerTermsLabel` | String | Label for the terms-of-use link |

### Slots

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `header` | The whole `AppHeader` section | — |
| `header-brand` | `AppHeader`'s `#brand` (the mark, keeping links/search/logos/language switcher) | — |
| `banner` | The whole `AppBanner` section | — |
| `navigation` | The whole `AppNavigation` section | — |
| *(default)* | `AppContent`'s body — the router view goes here | — |
| `hyperlinks` | The whole `AppHyperlinks` section | — |
| `sponsors` | The whole `AppSponsors` section | — |
| `footer` | The whole `AppFooter` section | — |

## SiteShell

`src/components/SiteShell.vue` (exported from
`@museumwnf/viewer-layout/components`, not the package root, because it reads
`@museumwnf/viewer-core` composables directly) — `PageShell` driven by a
site's `dataset.config.js` instead of a hand-written shell.

### Props

| Prop | Type | Purpose |
|---|---|---|
| `config` | Object | Overrides/extends `useSiteConfig()` — set only the keys needed; mainly for a standalone test mount |
| `logos` | Array | The page's own logo list (e.g. an exhibition's `logos`), bucketed by `config.logos` |

Plus every `PageShell` prop not computed from `config`, passed through
`$attrs` (computed props win over `$attrs` when both set the same key).

### `config.navigation` / `config.logos` / `config.banner` contract

| Key | Shape | Feeds |
|---|---|---|
| `navigation.languages` | `[{ code, label }]` | `languages` |
| `navigation.links` | `[{ section, label, to \| href, external?, when(ctx)? }]` | `navLinks`, with `active` set against the current `useSection()` |
| `navigation.headerLinks` | `[{ label, to \| href, external? }]` | `headerLinks` |
| `navigation.footerLinks` | `[{ label, to \| href, external? }]` | `footerLinks` |
| `navigation.sectionTitles` | `{ [section]: entryName }` | `bannerTitle`, when `banner.title` sets none |
| `navigation.search` | `{ route, key ('q'), placeholder, submitLabel, empty }` | `search`; a submit pushes to `route` with `{ [key]: term \|\| empty }` |
| `logos.header` | `(logo) => boolean` | which of the `logos` prop show as `headerLogos` |
| `logos.sponsorGroups` | `(logos, t) => [{ title, sponsors }]` | `sponsorGroups` |
| `logos.headerTitle` | entry name | `headerLogosTitle`, shown only when `logos.header` kept at least one |
| `banner.*` | `variant, image, imageAlt, caption, captionLabel, title, subtitle, headline, enter, strapline` — each a string (entry name) or `(ctx) => value`, `ctx = { section, locale, t }` | the matching `banner*` prop on `PageShell` |

A key `config` leaves unset stays whatever the site's own template passed
`SiteShell` through `$attrs` — nothing here overrides a value the config
doesn't configure.

### Slots

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `header` | Passes straight through to `PageShell`'s `#header` | — |
| `brand` | `PageShell`'s `#header-brand` (the lockup only) | — |
| `banner` | Passes straight through to `PageShell`'s `#banner` | — |
| `navigation` | Passes straight through to `PageShell`'s `#navigation` | — |
| `notice` | Rendered before the routed content | — |
| *(default)* | The routed content itself | — |
| `after-content` | Rendered after the routed content, still inside `PageShell`'s default slot | — |
| `hyperlinks` | Passes straight through to `PageShell`'s `#hyperlinks` | — |
| `sponsors` | Passes straight through to `PageShell`'s `#sponsors` | — |
| `footer` | Passes straight through to `PageShell`'s `#footer` | — |

Every passthrough slot is guarded the same way `PageShell` itself guards it
— filling none of `notice`/default/`after-content` still renders the
computed props-driven content; nothing goes blank because a slot went
unused.

## Composed views (`@museumwnf/viewer-layout/views`)

Every one of the ten takes a `spec` object (plus, where noted, `id`) as its
real configuration surface — the table below lists just the outer props;
`spec`'s own shape is summarized per view and documented fully in the
[README](../README.md#composed-views).

### HomeView

**Props:** `title` (String), `intro` (String, Markdown), `cards` (Array),
`featured` (Object) — or the same four keys under `config.home`, read
through `useSiteConfig()`, when no prop is passed.

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `before` | Above the section cards | — |
| *(default)* | Between the cards and the featured record | — |
| `after` | Below the featured record | — |

### CatalogueResultsView

**Props:** `spec` (Object, required — `entity`, `keys`, `facets`, `controls`,
`filterMode`, `scope`/`match`/`narrow`/`dates`/`sort`, `pageSize`, `variant`,
`record`, `recordRoute`, `summary`, `title`/`filterTitle`/`empty`/
`actionLabel`, `pagination`); `entity` (String) — set by viewer-core on a
`features.entities` route.

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `before` | Above the title/filter panel | `{ filters, active, apply, reset, goToPage, matching, pageInfo, options }` |
| `filters` | Extra controls inside `FilterPanel`, alongside `spec.controls` | *(same)* |
| `actions` | Beside the results summary | *(same)* |
| `empty` | The "no results" message inside the list/grid | *(same)* |
| `aside` | Beside the results (only rendered if filled) | *(same)* |
| `after` | Below everything | *(same)* |

### RecordView

**Props:** `spec` (Object, required — `entity`, `translations`,
`attribution`, `fields`, `sections`, `layout`, `shortDescription`, `media`,
`mediaVariant`, `credits`, `workingNumber`, `citation`, `related`, `back`,
`title`); `id` (String, required); `entity` (String) — set by viewer-core.

The slot context (`ctx`) every slot below receives: `{ record, text,
language, languages, select, dir, glossary, ready, attribution, t, tr }`.

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `header` | Back link + language buttons + title | `ctx` |
| `before-sheet` | Above the field sheet | `ctx` |
| *(dynamic, one per `custom`/`link` row key in `spec.fields`)* | That one sheet row | `{ ...rowProps, ...ctx }` |
| `after-sheet` | Below the sheet, above the credits block | `ctx` |
| `source` | The "Source: `<address>`" line under the citation (default: `SourceCredit`, nothing until the site declares `site.origin`) | `ctx` |
| `related` | The whole related-records block | `{ ...ctx, records, outside }` — `records` is the spec-built rows, `outside` the related records the package doesn't carry |
| `aside` | Beside the sheet (only rendered if filled) | `ctx` |
| `after` | Below everything, outside the two-column body | `ctx` |

### RecordSheetView

Built on `RecordView`; the DXA gallery/exhibition item sheet.

**Props:** every `RecordView` prop (`spec`, `id`, `entity`), forwarded
unchanged, plus `dataGetter` (Function, optional) — `(id) => record | null |
undefined`, a website's own language-subset record lookup. Left unset, this
view is a bare `RecordView` (the gallery shape — no per-language split).
Supplied and it reports `id` missing, the view renders `NotFoundView`
*before* `RecordView` ever mounts (the exhibition shape's per-language-build
404 — a record the data package carries can still be absent from this
particular language build, which `RecordView`'s own "not in the package"
gate, reading the whole package regardless of language, does not catch).

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| *(every `RecordView` slot: `header`, `before-sheet`, one per dynamic row, `after-sheet`, `source`, `related`, `aside`, `after`)* | Forwarded straight to `RecordView` by name, unmodified — this view declares no slot of its own | Whatever `RecordView` hands that same slot |

### EssayView

**Props:** `spec` (Object, required — `tree`, `entity`, `route`, `heading`,
`placeholder`, `quote`/`body`, `glossary`, `items`, `panel`, `navigation`,
`breadcrumb`, `tabs`, `about`/`aboutKeeps`, `numbering`,
`previous`/`next`/`backTo`/`inThisTheme`/`seeAll`); `id` (String, required).

Slot context: `{ node, text, language, tree, items, selected, select,
selectedVariant, selectVariant, breadcrumb, previous, next, t, tr }`.

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `header` | Breadcrumb + tab strip + title | `ctx` |
| `before-body` | Above the prose body | `ctx` |
| `after-body` | Below the prose body | `ctx` |
| `justifications` | Extra prose below the body (hidden on an "about" node) | `ctx` |
| `navigation` | The previous/next row | `ctx` |
| `panel` | The side picture panel (image, variant thumbnails, caption, fields) | `ctx` |
| `thumbnails` | The item-thumbnail strip beside the panel, or the plain item grid when there is no panel | `ctx` |
| `aside` | Extra content in the side column | `ctx` |
| `after` | Below everything (default: `SourceCredit`, nothing until `site.origin` is declared) | `ctx` |

### LinkListView

**Props:** `spec` (Object, required — `title`, `groups`, `back`, `empty`).

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `before` | Above the groups | — |
| `group` | One group's whole rendering (default: heading + its links) | `{ group }` |
| `after` | Below the groups / empty message | — |

### PartnerListView

**Props:** `spec` (Object, required — `entity`, `scope`, `group`,
`orderToggle`, `nested`, `label`, `record`, `route`, `variant`, `count`,
text overrides).

Base context every slot also receives: `{ t, locale, groups, orderDir,
toggleOrder }`.

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `before` | Above the order toggle and the groups | base context |
| `group-heading` | One group's heading (default: `group.label`) | `{ group, ...base }` |
| `row` | One partner row — main, associated, and (when `nested`) a child row too | `{ group, partner, row, ...base }` |
| `after` | Below the groups | base context |

### SearchFormView

**Props:** `spec` (Object, required — `mode`, `entity`, `rows`, `fields`,
`operators`, `dates`, `language`, `extras`, `facets`, `target`,
`submitLabel`/`showAllLabel`, `howTo`).

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `intro` | Above everything, including `before` | `{ mode, submit, showAll }` |
| `before` | Above the filter panel | *(same)* |
| `extras` | A control the `extras` array doesn't cover | *(same)* |
| `actions` | Beside Search / Show all / How-to-search | *(same)* |

### TextPageView

**Props:** `spec` (Object, required — `heading`, `body`, `back`). No slots —
back link, heading, and body (an entry via `I18nText`, or Markdown from a
function) are the whole page.

### TimelineResultsView

**Props:** `spec` (Object, required — `scope`, `countryLabel`,
`countryIdForCode`, `collections`, `tr`, `timelinesEntity`/`eventsEntity`,
`keys`, `controls`, `pageSize`, `entrance`, `route`, `event`, `gallery`,
`summary`, `errorSelect`/`errorPeriod`, text overrides, `pagination`).

Slot context: `{ filters, active, apply, reset, goToPage, events, pageInfo,
countries, collections, gallery, t, tr }`.

| Slot | Replaces / wraps | Slot props |
|---|---|---|
| `before` | Above the filter panel | `ctx` |
| `summary` | The results-count line (default: `ResultsSummary`) | `ctx` |
| `cross-link` | The "See gallery" link's own content (still inside the link) | `ctx` |
| `event` | The whole events list (default: `TimelineEventList`, which itself exposes `#date`/`#caption`/`#media`/`#actions`/`#empty` — not re-exposed here; a site wanting one of those writes its own component directly on `TimelineEventList`) | `ctx` |
| `after` | Below the pagination | `ctx` |

Note: only rendered when `spec.entrance` is not set — an entrance-mode
instance shows the form alone.

## `/content` components

Every component `src/content/index.js` exports from
`@museumwnf/viewer-layout/content`, one line each. `SmartLink` lives in the
same directory but is **not** exported from `/content` — it is this
package's own internal link helper (every content component's link goes
through it), not a public building block.

| Component | Purpose |
|---|---|
| `SectionCards` | A landing page's grid of section cards, four layout variants |
| `FeaturedRecord` | The "item on display" spotlight — one record, image, a few meta lines |
| `RecordList` | Records as rows: thumbnail, name, meta line, badge |
| `RecordGrid` | Records as tiles: square image, hover card with the same fields |
| `Pagination` | One pagination for every list: first/previous/window/next/last |
| `FacetSelect` | One labelled select for one facet, with a placeholder as a disabled first option |
| `FilterPanel` | The box the facet controls sit in, in `apply` or `immediate` mode |
| `ResultsSummary` | The line over a results list: what was searched for, how many found |
| `RecordLanguages` | The languages one record carries, as pressed buttons |
| `RecordSheet` | The labelled-value sheet, from `sheetRows()`, table or list layout |
| `SheetSection` | A headed prose block under the sheet (description, history, …) |
| `RecordCredits` | Who made the sheet: the credits, the working number, the citation |
| `SourceCredit` | The "Source: `<address>`" line the MWNF notice requires |
| `RelatedRecords` | The records related to the one on the page, list or grid |
| `MediaGallery` | A record's images: current one large, thumbnails, a lightbox |
| `GlossaryPopover` | The definition of a clicked glossary term, as a fixed popover |
| `PartnerMap` | An OpenStreetMap embed centred on a partner's coordinates |
| `FeaturedPartners` | A carousel of featured partner records, rotated on a timer |
| `SiblingGalleries` | Sibling-gallery links plus MWNF virtual-museum links |
| `PopupLogo` | A dismissible fixed modal for sponsor notices |
| `BackLink` | A "back" link using browser history when available, a route otherwise |
| `GlossaryTool` | The glossary search box: input, hits, chosen definition as Markdown |
| `DynastyPopout` | One dynasty's details (dates, area, history) behind a native toggle |
| `DynastyList` | One `DynastyPopout` per dynasty of a record |
| `TimelineEventList` | Timeline events as rows: date, caption, description, media, actions |
| `PictureGallery` | A DXA exhibition theme page's curated-picture panel + thumbnail strip, with the related-works toggle |
| `PictureNarrative` | The same page's narrative body: the selected picture's curated text plus its related pictures, forward and backward |

Full prop/slot detail for `PictureGallery`/`PictureNarrative`, and the
decomposition rationale behind them, is in
[`theme-components.md`](./theme-components.md).
