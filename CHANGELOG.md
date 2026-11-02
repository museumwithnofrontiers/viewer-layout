## 3.30.0 (2026-11-02)

### Added

- **A partner's objects page's layout, `mwnf-standalone-pmi`**: legacy's
  `pm_museum_items.php` on the results page's layout, shared by the
  products (Islamic Art drew it in its own stylesheet): a heading of the
  partner's name and its italic place, the tiles without the cells'
  gutter, "Partner Profile" at the top of the side column. A site's view
  sets it beside `mwnf-standalone-pcr`.

## 3.29.0 (2026-11-02)

### Added

- **A standalone results page's layout, `mwnf-standalone-pcr`**: legacy's
  `pclist_all.php` around the result tiles, shared by the three products
  (Islamic Art drew it in its own stylesheet): the way back, the heading
  naming the selection with its count, col-lg-10 for the tiles and
  col-lg-2 for the "Change your selection" panel and the related content,
  the pages under both. A site's results view sets the class on its
  `CatalogueResultsView` and draws these parts in its slots;
  `--mwnf-standalone-select-arrow` is the date lists' arrow.

## 3.28.0 (2026-11-02)

Needs `@museumwnf/viewer-core` 2.14.0 (`tIn`).

### Added

- **`RecordView`'s `labelsInRecordLanguage`**: the sheet's labels, its
  credits, its citation heading and its working number's label in the
  language the record is shown in, as legacy's `db_GetTERM` printed them,
  rather than the site's. Discover Baroque Art's interface is English, its
  Czech sheet Czech. The context a spec's functions receive carries
  `tIn(key)`, a text in the record's language, for a site's own citation.
