<script setup>
import { computed } from 'vue'
import {
  groupByCountry, partnerHierarchy, partnerView, renderInline, renderPlain, useDataPackage, useI18n, useListQuery, entityRef,
} from '@museumwnf/viewer-core'
import PartnerPanel from '../content/PartnerPanel.vue'

// The partner list, composed: islamicart's/sharinghistory's country
// accordion with main/associated tiers, and the DXA family's plain country
// groups with an A–Z toggle, both over viewer-core's `groupByCountry`. What a
// website declares is a spec, as route props:
//
//   {
//     entity: 'partners',                  // the entity read; default 'partners'
//     scope: (partner, ctx) => boolean,    // filtered before grouping — a site's
//                                           // own axis (museum/institution, a
//                                           // curated project, …), read from
//                                           // wherever the site keeps it
//     group: {
//       tier: 'level' | false,             // the field marking an associated
//                                           // partner (groupByCountry's own
//                                           // rule); false: no tiers, every
//                                           // partner is main — the DXA shape
//       order: 'country' | 'name',         // 'country' (default): one group per
//                                           // country_id; 'name': a single,
//                                           // flat, alphabetical group — no
//                                           // country carries this today, kept
//                                           // for a directory with none
//     },
//     orderToggle: true | false,           // an A-Z / Z-A control, mirrored in
//                                           // the query as `order`; every tier
//                                           // is sorted by name regardless —
//                                           // the toggle reverses the country
//                                           // order (group.order: 'country')
//                                           // or the one flat list ('name')
//     nested: true | false,                // an associated partner rendered
//                                           // under its own parent
//                                           // (partnerHierarchy) instead of the
//                                           // flat tier column; a partner whose
//                                           // parent is missing or in another
//                                           // group stays in the flat column
//     label: (countryId, ctx) => string,   // a group's own country label —
//                                           // required when group.order is
//                                           // 'country', the same shape as a
//                                           // facet's label(value)
//     record: (partner, ctx) => ({ name, city, logo, count, route }),  // the row
//     route: 'partner' | (partner, ctx) => (to | href),  // the row's default page
//     objectsRoute: (partner, ctx) => (to | href),  // the page of the items a
//                                           // partner holds, for the line's
//                                           // View objects link
//     actions: true | false,               // the line's Read more · View
//                                           // objects links (the DXA rows)
//     emptyLabel,                          // entry for a partner holding
//                                           // nothing; default: no line
//     variant: 'accordion' | 'open',       // accordion: collapsible <details>;
//                                           // open: always-expanded sections
//     count: true | false,                 // the "Partners found: N" line
//                                           // above the groups
//     associatedLabel, foundLabel, objectsLabel, sortAscendingLabel,
//     sortDescendingLabel, empty, title,   // entry names, overriding the
//                                           // shared partner.* entries below
//   }
//
// Texts are entry names, resolved through `t`: `associatedLabel` defaults to
// `partner.list.associated`, `foundLabel` to `partner.list.partnersFound`,
// `objectsLabel` to `partner.item.objectsInSite`, `sortAscendingLabel`/
// `sortDescendingLabel` to `partner.list.sortAscending`/`.sortDescending`,
// `empty` to `catalogue.results.noResults`. A row's own `count` is a number,
// not text — the default row prints it against `objectsLabel` only when it
// is truthy, which is exactly the DXA shape (a partner with no members gets
// no line, not "0"); a site with nothing to say about counts leaves `count`
// unset and gets no line at all, which is the standalone shape. A site that
// needs the DXA "no objects in this gallery" wording for a zero count writes
// its own `#row`.
//
// Slots: `before` (above the toggle and the groups), `group-heading` (given
// `{ group, ... }`; the default renders `group.label`), `row` (given
// `{ group, partner, row, view, ... }`, once per partner — main, associated
// and, when nested, a child row too; the default is `PartnerPanel`'s `line`
// variant over `view`, viewer-core's `partnerView()`: the logo, "Name,
// City" and the count line), `after` (below the groups). Every slot also
// receives the base context: `{ t, locale, groups, orderDir, toggleOrder }`.
// `row` keeps the shape `spec.record` returns, for a slot written against it.

const props = defineProps({
  spec: { type: Object, required: true },
})

const { t, locale } = useI18n()
const pkg = useDataPackage()

const spec = computed(() => props.spec)
const entity = computed(() => spec.value.entity ?? 'partners')
const records = entityRef(entity.value)
if (entity.value) pkg.loadTranslations(entity.value, 'en')

