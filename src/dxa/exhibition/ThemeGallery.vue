<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { renderInline, useI18n } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import ObjectGrid from '../gallery/ObjectGrid.vue'
import { labelOf, themes, tr } from './data.js'

// A theme's gallery as legacy's ThemeGallery (exhibitions-client,
// inventory-app#2379): Back; "Theme I | <title> ▪ <sub-theme> | Gallery";
// the pictures of the theme's sub-themes — every one, or the chosen
// sub-theme's — in legacy's tile grid, each named with its curated caption
// before its record's name, in date order, a picture shown once; beside the
// grid "Filter by Subtheme:" and, once one is chosen, "See all Items in this
// Theme"; the way back to the top of the page once it scrolls.
//
//   /theme-gallery/:id/:subtheme?
//     :id       display_order - 1
//     :subtheme a 1-based index into the sub-themes, as legacy's
const { pictureParent, romanFor, themeByRouteId, themeText, themePictures } = themes
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const theme = computed(() => themeByRouteId(route.params.id))
const subThemes = computed(() => theme.value?.sub_themes ?? [])
const subIndex = computed(() => {
  const n = Number(route.params.subtheme)
  return Number.isInteger(n) && n >= 1 && n <= subThemes.value.length ? n : null
})
const title = (node) => themeText(node, locale.value).title ?? node?.internal_name ?? ''

function choose(value) {
  router.push({ name: 'theme-gallery', params: { id: route.params.id, subtheme: value ? String(value) : '' } })
}

// Legacy's `sortChronological`: by the start date, an undated record
// counting as 0, a date over 80 characters cut to 80 and "...".
function shortDate(text) {
  return text && text.length > 80 ? `${text.slice(0, 80)}...` : (text ?? '')
}

const rows = computed(() => {
  const nodes = subIndex.value ? [subThemes.value[subIndex.value - 1]] : subThemes.value
  const out = []
  const seen = new Set()
  for (const node of nodes) {
    for (const raw of themePictures(node)) {
      const parent = pictureParent(raw)
      if (!parent || !raw.image_url || seen.has(raw.image_url)) continue
      seen.add(raw.image_url)
      const sheet = tr('items', parent.id, locale.value)
      const caption = tr('themes', `${node.id}/${raw.picture_item_id}`, locale.value).image_caption ?? ''
      const name = renderInline(labelOf('items', parent.id))
      out.push({
        id: raw.picture_item_id,
        image: raw.image_url,
        imageAlt: labelOf('items', parent.id),
        name: caption ? `${renderInline(caption)}, ${name}` : name,
        date: shortDate(sheet.dates),
        partner: sheet.holder || labelOf('partners', parent.partner_id),
        place: [sheet.location, labelOf('countries', parent.country_id)].filter(Boolean).join(', '),
        project: '',
        to: { name: 'item', params: { id: parent.id } },
        start: parent.start_date ?? 0,
      })
    }
  }
  return out.sort((a, b) => (a.start ?? 0) - (b.start ?? 0))
})

const scrolled = ref(false)
const onScroll = () => { scrolled.value = document.body.scrollHeight > window.innerHeight }
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll); window.addEventListener('resize', onScroll) })
onBeforeUnmount(() => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) })
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
  <div v-if="theme" class="mwnf-dxa-theme-gallery-page">
    <BackLink />
    <div class="mwnf-dxa-theme-gallery-page__header">
      <span>{{ t('exhibition.theme.romanLabel') }} {{ romanFor(theme.display_order) }} | <span class="mwnf-dxa-theme-gallery-page__bold" v-html="renderInline(title(theme))"></span><span v-if="subIndex" class="mwnf-dxa-theme-gallery-page__bold"> ▪ <span v-html="renderInline(title(subThemes[subIndex - 1]))"></span> </span> | {{ t('exhibition.theme.galleryLabel') }}</span>
    </div>
    <div class="mwnf-dxa-theme-gallery-page__wrapper">
      <div class="mwnf-dxa-theme-gallery-page__content">
        <div class="mwnf-dxa-theme-gallery-page__objects">
          <ObjectGrid :rows="rows" family="exhibition" />
        </div>
        <div class="mwnf-dxa-theme-gallery-page__filter">
          <div class="mwnf-dxa-theme-gallery-page__label">{{ t('exhibition.themeGallery.filterBy') }}</div>
          <select class="mwnf-dxa-theme-gallery-page__select" :disabled="!rows.length" :value="subIndex ? String(subIndex) : ''" @change="choose($event.target.value)">
            <option value="" disabled>{{ t('exhibition.themeGallery.select') }}</option>
            <option v-for="(sub, index) in subThemes" :key="sub.id" :value="String(index + 1)">{{ index + 1 }}. {{ title(sub) }}</option>
          </select>
          <div v-if="subIndex" class="mwnf-dxa-theme-gallery-page__reset">
            <button type="button" @click="choose('')">{{ t('exhibition.theme.seeAllInTheme') }}</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="scrolled" class="mwnf-dxa-theme-gallery-page__top">
      <button type="button" :aria-label="t('exhibition.themeGallery.top')" @click="toTop">⌃</button>
    </div>
  </div>

  <div v-else class="mwnf-loader">{{ t('exhibition.theme.notInExhibition') }}</div>
</template>