- **`--mwnf-standalone-related-bullet`**: the arrow before the Related
  Content column's links, where it differs from the sheet's (Discover
  Baroque Art's column draws it white on blue). It falls back to
  `--mwnf-standalone-bullet`.
- **`RecordLanguages`' `from`**: the number of languages from which the
  band is drawn (2 by default). The standalone item sheet draws it for one,
  as legacy's sheet did.

### Changed

- **The standalone item sheet keeps a picture's photographer and copyright
  in its alternative text**, as legacy's slider did, rather than printing
  them under the thumbnails.

## 3.27.0 (2026-11-02)

### Added

- **"As Word (text only)" on the standalone item sheet**, legacy's
  `export.php`: the related column's `download.word` offers the sheet's
  texts as a `.doc` file (an HTML page Word opens, in legacy's styles),
  each label a heading and each value a paragraph, without the pictures,
  the related content, the page's controls or its links.
  `download.title` titles it and `download.wordFile(record, language)`
  names it (legacy: the record's key and language, `;` as `_`).

## 3.26.1 (2026-11-02)

### Fixed

- **The standalone item sheet's columns are legacy's Bootstrap columns**:
  col-md-4, col-md-5 and col-md-3 of a row one gap wider than the
  container. The middle column was 7.5px too narrow, so a long value could
  wrap one line more than legacy's. A product whose Related Content column
  sets `--mwnf-standalone-related-margin` to reach legacy's `.col-lg-3` now
  sets it symmetrically (Islamic Art: `0 -15px`).
- **The sheet's sections follow its rows as legacy's did**: 10px under the
  last value, where the sheet's own bottom margin added 20px.
- **"View Short Description" stands 10px under the description**, as
  legacy's link under its paragraph.

## 3.26.0 (2026-11-02)

Needs `@museumwnf/viewer-core` 2.13.0 (`collate`).

### Added

- **Legacy's windows on the standalone sites**: a route marked `meta.bare`
  is drawn alone by `StandaloneShell`, without the chrome, and
  `StandaloneWindow` draws legacy's `#hcr_timeline` window: the heading in
  its band over the product's picture, the round × that closes it, the
  scrolling article. Its colours and picture are the
  `--mwnf-standalone-window-*` tokens.
- **`StandaloneGlossarySpelling`**: legacy's Glossary & Spelling window
  (`glossarysearch.php`). The first letters of a term bring the spellings
  they start in the site's language; a pick shows the term's definition and
  every spelling the database knows it by, in all languages. Legacy's own
  suggestions never arrived (its script read a POST its autocomplete sent
  as a GET); this window does what the scripts were written to do.

## 3.25.1 (2026-11-01)

### Fixed

- **The standalone item sheet draws a single picture's thumbnail**, as
  legacy's sheet did (its picture viewer always drew the strip).
  `MediaGallery` takes `thumbsFrom`, the number of images from which it
  draws the thumbnails (2 by default, as before).

## 3.25.0 (2026-11-01)

### Added

- **The standalone Related Content column's place and colour**:
  `--mwnf-standalone-related-margin` sets it out of its grid column (legacy's
  `.col-lg-3` in a row wider than the container); `-reach-top` and
  `-reach-right` carry its colour up to the band and out to the right, drawn
  behind it without widening the page.

### Fixed

- **The column is as tall as what it holds**, as legacy's, not the record's
  height.
- **Its spacing is legacy's**: 22px paragraph lines with no margin, the
  heading 14px and "Related objects" 3px over what follows, the dynasties
  16px under the links, the exhibitions' heading 10px over its list and the
  galleries' on theirs, Download a line and 15px under the galleries.
- **Related records are whole pictures**, no larger than
  `--mwnf-standalone-related-thumb-size` (now 70px), centred on 20px lines,
  10px apart and 5px over the next line, no longer cropped squares.

## 3.24.2 (2026-11-01)

### Fixed

- **A biography is rendered as the Markdown it is**: inline, its line
  breaks kept and its HTML escaped, as every other record text. It printed
  the Markdown's own marks (`*Tiraz*`) where legacy set the word in italics.

## 3.24.1 (2026-11-01)

### Fixed

- **The biography box starts where the name ends**, as legacy's tooltip,
  and keeps its own colour rather than the name's. The name that opens it
  takes `--mwnf-credits-person-color` and `-decoration` (legacy Islamic
  Art: the sheet's link blue, underlined); the box's bold name
  `--mwnf-credits-biography-heading-weight`.

## 3.24.0 (2026-11-01)

### Added

- **Credited people with their biography**: `RecordView`'s
  `creditPeople: { entity: 'authors' }` prints each person a translation
  credits (`credit_ids`) from their own record: the name (its Arabic
  spelling on an Arabic sheet) and, where the record has one in the
  sheet's language, the biography in a box over the name, under the pointer
  or the keyboard's focus, the name in bold first, as legacy Islamic Art's
  `su_tooltip`. A person the package does not carry leaves the joined line.
  Tokens `--mwnf-credits-biography-*` set the box.

## 3.23.0 (2026-11-01)

### Added

- **`RecordView`'s `citation.format(ctx, { permalink, year })`**: a site
  whose legacy worded its citation its own way composes it, as HTML it has
  escaped itself (`RecordCredits`' new `citationHtml`). Islamic Art's
  legacy cites the writers, the name without its ending period, a phrase
  per language and project, the year, then the address in italics.

## 3.22.1 (2026-11-01)

### Fixed

- **The Arabic standalone item sheet and partner profile keep legacy's
  columns**: the pictures on the left, Related Content (or the open tab) on
  the right; only their texts run right to left, each in its own column.
  The profile's place keeps to the left and its tab pill on the left with
  its tabs right to left, as legacy's.
- **The band of a record's languages** stays on the right in Arabic: the
  item sheet lists them from the left in the page's order, the partner
  profile in the English order, as legacy's two pages did.

## 3.22.0 (2026-11-01)

### Added

- **The standalone item sheet's picture size**: `--mwnf-standalone-item-picture-width`
  and `--mwnf-standalone-item-picture-height` keep the picture at its own
  proportions within a product's box (Islamic Art's legacy "medium"
  rendition: 320×240), on no ground; `--mwnf-standalone-item-thumb-size`,
  `-thumb-gap` and `-thumb-margin` set the thumbnails. The defaults keep
  the column's width and today's thumbnails.

## 3.21.2 (2026-11-01)

### Fixed

- **`SearchFormView` writes the search language as `searchlanguage`**
  (viewer-core 2.12's `SEARCH_LANGUAGE_KEY`), no longer `lang`, which
  switched the whole website to the language picked to search in.

## 3.21.1 (2026-11-01)

### Fixed

- **The standalone footer's 50px under its line** is the home page's only,
  as legacy's: its inner pages' footers have none.

## 3.21.0 (2026-11-01)

### Added

- **The standalone home's place line, the site's own**: `home.highlight.place`
  `(record, text, country) => line` replaces "location, country" where a
  site's legacy composed it otherwise (Islamic Art adds the province).
- **Home tokens**: `--mwnf-standalone-home-links-inset`,
  `--mwnf-standalone-home-links-line-height`, `--mwnf-standalone-home-links-gap`,
  `--mwnf-standalone-highlight-line-height` and
  `--mwnf-standalone-highlight-paragraph-gap`, for legacy's indents, lines
  and gaps.

### Fixed

- **The standalone footer** is legacy's `p.cookie_footer` and
  `#social-media`, shared by the three products: the links and the
  copyright on one centred line, "&nbsp;|&nbsp;" between them, 14px on
  24px, the social icons at the content's right edge on that line, 50px
  under it. `--mwnf-standalone-footer-weight` sets the line's weight.

## 3.20.0 (2026-11-01)

### Added

- **`StandalonePartnerPage`** (`@museumwnf/viewer-layout/standalone`):
  the standalone family's partner profile, legacy's `pm_partner.php`, which
  Discover Islamic Art, Discover Baroque Art and Sharing History share. The
  ways back; the name over "city, country" in italics; the About | Contact |
  Logo | homepage pill beside the pill to the partner's items; the pictures
  beside the open tab; for a museum with coordinates, the map across the
  page under its heading. A product passes its view-model, ways back, items
  link and words (`labels`); `about`, `bands`, `map` and `links` cover
  legacy's own rules. Two tokens: `--mwnf-standalone-pill` and
  `--mwnf-standalone-heading-color`.
- **`PartnerMap`'s `provider: 'google'`**: Google's keyless embed in its
  hybrid view at the record's zoom, in the page's `language`, without the
  map's own title or link, as legacy's partner profile drew it
  (inventory-app#2414). OpenStreetMap stays the default.

### Fixed

- **The standalone band of a record's languages** runs across the page
  straight under the banner, its words in legacy's order (the first one
  listed on the right), 26px high, 20px over the content, on the item sheet
  as on the partner profile.
- **The item sheet** runs from the band down without the composed views'
  16px gaps; its sheet opens with its first label 28px under the way back,
  as legacy's.

## 3.19.0 (2026-11-01)

### Added

- **`StandaloneResultsGrid`** (`@museumwnf/viewer-layout/standalone`):
  legacy's `pc_all` result tiles, four to a row: each record's picture in
  a 230×160 frame, and under the pointer (or the keyboard's focus) a panel
  with the picture again, the name, the record's lines, the holder, the
  location and the "See" link. On a phone the panel stands beside the
  picture. Two tokens: `--mwnf-standalone-results-border` and
  `--mwnf-standalone-results-panel`.
- **`CatalogueResultsView`'s `records` slot**: a website draws the page's
  rows itself (the slot receives the rows, the empty flag and the usual
  slot props); the default stays the list or grid.
- **`StandalonePagination`**: legacy's `page_listing`, "Previous", the
  page numbers in blocks of twenty, then "Next", centred, with legacy's
  arrows (`--mwnf-standalone-back-arrow`, `--mwnf-standalone-bullet`);
  the ends are plain words on the first and the last page.
- **`CatalogueResultsView`'s `pagination` slot**: a website draws the
  pages' links itself, or elsewhere on the page (an empty slot draws none).

## 3.18.1 (2026-11-01)

### Fixed

- **The standalone menu band** is legacy's 28px (its links set no line
  height), not 34px, and no entry is coloured as the current section:
  legacy's menu marked none, only the hovered one.

## 3.18.0 (2026-11-01)

### Added

- **`RecordView`'s short description after a section**: when
  `spec.shortDescriptionAfter` names a section and no row (the standalone
  sites print the description as a section), its toggle follows that
  section (`ShortDescription`), as legacy's "View Short Description" did.
- **`spec.workingNumberLabel`**: the entry naming the working number
  (default `sheet.field.workingNumber`), so a site can print its own word.
- **Standalone tokens** for the item sheet's colours
  (`--mwnf-standalone-sheet-label-color`, `-value-color`, `-link-color`),
  the Download picture (`--mwnf-standalone-download-icon`) and the record's
  language band (`--mwnf-standalone-language-bar`, `-language-color`,
  `-language-active`).
- `RecordCredits` marks its two headings (`--credits`, `--citation`).

### Changed

- **The standalone item sheet is drawn as legacy's `database_item.php`**
  (style_inside.css): labels, values, sections, credits and citation in
  16px/22px Roboto, labels weight 500 over values indented under them; the
  citation first, then each credit "Label Name" on its line, then the
  working number, with no Credits heading; no Source line (a site's own
  `source` slot still draws one); Related Content's links, dynasty,
  exhibitions (in italics), galleries and Download behind the product's
  arrow and download pictures; the record's languages as legacy's band.
  The words, colons included, are the product's own.

## 3.17.1 (2026-11-01)

### Fixed

- **The working number's label and value run together** on every item sheet
  ("MWNF working numberUK1 69"): `RecordCredits` drew them on separate
  template lines, which Vue's whitespace condensing joined. A space now
  parts them, as legacy did.

## 3.17.0 (2026-10-31)

### Added

- **Mini-site tokens for what legacy placed or spaced on its own**, read by
  `./minisite` with the old value as fallback, so a theme without them draws
  as before: `--minisite-home-title-right` and
  `--minisite-home-description-right` (minisite.css,
  minisite-baroqueart.css), a home title or description placed from the
  right as Reformation, Crusader and Women did; `--minisite-intro-padding-top`
  (both), where the introduction's text starts, which each Baroque Art
  exhibition set; `--minisite-partners-tab-padding-right`
  (minisite-baroqueart.css), the space after the curators' column.

### Fixed

- **The introduction's picture column** (Discover Islamic Art and Discover
  Baroque Art) widens to its widest picture, as legacy's table cell did, and
  the text column gives up the difference: the pictures no longer sit 40px
  right of legacy's or overflow the frame. Discover Islamic Art draws the
  empty title above the text, whose margin legacy kept.
- **Discover Baroque Art's introduction**: paragraphs a blank line apart and
  pictures at legacy's spacing (no margin above, 30px below).
- **Discover Islamic Art's home band**: the curators' logos are spaced as
  legacy spaced them (inline, a space either side of each spacer), and
  "This exhibition is curated by" takes the page's link colour where the
  exhibition set none for the band.
- **Sharing History's mini-sites**: at phone width the home quotation no
  longer runs over the theme menu, the footer menu wraps entry by entry
  without covering the footer, and closed dropdowns no longer widen the page
  past the screen; "Previous page" is a link, as on legacy; "See Database
  entry for this item" is in the caption's type, not bold.
- **Discover Baroque Art's home band**: the curated-by line takes legacy's
  line height (its themes no longer carry a line height legacy's own font
  shorthand reset), so the curators' columns sit at legacy's height.

## 3.16.0 (2026-10-30)

### Removed

- **The Discover Baroque Art branches of Discover Islamic Art's mini-site
  pages**, deprecated in 3.15.0: every Discover Baroque Art site is now on its
  own pages (`./minisite/baroqueart/`). `minisiteNavigation()` and
  `minisiteSettings()` take no `family` (no Baroque Art menu, footer link or
  band, no `partnerListHref`); the home page draws no Baroque Art band or home
  picture; the introduction opens no zoom; the exhibition page prints no
  artist or material line; `slotsOf` reads no detail views; `placementCaption`
  and `withFirstView` take no `family`; `curatorLabel` reads no `place`;
  `detailViewCaption` and `WINDOWS.introZoom` are gone (Discover Baroque
  Art's are `baroqueartDetailViewCaption` and `BAROQUEART_WINDOWS`); the
  shell's `menuSeparator` is gone (Discover Islamic Art's menu always had its
  bars); minisite.css styles no Baroque Art band or home picture. Discover
  Islamic Art's exhibitions and the Artistic Introduction draw exactly as
  before.

## 3.15.0 (2026-10-30)

### Added

- **Discover Baroque Art's mini-sites, a product of their own**
  (`./minisite`, ./minisite/baroqueart/): their own frame
  (`BaroqueartShell`), home page with the band crediting the curators and the
  designer and the home picture (`BaroqueartHome`), introduction whose
  pictures open the zoom (`BaroqueartIntroduction`), exhibition pages with the
  artist and material lines and the detail views (`BaroqueartPage`) and zoom
  window (`BaroqueartZoom`); their caption rules (`baroqueartCaption`,
  `baroqueartDetailViewCaption`, `baroqueartWithFirstView`,
  `baroqueartSlotsOf`, `baroqueartIntroCaption`, `baroqueartCuratorLabel`,
  `BAROQUEART_NO_COUNTRY`); and their declaration (`baroqueartRoutes()`,
  `baroqueartNavigation()`, `baroqueartSettings()`, `baroqueartMenu()`). Their
  stylesheet, minisite-baroqueart.css, styles only their own classes
  (`mwnf-baroqueart-*`) and reads the same `--minisite-*` tokens, so a
  site's theme/tokens.css stays as it is. They draw what the Discover Islamic
  Art pages drew for `family: 'BAR'`, element for element.

### Deprecated

- `family: 'BAR'` on `minisiteNavigation()` and `minisiteSettings()`, and the
  Discover Baroque Art branches of the Discover Islamic Art pages and rules
  (`detailViewCaption`, a placement's `details` in `slotsOf`, the `family`
  argument of `placementCaption` and `withFirstView`, `curatorLabel`'s
  `place`). They go in the next release, once every Discover Baroque Art site
  is on its own pages. `baroqueartMenu()` now comes from ./minisite/baroqueart/.

## 3.14.0 (2026-10-30)

### Added

- **Discover Islamic Art's Artistic Introduction** (`./minisite`,
  ./minisite/artintro/): one site of its own, in the frame of Discover
  Islamic Art's virtual exhibitions, on pages of its own (gai/). Its home
  page (`ArtIntroHome`) draws the title, the subtitle, the text and the
  credits over legacy's picture, the menu of its themes in two columns, and
  the links to MWNF's social media; a page (`ArtIntroPage`) draws the way
  back, the theme's title and its pages, the quote and the text, and beside
  them the item on show, its caption, its views and its sheet's link, with
  a 4:3 thumbnail per item under it. Its captions follow Discover Islamic
  Art's exhibition rules; the zoom window is the exhibitions'. A site
  declares it with `artintroRoutes()`, `artintroNavigation()` (the MWNF
  portal and the parent site's home in the header, no menu over the footer)
  and `artintroSettings()` (`family` "GAI"). Its label set is viewer-i18n's
  `minisiteArtIntro` (`LABELS.GAI`). Its stylesheet
  (minisite-artintro.css) reads every value from `--minisite-*` tokens,
  the exhibitions' where legacy styled the same selector, and
  `--minisite-artintro-*` for its own.

### Changed

- The mini-site frame draws no menu over the footer when `navigation.menu`
  is empty, and no tooltip on the logo when `logoTip` is empty.
- The footer's height and the header links' margin read
  `--minisite-footer-height` and `--minisite-header-back-margin`, defaulting
  to the exhibitions' values: a site whose stylesheet set its own draws them.
- `PLACEHOLDER_TITLE` also matches the importer's Artistic Introduction
  placeholders ("Artintro Page 15"): legacy printed no title there.

## 3.13.2 (2026-10-29)

### Fixed

- **A Sharing History page draws every record of a shared position.**
  Legacy's image table gives two records the same position now and then, and
  legacy drew a thumbnail for each. The mini-site drew one and showed the
  other as its related view. Each main view is now a slot of its own, with
  the position's other views as its related ones (`sharinghistorySlotsOf`).
  International Exhibitions has two such pages, Music, Literature, Dance and
  Fashion one.
- **A Sharing History title's Markdown no longer shows as text.** The home
  menu renders a theme's or a subtheme's italics, as legacy's menu printed
  them; the page's name, its lists of themes and subthemes and the
  introduction's print the title with them stripped, as legacy's pages did.
  Music, Literature, Dance and Fashion has such a title.

## 3.13.1 (2026-10-29)

### Fixed

- **Sharing History's mini-sites list only titled themes and subthemes**, as
  legacy's LoadListByExId and LoadListByThId did (an inner join on their
  names): a theme with no title in the page language — none of them, in
  English — or a subtheme with none in the page language is not a page.
  Economy and Trade has such a theme. `sharinghistoryListedThemes`,
  `sharinghistoryListedSubthemes`; the composable's `subthemesOf`.
- The 3.13.0 notes named the caption rule `sharinghistoryPlacementCaption`;
  it is exported as `sharinghistoryCaption`.

## 3.13.0 (2026-10-29)

Sharing History's mini-sites (museumwithnofrontiers/inventory-app#2393).
Reads viewer-i18n 6.4's `minisiteSharingHistory` bundle. Additive: Discover
Islamic Art's and Discover Baroque Art's mini-sites do not change.

### Added

- **Sharing History's mini-site pages**, in `./minisite`, a family of their
  own (legacy's `exhibitions/AWE/`), compared page by page with legacy's
  Travelling: `SharingHistoryShell` (the Sharing History frame: the header
  with About, Home and the portal, the text-size buttons over a page of text,
  the menu over the footer with the parent's country profiles),
  `SharingHistoryHome` (the home picture with the title and the quote, the
  theme menu, Related Content, the band with the windows and the partners'
  logos), the introduction (the exhibition's pictures, first five, with the
  zoom), a theme's overview and its subthemes (the thumbnails, the quote and
  the text, More about, the item panel with its Related views), Further
  Reading (the language tabs, Close, the bibliography in the order the data
  keeps), and the curators, cover-image and zoom windows. Routes, navigation
  and settings: `sharinghistoryRoutes`, `sharinghistoryNavigation`,
  `sharinghistorySettings`; legacy's rules: `sharinghistorySlotsOf` (a view
  only when the curator approved its relation, a position only with its main
  view), `sharinghistoryPlacementCaption`, `sharinghistoryRelatedLinks` (the
  gallery narrowed to the page's theme and subtheme), `sharinghistoryReadingOrder`.
  Themed by `--sh-*` tokens (`minisite-sharinghistory.css`). Exported under
  `SharingHistory*` / `sharinghistory*` names, apart from the other families'.
- `LABELS.SH`: the family's label set, `minisiteSharingHistory`.

### Fixed

- The README's mini-site section printed literal `\n` in one paragraph.

## 3.12.1 (2026-10-29)

### Fixed

- **Mini-sites: a detail view with no picture of its own shows the page's
  picture at its position**, as legacy showed the "Awaiting Image"
  placeholder there (inventory-app#2390); it showed the first view's picture.
  `slotsOf()` in `./minisite`'s rules.

## 3.12.0 (2026-10-29)

Discover Baroque Art's mini-sites (museumwithnofrontiers/inventory-app#2390).
Reads viewer-i18n 6.3's `minisiteBaroque` bundle. A Discover Islamic Art
mini-site changes only by the three fixes below, each now drawn as legacy did.

### Fixed

- **Mini-sites: the menu over the footer and the footer are legacy's height.**
  viewer-core's base stylesheet counts padding inside a box's height
  (`border-box`), which legacy's stylesheets did not: both bars were drawn
  shorter than legacy's. They are drawn `content-box` again.
- **Mini-sites: a caption's justification is bold**, as legacy's
  `showDetail()` wrote it; the caption's font shorthand had reset it.
- **Mini-sites: the introduction's pictures keep legacy's 180px column**
  (`IntroPageTableTD2`); a long caption widened it and narrowed the text.

### Added

- **Families.** `minisiteSettings({ family })` and
  `minisiteNavigation({ family })`: "ISL" (the default) or "BAR", Discover
  Baroque Art's exhibitions (exhibitions/BAR/generic_*.php). Each family reads
  a label set of its own (`LABELS`, `labelSet()`; `texts` to name another):
  every page reads its labels through it.
- **Baroque Art's captions**: the artist and material lines under the place,
  the page's own text first, else an object's artist or a monument's
  architects and the record's materials; a placement's detail views
  (`details`) are its views, each with its own picture, captioned from its
  own text, the first view's, then the monument detail it shows
  (`detailViewCaption()`, class.exhibition.inc.php's rules).
- **Baroque Art's home band**: "Exhibition curated by" and the exhibition's
  credits, the cooperation line and its link to the partner institutions
  (`partnerListHref`, the parent site's list by default), each curator named
  over its logo with the city and country legacy printed (`place`,
  `country`), and the designer (`design`), styled by the `--minisite-partners-*`
  tokens its stylesheet set.
- **Baroque Art's frame**: its menu (`baroqueartMenu()`: no Artistic
  Introduction, Exhibitions leads to the exhibition's home, no bars between
  links: `menuSeparator`), the footer's language-policy link, and the logo's
  tooltip in the family's labels (`logoTip`).
- **Baroque Art's pages**: the home picture (`banner`) placed against the
  footer by the `--minisite-banner-*` tokens, the home menu placed from the
  right (`--minisite-home-menu-right`), the titles' alignment
  (`--minisite-intro-title-align`, `--minisite-exhibition-title-align`), the
  introduction's pictures opening in the zoom window (zoomImage.php), and a
  view that never takes the first view's detail name, which legacy wrote as a
  space (`withFirstView(mine, first, family)`).

## 3.11.2 (2026-10-27)

### Fixed

- **Mini-sites: no "More information" for a photo legacy placed with no record.**
  Legacy's `showDetail()` linked the view's record, or the first view's
  (`Detail.ref_item || Detail0.ref_item`), and nothing when neither had one. A
  custom exhibition photo placed with no record is now an item of its own, a
  picture with no parent (inventory-app#2359), which has no sheet.
  `sheetItemId(slot, index, itemOf)` in `./minisite`'s rules.

## 3.11.1 (2026-10-27)

### Fixed

- **Mini-sites: a view without a picture shows the first view's**, as legacy's
  `showDetail()` did (`Detail.picture || Detail0.picture`): an exhibition page
  showed no picture there (The Muslim West, Defence, the Castle of Moura's third
  view). `viewPicture(slot, index)` in `./minisite`'s rules.

## 3.11.0 (2026-10-27)

The mini-sites: legacy's virtual exhibitions, each a website of its own
(museumwithnofrontiers/inventory-app#2359). Additive. Reads viewer-i18n 6.2's
`minisite` bundle.

### Added

- **`@museumwnf/viewer-layout/minisite`**, the mini-site family layer: the
  frame (`MinisiteShell`), the home page, the introduction, the exhibition
  page, and legacy's credits, map and zoom windows; legacy's caption, view and
  page-order rules as plain functions (`placementCaption`, `introCaption`,
  `slotsOf`, `readingOrder`, `pageWithNeighbours`, `cleanText`); and what a
  site declares, built once (`minisiteRoutes`, `minisiteNavigation`,
  `minisiteSettings`). Its stylesheet is scoped to its own classes and reads
  `--minisite-*` tokens, every value an exhibition's legacy stylesheet set.
## 3.10.0 (unreleased)

Part of the legacy-parity check of 2026-10-25 (museumwithnofrontiers/inventory-app#2338). Needs
viewer-core 2.10.

### Changed

- The record sheet (`RecordView`, the standalone `ItemSheet`) shows only the pictures with a
  row in the page's language (`picturesInLanguage`), as every legacy sheet listed them; a
  package without per-picture `languages` shows them all, as before.
- A sheet spec with `creditNames` prints each credited person from the package's
  `credit_names` (`creditLine`: "Firstname LASTNAME", as the galleries did), in the credits
  and the citation.
- `AppBanner`'s caption reads `{ name, holder, location, province, country }` (`partner` is
  still read as the holder). The exhibition shell captions an item with its own holding museum,
  never its partner, and adds the province on every page but the home page, as legacy did.

## 3.9.0 (2026-10-25)

- Picture caps per site (`pictureLimit`), the artist line per language, videos in the page's
  language, the featured partners' text decoded and three of them shown (#121).
## 3.8.0 (2026-10-22)

Part of the legacy-parity story museumwithnofrontiers/inventory-app#2233. Optional: a package
without the new field renders as before.

### Changed

- `SpecialFeatures` prints a feature's artist line from its translation's `artist`, as that
  language prints it (Markdown, so its line breaks survive), and falls back to the feature's
  `artist_names`. Those merge every language's line, so a Baroque Art special feature showed
  each artist once per spelling (museumwithnofrontiers/inventory-app#2332 ships the line).
## 3.7.0 (2026-10-21)

Part of the legacy-parity story museumwithnofrontiers/inventory-app#2233: what
Sharing History's legacy home page and menu need to be drawn as legacy drew
them, and the picture of the day legacy shows on Islamic Art and Baroque Art.
Every addition is optional; a site that declares none of it renders as before.

### Added

- The menu's entries take `children` (an array, or a function returning one):
  links that drop down under the entry, on hover or keyboard focus, and sit
  open under it on a narrow screen. A link's label may be `text`, a name in the
  page's words from the data package, in place of an entry name (`label`).
- `standalone.subheading`: a line under the inner pages' heading. `standalone.banner.homeTitle` / `homeText`: legacy's words over the home
  page's picture, its title in italics (Sharing History's `bannerText.php`).
- `standalone.home.tiles.items` may be a function of the loaded data, and a
  tile's `text`, a name from the data package, stands in for `label`.
- `standalone.home.highlight.pictures`: legacy's own picture of the day
  (`random_image/<site>/<n>.jpg`), picked in its own cycle by the day of the
  year, in place of the record's first picture.
- `StandaloneShell` passes a site's own `#sponsors` and `#footer` slots through, in place of `standalone.sponsors` and the configured footer.
- Tokens for the drop-down (`--mwnf-nav-sublink*`) and for the home banner's
  text (`--mwnf-standalone-home-banner-*`), in `tokens.reference.css`.

## 3.6.0 (2026-10-21)

Part of the legacy-parity story museumwithnofrontiers/inventory-app#2233. Rule
of 2026-10-21: a site displays a value only where legacy displayed it. Legacy
showed a picture's caption and credits in the page's language only. Needs
@museumwnf/viewer-core 2.8.0 (`pictureCredits`).

### Changed

- `RecordView` and `StandaloneItemSheet`, the default picture list: the
  caption in the record's language only, never the English one, and the
  photographer and copyright in it too (`pictureCredits`, from the packages'
  per-language `photographers` / `copyrights`).

### Added

- `RecordView`'s context carries `translations(entity)`: one entity's rows in
  the record's language and no other, for a value legacy printed in that
  language only, such as a dynasty's name. `tr` still falls back to English.

## 3.5.0 (2026-10-20)

The standalone family: Discover Islamic Art, Discover Baroque Art and Sharing
History, whose layouts match legacy's (museumwithnofrontiers/inventory-app#2233,
decision D1). Islamic Art adopts it first; Baroque Art and Sharing History follow.

### Added

- `@museumwnf/viewer-layout/standalone`, the standalone family layer, beside
  `/dxa`:
  - `StandaloneShell`: `SiteShell` with legacy's chrome, read from
    `config.standalone` on 3.4.0's site chrome contract (`chrome`, `brand`,
    `navigation.placement`, `navigation.socialLinks`) — the logo per language
    and a print-only logo, the inner pages' centred heading and "Portal |
    Home" links, the home page's picture banner, the inner pages' titled band,
    the band above the footer, the copyright line with the year, and a
    one-language option with no switcher. Pictures are keys of the site's
    chrome map.
  - `StandaloneHome` and `TodayHighlight`: the side links and legacy's
    "Today's highlight", the record of the day from legacy's own list, or a
    tile grid.
  - `StandaloneItemSheet` and `RelatedContent`: `RecordView` in legacy's three
    columns — the way back and the pictures, the sheet with its
    short-description toggle, the coloured Related Content column with the
    related records by type, the site's own blocks and Download.
  - `StandaloneTextPage`: a text page in legacy's centred column, with an
    optional drop cap, a "→" link and Print.
  - `StandaloneSponsors`, `StandaloneSubNav`, `StandaloneTileGrid`,
    `StandaloneSlider`: the band in columns of text, logos and links; and
    Sharing History's tab strip, picture tiles and slider.
  - `byLanguage`, `dayOfYear`, `pickForDay`, `legacyHomeItemKey`.
- The family's stylesheet, scoped to `.mwnf-standalone` and shipped in
  `style.css`; its `--mwnf-standalone-*` tokens in `tokens.reference.css`.
  No other site changes.

### Changed

- The `@museumwnf/viewer-core` peer range is `^2.6.0` (the record of the day
  prints its lines with `removeEndingPoint`). Every website already installs
  2.6.0.

## 3.4.0 (2026-10-20)

The gallery and exhibition families, and the shared header and footer,
back to legacy's layout (museumwithnofrontiers/inventory-app#2233, sections
2–4). Every change is additive for a site that supplies nothing new: it
renders as it did on 3.3, apart from the fixes below.

### Added

- **A site's own chrome files** (D7): `config.chrome`, the map
  `import.meta.glob('../theme/assets/**/*.{jpg,jpeg,png,gif,svg}', { eager: true, query: '?url', import: 'default' })`
  builds, keyed by the path under `theme/assets/`. `chromeAsset`,
  `chromePicture` and `chromeSource` (package root) read it. The DXA
  families read `logo.png` / `logo_black.png`, `dia.jpg`, `dba.jpg`,
  `sh.jpg`, `world.png`, and `chrome/<legacy path>` for every picture the
  package names by its legacy path (banners, the exhibition home image, the
  sibling-gallery tiles), falling back to `media.legacyHost` (README, "Site
  chrome").
- **The logo image** (A2): `config.brand = { logo, alt }` (SiteShell), drawn
  in the header's brand cell (AppHeader `brand-logo`, PageShell
  `header-brand-logo`). `galleryConfig` sets legacy's white `logo.png`,
  `exhibitionConfig` the black `logo_black.png`; without the file the
  "MWNF" text mark stays.
- **The menu above the banner** (S6): PageShell `navigation-placement`
  (`'after-banner'`, the default, or `'before-banner'`), SiteShell
  `config.navigation.placement` (a value or a function of the section). The
  galleries put it under the banner on the home page and above it elsewhere,
  the exhibitions above it on every page, as legacy did.
- **The social-network links** (T1): AppFooter `social`, PageShell
  `footer-social`, SiteShell `config.navigation.socialLinks`, opt-in for any
  site; `mwnfSocialLinks` (package root) is legacy's six, with Font Awesome
  Free's brand icons inlined (CC BY 4.0). Both DXA configs set them.
- Glass's home logo strip: `galleryConfig({ homeLogos })`, under viewer-i18n's
  `gallery.home.logosLabel`.
- `config.galleryShell` (`headerEyebrow`, `headerTitle`, `bannerEyebrow`,
  `bannerTitle`, `bannerImage`, `bannerCaption`): the gallery shell's chrome
  for a site without a gallery package, the galleries hub.
- RecordView's `aside` slot also gets `records` and `outside`, the related
  rows the `related` slot gets.
- `SocialLinks` (package root, prop `links`): the footer's icon links on their
  own, for a site that writes its own `#footer`.
- PageShell `language-placement="none"`: no site-language switcher.
- `config.footer.rightsHolder: true` (SiteShell): the rights-holder line, now
  opt-in (below).
- `exhibitionConfig({ sponsorLogos })`: an exhibition's own list of sponsor
  logos (`[{ image, href, alt, category_id, display_order }]`); and
  `withSitePictures(html, resolve)`, which redraws a popup notice's pictures
  from the site's own copies.
- `config.galleryShell.notice: false` drops the menu's search tip (the hub).

### Changed

- **The gallery's title is legacy's** (S5): the gallery's own project name
  where it is one ("Discover Carpet Art", "Discover Glass Art"), the
  gallery's name elsewhere, on the home banner and in the header of every
  other page; "Discover MWNF Galleries" is back over the home title (the
  config's `banner.eyebrow` never reached the banner, which SiteShell
  doesn't read).
- **The item sheet's related content is legacy's sidebar** (S7): the
  `related` block is drawn in RecordView's side column, at the right edge
  from under the language band, in the family's light tone (galleries) or
  contrast colour (exhibitions); the photos and the sheet keep legacy's
  40/60 split beside it. The labels are bold in the text colour, each
  followed by legacy's colon (drawn by the family stylesheet: the texts carry
  no punctuation).
- **The item sheet's labels are legacy's** (S7): a field labelled
  `sheet.field.<name>` reads `sheet.dxa.<name>` instead when the installed
  viewer-i18n has it ("Name of Object", "How Object was obtained": legacy's
  "Galleries common" words, which its galleries and exhibitions both read).
  A dictionary without those entries keeps today's labels, so this release
  and viewer-i18n's can land in either order.
- **The record's internal key is never shown** (S7): the
  `backward_compatibility` line under the source database, and the same key
  as an outside reference's fallback name, are gone. The family smoke test
  checks that no item sheet prints `mwnf3:`.
- Featured Partners (S4): white on the gallery's medium tone, legacy's
  centred picture-and-text box, and legacy's "Read more >>" and "View objects
  >>" links in place of one link over the whole card.
- The home's "Visit MWNF Galleries" tiles name the gallery in capitals on a
  dark band over the picture (S8), from legacy's `zoom` size; "Other Virtual
  Museums" sits beside them and shows legacy's picture banners when the site
  supplies `dia.jpg` / `dba.jpg` / `sh.jpg` (A3; `SiblingGalleries`'
  `museums[].image`), the flat blocks without them.
- The partner page has legacy's 50px side gutter (S9).
- The exhibition header's "A MWNF Online Exhibition" is bold, in the
  contrast colour, outlined by legacy's dark shadow (S10).
- An exhibition's home banner is legacy's composed `homepage_image_path`
  (`home_image.jpg`), captioned with the home item (A4); every other page
  keeps the banner.
- An exhibition's About page shows the About theme's pictures and their
  captions beside the text (A8; `aboutSpec.aboutKeeps: ['panel']`). The
  popup notice centres its text and keeps its pictures to legacy's width;
  legacy's popup pictures had no visible caption, only their title tooltip,
  which the package keeps.

- **The language switchers are legacy's** (Pascal, 2026-10-20): the
  galleries have none, only the record's own bar on the item and partner
  pages; the exhibitions have legacy's small header select, the codes in
  capitals, plus the record's bar.
- **The footer is legacy's on every SiteShell site** (Pascal, 2026-10-20):
  MWNF's five portal links and "© Museum With No Frontiers (MWNF)
  2004–<year>" by default, `config.navigation.footerLinks` and a `footer-text`
  still replacing them; the rights-holder line ("Content © Museum With No
  Frontiers, used under …") no longer shows unless `config.footer.rightsHolder`.
  The family smoke test checks legacy's footer instead of the attribution.
- **An exhibition's sponsor logos are the site's** (Pascal, 2026-10-20): the
  package's `logos[]` draw `chrome/<legacy_path>`, else legacy's media host,
  never the inventory's `image_url`; `sponsorLogos` replaces the list.
- `config.galleryShell`: an empty field means no line, and the header fields
  apply on inner pages only.

### Fixed

- AppBanner's `section` strip shows its caption ("Detail from …", the
  partner, the place) at the end of the title band (S6). It was drawn
  inside the picture, where the strip's own rule hid it.
- A section whose slot appears after the first render shows: every section
  decided whether to render from `useSlots()` inside a `computed`, which the
  slots object never invalidates; it now decides at render.

## 3.3.0 (2026-10-05)

The display review's fixes (museumwithnofrontiers/inventory-app#2197).

### Fixed

- The partner page's "View objects" button (`.mwnf-button` in
  `PartnerPanel`'s actions) keeps the button's colours. The panel's link rule,
  an element and a class, outranked the button's class and painted its text
  in the link colour over the button's background.
- The sponsor popup's paragraph, image and link rules apply. They used
  `:deep()`, which exists only in a component's scoped style; in this global
  stylesheet the browser dropped them.

### Changed

- **Every link reads one colour, `--mwnf-link-text`**, and
  `--mwnf-link-hover-text` where it changes under the pointer. A component
  whose links a site may want different has its own token falling back to
  them: `--mwnf-back-link-color`, `--mwnf-link-list-link-color` and
  `--mwnf-card-accordion-child-hover-color` (new), `--mwnf-partner-link-color`
  and `--mwnf-dxa-item-link` (now falling back to the link colour, not the
  accent).
- **`--mwnf-color-accent` colours no text.** It stays the surface colour
  (active backgrounds, rules). The prose, sheet, map, related-content and
  partner links, the Back link and the skip link took it before; a theme that
  paints its menu or bands in its accent, as the exhibitions do, hid them. A
  site that wants its links in its accent sets `--mwnf-link-text` to it.
- The partner list's disclosure triangle takes the group heading's colour
  (`--mwnf-partner-list-group-marker-color` to set another).
- The orphan `.mwnf-partner-list__name` / `__meta` rules and their two tokens
  go: no component has rendered those classes since the rows moved onto
  `PartnerPanel`'s.

### Added

- `@museumwnf/viewer-layout/dxa/gallery.css` and `/dxa/exhibition.css`, each
  family's stylesheet: its fonts, page reset, 1350px page column and menu,
  and its theme as a function of the palette (a gallery's five legacy
  colours, an exhibition's six). A site imports it between `style.css` and
  its own `theme/tokens.css`, which then holds the palette and what differs
  from the family.
- `@museumwnf/viewer-layout/dxa/testing`: `describeGallerySmoke` and
  `describeExhibitionSmoke`, the family's smoke test, which a site runs with
  its own config, texts, package and picks.
- `CatalogueResultsView`'s `boxed: true` (the results in the site's content
  box: the panel's frame, a gap under the filters, narrow year fields) and
  `RecordView`'s `spaced: true` (a gap under the pictures and the sheet): the
  two looks the virtual museums restyled with `:deep()`.

## 3.2.2 (2026-09-28)

Found while building the galleries hub (museumwithnofrontiers/inventory-app#2116,
milestone M11).

### Fixed

- `SmartLink` treats a `to` that is an absolute address (`https://…`,
  `mailto:…`) as a plain anchor, never as a route. Under a router it used to
  hand such a string to `RouterLink`, which read it as a path inside the site:
  every DXA site's sibling-galleries strip, whose links are each gallery's
  `legacy_host`, pointed at `#/https://…` — the site's own not-found page.
  Route locations and relative paths are unchanged.

## 3.2.1 (2026-09-26)

Part of M10 epic 8 (museumwithnofrontiers/inventory-app#2019), story
museumwithnofrontiers/inventory-app#2062. Requires `@museumwnf/viewer-i18n`
5.1.0 (the two entries it names).

### Fixed (`/dxa`)

- The partner-objects page's profile link reads `partner.action.partnerProfile`
  and the banner's caption reads `layout.banner.detailFrom`, in place of
  `gallery.action.partnerProfile` / `exhibition.partnerObjects.partnerProfile`
  and `gallery.banner.detailFrom` / `exhibition.media.detailFrom`, the last
  family pairs that said the same thing under two names. Every text reads as it
  did.
## 3.2.0 (2026-09-26)

Part of M10 epic 8 (museumwithnofrontiers/inventory-app#2019), story
museumwithnofrontiers/inventory-app#2064.

### Changed

- `TimelineResultsView` labels its country and date controls with the shared
  `catalogue.facet.selectCountry`, `.startDate` and `.endDate` by default, in
  place of `timeline.form.selectCountry`, `.startDate` and `.endDate`, which
  said the same in every language but capitalised the English ("Start Date").
  The timeline form now reads "Start date", as the search forms do. A
  control's own `label` or `placeholder` still wins.
## 3.1.1 (2026-09-26)

Part of M10 epic 8 (museumwithnofrontiers/inventory-app#2019), story
museumwithnofrontiers/inventory-app#2062. Requires `@museumwnf/viewer-i18n`
4.6.1 (the German of the entry it names).

### Fixed (`/dxa`)

- The footer's legal-notice link reads the shared `core.footer.legalNotice` in
  place of `gallery.footer.legalNotice` / `exhibition.footer.legalNotice`,
  which said the same and which 3.1.0 left behind. Every text reads as it did.
## 3.1.0 (2026-09-26)

Part of M10 epic 8 (museumwithnofrontiers/inventory-app#2019), stories
museumwithnofrontiers/inventory-app#2061 and #2062. Requires
`@museumwnf/viewer-i18n` 4.5.0 (the shared entries it names).

### Changed

- `EssayView` defaults its texts to shared entries every bundle carries,
  instead of the exhibitions' `exhibition.theme.*`, which the gallery bundle
  does not carry: `previous`/`next` → `core.pagination.previous`/`.next`,
  `inThisTheme` (the strip's label) → `core.nav.inThisSection`, `seeAll` (the
  panel's link to the selected record) → `catalogue.results.seeDatabaseEntry`.
  A spec's own names still win. The exhibition family's theme page names its
  own `exhibition.theme.inThisTheme` and `.seeAllInTheme`, so the exhibitions
  read what they did.
- The DXA family layer (`/dxa`: the site config, the pages, the shells) reads
  the shared entries in place of the `gallery.*`/`exhibition.*` twins that
  said the same: the menu (`core.nav.*`), the footer (`core.footer.*`), the
  section titles (`core.section.*`), the related block (`record.related.*`),
  the search placeholder (`catalogue.search.placeholder`) and the "See
  Database Entry" links (`catalogue.results.seeDatabaseEntry`); the
  exhibition theme page's Previous/Next read `core.pagination.*`. Every text
  reads as it did but one: a gallery's French footer link reads legacy's own
  "Contacter" where it read "Contact". A website that overloads one of the old
  names in its own texts overloads the new one instead — none did at this
  release.
## 3.0.0 (2026-09-25)

Part of M10 epic 6 (museumwithnofrontiers/inventory-app#2017), story
museumwithnofrontiers/inventory-app#2058: the moved components exist only under
`/dxa`. Every DXA site moved onto the family pages with 2.18.0, and no
website imports any of the names below; package-ci builds and tests all 46
against this release.

### Removed

- The `/content` aliases of the family-only blocks: `FeaturedPartners`,
  `SiblingGalleries`, `PopupLogo`, `PictureGallery`, `PictureNarrative`.
- The `/views` alias `RecordSheetView`.
- `GalleryPartnerProfile` and `ExhibitionPartnerProfile` (`/dxa`), the
  family's partner page under its old names.

### Migration

- A family-only block: import it from `@museumwnf/viewer-layout/dxa`, under
  the same name.
- `RecordSheetView` → `ItemDetailView` from `@museumwnf/viewer-layout/dxa`,
  the same props and slots.
- `GalleryPartnerProfile` / `ExhibitionPartnerProfile` → `PartnerDetail` with
  `family: galleryPartnerDetail` / `exhibitionPartnerDetail` (and `variant`
  for an institution), as `standardRoutes` registers it.
## 2.18.0 (2026-09-25)

Part of M10 epic 6 (museumwithnofrontiers/inventory-app#2017), stories
museumwithnofrontiers/inventory-app#2052, #2053, #2054 and #2055. Requires
`@museumwnf/viewer-core` 2.3.0 (the family item-page specs and the
exhibition themes) and `@museumwnf/viewer-i18n` 4.3.0
(`partner.list.featured`, `exhibition.partnerObjects.*`).

### Added (`/dxa`)

- **The pages each DXA site carried itself.** They were the same code on
  every site of a family.
  - Galleries: `GalleryHome`, `GalleryItemDetail`, `GalleryTimeline`.
  - Exhibitions: `ExhibitionHome`, `ExhibitionAbout`, `ExhibitionThemes`,
    `ExhibitionTheme`, `ExhibitionThemeGallery`, `ExhibitionItemDetail`,
    `ExhibitionRelatedContent`, `ExhibitionTimeline`, plus the theme pages'
    specs (`exhibitionThemeSpec`, `exhibitionAboutSpec`, `themeNodeRoute`).
- **The two shells,** `GalleryShell` and `ExhibitionShell`.
- **`galleryConfig(values)` and `exhibitionConfig(values)`:** a DXA site's
  whole declaration from the few values its own `dataset.config.js` differed
  by: the package, name, origin, project chips, notice projects and credits
  entry.
- **`standardRoutes(family, { pages: true })`** also serves the pages above,
  under the names, paths and `meta` the sites registered. An exhibition gets
  its credits page given `creditsBody`. `partnerObjects` defaults to the
  shared `exhibition.partnerObjects.*` entries, so a site no longer passes it.
- **The item page's two-column layout** (`.mwnf-dxa-item`) and the theme
  pages' styles are in `dxa.css`. The item page's ground is
  `--mwnf-dxa-item-background` (white, a gallery's item page on its tinted
  page) and its sheet links `--mwnf-dxa-item-link` (the accent), both of
  which an exhibition sets to its own. The theme pages read an exhibition's
  theme colours as tokens: `--mwnf-dxa-theme-background`, `-text`,
  `-contrast`, `-contrast-text`, `-main`.
- **`mwnf-chip--Explore`** (`--mwnf-project-Explore`, legacy's `#006950`): the
  chip of a record no project claims.

### Changed

- **The family-only blocks and composed view moved to `/dxa`:**
  `FeaturedPartners`, `SiblingGalleries`, `PopupLogo`, `PictureGallery`,
  `PictureNarrative`, and `RecordSheetView`, now `ItemDetailView`. `/content`
  and `/views` keep the old names as deprecated aliases until the next major.
- **`FeaturedPartners`' heading** defaults to `partner.list.featured`. The old
  default, `partner.featured`, was an entry that never existed.
- **The `DGA` chip is legacy's Glass Art blue, `#0059bf`.** It was grey
  (`#263238`), the Galleries colour, on every gallery and exhibition.
- **The `ISLandEPM` chip's text is black,** as in legacy.
- `peerDependencies`: `@museumwnf/viewer-core` `^2.3.0`.
- CI: viewer-workflows v1.9.0.
## 2.17.0 (2026-09-25)

Part of M10 epic 5 (museumwithnofrontiers/inventory-app#2016), stories
museumwithnofrontiers/inventory-app#2038, #2039 and #2040.

### Added

- `BackLink` `variant="bar"`: the products' back bar. A link carrying
  `.mwnf-back-bar` (and `.mwnf-back-bar--link`), addressed to the fallback so
  it also opens in a new tab, with an `arrow` before the label (`←` by
  default) and a default slot that replaces the label. Token:
  `--mwnf-back-bar-margin`.
- Item-page blocks in `/content`. The three standalone item pages and
  `RecordSheetView` each drew their own version.
  - `SpecialFeatures`: a monument's sub-details, as the data package embeds
    them on it (`details`). Each has its name, location, dates, artists, a
    description with the record's glossary terms, and its pictures.
  - `RelatedMedia`: a record's audio and video. With `language`, only that
    language's entries when there are any.
  - `OnDisplayIn`: the exhibitions, chapters and galleries that show a
    record, in groups. A route links inside the site; an external address is
    marked ↗; a name with no address is plain text, followed by
    `pendingLabel` when given.
  - Tokens: `--mwnf-special-features-*`, `--mwnf-related-media-*`,
    `--mwnf-on-display-*`.
- `HomeView`, for the standalone home pages (#2040):
  - `featured.filter`: the records the pick may show. It needs
    `@museumwnf/viewer-core` 2.2.0, whose `useFeaturedRecord` takes it.
  - `panels`: the welcome and the record on display as `.mwnf-panel` boxes.

### Changed

- `BackLink` goes back only when the previous page is one of this website's
  own (vue-router's `history.state.back`). Otherwise it goes to its fallback,
  so a visitor who arrived from another site stays on this one. With no
  fallback it still goes back through whatever history the tab has, as
  before.
- `RecordSheetView` draws its audio/video section with `RelatedMedia` and its
  on-display-in groups with `OnDisplayIn`. The section's heading and its
  links are unchanged; the lines carry the blocks' classes instead of
  `.mwnf-sheet-related__line`, `__subheading` and `__unresolved`.
## 2.16.0 (2026-09-25)

Part of M10 epic 4 (museumwithnofrontiers/inventory-app#2015), stories
museumwithnofrontiers/inventory-app#2032, #2033 and #2034. Requires
`@museumwnf/viewer-core` 2.1.0 (`partnerView()`) and `@museumwnf/viewer-i18n`
4.2.0 (`partner.action.*`).

### Added

- `PartnerPanel` (`/content`): one partner, wherever it appears, rendered from
  viewer-core's `partnerView()` view-model.
  - `line`: a list's row.
  - `summary`: the line under an item's holder text, or a page's heading.
  - `full`: the partner page. The About · Contact · Logo tabs by default
    (decision D2), or `layout: 'sections'`; the homepage link, the pictures
    beside the open panel, the map below.
  - `show` switches parts off; `heading` sets the name's level; labels are
    entry names with shared defaults.
  - Slots: `badge`, `meta`, `actions`, `after`.
  - Tokens: `--mwnf-partner-*`, listed in `tokens.reference.css`.
- `PartnerDetail` (`/dxa`): the partner page of both DXA families (decision
  D4), on `RecordView` and the `full` panel. Each family's own half is its
  `partnerDetail` (exported as `galleryPartnerDetail` /
  `exhibitionPartnerDetail`), which `standardRoutes` passes as `family`.
- `PartnerListView`'s spec: `objectsRoute`, `actions` and `emptyLabel`, for
  the line's View objects link, its Read more · View objects links and the
  "no objects" line. The `row` slot also receives `view`.
- `FeaturedPartners`: a `partners` prop taking `partnerView()` view-models,
  next to `records`.

### Changed

- `PartnerListView`'s default row is `PartnerPanel`'s `line`. A `spec.record`
  row is still honoured: its shape is lifted into the view-model. The row's
  parts carry the panel's classes (`.mwnf-partner-panel__name`, `__logo`,
  `__count`) instead of `.mwnf-partner-list__name`, `__logo`, `__meta`. The
  list's own wrappers (`__row`, `__row-block`, `__children`, `__group*`) are
  unchanged.
- `RecordSheetView`'s `museum` block shows the item's holder text, then the
  partner as the `summary` panel: "About {name}, {city}, {country}", linked
  through `spec.museum.route` (decision D3). `spec.museum.label` is no longer
  read. A partner the package does not carry leaves the holder text alone.
- The DXA partner pages (`GalleryPartnerProfile`, `ExhibitionPartnerProfile`)
  are `PartnerDetail`, kept under their old export names until the major
  release of inventory-app#2017. The family partner lists render their rows as
  `line` panels, and the partner-objects pages head with the `summary`.
  `dxa.css` maps the family's colours onto the panel's tokens, and drops the
  rules of the markup it replaced.

### Fixed

- The gallery partner page showed its photos twice. They now show once, in
  the panel.
- DXA partner picture captions were always empty: they read a `captions` map
  the package never carries. They now read `alt_text`.
- The partner's own fax shows in the contact block. No page showed it before.
- `PartnerMap`'s frame title names the partner ("Map of {name}"). It used to
  interpolate the name into a text, which texts never allow, so the name was
  dropped.
# Changelog

## 2.15.2 (2026-09-25)

Part of M10 epic 1 (museumwithnofrontiers/inventory-app#2012), story
museumwithnofrontiers/inventory-app#2024.

### Fixed

- `dxa/exhibition/PartnerProfile.vue` shows the partner's name and
  "city, country" at the top of the page, as the gallery profile and the
  legacy exhibition client do. The location joins only what is present, so a
  partner without a city or a country shows no stray comma. The institution
  variant gets the same header.

## 2.15.1 (2026-09-20)

Part of the #1727 cleanup wave, story
`#1727 cleanup: viewer-layout accepts viewer-core 2 (viewer-layout)`.

### Changed

- `peerDependencies["@museumwnf/viewer-core"]` widened from `^1.16.0` to
  `^1.16.0 || ^2.0.0`. The next viewer-core major removes only the
  deprecated legacy project API (`PROJECT_ENTRIES`, `PROJECT_FAMILIES`,
  `projectFamily`, `projectName`, `useProjectName`), which this package
  does not use (confirmed by `git grep` over `src`/`tests`/`README.md`/
  `docs`), so the wider range is a safe, additive step ahead of that
  major landing.

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

### Fixed

- `RecordSheetView`'s related block: an outside reference's chip now shows
  the project's name (`useProjects().label(ref.project_id)`), falling back
  to the stub's `backward_compatibility` code only when `project_id` is
  absent — no longer the raw legacy `project_key`. `related_items` stubs
  have carried `project_id` since every data package republished
  2026-09-20 (inventory-app#1807).
  Fixes museumwithnofrontiers/inventory-app#1827.

### Removed

- `RecordView`'s citation no longer falls back to viewer-core's deprecated
  `projectName(record.project_key, t)` for a data package predating
  inventory-app#1727 phase 2 — no such package exists any more (every site
  republished 2026-09-20). The citation now reads only
  `useProjects().label(spec.citation.project ?? record.project_id)`,
  omitting the project name (rather than printing a legacy key) when
  `label()` returns null. viewer-layout no longer imports any of
  viewer-core's deprecated project API (`projectName`, `useProjectName`,
  `projectFamily`, `PROJECT_ENTRIES`, `PROJECT_FAMILIES`) — the
  precondition for viewer-core's next major.
  Fixes museumwithnofrontiers/inventory-app#1840.
  Part of museumwithnofrontiers/inventory-app#1727.

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
