<script setup>
// PageShell, driven by a website's `dataset.config.js` instead of a shell a
// site writes by hand. Seven shells (70 to 227 lines) rebuilt the same menu,
// header/footer link lists, search submit, banner caption and section-title
// map; the exhibitions on top of that bucketed `exhibition.logos` into
// header logos and sponsor groups. This reads it all from `useSiteConfig()`
// and `useSection()` (both `@museumwnf/viewer-core`) instead.
//
// Config contract (also documented in the README's "Site shell" section):
//
//   config.navigation = {
//     languages,                                                // offered languages — PageShell's `languages` prop; already there today
//     links: [{ section, label, to | href, external, when, children }],   // the main nav; `label` an entry name, resolved through t(), or `text`, a label in the page's words; `children` (or a function returning them) drops down;
//                                                                // `to` a route name/location, resolved through the router; `href` used as-is;
//                                                                // `when(ctx)` — ctx is `{ section, locale }` — optionally hides the entry
//                                                                // (a link whose visibility depends on loaded data closes over its own
//                                                                // composable's ref instead, as the DXA shells already do for "hasTimeline")
//     headerLinks: [{ label, href | to, external }],
//     footerLinks: [{ label, href | to, external }],
//     sectionTitles: { [section]: entryName },                  // the banner title over a section page, when `banner.title` sets none
//     search: { route, key, placeholder, submitLabel, empty },  // `route`/`key` (default 'q') power the submit; `placeholder`/`submitLabel`
//                                                                // are entry names; `empty` is written for a blank submit (legacy's 'all-objects')
//     placement: 'after-banner' | 'before-banner' | (ctx) => …,  // where the menu goes (PageShell's `navigationPlacement`)
//     socialLinks: [{ label, href, icon }],                     // the footer's social-network icons (`mwnfSocialLinks`)
//   }
//   config.chrome = { [path]: url }               // the site's own chrome files, `import.meta.glob` over theme/assets/ (src/chrome.js)
//   config.brand = { logo, alt }                  // the header mark as an image: `logo` a chrome key or a URL, `alt` an entry name
//   config.footer = { rightsHolder }              // `true` adds the package's rights-holder attribution under the footer line
//   config.logos = {
//     header: (logo) => boolean,                    // which of the `logos` prop (below) show beside the brand
//     sponsorGroups: (logos, t) => [{ title, sponsors }],  // the rest, bucketed for AppSponsors
//     headerTitle: entryName,                       // the header logo group's heading; shown only when `header()` kept at least one
//   }
//   config.banner = {
//     variant, image, imageAlt, caption, captionLabel, title, subtitle, headline, enter, strapline,
//     // each value a string (an entry name, resolved through t(); `image` and `enter` still pass through
//     // this the same way — t() returns an unknown key unchanged — since a URL or a { label, href }
//     // object is not itself a text) or a function of `{ section, locale, t }`.
//   }
//
// `logos` (prop, below) is the page's own data — an exhibition's logo list —
// since it is not something a static site config can declare; `config.logos`
// only says how to bucket it. `header`/`sponsorGroups` are a predicate and a
// mapper over the *same* list, so its items are already in PageShell's logo
// shape (`{ image, alt, href? }`), with whatever extra field (a legacy
// `category_id`, a `visible` flag) the site's own functions bucket by —
// turning legacy's `image_url`/`labels` into that shape is the site's own
// composable's job, same as it is for `AppSponsors`' `{ name, href?, logo? }`.
//
// A computed PageShell prop is only set here when the config actually
// configures it, so a field the config leaves out stays whatever the caller
// passed PageShell through `$attrs` — the rule islamicart's and carpets'
// hand-written shells already followed ("PageShell receives these links
// after $attrs, so they take precedence").
//
// Slots: `#brand` is the header lockup (PageShell's `#header-brand`, so the
// computed header links/search/logos still render beside it — the full
// `#header` override would drop them); `#banner` replaces AppBanner's
// content; `#notice` renders before the routed content, `#after-content`
// after it — the two places a site currently adds something of its own next
// to the router-view (water-in-islam's dismissible `PopupLogo`, for one).
// `#header`, `#navigation`, `#hyperlinks`, `#sponsors`, `#footer` pass
// straight through to PageShell, guarded the same way PageShell itself
// guards them, so an unused slot does not blank out its section's
// props-driven content.
//
// The footer is legacy's on every site unless the site says otherwise:
// MWNF's five portal links and "© Museum With No Frontiers (MWNF)
// 2004–<year>". `config.navigation.footerLinks` replaces the links, a
// `footer-text` the caller passes replaces the line. The rights holder's
// attribution and terms-of-use link (`useSiteRights()`, the package's
// `manifest.rights`) are opt-in, `config.footer.rightsHolder: true`:
// legacy printed no such line (inventory-app#2233, Pascal 2026-10-20).
import { computed, useAttrs } from 'vue'

