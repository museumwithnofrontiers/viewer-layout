<script setup>
// The Related Content box (exh_items.php, and every page's bottom row): the
// parent site's timelines and gallery, this website's further reading and, on
// the home page, the parent's list of exhibitions.
import { useSharingHistoryExhibition } from './exhibition.js'
import { vTip } from '../tip.js'

defineProps({
  // The home page's box ends with "See all Exhibitions"; the other pages' do not.
  allExhibitions: { type: Boolean, default: false },
  // The arrow legacy drew before each link: black on white, white on colour.
  arrow: { type: String, default: 'legacy/arrow_inner_black.gif' },
})

const { label, picture, related, settings } = useSharingHistoryExhibition()
</script>

<template>
  <div class="mwnf-sh-related">
    <span class="mwnf-sh-related__heading">&nbsp;{{ label('related.heading') }}</span>
    <ul>
      <li v-for="link in related" :key="link.key">
        &nbsp;<img :src="picture(arrow)" alt="" class="mwnf-sh-arrow" width="11" height="8">
        <router-link v-if="link.to" v-tip="{ text: link.tip ? label(`related.${link.tip}`) : '' }" :to="link.to">{{ label(`related.${link.key}`) }}</router-link>
        <a v-else v-tip="{ text: typeof link.tip === 'string' ? label(`related.${link.tip}`) : '' }" :href="link.href">{{ label(`related.${link.key}`) }}</a>
      </li>
      <li v-if="allExhibitions">
        &nbsp;<img :src="picture(arrow)" alt="" class="mwnf-sh-arrow" width="11" height="8">
        <b><a :href="`${settings.parent}/#/exhibitions`">{{ label('nav.allExhibitions') }}</a></b>
      </li>
    </ul>
  </div>
</template>
