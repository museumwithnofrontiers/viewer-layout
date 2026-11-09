<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  glossaryEntries, glossaryTermsForText, renderBlock, renderInline, useGlossaryPopup, useI18n,
} from '@museumwnf/viewer-core'
import GlossaryPopover from '../../content/GlossaryPopover.vue'
import HoverZoom from './HoverZoom.vue'
import { exhibition, exhibitionSubtitle, exhibitionTitle, labelOf, themes, tr } from './data.js'
import { themeNodeRoute } from './themeSpecs.js'

// An exhibition's theme page as legacy's ThemeComponent (exhibitions-client,
// inventory-app#2379): the band of the node's pictures, scrolled under two
// arrows when legacy's width allowed fewer than it holds, with the "Add
// Related Works" switch under it; then, side by side, the chosen picture
// (zoomed under the pointer, the whole of it on a click) with its caption
// and the way to its database entry, and the text: the theme's title bar,
// the sub-theme's title ("Overview" on a theme's own page), the quote, the
// presentation, the picture's curated text, its related works, ← PREVIOUS /
// NEXT → and "In This Theme". `aboutMode` serves /about: the About theme
// under the exhibition's own title and subtitle.
//
// The address keeps legacy's shape, so a legacy link still resolves:
//   /theme/:id/:subtheme?/:image?
//     :id       display_order - 1
//     :subtheme `overview`, or a 1-based index into the sub-themes
//     :image    the selection's display_order (the importer sets it to the
//               legacy theme_item id)
const props = defineProps({
  aboutMode: { type: Boolean, default: false },
})

const {
  aboutTheme, listedThemes, pictureById, pictureParent, romanFor, themeByRouteId, themeText, useThemePictures,
} = themes
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const theme = computed(() => (props.aboutMode ? aboutTheme.value : themeByRouteId(route.params.id)))

const subIndex = computed(() => {
  const raw = route.params.subtheme
  if (props.aboutMode || !raw || raw === 'overview') return null
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : null
})
const subTheme = computed(() => (subIndex.value === null ? null : (theme.value?.sub_themes ?? [])[subIndex.value - 1] ?? null))

/** The node whose text and pictures the page shows: a sub-theme, or the theme. */
const node = computed(() => subTheme.value ?? theme.value)
const pictures = useThemePictures(node)

// ── The band: a related work shows only once the switch is on ──────────────

const isRelatedWork = (picture) => (picture.backRelated ?? []).length > 0
const relatedExists = computed(() => pictures.value.some(isRelatedWork))
const showAll = ref(false)
const shown = computed(() => (showAll.value ? pictures.value : pictures.value.filter((p) => !isRelatedWork(p))))

