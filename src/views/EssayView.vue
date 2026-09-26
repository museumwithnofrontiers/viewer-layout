<script setup>
import { computed, ref, useSlots, watch } from 'vue'
import {
  NotFoundView, byId, entityRef, glossaryEntries, glossaryTermsForText, renderBlock, renderInline,
  renderPlain, useCollectionTree, useDataPackage, useGlossaryPopup, useI18n, useRecordLanguage,
} from '@museumwnf/viewer-core'
import GlossaryPopover from '../content/GlossaryPopover.vue'
import MediaGallery from '../content/MediaGallery.vue'
import RecordGrid from '../content/RecordGrid.vue'
import SmartLink from '../content/SmartLink.vue'
import SourceCredit from '../content/SourceCredit.vue'

// The essay page, composed: seven sites' ExhibitionTheme / ArtIntroTheme /
// ExhibitionChapter / HistoricalBackgroundCountry / DXA's Theme, each a
// narrative over one node of a collection tree — a quote and a prose body,
// a thumbnail-driven picture panel or a plain item grid, previous/next over
// the tree, a tab strip of sibling pages, a breadcrumb, an about mode for a
// tree's own introduction page. The engine is viewer-core's
// `useCollectionTree`; the parts are the content components; what a website
// declares is a spec, as route props:
//
//   {
//     tree: useCollectionTree(...) result                       // built by the site, or:
//         | { purpose: 'exhibitions-root', childType?, entity?, order? }
//         | { rootId, childType?, entity?, order? }
//         | { themes: true | 'themes', childType? },             // a themes.json package
//     entity: 'items',                       // the tree's items — also the tree's OWN
//                                             // translations entity when `tree` carries
//                                             // none of its own (a pre-built tree, or a
//                                             // declarative form with no `entity`/`themes`
//                                             // of its own): falls back to 'collections'.
//     route: 'theme' | (node, ctx) => (to | href),   // a node's own page
//     heading: (ctx) => inline HTML,         // default: the node's own title
//     placeholder: /^(Theme|Page) \d+$/,     // a synthesized title, treated as missing
//     quote: 'quote' | false,                // a field of the node's translation:
//     body: 'description' | false,           // a name, a dotted path ('extra.intro_text'),
//                                             // or a function (ctx) => Markdown
//     glossary: true | false,                // highlight glossary terms in quote + body
//     items: {
//       of: (node) => [ids],                 // default: the node's own items/item_ids/pictures
//       caption: (item, node, ctx) => ({ name?, image?, imageAlt? }),  // merged over the default
//       meta: (item, ctx) => [string],       // the grid's caption lines, e.g. a date or a holder
//       badge: (item, ctx) => string,        // the grid's badge
//       route: 'item' | (item, ctx) => (to | href),
//     },
//     panel: {
//       variants: (item, ctx) => [{ id, image, alt, caption: { title, justification, fields: [{ label, value }] } }],
//       fields: (item, node, ctx) => [{ label, value }],   // fallback when a variant carries no fields of its own
//     } | false,
//     navigation: 'tree' | 'siblings' | false,   // decision D2: 'tree' crosses a branch boundary, 'siblings' stays inside
//     breadcrumb: true | false,
//     tabs: true | 'siblings' | 'children',   // the strip: true/'siblings' — the node's own
//                                              // siblings (default); 'children' — the node's
//                                              // own children (a theme's chapters, say)
//     about: (node) => boolean | { panel?: boolean, navigation?: boolean },
//                                              // a node rendered as an about page: essay only,
//                                              // no panel or navigation by default; an object
//                                              // keeps the named piece instead of dropping it —
//                                              // `aboutKeeps: ['panel']` does the same, spec-wide
//     aboutKeeps: ['panel' | 'navigation'],   // spec-wide alternative to `about`'s object form
//     numbering: 'roman' | 'decimal' | false, // counts a node among its true siblings — for a
//                                              // themes-package tree (`root` is null), that's
//                                              // every node whose own `tree.parents(id)` is
//                                              // also empty, so a themes tree numbers I, II, III
//     previous, next, backTo, inThisTheme, seeAll,  // entry names, overriding the defaults below
//   }
//
// Texts are entry names, resolved through `t`, and default to shared entries
// every bundle carries: `previous`/`next` to `core.pagination.previous`/`.next`,
// `backTo` to `record.action.backToResults`, `inThisTheme` (the label of the
// strip of pages) to `core.nav.inThisSection`, `seeAll` (the panel's link to
// the selected record) to `catalogue.results.seeDatabaseEntry`. Slots — `header`, `before-body`,
// `after-body`, `panel`, `thumbnails`, `aside`, `justifications`,
// `navigation`, `after` — each receive `{ node, text, language, tree, items,
// selected, select, selectedVariant, selectVariant, breadcrumb, previous,
// next, t, tr }`. `after`'s default content is `SourceCredit` — nothing
// unless the website declares `site.origin`; a website's own `#after`
// content replaces it, the same rule every other slot here follows. A
// website whose page is not this shape writes its own component on the same
// content components.
//
// Not every one of the seven pages fits the same slot: islamicart/baroqueart's
// multi-image "detail" selector is `panel.variants` — each variant carries
// its own image *and* caption (title, justification, fields), swapped
// together when the visitor picks a thumbnail under the panel, `fields`
// falling back to `panel.fields` when a variant carries none of its own;
// sharinghistory's dual curator/partner justifications are the
// `justifications` slot (the default panel shows none); its chapters'
// see-also/further-reading blocks are `after-body`; DXA's related-works
// toggle and its picture-to-parent indirection are `items.of`/`items.caption`
// plus the `thumbnails` slot for the toggle itself, which is unique to that
// family.

