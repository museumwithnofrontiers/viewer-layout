<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'
import SheetSection from './SheetSection.vue'
import SmartLink from './SmartLink.vue'

// Where a record is on display: the exhibitions, chapters and galleries that
// show it, in groups each under an optional subheading. A link is a route
// (`to`) or an address (`href`); an `external` one opens elsewhere, marked ↗.
// A name with neither is shown as it is, followed by `pendingLabel` when
// there is one — a place that exists but has no address yet.
//
// With no `heading`, the groups render alone, under a heading the page draws
// itself (the DXA item sheet's related block does).
const props = defineProps({
  /** `[{ heading? (entry name), links: [{ id?, label (inline HTML), to? | href?, external? }] }]` */
  groups: { type: Array, default: () => [] },
  heading: { type: String, default: 'record.related.onDisplayIn' },
  /** An entry name, shown after a name that has no address. */
  pendingLabel: { type: String, default: '' },
  dir: { type: String, default: '' },
})
const { t } = useI18n()

const filled = computed(() => props.groups.filter((group) => group.links?.length))
</script>

<template>
  <component
    :is="heading ? SheetSection : 'div'"
    v-if="filled.length"
    v-bind="heading ? { heading: t(heading) } : {}"
    :dir="dir || undefined"
    class="mwnf-on-display"
  >
    <div v-for="(group, g) in filled" :key="group.heading ?? g" class="mwnf-on-display__group">
      <p v-if="group.heading" class="mwnf-on-display__subheading">{{ t(group.heading) }}</p>
      <ul class="mwnf-on-display__list">
        <li v-for="(link, i) in group.links" :key="link.id ?? i" class="mwnf-on-display__item">
          <SmartLink v-if="link.to || link.href" :to="link.to" :href="link.href" :external="Boolean(link.external)">
            <template v-if="link.external">↗ </template><span v-html="link.label"></span>
          </SmartLink>
          <template v-else>
            <span v-html="link.label"></span>
            <template v-if="pendingLabel">{{ ' ' }}<span class="mwnf-on-display__pending">{{ t(pendingLabel) }}</span></template>
          </template>
        </li>
      </ul>
    </div>
  </component>
</template>
