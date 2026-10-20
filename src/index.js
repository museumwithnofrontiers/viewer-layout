import './styles/layout.css'

export { default as PageShell } from './PageShell.vue'
export { default as AppHeader } from './sections/AppHeader.vue'
export { default as AppBanner } from './sections/AppBanner.vue'
export { default as AppNavigation } from './sections/AppNavigation.vue'
export { default as AppContent } from './sections/AppContent.vue'
export { default as AppHyperlinks } from './sections/AppHyperlinks.vue'
export { default as AppSponsors } from './sections/AppSponsors.vue'
export { default as AppFooter } from './sections/AppFooter.vue'

// A site's chrome files and the footer's social links (inventory-app#2233).
export { chromeAsset, chromePicture, chromeSource } from './chrome.js'
export { mwnfSocialLinks } from './sections/socialLinks.js'

// The content components are also reachable from here; `/content` is the
// entry point for code that wants them without the shell.
//
// The composed views are NOT re-exported here, on purpose. They read the
// records and the engine from `@museumwnf/viewer-core` itself, whose entry
// point carries `.vue` files; a website's test runner loads this package
// natively and inlines viewer-core, so an import of viewer-core from this
// entry point would be resolved by Node and fail on the first `.vue`. A
// website that names the composed views imports `@museumwnf/viewer-layout/views`
// and inlines this package in its test runner too (the template does both).
//
// `SiteShell` (`src/components`) has the same constraint — it reads
// `useSiteConfig()`/`useSection()` from `@museumwnf/viewer-core` — so it is
// exported from `@museumwnf/viewer-layout/components` instead, not from here.
export * from './content/index.js'
