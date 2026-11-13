<script setup>
// Legacy's list of trails (travel_et_trail.php): a country's (`?country=`,
// legacy's `cid`) or a theme's (`?project=`, legacy's `tid`). The heading —
// the country's or the project's name — the breadcrumbs, "About" and its
// text, then every trail: its book's cover, its title and subtitle, on a
// theme's list its country, its region, "Available in" (the book's
// languages), "Main locations visited" and "Virtual visit in", a link to the
// trail's page in each language it has texts in.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import Crumbs from './Crumbs.vue'
import { useTravels } from './data.js'
import { locationsOfTrail, mainLocations, projectCode } from './rules.js'

const { t } = useI18n()
const route = useRoute()
// Every language of the site: a trail's "Virtual visit in" lists those it has texts in.
const config = useSiteConfig()
const siteLanguages = () => config.languages ?? []
const data = useTravels({ languagesToLoad: siteLanguages })

const country = computed(() => (typeof route.query.country === 'string' ? route.query.country : ''))
const project = computed(() => (typeof route.query.project === 'string' ? route.query.project : ''))
const projectEntry = computed(() => data.projects.value.find((row) => row.code === project.value) ?? null)

const heading = computed(() => (country.value
  ? data.countryName(country.value)
  : projectEntry.value ? data.projectName(projectEntry.value.id) || projectEntry.value.code : ''))

const rows = computed(() => data.listed.value
  .filter((trail) => (country.value ? trail.country_id === country.value : projectCode(trail) === project.value))
  .map((trail) => {
    const own = data.text(trail)
    const book = trail.publications?.[0]
    return {
      id: trail.id,
      cover: trail.images?.[0]?.url ?? null,
      title: own.title ?? '',
      subtitle: own.extra?.subtitle ?? '',
      country: data.countryName(trail.country_id),
      region: own.extra?.region_territory ?? '',
      available: Object.keys(book?.titles ?? {}).map((code) => data.languageName(code)).sort((a, b) => a.localeCompare(b)),
      locations: mainLocations(locationsOfTrail(data.collections.value, trail).map((location) => data.text(location).title)),
      visits: data.textLanguages(trail, siteLanguages())
        .map((code) => ({ code, label: data.languageName(code) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    }
  }))
</script>

<template>
  <div class="mwnf-travels-trails">
    <div class="mwnf-travels-banner">
      <h1 class="mwnf-travels-banner__heading">{{ heading }}</h1>
      <Crumbs :crumbs="[{ text: t('travels.nav.home'), to: { name: 'home' } }, { text: t('travels.nav.exhibitionTrails'), to: { name: 'home' } }, { text: heading }]" />
      <div class="mwnf-travels-banner__about">
        <p class="mwnf-travels-banner__about-heading">{{ t('travels.home.about') }}</p>
        <p v-if="country">{{ t('travels.list.countryIntro') }} {{ heading }}.</p>
        <p v-else>{{ t('travels.list.themeIntro') }}</p>
      </div>
    </div>
    <div v-for="row in rows" :key="row.id" class="mwnf-travels-trails__row">
      <div class="mwnf-travels-trails__cover">
        <img v-if="row.cover" :src="row.cover" alt="" loading="lazy">
      </div>
      <div class="mwnf-travels-trails__text">
        <h2 v-if="row.title" class="mwnf-travels-trails__title">{{ row.title }}</h2>
        <p><strong v-if="row.subtitle">{{ row.subtitle }}</strong></p>
        <p v-if="!country && row.country"><b>{{ t('travels.trail.country') }}:</b>&nbsp;&nbsp;{{ row.country }}</p>
        <p v-if="row.region"><b>{{ t('travels.trail.region') }}:</b>&nbsp;{{ row.region }}</p>
        <p v-if="row.available.length"><b>{{ t('travels.trail.availableIn') }}:</b>&nbsp;&nbsp;{{ row.available.join(', ') }}</p>
        <p v-if="row.locations.length"><b>{{ t('travels.trail.mainLocations') }}:</b>&nbsp;{{ row.locations.join(', ') }}</p>
        <p v-if="row.visits.length" class="mwnf-travels-trails__visit">
          <b>{{ t('travels.trail.virtualVisit') }}:</b>&nbsp;
          <template v-for="visit in row.visits" :key="visit.code">
            <RouterLink :to="{ name: 'trail', params: { id: row.id }, query: { lang: visit.code } }">{{ visit.label }}&nbsp;&gt;&gt;</RouterLink>&nbsp;&nbsp;
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
