<script setup>
import { computed, useSlots } from 'vue'
import {
  NotFoundView, byId, loadEntities, mdInline, mdStrip, mwnfLinks, partnerView, useDataPackage, useI18n, useProjects,
} from '@museumwnf/viewer-core'
import DynastyList from '../content/DynastyList.vue'
import GlossaryTool from '../content/GlossaryTool.vue'
import OnDisplayIn from '../content/OnDisplayIn.vue'
import PartnerPanel from '../content/PartnerPanel.vue'
import RelatedMedia from '../content/RelatedMedia.vue'
import RelatedRecords from '../content/RelatedRecords.vue'
import TimelineLookup from '../content/TimelineLookup.vue'
import RecordView from './RecordView.vue'

// The DXA gallery/exhibition item sheet, composed. `RecordView` is still the
// engine — the field sheet, the credits, the citation, the related records,
// the whole slot contract. What sets a DXA item sheet apart from any other
// `RecordView` use is two things: the per-language-build 404 a `dataGetter`
// gates (see below, unchanged from viewer-layout 2.14.0's first cut), and a
// handful of content blocks carpets/amulets and the-use-of-colours-in-art/
// water-in-islam each wrote byte-identical within their own pair and
// near-identical across the two — the source-database/collection block, the
// holding-museum link, and the related-content block (the outside
// references, the Artistic Introduction link, the timeline popout, the
// glossary tool, the dynasty popouts, the audio/video section, the
// on-display-in block, the related-database and overall-database links, the
// print action). Inventory-app#1728 asks for those blocks here, driven by
// `spec` and by data a site passes in — never by a project UUID, a site
// name or a legacy key this view would have to own — so a site's future
// `ItemSheet.vue` is a `spec` (usually built in its own `composables/
// sheet.js`), an `id`, and at most one slot of its own (nothing here spans
// the `header` slot — a back link and the record's languages, with no title
// of its own — a site still fills that one directly). Every block below
// still renders through a slot with default content: a site that fills
// `before-sheet`/`museum`/`related` itself keeps full control of that block;
// one that does not gets this view's own rendering of it.
//
// `dataGetter`, when a website passes one, is a language-subset lookup — a
// function of `id` returning the record when this build carries it, and a
// falsy value when it does not (an exhibition's own per-build `itemById.get`,
// unchanged). Supplied and it says no: the sheet renders `NotFoundView`
// before `RecordView` ever mounts — `RecordView`'s own "not in the package"
// gate does not catch this, because it reads the whole package regardless of
// which languages this build shipped. Omitted — a gallery, with no such
// split — the sheet is a bare `RecordView`, unconditionally. The same
// `dataGetter` also drives the related block's own language-subset split
// (`spec.related` below): a related record outside this build moves from
// the rendered grid into the "not in this gallery/exhibition" reference
// list, exactly as `RecordView`'s own `related`/`outside` split does for a
// record outside the whole package.
//
// See `docs/slot-catalogue.md` for every `spec` key below, documented in
// full, and the two-block adoption example (carpets, the-use-of-colours-in-
// art) in this package's `CHANGELOG.md`.

const props = defineProps({
  spec: { type: Object, required: true },
  id: { type: String, required: true },
  /** Set by viewer-core when this view renders a `features.entities` route. */
  entity: { type: String, default: '' },
  /**
   * `(id) => record | null | undefined` — a website's own language-subset
   * record lookup. Left unset, every `id` `RecordView` itself would find is
   * treated as present (the gallery shape). Supplied, an `id` it reports
   * missing 404s here, before `RecordView` mounts (the exhibition shape),
   * and also narrows the related block's `records`/outside-reference split.
   */
  dataGetter: { type: Function, default: null },
})

const slots = useSlots()
// Every slot the website filled that is not one of this view's own three
// (`before-sheet`, `museum`, `related` — each always gets its own template
// below, wrapping the website's slot as its fallback content) is forwarded
// to RecordView by name, unmodified.
const OWN_SLOTS = new Set(['before-sheet', 'museum', 'related'])
const passthroughSlots = computed(() => Object.keys(slots).filter((name) => !OWN_SLOTS.has(name)))

