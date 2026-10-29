<script setup>
// The banner over the introduction, every exhibition page and Further
// Reading: the exhibition's picture (intro_image or exh_image) with its title,
// and the navigation — the exhibition's home page and the parent's list of
// exhibitions; on the introduction and the exhibition pages, the previous
// page and the next one.
import { useRouter } from 'vue-router'
import { useSharingHistoryExhibition } from './exhibition.js'

const props = defineProps({
  // "intro" (exh_introduction.php, bibliography.php) or "page" (theme_items.php, subtheme_items.php).
  kind: { type: String, default: 'page' },
  // The title over the picture: the exhibition's, unless the page names its own.
  heading: { type: String, default: null },
  // Further Reading had no previous and next page.
  paging: { type: Boolean, default: true },
  // The previous page: a route (the introduction's is the home page), or
  // none, which goes back in the browser's history as legacy's other pages did.
  previous: { type: Object, default: null },
  next: { type: Object, default: null },
})

const router = useRouter()
const { label, picture, settings, title } = useSharingHistoryExhibition()
const background = picture(props.kind === 'intro' ? 'legacy/intro_bg.jpg' : 'legacy/exhibition_bg.jpg')

function back() {
  if (props.previous) router.push(props.previous)
  else router.back()
}
</script>

<template>
  <div :class="['mwnf-sh-banner', `mwnf-sh-banner--${kind}`]" :style="{ backgroundImage: background ? `url(${background})` : 'none' }">
    <div class="mwnf-sh-banner__top" />
    <div class="mwnf-sh-banner__title">{{ heading ?? title }}</div>
    <nav class="mwnf-sh-nav">
      <div class="mwnf-sh-nav__group">
        <div class="mwnf-sh-nav__first"><router-link :to="{ name: 'home' }">{{ label('nav.entrance') }}</router-link></div>
        <div class="mwnf-sh-nav__second"><a :href="`${settings.parent}/#/exhibitions`">{{ label('nav.allExhibitions') }}</a></div>
      </div>
      <div v-if="paging" class="mwnf-sh-nav__group">
        <div class="mwnf-sh-nav__first mwnf-sh-nav__previous"><button type="button" @click="back">{{ label('nav.previous') }}</button></div>
        <div v-if="next" class="mwnf-sh-nav__second mwnf-sh-nav__next"><router-link :to="next">{{ label('nav.next') }}</router-link></div>
      </div>
    </nav>
  </div>
</template>
