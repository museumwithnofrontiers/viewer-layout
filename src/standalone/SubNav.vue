<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// The tab strip under an inner page's banner: a section's pages on the left,
// a "see also" link on the right (Sharing History's About pages, its
// Historical Background, its exhibitions).
//
//   tabs: [{ label: entry, to | href, active }],
//   aside: { label: entry, to | href } | null
const props = defineProps({
  tabs: { type: Array, default: () => [] },
  aside: { type: Object, default: null },
})
const { t } = useI18n()
const items = computed(() => props.tabs.map((tab) => ({ ...tab, label: t(tab.label) })))
</script>

<template>
  <nav v-if="items.length || aside" class="mwnf-standalone-subnav">
    <ul class="mwnf-standalone-subnav__tabs">
      <li v-for="tab in items" :key="tab.label">
        <SmartLink
          :to="tab.to"
          :href="tab.href"
          class="mwnf-standalone-subnav__tab"
          :class="{ 'mwnf-standalone-subnav__tab--active': tab.active }"
          :aria-current="tab.active ? 'page' : undefined"
        >{{ tab.label }}</SmartLink>
      </li>
    </ul>
    <SmartLink v-if="aside" :to="aside.to" :href="aside.href" class="mwnf-standalone-subnav__aside">{{ t(aside.label) }}</SmartLink>
  </nav>
</template>
