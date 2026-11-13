<script setup>
// Legacy's Exhibition Trails page (travel_et_home.php): "Exhibition Trails",
// the breadcrumbs, "About" and its text, then a country select and a theme
// select, each opening the trails of the choice (travel_et_trail.php?cid= /
// ?tid=). The theme select leaves out the projects legacy hid (GPA).
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@museumwnf/viewer-core'
import Crumbs from './Crumbs.vue'
import { useTravels } from './data.js'

const { t } = useI18n()
const router = useRouter()
const data = useTravels()

const countries = computed(() => [...new Set(data.listed.value.map((trail) => trail.country_id).filter(Boolean))]
  .map((id) => ({ id, name: data.countryName(id) }))
  .sort((a, b) => a.name.localeCompare(b.name)))

function open(key, value) {
  if (value) router.push({ name: 'trails', query: { [key]: value } })
}
</script>

<template>
  <div class="mwnf-travels-home">
    <div class="mwnf-travels-home__banner">
      <h1 class="mwnf-travels-home__heading">{{ t('travels.nav.exhibitionTrails') }}</h1>
      <Crumbs :crumbs="[{ text: t('travels.nav.home'), to: { name: 'home' } }, { text: t('travels.nav.exhibitionTrails') }]" />
    </div>
    <div class="mwnf-travels-home__about">
      <p class="mwnf-travels-home__about-heading">{{ t('travels.home.about') }}</p>
      <p>{{ t('travels.home.intro') }}</p>
    </div>
    <div class="mwnf-travels-home__selects">
      <label class="mwnf-travels-home__select">
        <span>{{ t('travels.home.country') }}</span>
        <select @change="open('country', $event.target.value)">
          <option value="">{{ t('travels.home.selectCountry') }}</option>
          <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
        </select>
      </label>
      <label class="mwnf-travels-home__select">
        <span>{{ t('travels.home.theme') }}</span>
        <select @change="open('project', $event.target.value)">
          <option value="">{{ t('travels.home.selectTheme') }}</option>
          <option v-for="project in data.projects.value" :key="project.code" :value="project.code">{{ data.projectName(project.id) || project.code }}</option>
        </select>
      </label>
    </div>
  </div>
</template>
