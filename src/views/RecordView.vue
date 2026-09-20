<script setup>
import { computed, useSlots } from 'vue'
import { useRoute } from 'vue-router'
import {
  NotFoundView, byId, citation, entityRef, languageLabels, renderBlock, renderInline,
  renderPlain, sheetRows, sourceUrl, useDataPackage, useGlossaryPopup, useI18n, useProjects, useRecordSheet,
  useRelatedRecords,
} from '@museumwnf/viewer-core'
import GlossaryPopover from '../content/GlossaryPopover.vue'
import MediaGallery from '../content/MediaGallery.vue'
import RecordCredits from '../content/RecordCredits.vue'
import RecordLanguages from '../content/RecordLanguages.vue'
import RecordSheet from '../content/RecordSheet.vue'
import RelatedRecords from '../content/RelatedRecords.vue'
import SheetSection from '../content/SheetSection.vue'
import SmartLink from '../content/SmartLink.vue'
import SourceCredit from '../content/SourceCredit.vue'

// The record page, composed. The engine is viewer-core's — the record's
// language and loads, the glossary terms and the click on one, the field
// engine, the credits, the citation, the related records — and the parts are
// the content components; what a website declares is a spec, as route props:
//
//   {
//     entity: 'items',
//     translations: ['glossary'],                      // related entities loaded with the record
//     attribution: ['author', 'copy_editor'],          // credits read across languages when a row lacks them
//     fields: [{ key, label, value, render, when, join }],   // viewer-core's `sheetRows` spec; labels are entry names
//     sections: [{ key, label, value }],               // prose under the sheet, one SheetSection each
//     layout: 'table' | 'list',
//     shortDescription: 'short_description' | false,   // the field folded behind the toggle, after `shortDescriptionAfter`
//     media: (record, ctx) => [{ url, alt, caption, photographer }],   // default: the record's `images`
//     mediaVariant: '' | 'row',
//     credits: [{ field: 'author', label: 'sheet.field.preparedBy' }, …],
//     workingNumber: 'mwnf_reference',
//     citation: { project: 'ISL' | (record, ctx) => string, permalink: true | false | string } | false,
//     related: { variant: 'list' | 'grid', heading: 'record.related.items', record: (entry, ctx) => row } | false,
//     back: { label: 'record.action.backToResults', to | href },
//     title: (ctx) => inline HTML,                     // default: the record's name
//   }
//
// `fields` and `sections` may be functions of the context (a monument and an
// object read different fields on the standalone sites). Slots — `header`,
// `before-sheet`, `after-sheet`, `aside`, `source`, `related`, `after` —
// receive the context `{ record, text, language, languages, select, dir,
// glossary, ready, attribution, t, tr }` (`languages` and `select` so a
// `header` of the site's own can still offer the record's languages);
// `related` also receives `records` (the rows the spec made) and `outside`
// (the related records the package does not carry), so a website can
// surround the block with its own; a slot named after a `custom` or `link`
// row's key reaches the sheet. `source`, under the citation, defaults to
// `SourceCredit` — nothing unless the website declares `site.origin`.
// A website whose page is not this shape registers its own component instead.

const props = defineProps({
  spec: { type: Object, required: true },
  id: { type: String, required: true },
  /** Set by viewer-core when this view renders a `features.entities` route. */
  entity: { type: String, default: '' },
})

const { t, locale } = useI18n()
const pkg = useDataPackage()
const projects = useProjects()
const slots = useSlots()
const route = useRoute()

const entity = props.spec.entity ?? props.entity
const spec = computed(() => props.spec)
const records = entityRef(entity)
const index = byId(entity)
const record = computed(() => index.value.get(props.id) ?? null)
const loaded = computed(() => records.value !== null)

const {
  language, languages, dir, select, text, ready, terms, glossary, attribution,
} = useRecordSheet(record, {
  entity,
  translations: props.spec.translations ?? [],
  attribution: props.spec.attribution ?? [],
})
const languageEntries = computed(() => languageLabels(languages.value))

