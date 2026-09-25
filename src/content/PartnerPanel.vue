<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'
import MediaGallery from './MediaGallery.vue'
import PartnerMap from './PartnerMap.vue'
import SmartLink from './SmartLink.vue'

// One partner, wherever it appears — the one rendering every family shares
// (decisions D2/D3 of inventory-app#2015). It renders a view-model, never a
// record: `partner` is what viewer-core's `partnerView(partner, text, ctx)`
// returns, so the contact persons, the captions and the links are read the
// same way on every site, and what differs by family (routes, the hidden
// rule, the country label) was settled when the view-model was built.
//
//   variant: 'line'     a row of a list: logo, the name as a link, the city,
//                       the object count (or `emptyLabel`), then the actions
//            'summary'  one line under an item's holder text: an optional
//                       `label` ("About"), the name as a link, "city,
//                       country"; with `heading`, the name heads the page
//                       instead (the partner-objects pages)
//            'full'     the partner page's body: the name and location, the
//                       About · Contact · Logo · homepage strip, the pictures
//                       beside the open panel, the map below
//   layout:  'tabs' (default) or 'sections' — `full` only; `sections` renders
//            About, Contact and Logo one after another under their titles
//   show:    { part: false } switches a part off: `logo`, `location`,
//            `count`, `pictures`, `description`, `contact`, `persons`,
//            `logos`, `homepage`, `map`; `{ actions: true }` turns on the
//            line's default Read more · View objects links
//   heading: the level of the name (1–6; 0, the default, is not a heading);
//            `sections` titles its sections one level below
//
// Every text is an entry name, resolved here: the labels a family words its
// own way (`emptyLabel`, `homepageLabel`, …) are props, defaulting to the
// shared `partner.*` entries. Slots: `badge` (before the name), `meta`
// (after the location, or in place of the line's count), `actions` (the
// line's links, the page's view-objects button), `after` (the end).

const props = defineProps({
  partner: { type: Object, default: null },
  variant: { type: String, default: 'full' },
  layout: { type: String, default: 'tabs' },
  show: { type: Object, default: () => ({}) },
  heading: { type: Number, default: 0 },
  label: { type: String, default: '' },
  objectsLabel: { type: String, default: 'partner.item.objectsInSite' },
  emptyLabel: { type: String, default: '' },
  homepageLabel: { type: String, default: 'partner.nav.homepage' },
  readMoreLabel: { type: String, default: 'partner.action.readMore' },
  viewObjectsLabel: { type: String, default: 'partner.action.viewObjects' },
  dir: { type: String, default: '' },
})

const { t } = useI18n()
const id = useId()

// Everything is on unless `show` switches it off, except two parts a caller
// turns on: the line's default Read more · View objects links (the
// standalone lists never had them) and the summary's logo (an item page's
// line is text).
const DEFAULT_OFF = { line: ['actions'], summary: ['logo'], full: [] }
function shows(part) {
  const value = props.show?.[part]
  return value === undefined ? !(DEFAULT_OFF[props.variant] ?? []).includes(part) : Boolean(value)
}

const p = computed(() => props.partner)
const nameTag = computed(() => (props.heading >= 1 && props.heading <= 6 ? `h${props.heading}` : 'p'))
const sectionTag = computed(() => (props.heading >= 1 && props.heading <= 5 ? `h${props.heading + 1}` : 'p'))
const logo = computed(() => p.value?.logos?.[0] ?? null)
const website = computed(() => (shows('homepage') ? p.value?.contact?.website ?? null : null))

// ── The page's tabs ──────────────────────────────────────────────────────────

const tabs = computed(() => {
  const partner = p.value
  if (!partner) return []
  const list = []
  if (shows('description')) list.push({ key: 'about', label: t('partner.info.about') })
  const persons = shows('persons') ? partner.persons ?? [] : []
  const contact = partner.contact ?? {}
  const hasContact = contact.address || contact.phone || contact.fax || contact.email
    || contact.website || contact.links?.length || persons.length
  if (shows('contact') && hasContact) list.push({ key: 'contact', label: t('partner.info.contact') })
  if (shows('logos') && partner.logos?.length) list.push({ key: 'logo', label: t('partner.info.logo') })
  return list
})

const active = ref('')
watch(
  () => [p.value?.id, tabs.value.map((tab) => tab.key).join()],
  () => {
    if (!tabs.value.some((tab) => tab.key === active.value)) active.value = tabs.value[0]?.key ?? ''
  },
  { immediate: true },
)
watch(() => p.value?.id, () => { active.value = tabs.value[0]?.key ?? '' })

function tabId(key) { return `${id}-tab-${key}` }
function panelId(key) { return `${id}-panel-${key}` }