const props = defineProps({
  spec: { type: Object, required: true },
  id: { type: String, required: true },
})

const { t } = useI18n()
const pkg = useDataPackage()
const slots = useSlots()

function isBuiltTree(value) {
  return Boolean(value) && typeof value.walk === 'function' && typeof value.children === 'function'
}
function themesEntity(value) {
  return typeof value === 'string' ? value : 'themes'
}

const entity = props.spec.entity ?? 'items'
const treeSpec = props.spec.tree
// The tree's own translations entity: `treeSpec.entity`/`.themes` when the
// declarative form (or a pre-built tree the site tagged with `.entity`
// itself) carries one; otherwise `spec.entity` — already a spec key, read
// for the items grid above — since a site building its own tree already
// knows this value and a pre-built `useCollectionTree()` result carries no
// `entity` field of its own to read it back from; `'collections'` last.
const treeEntity = treeSpec?.entity ?? (treeSpec?.themes ? themesEntity(treeSpec.themes) : (props.spec.entity ?? 'collections'))
const tree = isBuiltTree(treeSpec)
  ? treeSpec
  : treeSpec?.themes
    ? useCollectionTree({ source: 'themes', entity: treeEntity, childType: treeSpec.childType })
    : useCollectionTree({
        purpose: treeSpec?.purpose,
        rootId: treeSpec?.rootId,
        childType: treeSpec?.childType,
        entity: treeEntity,
        order: treeSpec?.order,
      })
const treeRecords = entityRef(treeEntity)
const loaded = computed(() => treeRecords.value !== null)

const spec = computed(() => props.spec)
const node = computed(() => tree.byId.value.get(props.id) ?? null)
const parent = computed(() => tree.parents(props.id).at(-1) ?? null)
const siblings = computed(() => {
  if (parent.value) return tree.children(parent.value.id)
  const root = tree.root.value
  if (root) return tree.children(root.id)
  // A themes-package tree (`collectionTreeFromThemes`) has no root record to
  // list children of — `root` is documented as always null there, and a
  // top-level theme's own `parents(id)` comes back empty too (its parent is
  // a sentinel no real node carries). Its true siblings — the sentinel
  // root's children — are found instead by scanning the flattened walk for
  // every other node whose own ancestry is equally empty.
  return tree.walk().filter((n) => tree.parents(n.id).length === 0)
})
const siblingIndex = computed(() => siblings.value.findIndex((n) => n.id === props.id))

const navMode = computed(() => spec.value.navigation || false)
const previousNode = computed(() => {
  if (navMode.value === 'siblings') return siblingIndex.value > 0 ? siblings.value[siblingIndex.value - 1] : null
  if (navMode.value === 'tree') return tree.previous(props.id)
  return null
})
const nextNode = computed(() => {
  if (navMode.value === 'siblings') {
    return siblingIndex.value !== -1 && siblingIndex.value < siblings.value.length - 1 ? siblings.value[siblingIndex.value + 1] : null
  }
  if (navMode.value === 'tree') return tree.next(props.id)
  return null
})