// Legacy scrolled the band under two arrows past as many pictures as its
// width allowed: nine, then one fewer at each of its steps.
const STEPS = [[774, 4], [899, 5], [1024, 6], [1199, 7], [1299, 8]]
const width = ref(typeof window === 'undefined' ? 1366 : window.innerWidth)
const onResize = () => { width.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
const bandLimit = computed(() => (STEPS.find(([max]) => width.value <= max)?.[1] ?? 9))
const showScroll = computed(() => !showAll.value && shown.value.length > bandLimit.value)
const strip = ref(null)
function scrollBand(direction) {
  const thumb = strip.value?.querySelector('img')
  const step = (thumb?.clientWidth ?? 125) + 50
  strip.value?.scrollTo({ left: (strip.value.scrollLeft ?? 0) + direction * step, behavior: 'smooth' })
}

// A thumbnail's caption opens on the side with more room.
const tipLeft = ref(false)
function placeTip(event) {
  tipLeft.value = event.clientX > window.innerWidth / 2
}

// ── The selection: one of the node's pictures, or one of its related works ─

const selectedId = ref(null)
const relatedIndex = ref(null)

function defaultSelection() {
  const wanted = Number(route.params.image)
  const byOrder = pictures.value.find((p) => p.displayOrder === wanted)
  return (byOrder ?? shown.value[0] ?? pictures.value[0])?.id ?? null
}
function reset() {
  selectedId.value = defaultSelection()
  relatedIndex.value = null
}
onMounted(reset)
// One getter per source: a getter that returns a new array would call back on
// any route change (a query, a replace), dropping the visitor's selection.
watch([() => route.params.id, () => route.params.subtheme, () => props.aboutMode], () => {
  showAll.value = false
  reset()
})
watch(pictures, (list) => {
  if (!list.some((p) => p.id === selectedId.value)) reset()
})

const selected = computed(() => pictures.value.find((p) => p.id === selectedId.value) ?? null)
const selectedRelated = computed(() => (relatedIndex.value === null ? null : selected.value?.related?.[relatedIndex.value] ?? null))
const shownPicture = computed(() => selectedRelated.value?.picture ?? selected.value)

function select(picture) {
  selectedId.value = picture.id
  relatedIndex.value = null
  if (props.aboutMode) return
  router.replace({
    name: 'theme',
    params: { id: route.params.id, subtheme: route.params.subtheme ?? 'overview', image: String(picture.displayOrder) },
  })
}

// The caption under the picture, from its record as legacy's theme items
// carried it: the curated caption and the name, also known as, artist,
// materials, date, dynasty, then museum, location, province and country.
const lightbox = ref(false)
const details = computed(() => {
  const picture = shownPicture.value
  if (!picture) return null
  const raw = pictureById.value.get(picture.id)
  const parent = raw ? pictureParent(raw) : null
  const sheet = parent ? tr('items', parent.id, locale.value) : {}
  const materials = Array.isArray(sheet.materials) ? sheet.materials.join(', ') : (sheet.materials ?? '')
  return {
    caption: selectedRelated.value ? '' : (picture.imageCaption ?? ''),
    name: picture.name ?? '',
    alsoKnownAs: sheet.alternate_name ? renderInline(sheet.alternate_name) : '',
    artist: sheet.artist ? renderInline(sheet.artist) : '',
    materials: materials ? renderInline(materials) : '',
    date: sheet.dates ? renderInline(sheet.dates) : '',
    dynasty: sheet.dynasty ? renderInline(sheet.dynasty) : '',
    place: [sheet.holder || (parent ? labelOf('partners', parent.partner_id) : ''), sheet.location, sheet.province,
      parent ? labelOf('countries', parent.country_id) : ''].filter(Boolean).join(', '),
    to: picture.to ?? null,
  }
})

// ── The text ────────────────────────────────────────────────────────────────

const nodeText = computed(() => (node.value ? themeText(node.value, locale.value) : {}))
// Legacy's bar names a theme with its numeral, as its list does: "IV ▪ Islam in China".
const heading = computed(() => {
  if (props.aboutMode) return exhibitionTitle(locale.value)
  const name = themeText(theme.value, locale.value).title ?? theme.value?.internal_name ?? ''
  return theme.value ? `${romanFor(theme.value.display_order)} ▪ ${name}` : name
})
const subHeading = computed(() => {
  if (props.aboutMode) return exhibitionSubtitle(locale.value)
  if (subTheme.value) return themeText(subTheme.value, locale.value).title ?? subTheme.value.internal_name ?? ''
  return t('exhibition.theme.overview')
})

const contextualDescription = computed(() => {
  if (!node.value?.id || !selected.value?.id || selectedRelated.value) return ''
  return tr('themes', `${node.value.id}/${selected.value.id}`, locale.value).contextual_description ?? ''
})

// Legacy's ThemeComponent asked for the glossary of one of the node's texts:
// a sub-theme's quote, a theme's (and About's) presentation; the other stays
// unmarked. The selected picture's contextual description is always marked.
const markedText = computed(() => (subTheme.value ? nodeText.value.quote : nodeText.value.presentation))
const glossaryTerms = computed(() => glossaryTermsForText(
  [markedText.value, contextualDescription.value].filter(Boolean).join('\n\n'),
  locale.value,
))
const glossaryList = computed(() => glossaryEntries(glossaryTerms.value))
const { active, onClick, close } = useGlossaryPopup(glossaryTerms)
const activeHtml = computed(() => (active.value ? renderBlock(active.value.definition, { breaks: true }) : ''))

const quoteHtml = computed(() => (nodeText.value.quote
  ? renderInline(String(nodeText.value.quote), { glossary: subTheme.value ? glossaryList.value : [] }) : ''))
const bodyHtml = computed(() => (nodeText.value.presentation
  ? renderBlock(String(nodeText.value.presentation), { breaks: true, glossary: subTheme.value ? [] : glossaryList.value }) : ''))
const justificationHtml = computed(() => (contextualDescription.value
  ? renderBlock(String(contextualDescription.value), { breaks: true, glossary: glossaryList.value }) : ''))

// Related works: on a sub-theme, the selected picture's own (legacy's
// relatedItems), and for a related work the picture it relates to
// (relatesTo), with the relation's words.
const relatedItems = computed(() => (subIndex.value === null || !selected.value ? [] : selected.value.related ?? []))
const relatesTo = computed(() => (selected.value && !selectedRelated.value ? (selected.value.backRelated ?? [])[0] ?? null : null))
function showRelatesTo() {
  const target = pictures.value.find((p) => p.id === relatesTo.value?.picture?.id)
  if (target) select(target)
}

// ── The tour: About, then each theme's overview and its sub-themes ─────────

const tour = computed(() => {
  const stops = aboutTheme.value ? [aboutTheme.value] : []
  for (const owner of listedThemes.value) stops.push(owner, ...(owner.sub_themes ?? []))
  return stops
})
const tourIndex = computed(() => tour.value.findIndex((stop) => stop.id === node.value?.id))
const previous = computed(() => (tourIndex.value > 0 ? themeNodeRoute(tour.value[tourIndex.value - 1]) : null))
const next = computed(() => (tourIndex.value >= 0 && tourIndex.value < tour.value.length - 1 ? themeNodeRoute(tour.value[tourIndex.value + 1]) : null))

const subThemeNav = computed(() => (props.aboutMode ? [] : (theme.value?.sub_themes ?? []).map((sub, index) => ({
  index: index + 1,
  title: themeText(sub, locale.value).title ?? sub.internal_name ?? '',
  to: themeNodeRoute(sub),
}))))
const overviewTo = computed(() => (theme.value ? themeNodeRoute(theme.value) : null))

// Legacy's "Related Audio/Videos" (ThemeComponent): the page's own audio and
// video in the page's language, the exhibition's own on /about (legacy's
// theme 0); the heading names what there is.
const media = computed(() => {
  const source = props.aboutMode ? exhibition.value?.media : node.value?.media
  return (source ?? []).filter((entry) => !entry.language || entry.language === locale.value)
})
const audio = computed(() => media.value.filter((entry) => entry.type === 'audio'))
const videos = computed(() => media.value.filter((entry) => entry.type === 'video'))
const mediaHeading = computed(() => {
  if (audio.value.length && videos.value.length) return t('exhibition.sheet.relatedAudioVideos')
  return audio.value.length ? t('exhibition.sheet.relatedAudio') : t('exhibition.sheet.relatedVideos')
})

watch(showAll, () => nextTick(() => strip.value?.scrollTo({ left: 0 })))
</script>

<template>
  <div v-if="node" class="mwnf-dxa-theme-page" :class="{ 'mwnf-dxa-theme-page--about': aboutMode }">
    <div class="mwnf-dxa-theme-page__band">
      <div class="mwnf-dxa-theme-page__thumbs-frame">
        <div v-if="showScroll" class="mwnf-dxa-theme-page__arrows">
          <button type="button" class="mwnf-dxa-theme-page__arrow" :aria-label="t('core.pagination.previous')" @click="scrollBand(-1)">‹</button>
          <button type="button" class="mwnf-dxa-theme-page__arrow" :aria-label="t('core.pagination.next')" @click="scrollBand(1)">›</button>
        </div>
        <div v-if="pictures.length" ref="strip" class="mwnf-dxa-theme-page__thumbs" :class="{ 'mwnf-dxa-theme-page__thumbs--scroll': showScroll }">
          <div
            v-for="picture in shown"
            :key="picture.id"
            class="mwnf-dxa-theme-page__thumb"
            :class="{ 'mwnf-dxa-theme-page__thumb--selected': picture.id === selectedId, 'mwnf-dxa-theme-page__thumb--related': isRelatedWork(picture) }"
          >
            <img :src="picture.image" :alt="picture.imageAlt" @click="select(picture)" @mouseover="placeTip" />
            <div class="mwnf-dxa-theme-page__tip" :class="{ 'mwnf-dxa-theme-page__tip--left': tipLeft }">
              <div>
                <template v-if="picture.imageCaption"><span v-html="renderInline(picture.imageCaption)"></span>, </template><i v-html="picture.name"></i><template v-if="picture.detail">, {{ picture.detail }}</template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="relatedExists" class="mwnf-dxa-theme-page__controls">
        <div class="mwnf-dxa-theme-page__control">
          <label class="mwnf-dxa-theme-page__switch">
            <input v-model="showAll" type="checkbox" />
            <span class="mwnf-dxa-theme-page__slider"></span>
          </label>
          <span @click="showAll = !showAll">{{ showAll ? t('exhibition.theme.hideRelatedWorks') : t('exhibition.theme.addRelatedWorks') }}</span>
        </div>
      </div>
    </div>

    <div class="mwnf-dxa-theme-page__body">
      <div v-if="pictures.length" class="mwnf-dxa-theme-page__selected">
        <div v-if="shownPicture" class="mwnf-dxa-theme-page__picture" @click="lightbox = true">
          <HoverZoom :src="shownPicture.image" :alt="shownPicture.imageAlt" />
        </div>
        <div v-if="lightbox && shownPicture" class="mwnf-dxa-theme-page__lightbox" @click="lightbox = false">
          <div class="mwnf-dxa-theme-page__lightbox-frame"><img :src="shownPicture.image" :alt="shownPicture.imageAlt" /></div>
        </div>
        <div v-if="details" class="mwnf-dxa-theme-page__details">
          <div class="mwnf-dxa-theme-page__detail mwnf-dxa-theme-page__detail--title">
            <template v-if="details.caption"><span v-html="renderInline(details.caption)"></span>, </template><span v-html="details.name"></span>
          </div>
          <div v-if="details.alsoKnownAs" class="mwnf-dxa-theme-page__detail">{{ t('sheet.field.alsoKnownAs') }}: <span v-html="details.alsoKnownAs"></span></div>
          <div v-if="details.artist" class="mwnf-dxa-theme-page__detail" v-html="details.artist"></div>
          <div v-if="details.materials" class="mwnf-dxa-theme-page__detail" v-html="details.materials"></div>
          <div v-if="details.date" class="mwnf-dxa-theme-page__detail" v-html="details.date"></div>
          <div v-if="details.dynasty" class="mwnf-dxa-theme-page__detail" v-html="details.dynasty"></div>
          <div v-if="details.place" class="mwnf-dxa-theme-page__detail">{{ details.place }}</div>
          <RouterLink v-if="details.to" :to="details.to" class="mwnf-dxa-theme-page__detail mwnf-dxa-theme-page__entry">{{ t('exhibition.theme.seeItemEntry') }}</RouterLink>
        </div>
      </div>
      <div v-else class="mwnf-dxa-theme-page__empty">{{ t('exhibition.theme.additionalContent') }}</div>

      <div class="mwnf-dxa-theme-page__content" @click="onClick">
        <div class="mwnf-dxa-theme-page__theme-title">{{ heading }}</div>
        <div class="mwnf-dxa-theme-page__title">{{ subHeading }}</div>
        <template v-if="quoteHtml"><br /><div class="mwnf-dxa-theme-page__quote" v-html="quoteHtml"></div></template>
        <template v-if="bodyHtml"><br /><div class="mwnf-dxa-theme-page__presentation" v-html="bodyHtml"></div></template>
        <br />
        <div v-if="justificationHtml" class="mwnf-dxa-theme-page__justification" v-html="justificationHtml"></div>

        <div v-if="relatedItems.length" class="mwnf-dxa-theme-page__related">
          <div class="mwnf-dxa-theme-page__related-heading">{{ t('exhibition.related.items') }}</div>
          <div v-if="selectedRelated?.text" class="mwnf-dxa-theme-page__justification" v-html="renderInline(selectedRelated.text)"></div>
          <div class="mwnf-dxa-theme-page__related-images">
            <div class="mwnf-dxa-theme-page__related-image mwnf-dxa-theme-page__related-image--main">
              <img :src="selected.image" :alt="selected.imageAlt" @click="relatedIndex = null" />
            </div>
            <div
              v-for="(entry, index) in relatedItems"
              :key="entry.picture.id"
              class="mwnf-dxa-theme-page__related-image"
              :class="{ 'mwnf-dxa-theme-page__thumb--selected': index === relatedIndex }"
            >
              <img :src="entry.picture.image" :alt="entry.picture.imageAlt" @click="relatedIndex = index" />
            </div>
          </div>
        </div>

        <div v-if="relatesTo" class="mwnf-dxa-theme-page__related">
          <div class="mwnf-dxa-theme-page__related-heading">{{ t('exhibition.related.items') }}</div>
          <div class="mwnf-dxa-theme-page__justification mwnf-dxa-theme-page__reciprocal">
            <span v-if="relatesTo.reciprocalText" v-html="renderInline(relatesTo.reciprocalText)"></span>
            <span v-else>{{ t('exhibition.related.reciprocal') }}</span>
          </div>
          <div class="mwnf-dxa-theme-page__related-image">
            <img :src="relatesTo.picture.image" :alt="relatesTo.picture.imageAlt" @click="showRelatesTo" />
          </div>
        </div>

        <div class="mwnf-dxa-theme-page__tour">
          <RouterLink v-if="previous" :to="previous" class="mwnf-dxa-theme-page__tour-link mwnf-dxa-theme-page__tour-link--previous">&larr; {{ t('core.pagination.previous') }}</RouterLink>
          <RouterLink v-if="next" :to="next" class="mwnf-dxa-theme-page__tour-link mwnf-dxa-theme-page__tour-link--next">{{ t('core.pagination.next') }} &rarr;</RouterLink>
        </div>

        <div v-if="subThemeNav.length" class="mwnf-dxa-theme-page__links">
          <div class="mwnf-dxa-theme-page__links-inner">
            <div class="mwnf-dxa-theme-page__links-label">{{ t('exhibition.theme.inThisTheme') }}</div>
            <div><RouterLink :to="overviewTo" :class="{ 'mwnf-dxa-theme-page__link--current': subIndex === null }">{{ t('exhibition.theme.overview') }}</RouterLink></div>
            <div v-for="entry in subThemeNav" :key="entry.index">
              <RouterLink :to="entry.to" :class="{ 'mwnf-dxa-theme-page__link--current': subIndex === entry.index }">{{ entry.index }}. {{ entry.title }}</RouterLink>
            </div>
          </div>
        </div>

        <div v-if="media.length" class="mwnf-dxa-theme-page__media">
          <div class="mwnf-dxa-theme-page__media-heading">{{ mediaHeading }}</div>
          <div v-for="entry in [...audio, ...videos]" :key="entry.url" class="mwnf-dxa-theme-page__media-entry">
            <a :href="entry.url" target="_blank" rel="noopener"><span class="mwnf-dxa-theme-page__media-icon" aria-hidden="true">↗</span> {{ entry.title }}</a>
            <p v-if="entry.description" v-html="renderInline(entry.description)"></p>
          </div>
        </div>
      </div>
    </div>

    <GlossaryPopover :term="active" :html="activeHtml" @close="close" />
  </div>

  <div v-else class="mwnf-loader">{{ t('exhibition.theme.notInExhibition') }}</div>
</template>