// Arrow keys move along the strip, Home/End to its ends — the ARIA tabs
// pattern, with automatic activation.
function onKey(event) {
  const keys = tabs.value.map((tab) => tab.key)
  const at = keys.indexOf(active.value)
  const next = {
    ArrowRight: (at + 1) % keys.length,
    ArrowLeft: (at - 1 + keys.length) % keys.length,
    Home: 0,
    End: keys.length - 1,
  }[event.key]
  if (next === undefined || !keys.length) return
  event.preventDefault()
  active.value = keys[next]
  nextTick(() => document.getElementById(tabId(keys[next]))?.focus())
}

const persons = computed(() => (shows('persons') ? p.value?.persons ?? [] : []))
const links = computed(() => [
  ...(p.value?.contact?.website ? [p.value.contact.website] : []),
  ...(p.value?.contact?.links ?? []),
])
</script>

<template>
  <div v-if="partner && variant === 'line'" class="mwnf-partner-panel mwnf-partner-panel--line" :dir="dir || undefined">
    <img
      v-if="shows('logo') && logo"
      class="mwnf-partner-panel__logo"
      :src="logo.url"
      :alt="partner.plainName"
      loading="lazy"
    />
    <div class="mwnf-partner-panel__text">
      <slot name="badge" :partner="partner" />
      <component :is="partner.route ? SmartLink : 'span'" class="mwnf-partner-panel__name" :to="partner.route || undefined">
        <span v-html="partner.name"></span><span v-if="shows('location') && partner.city">, {{ partner.city }}</span>
      </component>
      <slot name="meta" :partner="partner">
        <p v-if="shows('count') && partner.itemCount" class="mwnf-partner-panel__count">
          {{ partner.itemCount }} {{ t(objectsLabel) }}
        </p>
        <p v-else-if="shows('count') && emptyLabel" class="mwnf-partner-panel__count mwnf-partner-panel__count--empty">
          {{ t(emptyLabel) }}
        </p>
      </slot>
      <p v-if="$slots.actions || (shows('actions') && partner.route)" class="mwnf-partner-panel__actions">
        <slot name="actions" :partner="partner">
          <SmartLink :to="partner.route">{{ t(readMoreLabel) }}</SmartLink>
          <template v-if="partner.objectsRoute">
            <span class="mwnf-partner-panel__divider" aria-hidden="true">|</span>
            <SmartLink :to="partner.objectsRoute">{{ t(viewObjectsLabel) }}</SmartLink>
          </template>
        </slot>
      </p>
    </div>
    <slot name="after" :partner="partner" />
  </div>

  <div v-else-if="partner && variant === 'summary'" class="mwnf-partner-panel mwnf-partner-panel--summary" :class="{ 'mwnf-partner-panel--heading': heading }" :dir="dir || undefined">
    <img
      v-if="shows('logo') && logo"
      class="mwnf-partner-panel__logo"
      :src="logo.url"
      :alt="partner.plainName"
      loading="lazy"
    />
    <template v-if="heading">
      <slot name="badge" :partner="partner" />
      <component :is="nameTag" class="mwnf-partner-panel__name">
        <component :is="partner.route ? SmartLink : 'span'" :to="partner.route || undefined"><span v-html="partner.name"></span></component>
      </component>
      <p v-if="shows('location') && partner.location" class="mwnf-partner-panel__location">{{ partner.location }}</p>
      <slot name="meta" :partner="partner" />
    </template>
    <p v-else class="mwnf-partner-panel__line">
      <slot name="badge" :partner="partner" />
      <component :is="partner.route ? SmartLink : 'span'" class="mwnf-partner-panel__name" :to="partner.route || undefined">
        <template v-if="label">{{ `${t(label)} ` }}</template><span v-html="partner.name"></span>
      </component><template v-if="shows('location') && partner.location">, <span class="mwnf-partner-panel__location">{{ partner.location }}</span></template>
      <slot name="meta" :partner="partner" />
    </p>
    <slot name="actions" :partner="partner" />
    <slot name="after" :partner="partner" />
  </div>

  <div v-else-if="partner" class="mwnf-partner-panel mwnf-partner-panel--full" :class="`mwnf-partner-panel--${layout === 'sections' ? 'sections' : 'tabs'}`" :dir="dir || undefined">
    <div class="mwnf-partner-panel__header">
      <slot name="badge" :partner="partner" />
      <component :is="nameTag" class="mwnf-partner-panel__name" v-html="partner.name"></component>
      <p v-if="shows('location') && partner.location" class="mwnf-partner-panel__location">{{ partner.location }}</p>
      <slot name="meta" :partner="partner" />
    </div>

    <div v-if="(layout !== 'sections' && tabs.length) || website || $slots.actions" class="mwnf-partner-panel__bar">
      <div v-if="layout !== 'sections' && tabs.length" role="tablist" class="mwnf-partner-panel__tabs" :aria-label="partner.plainName" @keydown="onKey">
        <template v-for="(tab, index) in tabs" :key="tab.key">
          <span v-if="index" class="mwnf-partner-panel__divider" aria-hidden="true">|</span>
          <button
            :id="tabId(tab.key)"
            type="button"
            role="tab"
            class="mwnf-partner-panel__tab"
            :class="{ 'mwnf-partner-panel__tab--active': active === tab.key }"
            :aria-selected="active === tab.key ? 'true' : 'false'"
            :aria-controls="panelId(tab.key)"
            :tabindex="active === tab.key ? 0 : -1"
            @click="active = tab.key"
          >{{ tab.label }}</button>
        </template>
        <template v-if="website">
          <span class="mwnf-partner-panel__divider" aria-hidden="true">|</span>
          <a class="mwnf-partner-panel__homepage" :href="website.url" target="_blank" rel="noopener">↗ {{ t(homepageLabel) }}</a>
        </template>
      </div>
      <a v-else-if="website" class="mwnf-partner-panel__homepage" :href="website.url" target="_blank" rel="noopener">↗ {{ t(homepageLabel) }}</a>
      <div v-if="$slots.actions" class="mwnf-partner-panel__actions">
        <slot name="actions" :partner="partner" />
      </div>
    </div>

    <div class="mwnf-partner-panel__body">
      <MediaGallery
        v-if="shows('pictures') && partner.pictures?.length"
        class="mwnf-partner-panel__pictures"
        :images="partner.pictures"
      />
      <div class="mwnf-partner-panel__panels">
        <component
          :is="layout === 'sections' ? 'section' : 'div'"
          v-for="tab in tabs"
          v-show="layout === 'sections' || active === tab.key"
          :id="panelId(tab.key)"
          :key="tab.key"
          class="mwnf-partner-panel__panel"
          :class="`mwnf-partner-panel__panel--${tab.key}`"
          v-bind="layout === 'sections' ? {} : { role: 'tabpanel', 'aria-labelledby': tabId(tab.key), tabindex: 0 }"
        >
          <component :is="sectionTag" v-if="layout === 'sections'" class="mwnf-partner-panel__section-title">{{ tab.label }}</component>

          <div v-if="tab.key === 'about'" class="mwnf-prose mwnf-partner-panel__description" v-html="partner.description"></div>

          <div v-else-if="tab.key === 'contact'" class="mwnf-partner-panel__contact">
            <template v-if="partner.contact.address">
              <p class="mwnf-partner-panel__contact-heading">{{ t('partner.info.addresses') }}</p>
              <div class="mwnf-prose mwnf-partner-panel__address" v-html="partner.contact.address"></div>
            </template>
            <p v-if="partner.contact.phone">{{ t('partner.info.phone') }} {{ partner.contact.phone }}</p>
            <p v-if="partner.contact.fax">{{ t('partner.info.fax') }} {{ partner.contact.fax }}</p>
            <p v-if="partner.contact.email"><a :href="`mailto:${partner.contact.email}`">{{ partner.contact.email }}</a></p>
            <p v-if="links.length" class="mwnf-partner-panel__links">
              <template v-for="(link, index) in links" :key="link.url">
                <span v-if="index" class="mwnf-partner-panel__divider" aria-hidden="true">|</span>
                <a :href="link.url" target="_blank" rel="noopener">{{ link.label }}</a>
              </template>
            </p>
            <div v-for="(person, index) in persons" :key="index" class="mwnf-partner-panel__person">
              <p v-if="person.title" class="mwnf-partner-panel__person-title">{{ person.title }}</p>
              <p v-if="person.name">{{ person.name }}</p>
              <p v-if="person.phone">{{ t('partner.info.phone') }} {{ person.phone }}</p>
              <p v-if="person.fax">{{ t('partner.info.fax') }} {{ person.fax }}</p>
              <p v-if="person.email"><a :href="`mailto:${person.email}`">{{ person.email }}</a></p>
            </div>
          </div>

          <div v-else-if="tab.key === 'logo'" class="mwnf-partner-panel__logos">
            <img v-for="entry in partner.logos" :key="entry.url" :src="entry.url" :alt="entry.alt" />
          </div>
        </component>
      </div>
    </div>

    <PartnerMap
      v-if="shows('map') && partner.map"
      class="mwnf-partner-panel__map"
      :latitude="partner.map.latitude"
      :longitude="partner.map.longitude"
      :zoom="partner.map.zoom"
      :label="partner.map.label"
    />
    <slot name="after" :partner="partner" />
  </div>
</template>