const exists = computed(() => !props.dataGetter || props.dataGetter(props.id) != null)

const { t } = useI18n()
const spec = computed(() => props.spec)
const projects = useProjects()

const byName = (a, b) => (a.name ?? '').localeCompare(b.name ?? '')
const galleryReferences = (record) => (record.gallery_references ?? []).filter((g) => g.kind === 'gallery').sort(byName)
const exhibitionReferences = (record) => (record.gallery_references ?? []).filter((g) => g.kind === 'exhibition').sort(byName)
const artisticIntroductionUrl = (record) => projects.links(record.project_id)?.artisticIntroductionUrl ?? null
const relatedDatabaseUrl = (record) => projects.links(record.project_id)?.relatedDatabaseUrl ?? null

// ── The source-database/collection block, and the notice ───────────────────

function beforeSheetInfo(record, ctx) {
  if (!record) return null
  const s = spec.value.sourceDatabase === false ? null : spec.value.sourceDatabase ?? null
  let source = null
  if (s) {
    const chipClass = s.chipClass ? s.chipClass(record, ctx) : null
    const name = projects.label(record.project_id)
    if (chipClass || name) source = { chipClass, name, label: t(s.label ?? 'record.sheet.sourceDatabase') }
  }
  // `backwardCompatibility`/`addToCollectionLabel` are part of the same
  // source-database/collection block, not a block of their own — nothing
  // here renders unless a site actually declares `spec.sourceDatabase`.
  const addToCollectionLabel = s && s.addToCollection !== false ? t(s.addToCollection?.label ?? 'record.action.addToCollection') : null
  const backwardCompatibility = s ? (record.backward_compatibility ?? '') : ''
  const n = spec.value.notice === false ? null : spec.value.notice ?? null
  const notice = n && n.show(record, ctx) ? t(n.label) : null
  return {
    source, addToCollectionLabel, notice, backwardCompatibility,
  }
}

// ── The holding-museum row ──────────────────────────────────────────────────
// The item's holder text, then the partner it refers to as `PartnerPanel`'s
// `summary` — "About {name}, {city}, {country}", linked to the partner's page
// through `spec.museum.route` (decision D3, inventory-app#2015). The holder
// is free text of the item's translation, not a partner reference, so the
// two are shown side by side rather than one standing for the other. A
// partner the package does not carry leaves the holder text alone; a
// `route` answering null (an exhibition's hidden partner) keeps the name
// and drops the link.

const pkg = useDataPackage()
const partnerById = byId('partners')
const countryById = byId('countries')
loadEntities(['partners', 'countries'])
pkg.loadTranslations('countries', 'en')

function countryLabel(countryId, language) {
  const text = pkg.tr('countries', countryId, language, 'en')
  return mdStrip(text.name ?? countryById.value?.get(countryId)?.internal_name ?? '')
}

function museumBlock(ctx) {
  const holder = ctx.text?.holder ? mdInline(String(ctx.text.holder)) : ''
  const m = spec.value.museum === false ? null : spec.value.museum ?? null
  const partner = m ? partnerById.value?.get(ctx.record?.partner_id) : null
  const view = partner
    ? partnerView(partner, pkg.tr('partners', partner.id, ctx.language, 'en'), {
      countryLabel: (id) => countryLabel(id, ctx.language),
      route: (p) => (m.route ? m.route(p.id, ctx) : null),
    })
    : null
  return { holder, view }
}

// ── The related-content block ───────────────────────────────────────────────