const { active, onClick, close } = useGlossaryPopup(terms)
const activeHtml = computed(() => (active.value ? renderBlock(active.value.definition, { breaks: true }) : ''))

const tr = (name, id) => pkg.tr(name, id, language.value, 'en')
const ctx = computed(() => ({
  record: record.value,
  text: text.value,
  language: language.value,
  languages: languageEntries.value,
  select,
  dir: dir.value,
  glossary: glossary.value,
  ready: ready.value,
  attribution: attribution.value,
  t,
  tr,
}))

// ── The sheet ──────────────────────────────────────────────────────────────

function resolveSpec(part) {
  const list = typeof part === 'function' ? part(ctx.value) : part
  return (list ?? []).map((field) => ({ ...field, label: field.label ? t(field.label) : '' }))
}

const rows = computed(() => (record.value ? sheetRows(resolveSpec(spec.value.fields), ctx.value) : []))
const sections = computed(() =>
  record.value
    ? sheetRows(resolveSpec(spec.value.sections).map((s) => ({ render: 'block', ...s })), ctx.value)
    : [],
)

const shortField = computed(() => (spec.value.shortDescription === false ? '' : spec.value.shortDescription ?? 'short_description'))
const shortDescription = computed(() => {
  const value = shortField.value ? text.value[shortField.value] : ''
  return value ? { html: renderBlock(String(value), { breaks: true, glossary: glossary.value }) } : null
})

const titleHtml = computed(() => {
  if (!record.value) return ''
  if (spec.value.title) return spec.value.title(ctx.value)
  const name = text.value.name ?? record.value.internal_name ?? record.value.id
  return renderInline(String(name), { glossary: glossary.value })
})

// ── Images ─────────────────────────────────────────────────────────────────

const images = computed(() => {
  if (!record.value) return []
  if (spec.value.media) return spec.value.media(record.value, ctx.value)
  const name = renderPlain(String(text.value.name ?? record.value.internal_name ?? ''))
  return (record.value.images ?? []).map((image) => ({
    url: image.url,
    alt: image.captions?.[language.value] ?? name,
    caption: image.captions?.[language.value] ?? image.captions?.en ?? '',
    photographer: image.photographer ?? '',
    copyright: image.copyright ?? '',
  }))
})

// ── Credits and citation ───────────────────────────────────────────────────

const DEFAULT_CREDITS = [
  { field: 'author', label: 'sheet.field.preparedBy' },
  { field: 'copy_editor', label: 'sheet.field.copyeditedBy' },
  { field: 'translator', label: 'sheet.field.translationBy' },
  { field: 'translation_copy_editor', label: 'sheet.field.translationCopyeditedBy' },
]

const credits = computed(() =>
  (spec.value.credits ?? DEFAULT_CREDITS)
    .map(({ field, label }) => ({ label: t(label), value: text.value[field] ?? attribution.value[field] ?? '' }))
    .filter((entry) => entry.value),
)

const workingNumber = computed(() => String(record.value?.[spec.value.workingNumber ?? 'mwnf_reference'] ?? ''))

const citationText = computed(() => {
  const s = spec.value.citation
  if (!record.value || s === false) return ''
  const projectId = typeof s?.project === 'function' ? null : (s?.project ?? record.value.project_id)
  const project = typeof s?.project === 'function'
    ? s.project(record.value, ctx.value)
    : projects.label(projectId)
  // `permalink: false` keeps disabling it; a string keeps winning; otherwise
  // (unset, or `true`) the address is the site's own — `sourceUrl` reads the
  // declared `site.origin`, so a site that has not declared one gets no
  // address rather than a browser-local guess that resolves nowhere once
  // copied out of the app.
  const permalink = s?.permalink === false
    ? undefined
    : typeof s?.permalink === 'string'
      ? s.permalink
      : sourceUrl(route) ?? undefined
  return citation({
    author: text.value.author ?? attribution.value.author,
    name: text.value.name ?? record.value.internal_name ?? '',
    project,
    permalink,
    inWord: t('record.citation.in'),
  })
})

