<script setup>
// Legacy travels.museumwnf.org's frame (header.include.php, footer.inc.php),
// for its Exhibition Trails: the "MWNF Travel" heading to the site's home,
// the menu — Exhibition Trails (its theme and its countries), MWNF Books,
// MWNF Portal — the language switcher, the page, the footer. The tours,
// guides, agencies, partners and booking pages legacy's menu also listed are
// not rebuilt (inventory-app#2515), so their entries are not drawn.
//
// `navigation.languages` is `languageLabels(languages)`; `travels.books`
// may name the Publications site's address (the trails' book links give it
// otherwise), `travels.portal` the portal's.
import { computed } from 'vue'
import { mwnfLinks, useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { useTravels } from './data.js'
import { inMenu } from './rules.js'

const props = defineProps({
  languages: { type: Array, default: () => [] },
  language: { type: String, required: true },
})
const emit = defineEmits(['update:language'])

const { t } = useI18n()
const config = useSiteConfig()
const data = useTravels()

const portal = computed(() => config.travels?.portal ?? mwnfLinks.portal)
// The Publications site, where the trails' books are.
const books = computed(() => {
  if (config.travels?.books) return config.travels.books
  const url = data.trails.value.find((trail) => trail.publications?.[0]?.url)?.publications[0].url
  return url ? url.slice(0, url.indexOf('#')) || url : 'https://books.museumwnf.org'
})

const countries = computed(() => [...new Set(data.listed.value.filter((trail) => inMenu(trail)).map((trail) => trail.country_id).filter(Boolean))]
  .map((id) => ({ id, name: data.countryName(id) }))
  .sort((a, b) => a.name.localeCompare(b.name)))
const year = new Date().getFullYear()

const footerLinks = [
  { label: 'core.footer.aboutMwnf', href: mwnfLinks.about },
  { label: 'core.footer.contact', href: mwnfLinks.contact },
  { label: 'core.footer.legalNotice', href: mwnfLinks.legalNotice },
  { label: 'core.footer.credits', href: mwnfLinks.credits },
  { label: 'core.footer.cookies', href: mwnfLinks.cookies },
]
const multilingual = computed(() => props.languages.length > 1)
</script>

<template>
  <div class="mwnf-travels">
    <header class="mwnf-travels-header">
      <RouterLink class="mwnf-travels-header__title" :to="{ name: 'home' }" :title="t('travels.header.homeTip')">{{ t('travels.header.title') }}</RouterLink>
      <nav class="mwnf-travels-menu" :aria-label="t('layout.nav.label')">
        <ul class="mwnf-travels-menu__list">
          <li class="mwnf-travels-menu__entry">
            <RouterLink :to="{ name: 'home' }">{{ t('travels.nav.exhibitionTrails') }}</RouterLink>
            <ul class="mwnf-travels-menu__children">
              <li v-for="project in data.projects.value" :key="project.code">
                <RouterLink :to="{ name: 'trails', query: { project: project.code } }">{{ data.projectName(project.id) || project.code }}</RouterLink>
              </li>
              <li v-for="country in countries" :key="country.id">
                <RouterLink :to="{ name: 'trails', query: { country: country.id } }">{{ country.name }}</RouterLink>
              </li>
            </ul>
          </li>
          <li class="mwnf-travels-menu__entry"><a :href="books">{{ t('travels.header.books') }}</a></li>
          <li class="mwnf-travels-menu__entry"><a :href="portal" :title="t('travels.header.portalTip')">{{ t('travels.header.portal') }}</a></li>
        </ul>
        <select
          v-if="multilingual"
          class="mwnf-travels-menu__language"
          :value="language"
          :aria-label="t('layout.language.label')"
          @change="emit('update:language', $event.target.value)"
        >
          <option v-for="option in languages" :key="option.code" :value="option.code">{{ option.label }}</option>
        </select>
      </nav>
    </header>
    <main class="mwnf-travels-main">
      <slot />
    </main>
    <footer class="mwnf-travels-footer">
      <template v-for="link in footerLinks" :key="link.label">
        <a :href="link.href">{{ t(link.label) }}</a>&nbsp;|&nbsp;
      </template>{{ t('core.footer.copyright') }} 2004–{{ year }}
    </footer>
  </div>
</template>
