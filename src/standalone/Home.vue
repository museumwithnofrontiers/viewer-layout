<script setup>
import { computed, watch } from 'vue'
import { byId, loadEntities, useDataPackage, useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'
import TodayHighlight from './TodayHighlight.vue'
import TileGrid from './TileGrid.vue'
import { legacyHomeItemKey, pickForDay } from './chrome.js'

// A standalone site's home page content, under the banner and the menu the
// shell draws: legacy's two columns (`diaTemplates/leftLink.php` and
// `randomText.php`) — a column of links, and the record of the day — or,
// for a site whose home is a set of pictures (Sharing History's exhibitions),
// a tile grid. From `config.standalone.home`:
//
//   home: {
//     links: [{ label: entry, to | href, external, prefix: entry, italic, title: entry, gap }],
//     highlight: {
//       list: ['object;ISL;uk;Mus02;6;en*1', …],   // legacy's home_items_img.txt, in order
//       heading: entry, alsoKnownAs: entry, action: entry, route: 'item',
//     },
//     tiles: { caption: entry, items: [{ image, label: entry, to | href }] },
//   }
//
// The highlight is legacy's pick: the list's line for the day of the year,
// shown with the record's own first picture.
const props = defineProps({
  home: { type: Object, default: null },
})
const { t, locale } = useI18n()
const config = useSiteConfig()
const spec = computed(() => props.home ?? config.standalone?.home ?? {})

const links = computed(() => (spec.value.links ?? []).map((link) => ({
  ...link,
  label: t(link.label),
  prefix: link.prefix ? t(link.prefix) : '',
  title: link.title ? t(link.title) : undefined,
})))

// ── The record of the day ──────────────────────────────────────────────────

const highlight = computed(() => spec.value.highlight ?? null)
const pkg = useDataPackage()
if (highlight.value?.list?.length) {
  loadEntities(['items', 'countries'])
  watch(locale, (language) => {
    pkg.loadTranslations('items', language)
    pkg.loadTranslations('countries', language)
  }, { immediate: true })
}
const itemsByKey = byId('items', 'backward_compatibility')
// The day's line; a line whose record the package does not carry gives way
// to the next one, so the page never shows an empty highlight.
const record = computed(() => {
  const list = highlight.value?.list ?? []
  const start = list.indexOf(pickForDay(list))
  for (let step = 0; start >= 0 && step < list.length; step++) {
    const found = itemsByKey.value.get(legacyHomeItemKey(list[(start + step) % list.length]))
    if (found) return found
  }
  return null
})
const text = computed(() => (record.value ? pkg.tr('items', record.value.id, locale.value, 'en') : {}))
const country = computed(() => {
  const id = record.value?.country_id
  return id ? (pkg.tr('countries', id, locale.value, 'en').name ?? '') : ''
})
const to = computed(() => (record.value ? { name: highlight.value.route ?? 'item', params: { id: record.value.id } } : null))
</script>

<template>
  <div class="mwnf-standalone-home">
    <ul v-if="links.length" class="mwnf-standalone-home__links">
      <li v-for="link in links" :key="link.label" :class="{ 'mwnf-standalone-home__link--gap': link.gap }">
        <SmartLink :to="link.to" :href="link.href" :external="Boolean(link.external)" :title="link.title">
          <template v-if="link.prefix">{{ `${link.prefix} ` }}</template>
          <i v-if="link.italic">{{ link.label }}</i><template v-else>{{ link.label }}</template>
        </SmartLink>
      </li>
    </ul>
    <TodayHighlight
      v-if="highlight"
      :record="record"
      :text="text"
      :country="country"
      :to="to"
      :heading="highlight.heading ?? ''"
      :also-known-as="highlight.alsoKnownAs ?? ''"
      :action="highlight.action ?? ''"
    />
    <TileGrid v-if="spec.tiles" :caption="spec.tiles.caption ?? ''" :items="spec.tiles.items ?? []" />
    <slot />
  </div>
</template>