// ── Language and the node's own translation ─────────────────────────────────

// `select` in the slot context picks the panel's item, pairing with
// `selected` — the tree node carries no language switch of its own in this
// context (unlike `RecordView`, which exposes one item's languages).
const { language, dir } = useRecordLanguage(node, { entity: treeEntity })
const text = computed(() => (node.value ? pkg.tr(treeEntity, node.value.id, language.value, 'en') : {}))

const ready = ref(false)
watch(
  () => [node.value?.id, language.value],
  async () => {
    ready.value = false
    if (!node.value) {
      ready.value = true
      return
    }
    const langs = language.value === 'en' ? ['en'] : [language.value, 'en']
    await Promise.all([treeEntity, entity].flatMap((name) => langs.map((code) => pkg.loadTranslations(name, code))))
    ready.value = true
  },
  { immediate: true },
)

function resolveTitle(n) {
  if (!n) return ''
  const placeholder = spec.value.placeholder
  const isPlaceholder = (value) => Boolean(value) && Boolean(placeholder) && placeholder.test(value)
  const own = pkg.tr(treeEntity, n.id, language.value, 'en')
  if (own.title && !isPlaceholder(own.title)) return own.title
  const en = pkg.tr(treeEntity, n.id, 'en').title
  if (en && !isPlaceholder(en)) return en
  return n.internal_name ?? n.id
}

// ── The base context: what a spec function reads, before items are resolved ─

const baseCtx = computed(() => ({
  node: node.value,
  text: text.value,
  language: language.value,
  tree,
  select,
  t,
  tr: (name, recId) => pkg.tr(name, recId, language.value, 'en'),
}))

// ── Quote, body and glossary ─────────────────────────────────────────────────

// `quote`/`body` name a field of the node's translation ('quote'), a dotted
// path into it ('extra.intro_text', for a field the flat lookup below
// cannot reach), or a function of the base context (a website composing its
// own value, e.g. from a second translated entity) — always Markdown either
// way, rendered exactly like a plain field name.
function pathValue(source, path) {
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), source)
}
function resolveTextSpec(fieldSpec, ctx) {
  if (fieldSpec === false || fieldSpec == null) return ''
  if (typeof fieldSpec === 'function') return fieldSpec(ctx) ?? ''
  return pathValue(ctx.text, fieldSpec) ?? ''
}

const quoteValue = computed(() => resolveTextSpec(spec.value.quote ?? 'quote', baseCtx.value))
const bodyValue = computed(() => resolveTextSpec(spec.value.body ?? 'description', baseCtx.value))

const glossaryTerms = computed(() => {
  if (!spec.value.glossary || !node.value) return []
  const parts = [quoteValue.value, bodyValue.value].filter(Boolean)
  return glossaryTermsForText(parts.join('\n\n'), language.value)
})
const glossaryList = computed(() => glossaryEntries(glossaryTerms.value))
const { active, onClick, close } = useGlossaryPopup(glossaryTerms)
const activeHtml = computed(() => (active.value ? renderBlock(active.value.definition, { breaks: true }) : ''))

const titleHtml = computed(() => {
  if (!node.value) return ''
  if (spec.value.heading) return spec.value.heading(baseCtx.value)
  return renderInline(String(resolveTitle(node.value)), { glossary: glossaryList.value })
})
const quoteHtml = computed(() => (quoteValue.value ? renderInline(String(quoteValue.value), { glossary: glossaryList.value }) : ''))
const bodyHtml = computed(() => (bodyValue.value ? renderBlock(String(bodyValue.value), { breaks: true, glossary: glossaryList.value }) : ''))

// `about` (a function of the node) may return a plain boolean — the
// original all-or-nothing about page, panel and navigation both dropped —
// or `{ panel?, navigation? }`, keeping the named piece instead; `true`
// still means "drop both", the object form's absent keys default to
// `false` (dropped). `aboutKeeps` is the spec-wide equivalent, for a family
// whose about pages all keep the same piece.
const aboutResult = computed(() => (node.value ? (spec.value.about?.(node.value) ?? false) : false))
const isAbout = computed(() => Boolean(aboutResult.value))
function aboutKeeps(part) {
  const result = aboutResult.value
  if (result && typeof result === 'object') return Boolean(result[part])
  return Boolean(spec.value.aboutKeeps?.includes(part))
}

