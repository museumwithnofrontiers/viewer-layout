# Changelog

## 2.15.0 (2026-09-20)

Part of the DXA family pages epic (museumwithnofrontiers/inventory-app#1731,
package side, part 2), story
`#1731 package side: DXA family pages and standardRoutes ship from viewer-layout/dxa`.

### Added

- `@museumwnf/viewer-layout/dxa`, a new sub-path entry: the gallery/
  exhibition thin pages confirmed byte-identical within each DXA site pair
  on `origin/main` 2026-09-20 (carpets/amulets — 11 gallery pages;
  the-use-of-colours-in-art/water-in-islam — 9 exhibition pages), built
  from `@museumwnf/viewer-core/dxa`'s composables (1.16.0), plus
  `standardRoutes(family, config)` — a `RouteRecord[]` factory a site
  spreads into its `dataset.config.js`'s `extraViews`. Route names and
  paths are pinned to exactly what carpets'/colours' own `dataset.config.js`
  register today, so adopting the factory keeps every existing deep link
  working. `config` carries only the handful of genuine per-site strings
  the scouting confirmed (`creditsBody` for the gallery family;
  `partnerObjects: { emptyPartner, emptyInstitution, institutionSummary,
  partnerProfileLabel, institutionProfileLabel }` for the exhibition
  family's `PartnerObjects`/`InstitutionMonuments` shape) — every other
  text is a literal shared entry, read by `npx viewer-i18n-check`.
  `standardRoutes('exhibition', config)` also registers the `institution`/
  `institution-monuments` routes against the same `PartnerProfile`/
  `PartnerObjects` components with `props: { variant: 'institution' }` — no
  separate component. `About`/`ThemeGallery`/`Themes`/`RelatedContent` stay
  out of the exhibition family for now, blocked on the Theme epic
  (inventory-app#1729); the exhibition family's `/credits` route is not
  promoted either — colours/water-in-islam never had a `Credits.vue`, only
  a one-line `TextPageView` call over a local `creditsSpec`. Full
  page-by-page detail in `docs/slot-catalogue.md`'s new "DXA family pages"
  section.
- `src/styles/dxa.css`, imported from `src/dxa/index.js`: every `<style
  scoped>` block the 20 source `.vue` files carried, moved out over
  `--mwnf-*` tokens (two new ones added to `tokens.reference.css`:
  `--mwnf-dxa-heading-color`, `--mwnf-dxa-band-background`) instead of the
  sites' own `--theme-*`/`--link-blue`/`--background-color` names — no
  `<style>` block under `src/dxa`, matching the existing rule for
  `src/{content,sections,views,components}`.

### Changed

- `peerDependencies`/`devDependencies` on `@museumwnf/viewer-core` bumped
  to `^1.16.0` (from `^1.15.0`) — the DXA pages import
  `@museumwnf/viewer-core/dxa`.

## 2.14.0 (2026-09-19)

Part of the exhibition Theme view epic (museumwithnofrontiers/inventory-app#1729),
package-side story #1811, and the DXA-item-sheet epic
(museumwithnofrontiers/inventory-app#1728).

### Added

- `PictureGallery` and `PictureNarrative`, two new `/content` components
  decomposed out of the DXA exhibition family's `Theme.vue` (453 lines,
  byte-identical between the-use-of-colours-in-art and water-in-islam):
  `PictureGallery` is the curated-picture side panel + thumbnail strip
  (with the "Add related works" toggle), `PictureNarrative` is the
  narrative body below it — the selected picture's own curated text plus
  its related pictures, forward and backward, including links that cross a
  theme boundary. See `docs/theme-components.md` for the full decomposition
  rationale and what a site's own `Theme.vue` shrinks to. Migrating
  the-use-of-colours-in-art and water-in-islam onto them is a follow-up,
  per-site story.
- New composed view `RecordSheetView`, built on `RecordView`: the DXA
  gallery/exhibition item sheet, with an optional `dataGetter` prop —
  `(id) => record | null | undefined` — for the one behavioural difference
  between the two shapes: an exhibition ships one build per language and an
  id the data package carries can still be missing from this build's
  language subset, which `RecordView`'s own package-wide "not found" gate
  does not catch. A gallery passes no `dataGetter` and gets exactly
  `RecordView`'s own record gate.
- `RecordSheetView` now also owns every block that was byte-identical within
  carpets/amulets and within the-use-of-colours-in-art/water-in-islam, and
  near-identical across the two pairs: the source-database/collection block
  and its chip (`spec.sourceDatabase`), the Explore-partner notice
  (`spec.notice`), the holding-museum row (`spec.museum`), and the whole
  related-content block — the outside-reference chips, the Artistic
  Introduction/related-database/overall-database links, the on-display-in
  list, the audio/video section, the glossary tool, the dynasty popouts, the
  timeline popout (new content component `TimelineLookup`), and the print
  action (`spec.related.*`, documented in full in `docs/slot-catalogue.md`).
  Every block still renders through a slot with this view's own content as
  the default — `before-sheet`, `museum` and `related` — so a site keeps the
  ability to override any one of them; every other `RecordView` slot
  (`header` among them) still forwards straight through, unmodified. This
  view carries no project UUID, no site name and no legacy key of its own —
  the one `// TODO(#1727)` in the related block's outside-reference chip
  names a platform gap instead of working around it. `useProjects()` (peer
  `@museumwnf/viewer-core` ^1.15.0) is read directly for a project's name
  and its related-database/artistic-introduction links.
  Exported from `@museumwnf/viewer-layout/views` (`TimelineLookup` also from
  `@museumwnf/viewer-layout/content`), ready for carpets, amulets, the-use-
  of-colours-in-art and water-in-islam to replace their local
  `ItemSheet.vue` with — under 40 lines each, a `spec` (mostly built in the
  site's own `composables/sheet.js`), `id`, and the `header` slot; see the
  two adoption examples at the end of `RecordSheetView`'s entry in
  `docs/slot-catalogue.md` (site migration is a separate story per site).

## 2.13.0 (2026-09-19)

Part of the project-knowledge epic (museumwithnofrontiers/inventory-app#1727),
viewer-layout half of phase 3.

### Changed

- `RecordView`'s citation now reads the project name from the data package's
  `manifest.projects` (via `@museumwnf/viewer-core`'s `useProjects()`),
  honouring an explicit `spec.citation.project` id first, and falling back to
  the deprecated `projectName(record.project_key, t)` only for a data package
  that predates inventory-app#1727 phase 2. `peerDependencies`/
  `devDependencies` now require `@museumwnf/viewer-core ^1.15.0` (the first
  version exporting `useProjects`).

## 2.12.0

Part of the M1 npmjs-publishing epic (metanull/inventory-app#1721). Requires
`@museumwnf/viewer-core` 1.14.0 (the first version published to npmjs).

### Changed

- Package renamed `@metanull/viewer-layout` → `@museumwnf/viewer-layout` and
  publishing moves to npmjs (`registry.npmjs.org`) via trusted publishing
  (OIDC), replacing GitHub Packages for all future versions. The last
  `@metanull/viewer-layout` version stays published, frozen, on GitHub
  Packages. `peerDependencies`/`devDependencies` now point at
  `@museumwnf/viewer-core ^1.14.0`. `publishConfig.registry` now points at
  npmjs; `release.yml` passes `registry: npmjs` to
  `package-release.yml@v1.6.0`.
- Added a project `.npmrc` scoping `@museumwnf:registry` to npmjs. Without
  it, `npm ci` in this repo's own CI would try to resolve
  `@museumwnf/viewer-core` through `package-ci.yml`'s `@metanull`-scoped
  GitHub Packages default and fail with a 404 — see the comment in `.npmrc`.
- `ci.yml`'s `package-ci.yml` pin moves to `v1.6.1`, which alias-installs a
  renaming PR's tarball under both the new and the pre-rename name in the
  downstream site matrix — without it, every site (still importing
  `@metanull/viewer-layout`) would silently build against the last
  published version instead of this PR's code (metanull/viewer-workflows#17).

## 2.11.2

Docs only, no code change (metanull/inventory-app#1732): `docs/designer-contract.md` (the four ownership roles — components, tokens/CSS, site designer, translator — and the token → overrides.css → slot → own-view decision ladder) and `docs/slot-catalogue.md` (every prop and slot of `PageShell`, `SiteShell` and the nine composed views, plus a one-line purpose for every `/content` component), both linked from the README. Written from and cross-checked against `main`'s actual source and `website-template`'s scaffold — no new prop, slot or mechanism.

## 2.11.1

Fix: `SiteShell`'s header and footer links now render translated labels even when the root spreads raw navigation attributes (the `config.navigation` fields with entry name labels) from viewer-core's `AppRoot`. Disabled automatic attribute fallthrough via `defineOptions({ inheritAttrs: false })` and explicitly bind translated computed props so they reach `PageShell`, not the untranslated entry names.

## 2.11.0

Wave K of epic #1692 (metanull/viewer-layout#52): the source credit the MWNF notice asks for, composed from `@metanull/viewer-core` 1.13.0's `useSiteRights()`/`sourceUrl()` and `@metanull/viewer-i18n` 2.5.0's `record.source.*` entries. Additive; a site with no `site.origin` and a package with no `rights` block renders exactly as 2.10.0.

- `SourceCredit` (`@metanull/viewer-layout/content`): the "Source: `<address>`" line, from `sourceUrl(route)` — nothing until the website declares `site.origin`. Rendered under `RecordView`'s citation and in `EssayView`'s `after` area by default, both overridable by a named slot (`source` on `RecordView`, `after` on `EssayView`).
- `RecordView`'s citation permalink now reads `sourceUrl(currentRoute)` instead of composing one from `window.location` — the browser-local guess a copied-out citation could not resolve. `citation.permalink: false` keeps disabling it; an explicit string keeps winning.
- `SiteShell`'s footer renders the rights holder's attribution and a `record.source.termsOfUse` link to `termsUrl` once the loaded package's `manifest.rights` names a holder (`useSiteRights()`); `footerText` stays, and a package with no `rights` block leaves the footer unchanged. Plumbed through `PageShell`'s new `footer-attribution-*`/`footer-terms-*` props and `AppFooter`'s matching ones, so a website driving `PageShell` directly can set the same attribution without `SiteShell`.
- Raises the `@metanull/viewer-core` peer/dev dependency to `^1.13.0`.

## 2.10.0

- `SiteShell` (#42): a config-driven `PageShell` — `config.navigation`, `config.logos` and `config.banner` (through `useSiteConfig()`/`useSection()`) replace the menu, header/footer links, search submit, banner caption and section-title map, and the exhibitions' logo bucketing that seven site shells rebuilt by hand. Exported from `@metanull/viewer-layout/components`, not the package root, for the same reason the composed views are (it reads `@metanull/viewer-core` itself).
- Content classes (#43): `.mwnf-panel`, `.mwnf-heading` with `--page` and `--label` variants, `.mwnf-form-table`, `.mwnf-button` / `--secondary`, `.mwnf-select`, `.mwnf-back-bar`, `.mwnf-chip` with `--<family>` variants reading project-colour tokens, `.mwnf-popout`, `.mwnf-loader` and `.mwnf-link` — shared utility classes extracted from the legacy sites' own CSS, behind a complete token set for customization per website.
- Fix: `PartnerMap`'s defaults now name entries the shared `partner` section carries: `mapTitleEntry: 'partner.map.map'`, `mapOfEntry: 'partner.map.mapOf'`, `openMapLinkEntry: 'partner.map.openInOpenStreetMap'` (viewer-i18n 2.4.0).

## 2.9.3

- Fix: `TextPageView` now passes a string body to `I18nText` using its required `keypath` prop, not `entry-name`.

## 2.9.2

- Fix: `TimelineResultsView`'s entrance now offers bucketed year selects with the full data range, not the rightly-empty entrance event list.

## 2.9.1

- Fix: `TimelineResultsView` now passes the plain helpers context to `event()`, matching the other two callers (`collections` and `options`).

## 2.9.0

Wave I of epic #1692 (composed views and content components): `TimelineEventList` and `TimelineResultsView`, `PartnerListView`, `SearchFormView`, `GlossaryTool`, `DynastyPopout` and `DynastyList`, and the five promoted partner components. Additive; every export of 2.8.0 is unchanged.

- `TimelineEventList` and `TimelineResultsView` (#54): the seven sites'
  hand-written Timeline pages — none importing `FacetSelect`/`FilterPanel`,
  each with its own query mirroring and its own rows — as one engine over
  viewer-core's `useTimelineEvents`. `TimelineResultsView`'s spec covers all
  three axes (the worldwide country merge, an exhibition's own narrative
  chronology, Sharing History's exhibition split) and both legacy pages per
  site: `entrance: true` renders the form alone, with validation, navigating
  to a target route; `entrance: false` (default) is the results, with the
  filter panel, the summary, pagination, and DXA's "See gallery" cross-link
  over an item predicate the site supplies. `TimelineEventList` renders the
  per-event rows the results page and a slot both need — a date, a caption,
  a Markdown description, an image/item strip and per-event actions such as
  the standalone sites' "View items from this period". The `begin` and `end`
  controls accept an optional `options` prop: an array or function yielding
  `[{ value, label }]` buckets (century strings like "1500–1599" for DXA
  sites); without it, a free-year number input.
- `PartnerListView` (#55): the partner list as a spec over viewer-core's
  `groupByCountry`/`partnerHierarchy` — islamicart's and sharinghistory's
  country accordion with main/associated tiers, and the DXA family's open
  groups with no tiers and an A-Z/Z-A toggle, one declaration apart
  (`group.tier`, `variant`, `orderToggle`). `nested` renders an associated
  partner under its own parent instead of the flat tier column, for a family
  that wants legacy's original nesting back. Slots `before`, `group-heading`,
  `row`, `after`.
- `SearchFormView` (#56), over `FilterPanel`/`FacetSelect` and viewer-core's `useFacets`, `centuryPresets`, `yearBuckets` and `useSearchLanguage`: legacy's three search entrances — `Database`'s keyword rows, `CollectionSearch`'s facet column, `PcEntrance`'s one-filter-at-a-time radio — as one spec, over `mode: 'rows' | 'facets' | 'radio'`.
- `GlossaryTool` (#57): the search box four item sheets and a theme page each wrote
  for themselves, over viewer-core's `searchGlossary` — an input, the hit
  list, the chosen definition as Markdown, collapsed behind a native
  `<details>` toggle (keyboard-usable for free, as `SectionCards`'
  accordion variant already is). `DynastyPopout`: the other fifty repeated
  lines, one dynasty's name, also known as, area, AH/AD dates and history,
  the same toggle; islamicart's dynasty cards and its dynasty sheet fold
  into the same shape (decision D5). `DynastyList` renders one popout per
  dynasty of a record, `RelatedRecords`'s shape.
- Five components promoted from the DXA and exhibition sites to the shared package (#58):
  - `PartnerMap` — an OpenStreetMap embed for a partner's location, centred and zoomed from
    the record's coordinates; the title and "map of X" label are catalogue entries.
  - `FeaturedPartners` — a carousel of featured partner records, one showing at a time,
    rotated on a timer, with bullet controls.
  - `SiblingGalleries` — two blocks of gallery tiles and MWNF virtual museum links; galleries
    may be unresolved (no link); the site builds the arrays from its data and provides the
    museums' labels and links.
  - `PopupLogo` — a dismissible fixed modal for sponsor logos or notices, with Markdown
    rendering by default or opt-in raw HTML.
  - `BackLink` — a "back" navigation link that uses browser history when available, with a
    fallback route.

## 2.8.0

Five more gaps, found by `EssayView`, `LinkListView` and `SectionCards`'s
next two site adoptions (metanull/sharinghistory#50, metanull/water-in-islam#42,
both merged; metanull/islamicart#57, open) over metanull/viewer-layout#34/#47/#49.
Additive; every export of 2.7.0 is unchanged.

- `EssayView`'s `tabs` accepts `'children'` alongside the existing `true`/
  `'siblings'` (unchanged, the node's own siblings): a theme page whose tab
  strip is its chapters, not its neighboring themes.
- `EssayView` now reads `spec.entity` — already a spec key, for the items
  grid — as the tree's own translations entity when `spec.tree` carries none
  of its own (`spec.tree.entity`/`.themes`), falling back to `'collections'`
  as before. Fixes a pre-built tree (a site's own `useCollectionTree()`
  result, handed to `EssayView` as `spec.tree`) silently reading the wrong
  entity for every node's title/quote/body.
- `EssayView`'s `numbering: 'roman' | 'decimal'` counts a node among its true
  siblings — found through `tree.parents(id)` — instead of `tree.root`'s
  children, which a themes-package tree (`root` is always `null`) has none
  of; every top-level theme numbered "I" before this. A themes tree now
  numbers its top-level themes I, II, III, same as any other.
- `EssayView`'s `about(node)` may return `{ panel?, navigation? }` instead of
  a plain boolean, keeping the named piece instead of dropping it; the
  spec-wide `aboutKeeps: ['panel' | 'navigation']` does the same across every
  about page in one spec. A plain `true`/`false` return is unchanged — both
  still dropped.
- `LinkListView`'s `label` and `note` render as inline Markdown (through
  `mdInline`) instead of plain interpolated text — a bibliography entry's
  italicised title survives instead of being stripped. New slots `before`,
  `group` (given `{ group }`; the default renders the heading and its links —
  replace it entirely for a citation list, which is not link-shaped) and
  `after`.
- `SectionCards`' `title` and `description` render as inline Markdown
  (`mdInline`, no block elements) instead of plain text.

## 2.7.0

Four `EssayView` gaps found by its first site adoption (metanull/islamicart#57,
over metanull/viewer-layout#34/#47's `EssayView`): the spec could not reach a
nested translation field, `TextPageView`'s function body had no context to
render a per-record text with, the item grid's caption carried no meta lines
of its own, and a panel with alternate images had no notion of a selected
*variant* — only a selected item, so a "detail" close-up swapped the picture
without swapping its caption. Additive; every export of 2.6.0 is unchanged.

- `EssayView`'s `quote`/`body` accept a dotted path (`'extra.intro_text'`)
  into the node's translation, or a function `(ctx) => Markdown` of the base
  context (`{ node, text, language, tree, t, tr }`), alongside the existing
  flat field name.
- `TextPageView`'s function `body` is now called with `{ t, tr, language }` —
  the same shape `EssayView`'s spec functions read — instead of an empty
  object, so a static page can render a per-record text; fixes a latent bug
  where a function body threw (`md` was read off `useI18n()`, which never
  carried it).
- `EssayView`'s `items.meta(item, ctx) => [string]` and `items.badge(item,
  ctx) => string` add caption lines and a badge to the item grid, the same
  contract `RecordGrid` already renders.
- `EssayView`'s `panel.variants(item, ctx)` now returns
  `[{ id, image, alt, caption: { title, justification, fields } }]`: a full
  caption per variant, not just an image. The view keeps a `selectedVariant`
  (the item's own picture by default) and a thumbnail strip under the panel
  to switch it, swapping the image, title, Markdown justification and fields
  together; `panel.fields` stays as the fallback when a variant carries none
  of its own. `selectedVariant`/`selectVariant` are exposed in every slot's
  context alongside `selected`/`select`. `--mwnf-view-essay-variant-*`
  tokens style the strip, in the reference file.

## 2.6.0

`EssayView` (metanull/viewer-layout#34), the largest piece of the shared-pages
epic: a narrative essay over one node of a collection tree, which seven
pages across four sites become — islamicart's `ExhibitionTheme` and
`ArtIntroTheme`, baroqueart's `ExhibitionTheme`, sharinghistory's
`ExhibitionTheme`, `ExhibitionChapter` and `HistoricalBackgroundCountry`,
and the DXA family's `Theme`. Additive; every export of 2.5.0 is unchanged.

- A fourth composed view, from `@metanull/viewer-layout/views`: `tree` (a
  `useCollectionTree` result, built by the site, or a `{ purpose, childType }`
  / `{ themes }` declaration the view builds one from), a quote and a prose
  body with the glossary, a thumbnail-driven picture panel or a plain
  `RecordGrid`, previous/next over the tree (`navigation: 'tree'` crosses a
  branch boundary — decision D2 — `'siblings'` stays inside the parent), a
  tab strip of sibling pages, a breadcrumb, an `about(node)` mode for a
  tree's own introduction page, and roman/decimal numbering. Slots for what
  is not shared by every page — `justifications` for sharinghistory's
  curator/partner pair, `thumbnails` for the DXA related-works toggle — so
  no page is special-cased in the view itself.
- `--mwnf-view-essay-*` tokens for the essay's arrangement, in the reference
  file; the two-column body, the aside width and the status/back tokens are
  shared with `RecordView`'s.
- Peer and dev dependency `@metanull/viewer-core` ^1.10.0: the view reads
  1.10's `useCollectionTree` (`root`, `byId`, `children`, `parents`,
  `breadcrumb`, `itemsUnder`, `containing`, `walk`, `previous`/`next`, the
  `themes.json` adapter) and `glossaryTermsForText`, for a node with no
  `glossary_ids` column of its own to read.
- `SectionCards`: new `variant` prop (`'cards' | 'rows' | 'covers' | 'accordion'`)
  selects the presentation of the cards. The default `'cards'` is unchanged.
  `'rows'` renders cards in a flex layout with an image on the left, text on
  the right, and the image fades in on hover. `'covers'` displays each card as
  a cropped image with the title and number as text overlay. `'accordion'`
  creates collapsible sections, each with optional `children` subsections; the
  `number` (formatted by the caller as Roman or decimal) precedes the title.
  Tokens documented in `tokens.reference.css`.
- `.mwnf-prose` — readable text styling for essay pages: comfortable measure,
  paragraph spacing, list and link styling all on documented tokens.
- `LinkListView` (in `/views`): a page of categorized links. The spec declares
  groups statically or computed dynamically, each with a heading and links that
  may carry optional notes; an optional back link and title; groups with no links
  are filtered out. Texts are entry names.
- `TextPageView` (in `/views`): a simple page with optional heading and body text
  (rendered as a Markdown entry or a function returning Markdown), styled through
  `.mwnf-prose`. An optional back link that is true for history back, false for
  hidden, or `{ label, to | href }`. Texts are entry names.

## 2.5.0

Two more control kinds `CatalogueResultsView` asked for. Additive.

- `type: 'query'` — a text input bound to `filters[key]`, submitting on Enter
  in `apply` mode and on change in `immediate` mode, the same as `'year'`:
  the keyword-search results pages (three `DatabaseResults.vue`, four
  `SearchResults.vue`) narrow on a term that is not a facet, and could not
  become a spec without one.
- `type: 'checkbox'` — a labelled checkbox writing `'1'` or `''` into
  `filters[key]`: islamicart's Permanent Collection Explore page filters on
  a boolean, which neither existing control kind expressed.

## 2.4.1

What the DXA family's adoption asked for. Additive.

- `CatalogueResultsView`: every slot also receives `goToPage`, so a website
  can compose the filter panel itself — in the aside, where the galleries
  put it — and turn the pages from a second pagination above the tiles.
- `RecordView`: the `related` slot also receives `records` (the rows the
  spec made) and `outside` (the related records the package does not
  carry), so a website can surround the related block with its own without
  computing the relation again.

## 2.4.0

Two hooks the first site adoptions of the composed views asked for.
Additive.

- `CatalogueResultsView`: `spec.narrow(list, filters, helpers)` — a site rule
  over the whole list, applied after `scope`, the facets and `match` and
  before the date rule. A keyword index answers a list, not a predicate per
  record; this is where a results page that also searches hands the engine
  its hits.
- `RecordView`: the context every slot receives gains `languages` (the
  record's, labelled) and `select`, so a `header` of the site's own — a
  type badge, a timeline link — can still offer the record's languages.

## 2.3.0

Wave E of the shared-pages epic (metanull/inventory-app#1691), the composed
views (viewer-core#50 decided they live here: they are made of this
package's components, and viewer-core does not depend on the layout).
Additive; every export of 2.2.0 is unchanged.

- A third entry point, `@metanull/viewer-layout/views` — and only there, not
  from the package root: the views import `@metanull/viewer-core` itself,
  whose entry point carries `.vue` files, and a website's test runner loads
  this package natively while inlining viewer-core, so a root import would
  fail on the first `.vue` in every website's tests (which is what the
  downstream check of this release caught). A website that names the views
  inlines this package too. `HomeView` (the welcome, the section cards and
  the record on display, from `config.home`), `CatalogueResultsView` (the
  filters in the URL, the options, the date rule, the order, the pages, the
  rows and the summary, from a spec) and `RecordView` (the record's language
  and loads, the sheet, the sections, the credits, the citation, the related
  records and the glossary popover, from a spec). Each keeps slots for what
  only one website has, and a website whose page is not this shape writes
  its own on the same components.
- `--mwnf-view-*` tokens for the arrangement of a composed page, in the
  reference file.
- Peer dependency `@metanull/viewer-core` ^1.8.0: the views read the
  engine of wave B. The build externalizes `@metanull/viewer-core` as it
  already did `@metanull/viewer-core/i18n`; the tests stand a fixture data
  package behind `@inventory-data`, as a website stands its own.

## 2.2.0

Wave C of the shared-pages epic (metanull/inventory-app#1691): the content
components — what renders inside a page, from props. Additive; every export
of 2.1.0 is unchanged. The texts these read are in every bundle of
`@metanull/viewer-i18n` from 1.7.0.

- A second entry point, `@metanull/viewer-layout/content` (#23), for a page
  that composes a list and a pagination without carrying the shell; the
  same components are exported from the package too. One stylesheet for
  both. Their tokens — `--mwnf-card-*`, `--mwnf-featured-*`, `--mwnf-list-*`,
  `--mwnf-grid-*`, `--mwnf-pagination-*`, `--mwnf-filter-*`, `--mwnf-facet-*`,
  `--mwnf-summary-*`, `--mwnf-languages-*`, `--mwnf-sheet-*`, `--mwnf-credits-*`,
  `--mwnf-media-*`, `--mwnf-popover-*` — are in `tokens.reference.css`, and a
  test now fails when a stylesheet reads a token the reference does not
  document.
- `SectionCards` and `FeaturedRecord` (#24): a landing page's cards and its
  spotlight, which three websites carried with the same hundred lines of CSS.
- `RecordList` and `RecordGrid` (#25): records as rows (the standalone row)
  and as tiles with a hover card (the DXA grid), over one record contract —
  `{ id, image, imageAlt, name, meta, badge, href | to }` — so a page swaps
  one for the other by changing a component name.
- `Pagination`, `FacetSelect`, `FilterPanel`, `ResultsSummary` (#26): one
  pagination for the five that existed, a labelled facet select, the panel
  in its two legacy shapes (`apply` and `immediate`), and a summary that
  renders every count beside its label.
- `RecordLanguages`, `RecordSheet`, `SheetSection`, `RecordCredits`,
  `RelatedRecords` (#27): the sheet in its two legacy layouts (table and
  list) with the short-description toggle built in and a slot per custom
  row, and the blocks around it.
- `MediaGallery` and `GlossaryPopover` (#28): one image gallery with
  thumbnails and a lightbox (and a `row` variant for the standalone sites'
  flat row until they adopt the gallery — decision D4), and one glossary
  popover. Escape closes both and focus returns to what opened them.
- Links: an `href` the website's router produced, as everywhere in this
  package; a route location (`to`) is honoured through the application's
  `RouterLink` when it registered one. Nothing here imports vue-router.

## 2.1.0

The alignment pass (metanull/inventory-app#1683): `PageShell` covers the
needs of all seven websites from props, so no website rebuilds a section in
a slot. Additive — every prop and slot of 2.0.0 still works. Requires
`@metanull/viewer-core` 1.6.0, whose `/i18n` entry point exports the
Markdown renderers the banner headline goes through, and the `layout.nav.menu`
entry of `@metanull/viewer-i18n` 1.6.0.

- `AppHeader` (#18): `home` and a `brand` slot or text for the mark;
  `eyebrow` above the title and `titleHref`; `logos` with `logosTitle`;
  `links`; `search` rendering a search form that emits `search(term)`; the
  language switcher in the header as `select` or `buttons`. On `PageShell`:
  `headerHome`, `headerBrand`, the `header-brand` slot, `headerEyebrow`,
  `headerTitleHref`, `headerLogos`, `headerLogosTitle`, `headerLinks`,
  `search`, `languagePlacement`, `languageStyle`.
- `AppNavigation` (#19): the links fold behind a menu button on a narrow
  screen (`layout.nav.menu`), closing again when one is followed; `notice`
  renders a standing bar under the links; `external` links open in a new
  window. On `PageShell`: `notice`.
- `AppFooter` and `AppSponsors` (#20): `links` beside the footer text;
  `groups` of sponsors under headings, next to the flat `sponsors`. On
  `PageShell`: `footerLinks`, `sponsorGroups`.
- `AppBanner` (#21): `variant` `strip`, `split` or `section`, with `caption`
  (a string or `{ name, partner, location, country }`), `captionLabel`,
  `eyebrow`, `title`, `titleHref`, `subtitle`, `headline` (Markdown, rendered
  through viewer-core), `enter`, `strapline`; `AppHyperlinks` `variant`
  `tiles` with `subtitle` and `titleHref`. On `PageShell`: `bannerVariant`
  and the matching `banner*` props, `hyperlinksVariant`,
  `hyperlinksSubtitle`, `hyperlinksTitleHref`.
- Tokens for every new colour, spacing and size, listed in
  `tokens.reference.css`.

## 2.0.0

Breaking. A website adopting this must be on `@metanull/viewer-core` 1.2.1 or
later — 1.1.0 does not declare the `/i18n` entry point this reads its texts
through, and 1.2.0 keys them on a symbol that is not shared when that entry
point is loaded as a second copy of the module — and must supply the five
`layout.*` entries, which it does by receiving the `layout` namespace of
`@metanull/viewer-i18n`.

- `vue-i18n` is gone. The layout reads its texts through
  `@metanull/viewer-core/i18n`, now a peer dependency.
- **Removed: the `layoutMessages` export and the bundled English defaults.**
  The layout no longer carries texts. Its five entries are published in the
  `layout` namespace of `@metanull/viewer-i18n`, so they are translated in the
  same place, by the same people, as every other text on the platform —
  instead of being an export each website had to remember to merge.
- The entries are renamed to the platform's three-part grammar:
  `layout.skipToContent` → `layout.nav.skipToContent`, `layout.navigationLabel`
  → `layout.nav.label`, `layout.languageLabel` → `layout.language.label`,
  `layout.hyperlinksLabel` → `layout.hyperlinks.label`, `layout.sponsorsLabel`
  → `layout.sponsors.label`.

## 0.1.0 — 2026-08-24

- Initial release: `PageShell` composing seven optional, token-styled sections
  (`AppHeader`, `AppBanner`, `AppNavigation`, `AppContent`, `AppHyperlinks`,
  `AppSponsors`, `AppFooter`), `--mwnf-*` token styling with
  `tokens.reference.css`, vue-i18n `layout.*` chrome strings with bundled
  English defaults (`layoutMessages`).