function relatedInfo(record, ctx) {
  if (!record) return null
  const s = spec.value.related ?? {}
  const records = ctx.records ?? []
  const outside = ctx.outside ?? []
  // With no `dataGetter` (a gallery), the related rows are exactly what
  // RecordView already resolved. With one (an exhibition), a related record
  // this build's language subset does not carry moves out of the rendered
  // grid and into the reference list — its own `related_items` entry
  // recovered from the current record, since the transformed row no longer
  // carries the legacy project key / backward_compatibility a reference
  // needs.
  const inPackage = props.dataGetter ? records.filter((r) => props.dataGetter(r.id) != null) : records
  const extraOutside = props.dataGetter
    ? records
      .filter((r) => props.dataGetter(r.id) == null)
      .map((r) => (record.related_items ?? []).find((ref) => ref.id === r.id))
      .filter(Boolean)
    : []
  const references = [...outside, ...extraOutside].map((ref) => ({
    ...ref,
    // The exporter's `related_items` stub carries a `project_id` since
    // inventory-app#1807; resolve it through `useProjects()` for the chip's
    // visible text, and fall back to the stub's own `backward_compatibility`
    // code only when the stub has no `project_id` at all.
    name: ref.project_id ? projects.label(ref.project_id) : null,
    chipClass: s.outsideChip ? s.outsideChip(ref, ctx) : null,
  }))
  // A place with a legacy host links out to it; one without is named, with the
  // spec's "link pending" note (OnDisplayIn's pendingLabel).
  const place = (ref) => ({
    id: ref.id, label: mdInline(ref.name ?? ''), href: ref.legacy_host || '', external: Boolean(ref.legacy_host),
  })
  const onDisplayIn = s.onDisplayIn && s.onDisplayIn !== false
    ? {
      pendingLabel: s.onDisplayIn.linkPendingLabel ?? '',
      groups: [
        { heading: 'record.related.exhibitions', links: exhibitionReferences(record).map(place) },
        { heading: 'record.related.galleries', links: galleryReferences(record).map(place) },
      ].filter((group) => group.links.length),
    }
    : null
  const database = s.databaseLabel && relatedDatabaseUrl(record)
    ? { url: relatedDatabaseUrl(record), label: t(s.databaseLabel), name: projects.label(record.project_id) }
    : null
  const overallDatabase = s.overallDatabase && s.overallDatabase !== false
    ? { label: t(s.overallDatabase.label), linkLabel: t(s.overallDatabase.linkLabel) }
    : null
  return {
    title: s.title ? t(s.title) : '',
    description: s.description ? t(s.description) : '',
    heading: t(s.heading ?? 'record.related.items'),
    variant: s.variant ?? 'grid',
    actionLabel: s.actionLabel ? t(s.actionLabel) : '',
    inPackage,
    references,
    notInPackageLabel: s.notInPackageLabel ? t(s.notInPackageLabel) : '',
    artisticIntroduction: s.artisticIntroductionLabel && artisticIntroductionUrl(record)
      ? { url: artisticIntroductionUrl(record), label: t(s.artisticIntroductionLabel) }
      : null,
    timeline: s.timeline ? s.timeline(record, ctx) : null,
    glossary: s.glossary !== false,
    dynasties: s.dynasties ? s.dynasties(record, ctx.language, ctx) : null,
    media: s.media !== false ? (record.media ?? []) : [],
    onDisplayIn,
    database,
    overallDatabase,
    download: s.download !== false ? { label: t('record.action.download'), pdfLabel: t('record.action.downloadPdf') } : null,
  }
}

function printSheet() {
  window.print()
}
</script>

