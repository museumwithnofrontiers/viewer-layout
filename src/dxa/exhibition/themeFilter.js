import { computed } from 'vue'
import { themes } from './data.js'

// Legacy's theme filter on an exhibition's collection pages
// (exhibitions-client CollectionSearch.vue, CollectionResults.vue,
// inventory-app#2379): "All Themes", the About theme unnumbered, then each
// theme with its numeral; once a theme is chosen, its sub-themes. A theme or
// sub-theme is addressed by its legacy theme id (`?theme=1&subtheme=3`), so a
// legacy link still resolves; it holds the records its pictures show, its
// sub-themes' included.
const { aboutTheme, listedThemes, pictureById, pictureParent, romanFor, themeText, themeTree } = themes

/** A theme node's legacy id: the last segment of its key (`…:theme:50:1` → `1`). */
export function legacyThemeId(node) {
  return String(node?.backward_compatibility ?? '').split(':').pop()
}

export function useThemeFilter(locale) {
  const title = (node) => themeText(node, locale.value).title ?? node?.internal_name ?? ''

  const themeOptions = computed(() => [
    ...(aboutTheme.value ? [{ value: legacyThemeId(aboutTheme.value), label: title(aboutTheme.value), node: aboutTheme.value }] : []),
    ...listedThemes.value.map((node) => ({
      value: legacyThemeId(node),
      label: `${romanFor(node.display_order)}. ${title(node)}`,
      node,
    })),
  ])

  const themeFor = (value) => themeOptions.value.find((option) => option.value === String(value))?.node ?? null

  function subThemeOptions(themeValue) {
    return (themeFor(themeValue)?.sub_themes ?? []).map((node, index) => ({
      value: legacyThemeId(node),
      label: `${index + 1}. ${title(node)}`,
      node,
    }))
  }

  function itemIdsUnder(node) {
    const ids = new Set()
    if (!node) return ids
    for (const pictureId of themeTree.itemsUnder(node.id)) {
      const parent = pictureParent(pictureById.value.get(pictureId))
      if (parent) ids.add(parent.id)
    }
    return ids
  }

  /** The records the chosen theme (or its chosen sub-theme) holds; null when none is chosen. */
  function scopeFor(themeValue, subValue) {
    const theme = themeFor(themeValue)
    if (!theme) return null
    const sub = subValue ? subThemeOptions(themeValue).find((option) => option.value === String(subValue))?.node : null
    return itemIdsUnder(sub ?? theme)
  }

  return { themeOptions, subThemeOptions, scopeFor, title }
}