// ── Numbering ─────────────────────────────────────────────────────────────

const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
function toRoman(num) {
  let n = num
  let out = ''
  for (const [value, symbol] of ROMAN) {
    while (n >= value) {
      out += symbol
      n -= value
    }
  }
  return out
}
const numberLabel = computed(() => {
  const mode = spec.value.numbering
  if (!mode || !node.value) return ''
  const list = siblings.value.length ? siblings.value : [node.value]
  const index = list.findIndex((n) => n.id === props.id)
  const n = index >= 0 ? index + 1 : 1
  return mode === 'roman' ? toRoman(n) : String(n)
})

// ── Items ───────────────────────────────────────────────────────────────────

function defaultItemIds(n) {
  if (!n) return []
  if (Array.isArray(n.items)) return n.items.map((entry) => (entry && typeof entry === 'object' ? entry.id : entry)).filter((v) => v != null)
  if (Array.isArray(n.item_ids)) return n.item_ids.filter((v) => v != null)
  if (Array.isArray(n.pictures)) return n.pictures.map((picture) => picture?.picture_item_id).filter((v) => v != null)
  return []
}

const itemIndex = byId(entity)
const itemIds = computed(() => {
  const of = spec.value.items?.of ?? defaultItemIds
  return node.value ? of(node.value, baseCtx.value) : []
})
const itemRecords = computed(() => itemIds.value.map((itemId) => itemIndex.value.get(itemId)).filter(Boolean))

const selectedId = ref(null)
watch(itemRecords, (list) => {
  if (!list.some((item) => item.id === selectedId.value)) selectedId.value = list[0]?.id ?? null
}, { immediate: true })
const selected = computed(() => itemRecords.value.find((item) => item.id === selectedId.value) ?? itemRecords.value[0] ?? null)
function select(itemId) {
  selectedId.value = itemId
}

function itemTo(item) {
  const routeSpec = spec.value.items?.route
  if (!routeSpec || !item) return null
  return typeof routeSpec === 'function' ? routeSpec(item, baseCtx.value) : { name: routeSpec, params: { id: item.id } }
}
function nodeTo(n) {
  const routeSpec = spec.value.route
  if (!routeSpec || !n) return null
  return typeof routeSpec === 'function' ? routeSpec(n, baseCtx.value) : { name: routeSpec, params: { id: n.id } }
}

function defaultItemCaption(item) {
  if (!item) return null
  const own = pkg.tr(entity, item.id, language.value, 'en')
  const name = own.name ?? item.internal_name ?? item.id
  return {
    name: renderInline(String(name)),
    image: item.images?.[0]?.url ?? '',
    imageAlt: renderPlain(String(name)),
  }
}

const selectedCaption = computed(() => {
  const item = selected.value
  if (!item) return null
  const base = defaultItemCaption(item)
  const override = spec.value.items?.caption?.(item, node.value, baseCtx.value)
  return { ...base, ...override }
})

const hasPanel = computed(() => Boolean(spec.value.panel))

// A "variant" pairs one image with its own caption (title, justification,
// fields) — islamicart/baroqueart's "detail" close-ups, which swap the whole
// panel, not just the picture. The item's own image is always variant zero,
// carrying no caption of its own (`fields: null` so the panel falls back to
// `panel.fields`, `justification: ''` — the item's caption already covers
// the name); `panel.variants` appends whatever else the site declares.
const itemVariants = computed(() => {
  const item = selected.value
  if (!item) return []
  const caption = selectedCaption.value
  const primary = item.images?.[0]?.url
    ? [{
        id: '__primary',
        image: item.images[0].url,
        alt: caption?.imageAlt ?? '',
        caption: { title: caption?.name ?? '', justification: '', fields: null },
      }]
    : []
  const extra = spec.value.panel?.variants?.(item, baseCtx.value) ?? []
  return [...primary, ...extra.map((variant, index) => ({ id: variant.id ?? `variant-${index}`, ...variant }))]
})

const selectedVariantId = ref(null)
watch(itemVariants, (list) => {
  if (!list.some((variant) => variant.id === selectedVariantId.value)) selectedVariantId.value = list[0]?.id ?? null
}, { immediate: true })
const selectedVariant = computed(() => itemVariants.value.find((variant) => variant.id === selectedVariantId.value) ?? itemVariants.value[0] ?? null)
function selectVariant(variantId) {
  selectedVariantId.value = variantId
}

