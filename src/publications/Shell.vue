<script setup>
// Legacy books.museumwnf.org's frame (App.vue, HeaderComponent.vue,
// FooterComponent.vue): the header — the MWNF logo to the portal, "MWNF
// BOOKS" to the home page, About, Contact and Home; the menu of categories;
// the search panel, open, folded by its chevron; the page; the portal's
// footer. Legacy's newsletter and social band (SocialComponent) belong to
// the portal and are not drawn here.
//
// The logo pictures are the site's chrome files (`legacy/logo-blue.png`,
// `legacy/logo-white.png`); the categories are `publications.categories`
// (legacy's by default); the footer is legacy's portal footer
// (`PUBLICATIONS_FOOTER`), or `publications.footer`.
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mwnfLinks, useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { chromeSource } from '../chrome.js'
import { categoriesOf, usePublications } from './data.js'
import { PUBLICATIONS_FOOTER } from './footer.js'
import { FORMATS, SEARCH_KEYS } from './rules.js'

defineProps({
  // What viewer-core hands every shell; the Publications site offers one
  // language, as legacy's pages did, so there is no switcher.
  languages: { type: Array, default: () => [] },
  language: { type: String, default: 'en' },
})

const { t } = useI18n()
const config = useSiteConfig()
const route = useRoute()
const router = useRouter()
const data = usePublications()

const asset = (path) => chromeSource(config.chrome, path)
const categories = computed(() => categoriesOf(config))
const footer = computed(() => config.publications?.footer ?? PUBLICATIONS_FOOTER)
const portal = computed(() => config.publications?.portal ?? mwnfLinks.portal)
const menuOpen = ref(false)

// ── The search panel ───────────────────────────────────────────────────────

const open = ref(true)
const form = reactive(Object.fromEntries(SEARCH_KEYS.map((key) => [key, ''])))

// The form shows the search the results page is showing.
watch(
  () => route.query,
  (query) => {
    if (route.name !== 'results') return
    for (const key of SEARCH_KEYS) form[key] = typeof query[key] === 'string' ? query[key] : ''
  },
  { immediate: true },
)

const alphabetical = (rows) => rows.sort((a, b) => a.label.localeCompare(b.label))
const editionsList = computed(() => data.editions.value ?? [])
const options = computed(() => ({
  language: alphabetical(
    [...new Set(editionsList.value.map((edition) => edition.language).filter(Boolean))]
      .map((code) => ({ value: code, label: data.languageName(code, 'en') })),
  ),
  country: alphabetical(
    [...new Set(data.publications.value.map((publication) => publication.country_id).filter(Boolean))]
      .map((id) => ({ value: id, label: data.countryName(id) })),
  ),
  subject: alphabetical(
    (data.tags.value ?? []).filter((tag) => tag.category === 'subject').map((tag) => ({ value: tag.id, label: tag.description ?? tag.internal_name })),
  ),
  type: alphabetical(FORMATS.map((format) => ({ value: format.value, label: t(format.label) }))),
  publisher: alphabetical(
    [...new Set(editionsList.value.map((edition) => edition.publisher).filter(Boolean))].map((name) => ({ value: name, label: name })),
  ),
}))

const SELECTS = ['language', 'country', 'subject', 'type', 'publisher']

function reset() {
  for (const key of SEARCH_KEYS) form[key] = ''
}

function submit() {
  const query = Object.fromEntries(SEARCH_KEYS.filter((key) => String(form[key]).trim() !== '').map((key) => [key, String(form[key]).trim()]))
  router.push({ name: 'results', query })
}
</script>