const helpers = {
  t,
  locale,
  tr: (id) => pkg.tr(entity.value, id, locale.value, 'en'),
  renderInline,
  renderPlain,
}

// ── The order toggle ─────────────────────────────────────────────────────
// Always declared — a spec with `orderToggle: false` simply never reads or
// exposes it — so the query key is stable whether or not a given site turns
// the control on.
const { filters, apply } = useListQuery({ keys: ['order'], page: false })
const orderDir = computed(() => (filters.order === 'desc' ? 'desc' : 'asc'))
function toggleOrder() {
  apply({ order: orderDir.value === 'asc' ? 'desc' : 'asc' })
}

// ── What matches ─────────────────────────────────────────────────────────

const matching = computed(() => {
  const s = spec.value
  const list = records.value ?? []
  return s.scope ? list.filter((partner) => s.scope(partner, helpers)) : list
})

// ── The rows ─────────────────────────────────────────────────────────────

const recordRoute = computed(() => spec.value.route)

function routeOf(partner) {
  const r = recordRoute.value
  if (!r) return null
  return typeof r === 'function' ? r(partner, helpers) : { name: r, params: { id: partner.id } }
}

// A row is the partner's view-model — what `PartnerPanel` renders — plus
// the flat `{ name, city, logo, count, route }` a `#row` slot or a
// `spec.record` reads. A site's own `spec.record` still decides the row: its
// shape is lifted into the view-model the panel needs.
function viewOf(partner) {
  const objects = spec.value.objectsRoute
  return partnerView(partner, helpers.tr(partner.id), {
    route: routeOf,
    objectsRoute: objects ? (p) => objects(p, helpers) : null,
  })
}

function fromRecord(partner, row) {
  const name = row.name ?? ''
  return {
    ...partnerView(partner, {}, {}),
    name,
    plainName: plainOf(name),
    city: row.city ?? '',
    location: row.city ?? '',
    logos: row.logo ? [{ url: row.logo, alt: plainOf(name), type: '' }] : [],
    itemCount: row.count ?? 0,
    route: row.route ?? null,
  }
}

function buildEntry(partner) {
  if (spec.value.record) {
    const row = spec.value.record(partner, helpers)
    return { partner, row, view: fromRecord(partner, row) }
  }
  const view = viewOf(partner)
  const row = { name: view.name, city: view.city, logo: view.logos[0]?.url ?? '', count: view.itemCount, route: view.route }
  return { partner, row, view }
}

// A row's `name` is already rendered (Markdown to HTML, the record
// convention `defaultRecord` and every `spec.record` follow) — `renderPlain`
// re-lexes its *input* as Markdown, so running it on already-rendered HTML
// would read that markup as source and drop whatever it does not recognize.
// The sort key and the image `alt` only need the tags gone, not a second
// pass through the Markdown pipeline.
function plainOf(html) {
  return String(html ?? '').replace(/<[^>]*>/g, '')
}

// ── The groups ───────────────────────────────────────────────────────────
// A single derivation for both shapes: `group.order: 'name'` groups
// everything into one bucket by giving groupByCountry a constant country -
// tier and its main/associated split are still its own rule, only the
// country axis is neutralized - rather than duplicating that rule here.

const hierarchy = computed(() => (spec.value.nested ? partnerHierarchy(matching.value) : null))

const groups = computed(() => {
  const s = spec.value
  const tier = s.group?.tier ?? false
  const byName = (s.group?.order ?? 'country') === 'name'
  const source = byName ? matching.value.map((partner) => ({ ...partner, country_id: ' ' })) : matching.value
  const label = byName ? () => '' : (countryId) => (s.label ? s.label(countryId, helpers) : countryId)

  const raw = groupByCountry(source, { label, tier, order: orderDir.value })

  // Partners keep the relative order groupByCountry was given in within each
  // tier - sorting them is this view's concern, not that derivation's - and
  // both families sort every tier by name; only the country order (or, with
  // no country at all, the whole flat list) is what the toggle reverses.
  const byRowName = (a, b) => plainOf(a.row.name).localeCompare(plainOf(b.row.name))

  return raw.map((group) => {
    let main = group.main.map(buildEntry).sort(byRowName)
    let associated = group.associated.map(buildEntry).sort(byRowName)

    if (byName && orderDir.value === 'desc') {
      main.reverse()
      associated.reverse()
    }

    if (s.nested && hierarchy.value) {
      const remaining = new Set(associated.map((entry) => entry.partner.id))
      main = main.map((entry) => {
        const children = hierarchy.value
          .children(entry.partner.id)
          .filter((child) => remaining.has(child.id))
        for (const child of children) remaining.delete(child.id)
        return { ...entry, children: children.map(buildEntry) }
      })
      associated = associated.filter((entry) => remaining.has(entry.partner.id))
    }

    return { country: group.country, label: group.label, main, associated }
  })
})