const mediaImages = computed(() => {
  const variant = selectedVariant.value
  if (!variant?.image) return []
  return [{ url: variant.image, alt: variant.alt ?? '' }]
})
const panelFields = computed(() => {
  const item = selected.value
  if (!item || !spec.value.panel?.fields) return []
  return spec.value.panel.fields(item, node.value, baseCtx.value) ?? []
})
// A variant's own fields (its `label` an entry name, resolved here — unlike
// `panel.fields`' fallback rows, already resolved text by the same
// convention as `items.caption`) win; `fields: null` (or no variant at all)
// falls back to `panel.fields`.
const panelDisplayFields = computed(() => {
  const variantFields = selectedVariant.value?.caption?.fields
  if (variantFields != null) return variantFields.map((field) => ({ label: field.label ? t(field.label) : '', value: field.value }))
  return panelFields.value
})
const panelJustificationHtml = computed(() => {
  const value = selectedVariant.value?.caption?.justification
  return value ? renderInline(String(value)) : ''
})

const gridRecords = computed(() =>
  itemRecords.value.map((item) => {
    const caption = defaultItemCaption(item)
    const meta = spec.value.items?.meta?.(item, baseCtx.value) ?? []
    const badge = spec.value.items?.badge?.(item, baseCtx.value) ?? ''
    return { id: item.id, image: caption.image, imageAlt: caption.imageAlt, name: caption.name, meta, badge, to: itemTo(item) }
  }),
)

// ── Breadcrumb, tabs, texts ───────────────────────────────────────────────

const breadcrumbList = computed(() => (spec.value.breadcrumb && node.value ? tree.parents(props.id) : []))
// `tabs: true` (or `'siblings'`) keeps the original strip — the node's own
// siblings; `'children'` lists the node's own children instead, for a page
// whose tabs are its chapters, not its neighbors.
const tabNodes = computed(() => {
  const mode = spec.value.tabs
  if (!mode) return []
  if (mode === 'children') return node.value ? tree.children(node.value.id) : []
  return siblings.value
})

const previousText = computed(() => spec.value.previous ?? 'core.pagination.previous')
const nextText = computed(() => spec.value.next ?? 'core.pagination.next')
const backToText = computed(() => spec.value.backTo ?? 'record.action.backToResults')
const inThisThemeText = computed(() => spec.value.inThisTheme ?? 'core.nav.inThisSection')
const seeAllText = computed(() => spec.value.seeAll ?? 'catalogue.results.seeDatabaseEntry')

// ── The slot context ────────────────────────────────────────────────────────

const ctx = computed(() => ({
  ...baseCtx.value,
  items: itemRecords.value,
  selected: selected.value,
  selectedVariant: selectedVariant.value,
  selectVariant,
  breadcrumb: breadcrumbList.value,
  previous: previousNode.value,
  next: nextNode.value,
}))

const hasSide = computed(() => {
  if (isAbout.value && !aboutKeeps('panel')) return false
  return hasPanel.value || itemRecords.value.length > 0 || Boolean(slots.aside)
})
const showNavigation = computed(
  () => (!isAbout.value || aboutKeeps('navigation')) && Boolean(navMode.value) && Boolean(previousNode.value || nextNode.value),
)
</script>

