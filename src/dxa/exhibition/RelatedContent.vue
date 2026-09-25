<script setup>
import { useI18n } from '@museumwnf/viewer-core'
import LinkListView from '../../views/LinkListView.vue'
import { chromeImage, countryLabelFromCode, mdStrip, relatedContent } from './data.js'

// Legacy's RelatedContent: the exhibition's reading list, grouped by
// category and ordered inside each group, as a LinkListView spec. The view
// renders `label`/`note` as plain text, so a text entry's Markdown (its
// italics, its paragraph breaks) reaches the page stripped and run together;
// no hook of the view keeps it.
//
// The four category names are the one thing the package cannot supply:
// legacy read them from `mwnf3_thematic_gallery.related_content_category`,
// which the importer does not carry, so `related_content.json` ships
// `category_id` alone. Every exhibition has the same four, named from the
// shared `exhibition.relatedCategory.*` entries.
const CATEGORY_NAMES = {
  1: 'exhibition.relatedCategory.furtherReading',
  2: 'exhibition.relatedCategory.mwnfContent',
  3: 'exhibition.relatedCategory.partnerContent',
  4: 'exhibition.relatedCategory.otherContent',
}

// Legacy's own order for the four groups: the order its API answered in.
const CATEGORY_ORDER = [1, 2, 3, 4]

const { t, locale } = useI18n()

function text(map) {
  return map?.[locale.value] ?? map?.en ?? ''
}

function href(entry) {
  if (entry.document_path) return chromeImage(entry.document_path, 'hi_res')
  return entry.url ?? null
}

// A text entry (no title) reads as its own bibliography; anything else names
// itself, falling back to its link when even that is missing.
function labelFor(entry) {
  if (text(entry.titles)) return mdStrip(text(entry.titles))
  if (text(entry.texts)) return mdStrip(text(entry.texts))
  return href(entry) || t('exhibition.relatedCategory.unknown')
}

// What a titled entry carries beyond its label — location, authors, a short
// description — on one line under it; a text entry has said it all already.
function noteFor(entry) {
  if (!text(entry.titles)) return ''
  const parts = []
  if (entry.entity_location || entry.entity_country) {
    parts.push([entry.entity_location, entry.entity_country ? countryLabelFromCode(entry.entity_country) : '']
      .filter(Boolean).join(', '))
  }
  if (entry.authors || entry.type_resource) parts.push([entry.authors, entry.type_resource].filter(Boolean).join(', '))
  if (text(entry.descriptions)) parts.push(mdStrip(text(entry.descriptions)))
  if (entry.further_reading) parts.push(mdStrip(entry.further_reading))
  return parts.join(' — ')
}

function groups() {
  const byCategory = new Map()
  for (const entry of relatedContent.value ?? []) {
    const bucket = byCategory.get(entry.category_id)
    if (bucket) bucket.push(entry)
    else byCategory.set(entry.category_id, [entry])
  }
  const ids = [
    ...CATEGORY_ORDER.filter((id) => byCategory.has(id)),
    ...[...byCategory.keys()].filter((id) => !CATEGORY_ORDER.includes(id)).sort(),
  ]
  return ids.map((id) => ({
    heading: CATEGORY_NAMES[id] ?? 'exhibition.relatedCategory.unknown',
    links: [...byCategory.get(id)]
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((entry) => ({ label: labelFor(entry), href: href(entry) ?? undefined, note: noteFor(entry) || undefined })),
  }))
}

const spec = {
  groups,
  empty: 'exhibition.related.notAvailable',
  // A fixed destination, not "the page before": Home is the one address
  // every visitor can reach back to.
  back: { label: 'core.action.back', to: { name: 'home' } },
}
</script>

<template>
  <LinkListView :spec="spec" class="mwnf-dxa-related" />
</template>