<template>
  <RecordView v-if="exists" :spec="spec" :id="id" :entity="entity">
    <template v-for="name in passthroughSlots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>

    <template #before-sheet="beforeCtx">
      <slot name="before-sheet" v-bind="beforeCtx">
        <template v-for="info in [beforeSheetInfo(beforeCtx.record, beforeCtx)]" :key="'before-sheet'">
          <div v-if="info?.source || info?.backwardCompatibility || info?.addToCollectionLabel" class="mwnf-sheet-source">
            <p v-if="info.source" class="mwnf-sheet-source__line">
              <span v-if="info.source.chipClass" class="mwnf-chip" :class="info.source.chipClass" aria-hidden="true"></span>
              <template v-if="info.source.name">{{ info.source.label }}: {{ info.source.name }}</template>
            </p>
            <p v-if="info.backwardCompatibility" class="mwnf-sheet-source__uid"><code>{{ info.backwardCompatibility }}</code></p>
            <p v-if="info.addToCollectionLabel" class="mwnf-sheet-source__collection">
              <a :href="mwnfLinks.myCollection" target="_blank" rel="noopener">↗ {{ info.addToCollectionLabel }}</a>
            </p>
          </div>
          <div v-if="info?.notice" class="mwnf-sheet-notice">
            {{ info.notice }} <strong><em>{{ beforeCtx.languages.map((l) => l.label).join(', ') }}</em></strong>
          </div>
        </template>
      </slot>
    </template>

    <template #museum="museumCtx">
      <slot name="museum" v-bind="museumCtx">
        <template v-for="info in [museumBlock(museumCtx)]" :key="'museum'">
          <div class="mwnf-sheet-museum">
            <p v-if="info.holder" class="mwnf-sheet-museum__holder" v-html="info.holder"></p>
            <PartnerPanel
              v-if="info.view"
              variant="summary"
              :partner="info.view"
              label="partner.info.about"
              :dir="museumCtx.dir"
            />
          </div>
        </template>
      </slot>
    </template>

    <template #related="relCtx">
      <slot name="related" v-bind="relCtx">
        <template v-for="rel in [relatedInfo(relCtx.record, relCtx)]" :key="relCtx.record?.id ?? 'related'">
          <div v-if="rel" class="mwnf-sheet-related">
            <p v-if="rel.title" class="mwnf-sheet-related__heading mwnf-sheet-related__heading--caps">{{ rel.title }}</p>
            <p v-if="rel.description" class="mwnf-sheet-related__description">{{ rel.description }}</p>

            <RelatedRecords :heading="rel.heading" :records="rel.inPackage" :variant="rel.variant" :action-label="rel.actionLabel">
              <ul v-if="rel.references.length" class="mwnf-sheet-related__references">
                <li v-for="ref in rel.references" :key="ref.id">
                  <span v-if="ref.chipClass" class="mwnf-chip" :class="ref.chipClass" aria-hidden="true"></span>
                  <template v-if="ref.name">{{ ref.name }}</template>
                  <code v-else>{{ ref.backward_compatibility }}</code>
                  <span v-if="rel.notInPackageLabel" class="mwnf-sheet-related__unresolved">{{ rel.notInPackageLabel }}</span>
                </li>
              </ul>
            </RelatedRecords>

            <p v-if="rel.artisticIntroduction" class="mwnf-sheet-related__line">
              <a :href="rel.artisticIntroduction.url" target="_blank" rel="noopener">↗ {{ rel.artisticIntroduction.label }}</a>
            </p>

            <TimelineLookup v-if="rel.timeline" :key="relCtx.record.id" :info="rel.timeline" />

            <GlossaryTool v-if="rel.glossary" :language="relCtx.language" :dir="relCtx.dir" />

            <DynastyList
              v-if="rel.dynasties?.records?.length"
              :heading="t('record.dynasty.list')"
              :dynasties="rel.dynasties.records"
              :tr="rel.dynasties.tr"
              :dir="relCtx.dir"
            />

            <RelatedMedia :media="rel.media" :descriptions="false" :dir="relCtx.dir" />

            <div v-if="rel.onDisplayIn?.groups.length">
              <p class="mwnf-sheet-related__heading">{{ t('record.related.onDisplayIn') }}</p>
              <OnDisplayIn heading="" :groups="rel.onDisplayIn.groups" :pending-label="rel.onDisplayIn.pendingLabel" :dir="relCtx.dir" />
            </div>

            <div v-if="rel.database">
              <p class="mwnf-sheet-related__heading">{{ rel.database.label }}</p>
              <p class="mwnf-sheet-related__line">
                <a :href="rel.database.url" target="_blank" rel="noopener">↗ {{ rel.database.name }}</a>
              </p>
            </div>

            <div v-if="rel.overallDatabase">
              <p class="mwnf-sheet-related__heading">{{ rel.overallDatabase.label }}</p>
              <p class="mwnf-sheet-related__line">
                <a :href="mwnfLinks.overallDatabase" target="_blank" rel="noopener">↗ {{ rel.overallDatabase.linkLabel }}</a>
              </p>
            </div>

            <div v-if="rel.download">
              <p class="mwnf-sheet-related__heading">{{ rel.download.label }}</p>
              <p class="mwnf-sheet-related__line mwnf-sheet-related__line--action" @click="printSheet">➤ {{ rel.download.pdfLabel }}</p>
            </div>
          </div>
        </template>
      </slot>
    </template>
  </RecordView>
  <NotFoundView v-else />
</template>
