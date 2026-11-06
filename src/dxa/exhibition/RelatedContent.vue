<script setup>
import { computed } from 'vue'
import { renderBlock, renderInline, useI18n } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import { chromeImage, countryLabelFromCode, relatedContent } from './data.js'

// The exhibition's related content as legacy's RelatedContent
// (exhibitions-client, inventory-app#2379): Back, then a centred column half
// the page wide at 20px, each category's name bold over its entries, an
// entry's parts on lines of their own: its reading, the partner and where it
// is, its title (a link to its document or address), the address alone when
// it has no title, "authors, kind", the description.
//
// The four category names are the one thing the package cannot supply:
// legacy read them from `mwnf3_thematic_gallery.related_content_category`,
// which the importer does not carry, so `related_content.json` ships
// `category_id` alone; every exhibition has the same four.
const CATEGORY_NAMES = {
  1: 'exhibition.relatedCategory.furtherReading',
  2: 'exhibition.relatedCategory.mwnfContent',
  3: 'exhibition.relatedCategory.partnerContent',
  4: 'exhibition.relatedCategory.otherContent',
}
const CATEGORY_ORDER = [1, 2, 3, 4]

const { t, locale } = useI18n()
const text = (map) => map?.[locale.value] ?? map?.en ?? ''

function entryView(entry) {
  const document = entry.document_path ? chromeImage(entry.document_path, 'hi_res') : ''
  return {
    reading: renderBlock(text(entry.texts) || entry.further_reading || ''),
    partner: entry.partner_name ? renderInline(entry.partner_name) : '',
    place: [entry.entity_location, entry.entity_country ? countryLabelFromCode(entry.entity_country) : ''].filter(Boolean).join(', '),
    title: text(entry.titles) ? renderInline(text(entry.titles)) : '',
    href: document || entry.url || '',
    byline: [entry.authors, entry.type_resource].filter(Boolean).map((part) => renderInline(part)).join(', '),
    description: text(entry.descriptions) ? renderInline(text(entry.descriptions)) : '',
  }
}

const groups = computed(() => {
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
    id,
    heading: CATEGORY_NAMES[id] ?? 'exhibition.relatedCategory.unknown',
    entries: [...byCategory.get(id)]
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map(entryView),
  }))
})
</script>

<template>
  <div class="mwnf-dxa-related-page">
    <BackLink />
    <div class="mwnf-dxa-related-page__container">
      <p v-if="!groups.length">{{ t('exhibition.related.notAvailable') }}</p>
      <div v-for="group in groups" :key="group.id" class="mwnf-dxa-related-page__category">
        <div class="mwnf-dxa-related-page__heading">{{ t(group.heading) }}</div>
        <div v-for="(entry, index) in group.entries" :key="index" class="mwnf-dxa-related-page__entry">
          <div v-if="entry.reading" v-html="entry.reading"></div>
          <div v-if="entry.partner" v-html="entry.partner"></div>
          <div v-if="entry.place">{{ entry.place }}</div>
          <div v-if="entry.title">
            <a v-if="entry.href" :href="entry.href" target="_blank" rel="noopener" v-html="entry.title"></a>
            <span v-else v-html="entry.title"></span>
          </div>
          <div v-else-if="entry.href"><a :href="entry.href" target="_blank" rel="noopener">{{ entry.href }}</a></div>
          <div v-if="entry.byline" v-html="entry.byline"></div>
          <div v-if="entry.description" v-html="entry.description"></div>
        </div>
      </div>
    </div>
  </div>
</template>