defineOptions({
  // Disable automatic attribute fallthrough so the root's raw navigation
  // attributes (config.navigation.headerLinks/footerLinks with entry name
  // labels) don't reach PageShell untranslated; only our computed props
  // (translated via t()) get through.
  inheritAttrs: false,
})
import { mwnfLinks, useI18n, useSection, useSiteConfig, useSiteRights } from '@museumwnf/viewer-core'
import { useRouter } from 'vue-router'
import PageShell from '../PageShell.vue'
import { chromeSource } from '../chrome.js'

const props = defineProps({
  // Overrides/extends `useSiteConfig()` — set only the keys you need. Mainly
  // for a test, which mounts this component on its own rather than through
  // `createViewer`; a page may also use it for a one-off variation without
  // touching `dataset.config.js`.
  config: { type: Object, default: null },
  // The page's own logo list (e.g. `exhibition.logos`), bucketed by `config.logos`.
  logos: { type: Array, default: () => [] },
})

const { t, locale } = useI18n()
const router = useRouter()
const section = useSection()
const siteConfig = useSiteConfig()

const config = computed(() => ({ ...siteConfig, ...(props.config ?? {}) }))
const nav = computed(() => config.value.navigation ?? {})
const logosConfig = computed(() => config.value.logos ?? null)
const bannerConfig = computed(() => config.value.banner ?? null)

// ── The footer: legacy's links and line, the attribution only on request ──

const attrs = useAttrs()
const LEGACY_FOOTER_LINKS = [
  { label: 'core.footer.aboutMwnf', href: mwnfLinks.about, external: true },
  { label: 'core.footer.contact', href: mwnfLinks.contact, external: true },
  { label: 'core.footer.legalNotice', href: mwnfLinks.legalNotice, external: true },
  { label: 'core.footer.credits', href: mwnfLinks.credits, external: true },
  { label: 'core.footer.cookies', href: mwnfLinks.cookies, external: true },
]
const currentYear = new Date().getFullYear()
const footerText = computed(() => (
  attrs.footerText === undefined && attrs['footer-text'] === undefined
    ? `${t('core.footer.copyright')} 2004–${currentYear}`
    : null
))

const rights = useSiteRights()
const footerAttribution = computed(() => {
  if (config.value.footer?.rightsHolder !== true || !rights.holder) return null
  return { label: t('record.source.rightsHolder'), text: rights.attribution ?? rights.holder, termsHref: rights.termsUrl, termsLabel: t('record.source.termsOfUse') }
})

// ── Links: `href` used as-is, `to` resolved through the router; a nav entry
// also carries whether it is the current section's ─────────────────────────

function resolveHref(link) {
  if (link.href) return link.href
  if (link.to) return router.resolve(link.to).href
  return ''
}

function isShown(link) {
  return typeof link.when === 'function'
    ? Boolean(link.when({ section: section.value, locale: locale.value }))
    : true
}

// `text` is a label already in the page's words (a name from the data
// package); `label` an entry name. `children`, an array or a function
// returning one, drops down under the entry.
function toLink(link, { active = false } = {}) {
  const out = { label: link.text ?? t(link.label), href: resolveHref(link), external: Boolean(link.external) }
  if (active) out.active = link.section === section.value
  const children = typeof link.children === 'function' ? link.children() : link.children
  if (Array.isArray(children) && children.length) out.children = children.filter(isShown).map((child) => toLink(child))
  return out
}

const navLinks = computed(() => (
  Array.isArray(nav.value.links)
    ? nav.value.links.filter(isShown).map((link) => toLink(link, { active: true }))
    : null
))
const headerLinks = computed(() => (
  Array.isArray(nav.value.headerLinks) ? nav.value.headerLinks.map((link) => toLink(link)) : null
))
const footerLinks = computed(() => (
  Array.isArray(nav.value.footerLinks) ? nav.value.footerLinks : LEGACY_FOOTER_LINKS
).map((link) => toLink(link)))

// ── Search: the header's form, and where a submit goes ──────────────────────

const search = computed(() => {
  const s = nav.value.search
  if (!s) return null
  return { placeholder: s.placeholder ? t(s.placeholder) : '', submitLabel: s.submitLabel ? t(s.submitLabel) : '' }
})

