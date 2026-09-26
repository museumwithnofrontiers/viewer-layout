<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import CatalogueResultsView from '../../views/CatalogueResultsView.vue'
import { themes, tile } from './data.js'

// Legacy's ThemeGallery: every record a theme touches, as one grid.
// `tree.itemsUnder` walks the theme and its sub-themes' picture selections
// depth-first; a picture's own id is not a catalogue id, so each resolves
// through its (possibly absent) parent, and only the resolvable parents make
// the scope. Legacy's per-sub-theme dropdown is not reproduced: a second
// filter over the same data was not worth adding back.
const { pictureById, pictureParent, romanFor, themeByRouteId, themeText, themeTree } = themes
const route = useRoute()
const { t, locale } = useI18n()

const theme = computed(() => themeByRouteId(route.params.id))

const itemIds = computed(() => {
  const ids = new Set()
  if (!theme.value) return ids
  for (const pictureId of themeTree.itemsUnder(theme.value.id)) {
    const parent = pictureParent(pictureById.value.get(pictureId))
    if (parent) ids.add(parent.id)
  }
  return ids
})

const title = computed(() => themeText(theme.value, locale.value).title ?? theme.value?.internal_name ?? '')

const spec = computed(() => ({
  entity: 'items',
  scope: (record) => itemIds.value.has(record.id),
  // Undated first, as legacy's own `sortChronological(out, { undated: 'first' })` did.
  sort: { undated: 'first' },
  variant: 'grid',
  recordRoute: 'item',
  record: (item, helpers) => tile(item, helpers.t),
  actionLabel: 'catalogue.results.seeDatabaseEntry',
  empty: 'exhibition.theme.noRecords',
  summary: () => [{
    label: t('exhibition.theme.galleryLabel'),
    value: `${t('exhibition.theme.romanLabel')} ${romanFor(theme.value?.display_order ?? 1)} | ${title.value}`,
  }],
}))
</script>

<template>
  <CatalogueResultsView v-if="theme" :spec="spec" class="mwnf-dxa-theme-gallery">
    <template #before>
      <BackLink />
    </template>
    <template #empty>
      <p class="mwnf-dxa-theme-gallery__empty">{{ t('exhibition.theme.noRecords') }}</p>
    </template>
  </CatalogueResultsView>

  <div v-else class="mwnf-loader">{{ t('exhibition.theme.notInExhibition') }}</div>
</template>