const hasResults = computed(() => groups.value.some((group) => group.main.length > 0 || group.associated.length > 0))

// ── Texts ────────────────────────────────────────────────────────────────

const associatedLabel = computed(() => t(spec.value.associatedLabel ?? 'partner.list.associated'))
const lineProps = computed(() => ({
  objectsLabel: spec.value.objectsLabel ?? 'partner.item.objectsInSite',
  emptyLabel: spec.value.emptyLabel ?? '',
  show: { actions: Boolean(spec.value.actions) },
}))
const foundLabel = computed(() => t(spec.value.foundLabel ?? 'partner.list.partnersFound'))
const sortAscendingLabel = computed(() => t(spec.value.sortAscendingLabel ?? 'partner.list.sortAscending'))
const sortDescendingLabel = computed(() => t(spec.value.sortDescendingLabel ?? 'partner.list.sortDescending'))
const empty = computed(() => t(spec.value.empty ?? 'catalogue.results.noResults'))
const title = computed(() => (spec.value.title ? t(spec.value.title) : ''))
const totalCount = computed(() => groups.value.reduce((sum, group) => sum + group.main.length + group.associated.length, 0))
const variant = computed(() => spec.value.variant ?? 'accordion')

const slotProps = computed(() => ({ t, locale, groups: groups.value, orderDir: orderDir.value, toggleOrder }))
</script>

<template>
  <section class="mwnf-partner-list">
    <h1 v-if="title" class="mwnf-partner-list__title">{{ title }}</h1>

    <div v-if="spec.count" class="mwnf-partner-list__count">{{ foundLabel }}: {{ totalCount }}</div>

    <slot name="before" v-bind="slotProps" />

    <div v-if="spec.orderToggle" class="mwnf-partner-list__toggle">
      <button type="button" class="mwnf-partner-list__toggle-button" @click="toggleOrder">
        {{ orderDir === 'asc' ? sortDescendingLabel : sortAscendingLabel }}
      </button>
    </div>

    <div v-if="hasResults" class="mwnf-partner-list__groups">
      <component
        :is="variant === 'accordion' ? 'details' : 'section'"
        v-for="group in groups"
        :key="group.country ?? ''"
        class="mwnf-partner-list__group"
        v-bind="variant === 'accordion' ? { open: true } : {}"
      >
        <component :is="variant === 'accordion' ? 'summary' : 'div'" class="mwnf-partner-list__group-heading">
          <slot name="group-heading" :group="group" v-bind="slotProps">
            <h2 v-if="group.label" class="mwnf-partner-list__group-title">{{ group.label }}</h2>
          </slot>
        </component>

        <div class="mwnf-partner-list__tier">
          <div v-for="entry in group.main" :key="entry.partner.id" class="mwnf-partner-list__row-block">
            <div class="mwnf-partner-list__row">
              <slot name="row" :group="group" :partner="entry.partner" :row="entry.row" :view="entry.view" v-bind="slotProps">
                <PartnerPanel variant="line" :partner="entry.view" v-bind="lineProps" />
              </slot>
            </div>

            <div v-if="entry.children?.length" class="mwnf-partner-list__children">
              <div v-for="child in entry.children" :key="child.partner.id" class="mwnf-partner-list__row mwnf-partner-list__row--child">
                <slot name="row" :group="group" :partner="child.partner" :row="child.row" :view="child.view" v-bind="slotProps">
                  <PartnerPanel variant="line" :partner="child.view" v-bind="lineProps" />
                </slot>
              </div>
            </div>
          </div>
        </div>

        <div v-if="group.associated.length" class="mwnf-partner-list__tier mwnf-partner-list__tier--associated">
          <p class="mwnf-partner-list__tier-label">{{ associatedLabel }}</p>
          <div v-for="entry in group.associated" :key="entry.partner.id" class="mwnf-partner-list__row">
            <slot name="row" :group="group" :partner="entry.partner" :row="entry.row" :view="entry.view" v-bind="slotProps">
              <PartnerPanel variant="line" :partner="entry.view" v-bind="lineProps" />
            </slot>
          </div>
        </div>
      </component>
    </div>

    <p v-else class="mwnf-partner-list__empty">{{ empty }}</p>

    <slot name="after" v-bind="slotProps" />
  </section>
</template>