<template>
  <div class="mwnf-books">
    <header class="mwnf-books-header">
      <div class="mwnf-books-header__main">
        <div class="mwnf-books-header__logo">
          <a :href="portal"><img v-if="asset('legacy/logo-blue.png')" :src="asset('legacy/logo-blue.png')" alt=""></a>
        </div>
        <div class="mwnf-books-header__links">
          <RouterLink class="mwnf-books-header__slogan" :to="{ name: 'home' }">{{ t('publications.header.title') }}</RouterLink>
          <nav class="mwnf-books-header__nav">
            <a class="mwnf-books-header__item" :href="mwnfLinks.about" target="_blank">{{ t('publications.header.about') }}</a>
            <a class="mwnf-books-header__item" :href="mwnfLinks.contact" target="_blank">{{ t('publications.header.contact') }}</a>
            <RouterLink class="mwnf-books-header__item" :to="{ name: 'home' }">{{ t('publications.header.home') }}</RouterLink>
            <button
              type="button"
              class="mwnf-books-header__burger"
              :aria-expanded="menuOpen"
              :aria-label="t('layout.nav.menu')"
              @click="menuOpen = !menuOpen"
            >&#9776;</button>
          </nav>
        </div>
      </div>
      <nav class="mwnf-books-menu" :class="{ 'mwnf-books-menu--open': menuOpen }" :aria-label="t('layout.nav.label')">
        <div v-for="entry in categories" :key="entry.slug" class="mwnf-books-menu__item">
          <RouterLink :to="{ name: 'category', params: { category: entry.slug } }" @click="menuOpen = false">{{ t(entry.menu ?? entry.label) }}</RouterLink>
        </div>
      </nav>
      <div class="mwnf-books-search">
        <button
          type="button"
          class="mwnf-books-search__toggle"
          :aria-expanded="open"
          :aria-label="t('core.action.search')"
          @click="open = !open"
        >
          <span v-if="open" aria-hidden="true">&#8963;&#8963;</span>
          <span v-else aria-hidden="true">&#8964; &#9906; &#8964;</span>
        </button>
        <div v-if="open" class="mwnf-books-search__panel">
          <p class="mwnf-books-search__explanation">{{ t('publications.search.explanation') }}</p>
          <form class="mwnf-books-search__form" @submit.prevent="submit">
            <input v-model="form.title" class="mwnf-books-search__input" type="search" :placeholder="t('publications.search.title')" :aria-label="t('publications.search.title')">
            <input v-model="form.author" class="mwnf-books-search__input" type="search" :placeholder="t('publications.search.author')" :aria-label="t('publications.search.author')">
            <input v-model="form.isbn" class="mwnf-books-search__input" type="search" :placeholder="t('publications.search.isbn')" :aria-label="t('publications.search.isbn')">
            <select v-for="key in SELECTS" :key="key" v-model="form[key]" class="mwnf-books-search__input" :aria-label="t(`publications.search.${key}`)">
              <option value="">{{ t(`publications.search.${key}`) }}</option>
              <option v-for="option in options[key]" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <div class="mwnf-books-search__buttons">
              <button type="button" class="mwnf-books-search__button mwnf-books-search__button--reset" @click="reset">{{ t('publications.search.reset') }}</button>
              <button type="submit" class="mwnf-books-search__button">{{ t('publications.search.submit') }}</button>
            </div>
          </form>
        </div>
      </div>
    </header>

    <main class="mwnf-books-main">
      <slot />
    </main>

    <footer class="mwnf-books-footer">
      <div class="mwnf-books-footer__top">
        <div class="mwnf-books-footer__column mwnf-books-footer__brand">
          <img v-if="asset('legacy/logo-white.png')" :src="asset('legacy/logo-white.png')" alt="">
          <p>{{ t('publications.footer.slogan') }}</p>
        </div>
        <div v-for="column in footer.columns" :key="column.heading" class="mwnf-books-footer__column">
          <p class="mwnf-books-footer__heading">{{ t(column.heading) }}</p>
          <a v-for="link in column.links" :key="link.label" class="mwnf-books-footer__link" :href="link.href">{{ t(link.label) }}</a>
        </div>
      </div>
      <div class="mwnf-books-footer__bottom">
        <a v-for="link in footer.bottom" :key="link.label" class="mwnf-books-footer__bottom-link" :href="link.href">{{ t(link.label) }}</a>
      </div>
    </footer>
  </div>
</template>
