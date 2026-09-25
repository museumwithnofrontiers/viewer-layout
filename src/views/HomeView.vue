<script setup>
import { computed } from 'vue'
import {
  I18nText, renderInline, renderPlain, useDataPackage, useFeaturedRecord, useI18n, useSiteConfig,
} from '@museumwnf/viewer-core'
import SectionCards from '../content/SectionCards.vue'
import FeaturedRecord from '../content/FeaturedRecord.vue'

// The landing page, composed: a welcome, the sections as cards, one record on
// display. What a website declares is `config.home` (or the same as props):
//
//   home: {
//     title: 'mysite.home.title',            // entry names; the view resolves them
//     intro: 'mysite.home.intro',            // rendered as Markdown
//     cards: [{ title, description, action, to | href }],
//     featured: {
//       entity: 'items',
//       heading: 'mysite.home.itemOnDisplay',
//       action: 'core.action.viewDetails',
//       route: 'item',                        // the record's route name (params: { id })
//       eyebrow: 'type',                      // a record field, or (record, text) => string
//       meta: ['location', 'dates'],          // translation fields, or (record, text) => [string]
//       seed: 42,                             // optional: a deterministic pick
//       filter: (record) => boolean,          // optional: the records the pick may show (viewer-core 2.2.0)
//     },
//     panels: true,                           // optional: the welcome and the record in .mwnf-panel boxes
//   }
//
// Every text is an entry name written out in the declaration, resolved here
// through `t`, so a translator's file changes the page and the check that
// every name resolves can read the names. The pick is viewer-core's
// `useFeaturedRecord`; the grid and the spotlight are the content
// components. A website that wants another landing page registers its own
// component on the `home` route instead.

const props = defineProps({
  title: { type: String, default: '' },
  intro: { type: String, default: '' },
  cards: { type: Array, default: null },
  featured: { type: Object, default: null },
  panels: { type: Boolean, default: null },
})

const { t, locale } = useI18n()
const config = useSiteConfig()
const home = computed(() => ({ ...(config.home ?? {}), ...pick(props) }))

function pick(source) {
  const out = {}
  for (const key of ['title', 'intro', 'cards', 'featured', 'panels']) {
    if (source[key] != null && source[key] !== '') out[key] = source[key]
  }
  return out
}

const cards = computed(() =>
  (home.value.cards ?? []).map((card) => ({
    ...card,
    title: card.title ? t(card.title) : '',
    description: card.description ? t(card.description) : '',
    action: card.action ? t(card.action) : '',
  })),
)

// ── The record on display ──────────────────────────────────────────────────

const featuredSpec = computed(() => home.value.featured ?? null)
const entity = featuredSpec.value?.entity ?? ''
const pkg = useDataPackage()
if (entity) pkg.loadTranslations(entity, 'en')
const featured = entity
  ? useFeaturedRecord(entity, {
    seed: featuredSpec.value?.seed, images: featuredSpec.value?.images ?? 'images', filter: featuredSpec.value?.filter,
  })
  : computed(() => null)

const text = computed(() => (featured.value ? pkg.tr(entity, featured.value.id, locale.value, 'en') : {}))

function read(field, record, textOf) {
  if (typeof field === 'function') return field(record, textOf)
  if (typeof field !== 'string' || !field) return ''
  return textOf[field] ?? record[field] ?? ''
}

const featuredProps = computed(() => {
  const record = featured.value
  const spec = featuredSpec.value
  if (!record || !spec) return null
  const name = text.value.name ?? record.internal_name ?? record.id
  const meta = typeof spec.meta === 'function' ? spec.meta(record, text.value) : (spec.meta ?? []).map((f) => read(f, record, text.value))
  const images = spec.images ?? 'images'
  return {
    heading: spec.heading ? t(spec.heading) : '',
    image: record[images]?.[0]?.url ?? '',
    imageAlt: renderPlain(String(name)),
    eyebrow: String(read(spec.eyebrow, record, text.value) ?? ''),
    name: renderInline(String(name)),
    meta: meta.filter(Boolean).map(String),
    action: spec.action ? t(spec.action) : '',
    to: typeof spec.to === 'function' ? spec.to(record) : { name: spec.route ?? 'item', params: { id: record.id } },
  }
})
</script>

<template>
  <section class="mwnf-home">
    <header v-if="home.title || home.intro" class="mwnf-home__welcome" :class="{ 'mwnf-panel': home.panels }">
      <h1 v-if="home.title" class="mwnf-home__title">{{ t(home.title) }}</h1>
      <I18nText v-if="home.intro" tag="div" class="mwnf-home__intro" :keypath="home.intro" />
    </header>
    <slot name="before" />
    <SectionCards :cards="cards" />
    <slot />
    <FeaturedRecord v-if="featuredProps" v-bind="featuredProps" :class="{ 'mwnf-panel': home.panels }" />
    <slot name="after" />
  </section>
</template>
