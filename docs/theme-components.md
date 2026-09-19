# Theme components — decomposition rationale

museumwithnofrontiers/inventory-app#1729 (epic), story #1811 (package side).
Read this before porting a third exhibition's `Theme.vue` in the M5 wave, or
before migrating the-use-of-colours-in-art / water-in-islam off their own
copies (a follow-up story — this one is package side only).

## The file being decomposed

`Theme.vue` (453 lines, byte-identical between the-use-of-colours-in-art and
water-in-islam on `origin/main` at the time of writing) is already an
`EssayView` spec (`themeSpecs.js`) for the shell: breadcrumb-free, a two-tier
heading, the quote/body/glossary, previous/next over the tree, a sub-theme
tab strip. What it does NOT get from `EssayView`'s default `items`/`panel`
machinery — and therefore builds itself, in the `panel`, `thumbnails` and
`after-body` slots — is everything to do with **pictures**:

- A theme's curated selections (`themes.json`'s `pictures[]`) are not
  catalogue records. Several curated crops can share one parent item, and a
  picture's parent may not even be a member of the exhibition (`to: null` /
  "not in this exhibition" in the components below) — `EssayView`'s
  `items`/`panel.variants` machinery addresses one record per id and cannot
  express this.
- `theme_item_related` rows are directional and can name **another theme**
  (`themes.json`'s `related[].theme_id`) — a picture in "Colour and Light"
  can be related to one in "Colour and Religion". A picture shows its
  targets ("Related items") and, reciprocally, whoever points at it ("…
  related to").
- A "show related works" toggle keeps the thumbnail strip to the curator's
  primary selection, hiding anything that is itself a related-link target
  until the visitor asks for more.

That is the whole 453 lines minus the parts `EssayView` already covers
(header, body, glossary, tour nav, sub-theme tabs, `SourceCredit`) and the
two-tier heading text, which stays the site's own `#header` slot override —
it reads the *owning theme's* Roman numeral, not the node's own, a detail
`EssayView`'s `numbering` option cannot express for a themes-package tree
(see `themeSpecs.js`'s own comment; out of scope here, feeds this view via
the composables epic #1730).

## The two seams

### `PictureGallery` (`src/content/PictureGallery.vue`)

Fills `EssayView`'s `panel` + `thumbnails` slots: the selected picture large,
its fields, a link to the parent record (or the "not in this exhibition"
message), the thumbnail strip, and the related-works toggle. Owns its own
`showAll` UI state; the *selected* picture is a `v-model:selected-id`
because the website needs the same id to drive `PictureNarrative` below it.

### `PictureNarrative` (`src/content/PictureNarrative.vue`)

Fills the `after-body` slot: the selected picture's own curated text
(`contextual_description` — distinct from the node's own `presentation`
`EssayView`'s body already renders) plus the "Related items" / "… related
to" blocks. Takes the **one selected picture**, not the whole list — it has
nothing to compute across siblings, unlike `PictureGallery`, which needs
every picture in the node to draw the strip.

Two components, not one, because they fill two different `EssayView` slots
(`panel`+`thumbnails` vs `after-body`) that a site is free to arrange
differently — sharinghistory's own theme-shaped pages put comparable
justification content in `after-body` too, with no panel at all — and
because `PictureNarrative` alone is reusable anywhere a single curated
picture's relations need rendering (an item sheet's own "seen in this
exhibition" block, say) without dragging in the strip/toggle machinery.

## Why cross-theme related links are the website's job, not the component's

`PictureGallery`/`PictureNarrative` never look up a picture by id — every
picture object they render, including a related link's *target*, arrives
already resolved as a plain `{ id, image, imageAlt, name, detail, to }`
value. This is deliberate: resolving `related[].picture_item_id` back into a
displayable picture requires walking the **whole** theme tree (a cross-theme
target is not in the current node's `pictures[]`), which only the website
can do — it already holds that whole-tree index for exactly this reason
(`themes.js`'s `pictureById`, a `useCollectionTree`-driven map keyed by every
picture id in the package, theme or sub-theme). Keeping that walk in the
website, not the component, also means the component's contract stays the
one other content components already use (`RecordGrid`/`RecordList`/
`RelatedRecords`'s pre-resolved `{ id, image, name, meta, to }` rows) —
no new "resolver function as prop" mechanism, no viewer-core dependency
beyond what `EssayView` already needs.

Concretely, a website builds, once per node, an array shaped:

```js
pictures.value = node.pictures.map((raw) => ({
  id: raw.picture_item_id,
  image: raw.image_url,
  imageAlt: /* plain text */,
  name: /* inline HTML, parent's label or the picture's own */,
  imageCaption: pictureText(node, raw).image_caption,
  detail: itemDetailString(pictureParent(raw)),
  fields: [ /* alsoKnownAs, artist_names, dates — panel-only */ ],
  to: pictureParent(raw) ? itemRoute(pictureParent(raw)) : null,
  related: (raw.related ?? []).map((link) => ({
    picture: pictureView(pictureById.value.get(link.picture_item_id)), // ANY theme
    text: link.descriptions?.[locale] ?? link.descriptions?.en ?? '',
  })),
  backRelated: /* every OTHER picture anywhere in the tree whose own
                  `related` names this id — precomputed once per node
                  the same way, scanning `pictureById` instead of just
                  `node.pictures` */,
}))
```

`related`/`backRelated` are pre-resolved for **every** picture in the node
up front (not lazily per selection) so `PictureGallery`'s toggle-hide check
(`backRelated.length`) works for the whole strip, not just the selected
picture.

This also **fixes a gap in the current `Theme.vue`**: its own `relatedTo` map
is scoped to `pictures.value` (the current node only — `inNode.has(...)`), so
a cross-theme related link is silently dropped today. The epic calls out
"related-picture links including cross-theme ones" as part of what the
decomposition must cover; the fix is a website-side change (index against
the whole tree, not the current node) enabled by, but not contained in,
these two components.

## Theme cover images

`themes.json`'s `cover_picture_item_id` is not rendered anywhere in
`Theme.vue` today, on either site — it isn't part of this file's 453 lines
and this decomposition does not add it. It belongs to the *theme list* page
instead (`Themes.vue`, already built on shared `SectionCards`, whose
`'accordion'` variant carries no image slot — see that file's own comment).
Should a future exhibition want a cover crop on its theme list,
`SectionCards`'s `'rows'`/`'covers'` variants already accept an `image` per
card; no change to `PictureGallery`/`PictureNarrative` is needed either way,
since neither renders a theme-level image, only a picture-level one.

## What a site's `Theme.vue` shrinks to

Everything `themeSpecs.js`/`themes.js`/`useThemePresentation.js`/
`useExhibitionData.js` already resolve stays exactly where it is (composables
epic #1730, out of scope here). What moves out of `Theme.vue`'s `<template>`
is the `panel`, `thumbnails` and `after-body` slot content — roughly 230 of
the file's 453 lines — replaced with:

```html
<template #panel>
  <PictureGallery
    :pictures="pictures"
    v-model:selected-id="selectedId"
  />
</template>

<template #after-body>
  <PictureNarrative
    v-if="!aboutMode"
    :picture="selected"
    :contextual-description="contextualDescription"
    @select="(id) => (selectedId = id)"
  />
</template>
```

`Theme.vue` keeps: the `#header` two-tier heading, the `#navigation`
previous/next + sub-theme strip (still site-specific per `EssayView`'s own
doc comment — a themes tree numbers every top-level theme "I" without this
override), the `#after` about-mode forward link, and the `pictures`/
`selectedId`/`contextualDescription` computeds themselves (unchanged data
resolution, now feeding components instead of a local template). The site
migration itself — deleting `Theme.vue`'s panel/thumbnails/after-body markup
on both sites and wiring the two components above — is a follow-up story per
site, not part of this package-side story.
