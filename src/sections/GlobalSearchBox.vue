<script setup>
import { ref } from 'vue'
import { useGlobalSearch, useI18n, useLocale } from '@museumwnf/viewer-core'

// The global search's box (inventory-app M15, ADR 005). It renders only when
// the site sets `globalSearch` in its dataset.config.js, and sends the visitor
// to the search site with the text, the page's language and the site's own
// slug, as viewer-core's `globalSearchUrl()` builds it. AppHeader shows it in
// its tools; a site with a header of its own places it where it wants.
const { enabled, url } = useGlobalSearch()
const { t } = useI18n()
const locale = useLocale()
const term = ref('')

function submit() {
  const href = url(term.value, locale.value)
  if (href) window.location.assign(href)
}
</script>

<template>
  <form v-if="enabled" class="mwnf-global-search mwnf-header__search" role="search" @submit.prevent="submit">
    <input
      v-model="term"
      class="mwnf-global-search__input mwnf-header__search-input"
      type="search"
      :placeholder="t('layout.globalSearch.label')"
      :aria-label="t('layout.globalSearch.label')"
    />
    <button class="mwnf-global-search__submit mwnf-header__search-submit" type="submit">
      {{ t('layout.globalSearch.submit') }}
    </button>
  </form>
</template>
