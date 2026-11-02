<script setup>
import { computed } from 'vue'
import { md } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// The standalone family's Sponsors page, legacy's atrium_sponsor_detail.php:
// the way back, the list's heading, then one row a sponsor, its name, web
// address (linked as legacy's `http://<web>`), remarks in italics and logo.
// A list whose rows have a `label` (Baroque Art's local sponsors: the country
// on a group's first row) gets legacy's label column too; the rows are the
// website's (its src/legacy/sponsors.json), never the inventory's.
//
//   rows: [{ label?, region?, name, web, remarks, logo }]   // label, remarks: Markdown; logo: a URL
//   back: [{ label, to | href } | { label, history: true }]
const props = defineProps({
  heading: { type: String, default: '' },
  rows: { type: Array, default: () => [] },
  back: { type: Array, default: () => [] },
})

const labels = computed(() => props.rows.some((row) => row.label !== undefined))
const sponsors = computed(() =>
  props.rows.map((row) => ({
    ...row,
    labelHtml: row.label ? md(row.label) : '',
    remarksHtml: row.remarks ? md(row.remarks) : '',
  })),
)
</script>

<template>
  <div class="mwnf-standalone-sp" :class="{ 'mwnf-standalone-sp--labels': labels }">
    <p class="mwnf-standalone-item__back mwnf-standalone-sp__back">
      <template v-for="link in back" :key="link.label">
        <button v-if="link.history" type="button" class="mwnf-standalone-item__back-link" @click="$router.back()">{{ link.label }}</button>
        <SmartLink v-else class="mwnf-standalone-item__back-link" :to="link.to" :href="link.href">{{ link.label }}</SmartLink>
      </template>
    </p>
    <h3 v-if="heading" class="mwnf-standalone-sp__heading">{{ heading }}</h3>

    <div v-for="(sponsor, index) in sponsors" :key="index" class="mwnf-standalone-sp__row">
      <div v-if="labels" class="mwnf-standalone-sp__label" v-html="sponsor.labelHtml"></div>
      <div class="mwnf-standalone-sp__text">
        <p v-if="sponsor.region">{{ sponsor.region }}</p>
        <p v-if="sponsor.name">{{ sponsor.name }}</p>
        <p v-if="sponsor.web"><a :href="`http://${sponsor.web}`" target="_blank" rel="noopener">{{ sponsor.web }}</a></p>
        <div v-if="sponsor.remarksHtml" class="mwnf-standalone-sp__remarks" v-html="sponsor.remarksHtml"></div>
      </div>
      <div class="mwnf-standalone-sp__logo">
        <p v-if="sponsor.logo"><img :src="sponsor.logo" :alt="sponsor.name" /></p>
      </div>
    </div>
  </div>
</template>
