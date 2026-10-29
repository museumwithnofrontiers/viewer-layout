<script setup>
// The Related Content box (exh_items.php, and every page's bottom row): the
// parent site's timelines and gallery, this website's further reading and, on
// the home page, the parent's list of exhibitions.
import { computed } from 'vue'
import { useSharingHistoryExhibition } from './exhibition.js'
import { vTip } from '../tip.js'

const props = defineProps({
  // The home page's box ends with "See all Exhibitions"; the other pages' do not.
  allExhibitions: { type: Boolean, default: false },
  // The arrow legacy drew before each link: black on white, white on colour.
  arrow: { type: String, default: 'legacy/arrow_inner_black.gif' },
  // A theme's or subtheme's page: its links are narrowed to it, and open in a
  // new window, as theme_items.php and subtheme_items.php opened them.
  themeId: { type: String, default: null },
  subthemeId: { type: String, default: null },
})

const { label, picture, related, settings } = useSharingHistoryExhibition()
const links = computed(() => related(props.themeId, props.subthemeId))
const target = computed(() => (props.themeId ? '_blank' : undefined))
const tipOf = (link) => link.tipText ?? (link.tip ? label(`related.${link.tip}`) : '')
</script>

<template>
  <div class="mwnf-sh-related">
    <span class="mwnf-sh-related__heading">&nbsp;{{ label('related.heading') }}</span>
    <ul>
      <li v-for="link in links" :key="link.key">
        &nbsp;<img :src="picture(arrow)" alt="" class="mwnf-sh-arrow" width="11" height="8">
        <router-link v-if="link.to" v-tip="{ text: tipOf(link) }" :to="link.to" :target="target">{{ label(`related.${link.key}`) }}</router-link>
        <a v-else v-tip="{ text: tipOf(link) }" :href="link.href" :target="target">{{ label(`related.${link.key}`) }}</a>
      </li>
      <!-- Legacy left a blank line before it. -->
      <li v-if="allExhibitions" class="mwnf-sh-related__all">
        &nbsp;<img :src="picture(arrow)" alt="" class="mwnf-sh-arrow" width="11" height="8">
        <b><a :href="`${settings.parent}/#/exhibitions`">{{ label('nav.allExhibitions') }}</a></b>
      </li>
    </ul>
  </div>
</template>