<template>
  <NotFoundView v-if="loaded && !node" />

  <article v-else-if="node" class="mwnf-essay" :class="{ 'mwnf-essay--about': isAbout }" :dir="dir || undefined" @click="onClick">
    <slot name="header" v-bind="ctx">
      <p v-if="breadcrumbList.length" class="mwnf-essay__breadcrumb">
        <span class="mwnf-essay__breadcrumb-label">{{ t(backToText) }}</span>
        <template v-for="crumb in breadcrumbList" :key="crumb.id">
          <SmartLink v-if="nodeTo(crumb)" :to="nodeTo(crumb)" class="mwnf-essay__breadcrumb-link">{{ resolveTitle(crumb) }}</SmartLink>
          <span v-else class="mwnf-essay__breadcrumb-link">{{ resolveTitle(crumb) }}</span>
        </template>
      </p>

      <div v-if="tabNodes.length > 1" class="mwnf-essay__tabs" role="tablist" :aria-label="t(inThisThemeText)">
        <SmartLink
          v-for="tab in tabNodes"
          :key="tab.id"
          :to="nodeTo(tab)"
          class="mwnf-essay__tab"
          :class="{ 'mwnf-essay__tab--active': tab.id === id }"
        >{{ resolveTitle(tab) }}</SmartLink>
      </div>

      <h1 class="mwnf-essay__title">
        <span v-if="numberLabel" class="mwnf-essay__number">{{ numberLabel }}</span>
        <span v-html="titleHtml"></span>
      </h1>
    </slot>

    <div class="mwnf-essay__body">
      <div class="mwnf-essay__main">
        <p v-if="!ready" class="mwnf-essay__status">{{ t('core.status.loading') }}</p>
        <p v-if="quoteHtml" class="mwnf-essay__quote" v-html="quoteHtml"></p>

        <slot name="before-body" v-bind="ctx" />

        <div v-if="bodyHtml" class="mwnf-essay__prose mwnf-sheet__block" v-html="bodyHtml"></div>

        <slot name="after-body" v-bind="ctx" />

        <slot v-if="!isAbout" name="justifications" v-bind="ctx" />

        <div v-if="showNavigation" class="mwnf-essay__nav">
          <slot name="navigation" v-bind="ctx">
            <SmartLink v-if="previousNode" :to="nodeTo(previousNode)" class="mwnf-essay__nav-link mwnf-essay__nav-link--previous">← {{ t(previousText) }}</SmartLink>
            <span v-else class="mwnf-essay__nav-spacer"></span>
            <SmartLink v-if="nextNode" :to="nodeTo(nextNode)" class="mwnf-essay__nav-link mwnf-essay__nav-link--next">{{ t(nextText) }} →</SmartLink>
          </slot>
        </div>
      </div>

      <div v-if="hasSide" class="mwnf-essay__side">
        <slot name="panel" v-bind="ctx">
          <div v-if="hasPanel && selectedCaption" class="mwnf-essay__panel">
            <MediaGallery :images="mediaImages" />
            <ul v-if="itemVariants.length > 1" class="mwnf-essay__variants">
              <li v-for="variant in itemVariants" :key="variant.id">
                <button
                  type="button"
                  class="mwnf-essay__variant"
                  :class="{ 'mwnf-essay__variant--active': variant.id === selectedVariant?.id }"
                  :aria-pressed="variant.id === selectedVariant?.id ? 'true' : 'false'"
                  @click="selectVariant(variant.id)"
                >
                  <img v-if="variant.image" :src="variant.image" :alt="variant.alt ?? ''" loading="lazy" />
                </button>
              </li>
            </ul>
            <h3 class="mwnf-essay__panel-name" v-html="selectedVariant?.caption?.title || selectedCaption.name"></h3>
            <p v-for="(field, index) in panelDisplayFields" :key="index" class="mwnf-essay__panel-field">
              <span v-if="field.label" class="mwnf-essay__panel-label">{{ field.label }}</span>
              <span v-html="field.value"></span>
            </p>
            <p v-if="panelJustificationHtml" class="mwnf-essay__panel-justification mwnf-sheet__block" v-html="panelJustificationHtml"></p>
            <SmartLink v-if="itemTo(selected)" :to="itemTo(selected)" class="mwnf-essay__panel-link">{{ t(seeAllText) }} →</SmartLink>
          </div>
        </slot>

        <slot name="thumbnails" v-bind="ctx">
          <ul v-if="hasPanel && itemRecords.length > 1" class="mwnf-essay__thumbs">
            <li v-for="item in itemRecords" :key="item.id">
              <button
                type="button"
                class="mwnf-essay__thumb"
                :class="{ 'mwnf-essay__thumb--active': item.id === selected?.id }"
                @click="select(item.id)"
              >
                <img v-if="item.images?.[0]?.url" :src="item.images[0].url" alt="" loading="lazy" />
              </button>
            </li>
          </ul>
          <RecordGrid v-else-if="!hasPanel && gridRecords.length" :records="gridRecords" />
        </slot>

        <slot name="aside" v-bind="ctx" />
      </div>
    </div>

    <slot name="after" v-bind="ctx">
      <SourceCredit />
    </slot>

    <GlossaryPopover :term="active" :html="activeHtml" :dir="dir" @close="close" />
  </article>

  <p v-else class="mwnf-essay__status">{{ t('core.status.loading') }}</p>
</template>
