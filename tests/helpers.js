import { useDataPackage, useSiteConfig } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'

// The layout has no texts of its own any more: every `layout.*` entry comes
// from the application, which merges @museumwnf/viewer-i18n with its own file.
// These tests stand in for that application, so what they pass is what a real
// website's catalogue contains.
export const layoutTexts = {
  'layout.hyperlinks.label': 'Related links',
  'layout.language.label': 'Language',
  'layout.nav.label': 'Main navigation',
  'layout.nav.menu': 'Menu',
  'layout.nav.skipToContent': 'Skip to content',
  'layout.sponsors.label': 'Sponsors',
  // The entries the content components read, from viewer-i18n 1.7.0's
  // `core`, `catalogue` and `record` namespaces.
  'core.action.apply': 'Apply',
  'core.action.close': 'Close',
  'core.action.reset': 'Reset',
  'core.pagination.next': 'Next',
  'core.pagination.previous': 'Previous',
  'catalogue.pagination.first': 'First',
  'catalogue.pagination.go': 'Go',
  'catalogue.pagination.last': 'Last',
  'catalogue.pagination.page': 'Page',
  'record.action.hideShortDescription': 'Hide short description',
  'record.action.viewShortDescription': 'View short description',
  'record.citation.heading': 'Citation',
  // The source credit and the footer attribution (viewer-i18n 2.5.0's
  // `record.source` namespace, and `core.footer.legalNotice` — the address
  // `useSiteRights()`'s `termsUrl` falls back to without a rights block).
  'record.source.label': 'Source',
  'record.source.termsOfUse': 'Terms of use',
  'record.source.rightsHolder': 'Rights holder',
  'core.footer.legalNotice': 'Legal notice',
  'record.glossary.close': 'Close',
  'record.glossary.heading': 'Glossary',
  'record.glossary.tool': 'Glossary tool',
  'record.glossary.instructions': 'Enter the first letter(s) of the term you are looking for, then choose one of the options in the list.',
  'record.glossary.definition': 'Definition',
  'record.dynasty.heading': 'Dynasties',
  'record.media.photograph': 'Photograph',
  'record.sheet.credits': 'Credits',
  'record.sheet.languages': 'Languages',
  // viewer-i18n's `sheet` namespace, read by DynastyPopout.
  'sheet.field.alsoKnownAs': 'Also known as',
  'sheet.field.area': 'Area',
  'sheet.field.history': 'History',
  // PartnerMap entries (viewer-i18n 2.4.0+)
  'partner.map.map': 'Map',
  'partner.map.mapOf': 'Map of',
  'partner.info.about': 'About',
  'partner.info.contact': 'Contact',
  'partner.info.logo': 'Logo',
  'partner.info.addresses': 'Address(es)',
  'partner.info.phone': 'Phone',
  'partner.info.fax': 'Fax',
  'partner.nav.homepage': 'Go to the Partner’s homepage',
  'partner.item.objectsInSite': 'object(s) in this site',
  'partner.action.readMore': 'Read more',
  'partner.action.viewObjects': 'View objects',
  'partner.map.openInOpenStreetMap': 'Open in OpenStreetMap',
}

export function globalWithI18n(options = {}) {
  const i18n = createI18n({
    locale: options.locale ?? 'en',
    messages: { en: layoutTexts, ...options.messages },
  })
  return { global: { plugins: [i18n] } }
}

/**
 * `site.origin` and the loaded fixture package's `manifest.rights` are the
 * two facts `sourceUrl()`/`useSiteRights()` read — and both live in module
 * state a whole test file shares (`useSiteConfig()`'s `current`,
 * `useDataPackage()`'s `manifest`), the same fixture every other test in the
 * file mounts against. Call this to set both for one test, and call the
 * function it returns — in a `finally`, so a failed assertion still runs it
 * — to put the fixture back the way every other test expects to find it.
 */
export function withSiteRights({
  origin = 'https://example.org',
  rights = { rights_holder: 'Fixture Museum', terms_url: 'https://example.org/terms', attribution: 'Images © Fixture Museum.' },
} = {}) {
  const config = useSiteConfig()
  const pkg = useDataPackage()
  const previousSite = config.site
  const previousRights = pkg.manifest.rights
  config.site = { ...(config.site ?? {}), origin }
  pkg.manifest.rights = rights
  return () => {
    config.site = previousSite
    pkg.manifest.rights = previousRights
  }
}
