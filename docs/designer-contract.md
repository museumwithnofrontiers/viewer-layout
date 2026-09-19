# Designer contract

Who edits what in `@museumwnf/viewer-layout` and the websites built on it, and
how a site reaches beyond what a prop or token already exposes. This is not a
new mechanism — every rule below is the separation already present in the
code; this page only writes it down. The full technical reference for every
prop and slot lives in the [README](../README.md); the scannable, slot-first
version of the same facts is [`slot-catalogue.md`](./slot-catalogue.md).

## The four roles

### 1. Components maintainer — this package's `.vue` files

Owns every file under `src/{content,sections,views,components}` — `PageShell.vue`
at the package root, `components/SiteShell.vue`, the seven `sections/App*.vue`
shell pieces, the 25 `content/*.vue` building blocks, and the ten
`views/*.vue` composed pages.

These files carry markup, props, slots and behaviour — never presentation.
Confirmed by reading every one of them: **zero `<style>` blocks** anywhere
under `src/{content,sections,views,components}` on `main`. A change here
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

Owns three files, all shipped by this package and none of them a `.vue`
file:

- `src/styles/layout.css` — the shell/chrome: header, banner, navigation,
  footer.
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
