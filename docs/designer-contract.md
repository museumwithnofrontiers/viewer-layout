# Designer contract

Who edits what in `@museumwnf/viewer-layout` and the websites built on it, and
how a site reaches beyond what a prop or token already exposes. This is not a
new mechanism — every rule below is the separation already present in the
code; this page only writes it down. The full technical reference for every
prop and slot lives in the [README](../README.md); the scannable, slot-first
version of the same facts is [`slot-catalogue.md`](./slot-catalogue.md).

## The four roles

### 1. Components maintainer — this package's `.vue` files

Owns every `.vue` file of the package — `PageShell.vue` at the package root,
`components/SiteShell.vue`, the seven `sections/App*.vue` shell pieces, the
`content/*.vue` building blocks, the `views/*.vue` composed pages, and the
DXA family pages under `dxa/gallery/` and `dxa/exhibition/`. Where a new one
goes is [below](#where-a-new-component-goes).

These files carry markup, props, slots and behaviour — never presentation:
there is **no `<style>` block** anywhere under
`src/{content,sections,views,components,dxa}`. A change here
should never need to touch a colour, a size or a spacing value; those are a
token's job (role 2). This is deliberate and load-bearing, not an accident of
the current file set — it is what makes roles 1 and 2 separable without
touching the same file.

There is also **no component-swap or registry mechanism**: no
`provide`/`inject`/`defineAsyncComponent`/`registerComponent`/
`componentRegistry` anywhere in this package for substituting a shared
component with a site's own. `SiteShell` wraps `PageShell` rather than
forking it; a composed view a site's page does not fit is not overridden —
the site writes its own component on the same content components instead
(see the decision ladder below). Building such a registry is explicitly out
of scope for this contract (epic #1732) — the wrap-or-write-your-own pattern
already used by every site today is what gets documented, not an idealised
alternative.

### 2. Tokens / CSS maintainer — this package's stylesheets

Owns four files, all shipped by this package and none of them a `.vue`
file:

- `src/styles/layout.css` — the shell/chrome: header, banner, navigation,
  footer.
- `src/styles/dxa.css` — the DXA family pages under `src/dxa/`, and nothing
  else: a rule a generic component needs belongs in `content.css`.
- `src/styles/content.css` — the content components, plus the `.mwnf-*`
  utility classes (`.mwnf-panel`, `.mwnf-heading`, `.mwnf-form-table`,
  `.mwnf-button`, `.mwnf-select`, `.mwnf-back-bar`, `.mwnf-chip`,
  `.mwnf-popout`, `.mwnf-loader`, `.mwnf-link` — see the README's "Content
  classes" table) that a site's own views may use directly.
- `src/tokens.reference.css` — a **documentation-only** catalogue of every
  `--mwnf-*` custom property this package reads, each line commented out
  with its neutral fallback. It is not consumed at runtime by this package
  itself (`layout.css`/`content.css` reference `var(--mwnf-x, fallback)`
  directly); it exists to be copied into a site as `theme/tokens.css`,
  uncommented, and filled in.

### 3. Site designer — a site repo, not this package

Everything under a site's own `theme/` folder and its `dataset.config.js`
chrome keys:

- `theme/tokens.css` — the site's copy of `tokens.reference.css`, real
  values. Sibling of `src/` at the repo root (confirmed in
  `website-template`), loaded first in `main.js`, right after
  `@museumwnf/viewer-layout/style.css`.
- `theme/overrides.css` — the free-form escape hatch, loaded immediately
  after `theme/tokens.css` and ahead of `src/styles/site.css`.
  `website-template` ships it as one comment: *"keep it empty until a need
  cannot be expressed with a token."*
- `src/styles/site.css` — the site's **own** content styles (the palette and
  building blocks its own `src/views/` reference), loaded last. Kept apart
  from `theme/tokens.css` on purpose: tokens are read by
  `@museumwnf/viewer-layout`, this file only by the site's own views.
- `dataset.config.js`'s `navigation`, `logos` and `banner` keys, read by
  `SiteShell` — the menu, header/footer link lists, search submit, banner
  fields and image, and the page's own logo list bucketed into header logos
  and sponsor groups. Full contract in
  [`slot-catalogue.md`](./slot-catalogue.md#siteshell).
- The site's own `src/SiteShell.vue` — a thin wrapper around this package's
  `SiteShell` (confirmed: `website-template`'s is ~30 lines; every real site
  checked for epic #1732 was 24–143 lines), filling only the `#brand` slot
  and a `footer-text`/`header-home` prop or two. **This is the one place a
  site's own `<style scoped>` block is expected** — the brand lockup is the
  site's own markup, not a shared component, so the "no `<style>` in
  components" rule (role 1) does not apply to it.

### 4. Translator

- The site's own `locales/<lang>.json` files. Local wins — the only merge
  rule: a site overloads any entry the shared dictionary carries.
- The shared [`@museumwnf/viewer-i18n`](https://github.com/museumwithnofrontiers/viewer-i18n)
  dictionary every site receives (`core`, `layout`, `record`, `catalogue`,
  `partner`, `timeline`, `exhibition`, … namespaces).

## How to customise: the decision ladder

Try each step in order; stop at the first one that expresses what the site
needs.

1. **Token.** Change a value in `theme/tokens.css`. Covers colour, font,
   spacing, radius, size for everything that value drives — the broadest,
   cheapest change, and the one every other step falls back to when it
   leaves something unset.
2. **`theme/overrides.css`.** A rule a token can't express — a one-off
   selector, a layout tweak local to this site. Free-form CSS, loaded after
   tokens, ahead of the site's own `site.css`.
3. **A slot.** The page is a composed view (or `PageShell`/`SiteShell`) and
   it already exposes a slot for the piece that needs to change — replace or
   wrap the default content for just that one page. See
   [`slot-catalogue.md`](./slot-catalogue.md) for the full list, per view,
   with the slot props each one passes.
4. **A site's own view.** No slot fits the page's shape. Import the content
   components directly from `@museumwnf/viewer-layout/content` and write a
   page on them, registered on the site's own route — the same pattern
   islamicart's `ArtIntroEntrance.vue` uses today (a plain local route and
   view importing `TextPageView`/`SectionCards`, no shared source touched).
   This is the escape hatch every composed view leaves open on purpose; it
   is not a fork of this package.

## Where a new component goes

When step 4 of the ladder turns out to be needed on more than one site, the
page's pieces move into the packages. The platform's
[architecture reference](https://github.com/museumwithnofrontiers/inventory-app/issues/1510) says where, for every package; for
this one:

| Layer | Folder (entry point) | What belongs there |
| --- | --- | --- |
| Building blocks | `content/` (`/content`, and the package root with `PageShell` and `sections/`) | A small visual component used as it is wherever the thing appears, fed by its props — a plain view-model built by viewer-core or by the site. No spec, no route of its own. |
| Composed views | `views/` (`/views`), `components/` (`/components`) | A page skeleton driven by a spec the site declares, with slots the site fills. |
| DXA family layer | `dxa/` (`/dxa`) | A page, a component or a style only the galleries or the exhibitions use, the same on every site of that family. The only place where whole pages are shared. |

Three rules decide between them:

1. **Promote into the lowest layer that fits.** A block comes before a
   composed view, and a composed view before a family page.
2. **A generic component never defaults to one family's texts.** A block or
   a composed view defaults to a shared entry (`core.*`, `record.*`,
   `partner.*`, …) or takes the entry name as a prop — never a `gallery.*`
   or `exhibition.*` entry.
3. **A component only the DXA family uses belongs under `dxa/`.**

`content/`, `sections/`, `views/` and `components/` never import from
`dxa/`; `dxa/` imports only what the other entries publish. A component
that moves keeps its old export as an alias until the websites have moved,
and a major release removes the alias.

A page that is one site's own stays in that site — a standalone product
(islamicart, baroqueart, sharinghistory) shares blocks and composed views
with the others, never pages.

## Cross-check: `website-template`

Verified against `website-template`'s `main.js`, `theme/`, and
`src/dataset.config.js` (`main` branch):

- `theme/` sits at the repo root, sibling to `src/`, exactly as documented
  above.
- `main.js`'s import order is `@museumwnf/viewer-layout/style.css` →
  `../theme/tokens.css` → `../theme/overrides.css` → `./styles/site.css` —
  matching this contract exactly.
- `dataset.config.js` declares `navigation.links`/`.languages` and leaves
  `logos`/`banner`/`headerLinks`/`footerLinks`/`search` unset — the template
  only exercises part of `SiteShell`'s config contract; the rest is real and
  documented in `slot-catalogue.md`, just not demonstrated by the scaffold
  itself.
- `src/SiteShell.vue` wraps `@museumwnf/viewer-layout/components`'s
  `SiteShell`, fills `#brand` and a `footer-text`/`header-home` prop, and
  carries one small `<style scoped>` block for the brand lockup only — the
  role-3 exception noted above.

No discrepancy found between the template's actual scaffold and what this
contract documents.