// ── Related records ────────────────────────────────────────────────────────

const related = useRelatedRecords(record, { entity, language })
const relatedSpec = computed(() => (spec.value.related === false ? null : spec.value.related ?? {}))
const relatedRows = computed(() => {
  if (!relatedSpec.value) return []
  const make = relatedSpec.value.record ?? defaultRelated
  return related.value.inPackage.map((entry) => make(entry, ctx.value))
})
function defaultRelated({ record: other, justification }) {
  const name = tr(entity, other.id).name ?? other.internal_name ?? other.id
  return {
    id: other.id,
    image: other.images?.[0]?.url ?? '',
    imageAlt: renderPlain(String(name)),
    name: renderInline(String(name)),
    meta: justification ? [justification] : [],
    badge: other.type ?? '',
    to: { name: spec.value.route ?? (props.entity ? `${props.entity}-detail` : 'item'), params: { id: other.id } },
  }
}

// The slots that reach the sheet: every slot that is not this view's own.
const OWN_SLOTS = new Set(['header', 'before-sheet', 'after-sheet', 'aside', 'source', 'related', 'after', 'default'])
const rowSlots = computed(() => Object.keys(slots).filter((name) => !OWN_SLOTS.has(name)))
</script>

<template>
  <NotFoundView v-if="loaded && !record" />

  <article v-else-if="record" class="mwnf-record" @click="onClick">
    <slot name="header" v-bind="ctx">
      <SmartLink v-if="spec.back" class="mwnf-record__back" :to="spec.back.to" :href="spec.back.href">← {{ t(spec.back.label) }}</SmartLink>
      <RecordLanguages :languages="languageEntries" :language="language" @select="select" />
      <h1 class="mwnf-record__title" :dir="dir || undefined" v-html="titleHtml"></h1>
    </slot>

    <div class="mwnf-record__body">
      <div class="mwnf-record__main">
        <MediaGallery v-if="images.length" :images="images" :variant="spec.mediaVariant ?? ''" />
        <p v-if="!ready" class="mwnf-record__status">{{ t('core.status.loading') }}</p>

        <slot name="before-sheet" v-bind="ctx" />

        <RecordSheet
          :rows="rows"
          :layout="spec.layout ?? 'table'"
          :dir="dir"
          :short-description="shortDescription"
          :short-description-after="spec.shortDescriptionAfter ?? 'description'"
        >
          <template v-for="name in rowSlots" :key="name" #[name]="rowProps">
            <slot :name="name" v-bind="{ ...rowProps, ...ctx }" />
          </template>
        </RecordSheet>

        <SheetSection v-for="section in sections" :key="section.key" :heading="section.label" :html="section.html" :dir="dir" />

        <slot name="after-sheet" v-bind="ctx" />

        <RecordCredits
          :credits="credits"
          :working-number="workingNumber"
          :working-number-label="t('sheet.field.workingNumber')"
          :citation="citationText"
          :citation-heading="spec.citation?.heading ? t(spec.citation.heading) : ''"
        />

        <slot name="source" v-bind="ctx">
          <SourceCredit />
        </slot>

        <slot name="related" v-bind="{ ...ctx, records: relatedRows, outside: related.outside }">
          <RelatedRecords
            v-if="relatedSpec"
            :heading="t(relatedSpec.heading ?? 'record.related.items')"
            :records="relatedRows"
            :variant="relatedSpec.variant ?? 'list'"
            :action-label="relatedSpec.actionLabel ? t(relatedSpec.actionLabel) : ''"
          />
        </slot>
      </div>

      <aside v-if="$slots.aside" class="mwnf-record__aside"><slot name="aside" v-bind="ctx" /></aside>
    </div>

    <slot name="after" v-bind="ctx" />

    <GlossaryPopover :term="active" :html="activeHtml" :dir="dir" @close="close" />
  </article>

  <p v-else class="mwnf-record__status">{{ t('core.status.loading') }}</p>
</template>
