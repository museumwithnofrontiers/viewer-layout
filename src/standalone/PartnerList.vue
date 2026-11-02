<script setup>
import { computed, ref, watch } from 'vue'
import SmartLink from '../content/SmartLink.vue'

// The standalone family's partner lists, legacy's pm_partner_list.php: the
// way back, the headings, then one row a group (a country, or a country and
// its region). Museums: the group beside "See Associated Museums", which
// opens that group's associated museums and closes any other.
// Institutions: the group itself opens and closes, every group open at
// first (legacy's js/accordion.js). What each word says is the website's.
//
//   groups: [{ label, main: [{ id, label, to | href }], associated: [same] }]
//   back:   [{ label, to | href } | { label, history: true }]
const props = defineProps({
  /** 'museum' or 'institution'. */
  type: { type: String, required: true },
  groups: { type: Array, default: () => [] },
  back: { type: Array, default: () => [] },
  /** The headings over the two columns: one or two. */
  heads: { type: Array, default: () => [] },
  /** "See Associated Museums" */
  seeAssociated: { type: String, default: '' },
  /** Shown under a museum group with no associated museum. */
  noAssociated: { type: String, default: '' },
})

const museums = computed(() => props.type === 'museum')

// One section open at a time, its title active; a click on the active title
// closes them all.
const active = ref(null)
const opened = ref(new Set())
watch(
  [museums, () => props.groups.length],
  () => {
    active.value = museums.value ? null : 0
    opened.value = museums.value ? new Set() : new Set(props.groups.map((_, i) => i))
  },
  { immediate: true },
)
function toggle(index) {
  const closing = active.value === index
  active.value = closing ? null : index
  opened.value = closing ? new Set() : new Set([index])
}
</script>

<template>
  <div class="mwnf-standalone-pl" :class="museums ? 'mwnf-standalone-pl--museums' : 'mwnf-standalone-pl--institutions'">
    <p class="mwnf-standalone-item__back mwnf-standalone-pl__back">
      <template v-for="link in back" :key="link.label">
        <button v-if="link.history" type="button" class="mwnf-standalone-item__back-link" @click="$router.back()">{{ link.label }}</button>
        <SmartLink v-else class="mwnf-standalone-item__back-link" :to="link.to" :href="link.href">{{ link.label }}</SmartLink>
      </template>
      <slot name="back" />
    </p>
    <div class="mwnf-standalone-pl__heads">
      <h3 v-for="head in heads" :key="head">{{ head }}</h3>
    </div>

    <div v-for="(group, index) in groups" :key="group.label" class="mwnf-standalone-pl__group">
      <div class="mwnf-standalone-pl__head">
        <h3 v-if="museums">{{ group.label }}</h3>
        <h3>
          <a
            href="#"
            class="mwnf-standalone-pl__toggle"
            :class="{ 'mwnf-standalone-pl__toggle--active': active === index }"
            @click.prevent="toggle(index)"
          >{{ museums ? seeAssociated : group.label }}</a>
        </h3>
      </div>
      <div v-show="museums || opened.has(index)" class="mwnf-standalone-pl__row">
        <div class="mwnf-standalone-pl__main">
          <p v-for="partner in group.main" :key="partner.id"><SmartLink :to="partner.to" :href="partner.href">{{ partner.label }}</SmartLink></p>
        </div>
        <div v-show="!museums || opened.has(index)" class="mwnf-standalone-pl__associated">
          <p v-for="partner in group.associated" :key="partner.id"><SmartLink :to="partner.to" :href="partner.href">{{ partner.label }}</SmartLink></p>
          <p v-if="museums && !group.associated.length" class="mwnf-standalone-pl__none">{{ noAssociated }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