function onSearch(term) {
  const s = nav.value.search
  if (!s?.route) return
  router.push({ name: s.route, query: { [s.key ?? 'q']: term || s.empty || '' } })
}

// ── The banner: every field optional, `title` falling back to `sectionTitles` ─

function resolveBannerField(value) {
  if (typeof value === 'function') return value({ section: section.value, locale: locale.value, t })
  if (typeof value === 'string') return t(value)
  return value
}

const bannerTitle = computed(() => {
  const explicit = bannerConfig.value ? resolveBannerField(bannerConfig.value.title) : ''
  if (explicit) return explicit
  const entry = nav.value.sectionTitles?.[section.value]
  return entry ? t(entry) : ''
})

const BANNER_FIELDS = [
  'variant', 'image', 'imageAlt', 'caption', 'captionLabel', 'subtitle', 'headline', 'enter', 'strapline',
]
const bannerProps = computed(() => {
  const out = {}
  if (bannerTitle.value) out.bannerTitle = bannerTitle.value
  for (const key of BANNER_FIELDS) {
    const resolved = bannerConfig.value ? resolveBannerField(bannerConfig.value[key]) : ''
    if (resolved) out[`banner${key[0].toUpperCase()}${key.slice(1)}`] = resolved
  }
  return out
})

// ── The mark, the menu's place and the social links ────────────────────────

const brandLogo = computed(() => {
  const brand = config.value.brand
  const src = brand ? chromeSource(config.value.chrome, brand.logo) : null
  return src ? { src, alt: brand.alt ? t(brand.alt) : '' } : null
})

const placement = computed(() => {
  const value = nav.value.placement
  return typeof value === 'function' ? value({ section: section.value, locale: locale.value }) : value
})

const socialLinks = computed(() => (Array.isArray(nav.value.socialLinks) ? nav.value.socialLinks : null))

// ── Logos: the page's own list, bucketed by the site's mapper ───────────────

const headerLogos = computed(() => {
  const header = logosConfig.value?.header
  return typeof header === 'function' ? props.logos.filter(header) : null
})
const headerLogosTitle = computed(() => {
  const entry = logosConfig.value?.headerTitle
  return entry && headerLogos.value?.length ? t(entry) : ''
})
const sponsorGroups = computed(() => {
  const mapper = logosConfig.value?.sponsorGroups
  return typeof mapper === 'function' ? mapper(props.logos, t) : null
})

// ── What actually reaches PageShell: only the keys the config (or `logos`)
// configures, so an unconfigured value is left to `$attrs` ──────────────────

const shellProps = computed(() => {
  const out = { ...bannerProps.value }
  if (Array.isArray(nav.value.languages)) out.languages = nav.value.languages
  if (navLinks.value) out.navLinks = navLinks.value
  if (headerLinks.value) out.headerLinks = headerLinks.value
  if (footerLinks.value) out.footerLinks = footerLinks.value
  if (footerText.value) out.footerText = footerText.value
  if (search.value) out.search = search.value
  if (headerLogos.value) {
    out.headerLogos = headerLogos.value
    if (headerLogosTitle.value) out.headerLogosTitle = headerLogosTitle.value
  }
  if (sponsorGroups.value) out.sponsorGroups = sponsorGroups.value
  if (brandLogo.value) out.headerBrandLogo = brandLogo.value
  if (placement.value) out.navigationPlacement = placement.value
  if (socialLinks.value) out.footerSocial = socialLinks.value
  if (footerAttribution.value) {
    out.footerAttributionLabel = footerAttribution.value.label
    out.footerAttributionText = footerAttribution.value.text
    out.footerTermsHref = footerAttribution.value.termsHref
    out.footerTermsLabel = footerAttribution.value.termsLabel
  }
  return out
})
</script>

<template>
  <!-- Pass $attrs first, then computed props override them: the root spreads
       config.navigation onto this component, and translated links must reach
       PageShell, not raw entry names. Later bindings win in the merge. -->
  <PageShell v-bind="{ ...$attrs, ...shellProps }" @search="onSearch">
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <template v-if="$slots.brand" #header-brand><slot name="brand" /></template>
    <template v-if="$slots.banner" #banner><slot name="banner" /></template>
    <template v-if="$slots.navigation" #navigation><slot name="navigation" /></template>
    <template v-if="$slots.default || $slots.notice || $slots['after-content']" #default>
      <slot name="notice" />
      <slot />
      <slot name="after-content" />
    </template>
    <template v-if="$slots.hyperlinks" #hyperlinks><slot name="hyperlinks" /></template>
    <template v-if="$slots.sponsors" #sponsors><slot name="sponsors" /></template>
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </PageShell>
</template>
