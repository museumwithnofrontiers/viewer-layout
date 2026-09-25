<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from '@museumwnf/viewer-core'
import EssayView from '../../views/EssayView.vue'
import PictureGallery from '../PictureGallery.vue'
import PictureNarrative from '../PictureNarrative.vue'
import SourceCredit from '../../content/SourceCredit.vue'
import { exhibitionSubtitle, exhibitionTitle, themes, tr } from './data.js'
import { aboutSpec, themeNodeRoute, themeSpec } from './themeSpecs.js'

// An exhibition's theme page — legacy's ThemeComponent — as an EssayView
// spec (themeSpecs.js) for the shell: the heading, the quote and body with
// the glossary, the tour's previous/next. The picture panel and the
// narrative are PictureGallery/PictureNarrative (docs/theme-components.md).
// `aboutMode` serves /about: the About theme under the exhibition's own
// title and subtitle, with no picture apparatus — EssayView's `about` mode
// drops the side column.
//
// The address keeps legacy's shape, so a legacy link still resolves:
//   /theme/:id/:subtheme?/:image?
//     :id       display_order - 1
//     :subtheme `overview`, or a 1-based index into the sub-themes
//     :image    the selection's display_order, which the importer sets to
//               the legacy theme_item id, so `?image=5` picks the picture
//               it picked on the legacy site.
const props = defineProps({
  aboutMode: { type: Boolean, default: false },
})

const { aboutTheme, owningTheme, romanFor, themeByRouteId, themeText, useThemePictures } = themes
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

const subTheme = computed(() => {
  if (subIndex.value === null) return null
  return (theme.value?.sub_themes ?? [])[subIndex.value - 1] ?? null
})

/** The node whose text and pictures the page shows: a sub-theme, or the theme. */
const node = computed(() => subTheme.value ?? theme.value)

const spec = computed(() => (props.aboutMode ? aboutSpec : themeSpec))

const pictures = useThemePictures(node)

// ── Selection ──────────────────────────────────────────────────────────────
//
// The page's own state rather than EssayView's `items`/`selected`: a curated
// picture is its own id space, several can share one parent with different
// crops and texts, and one whose parent was not exported still renders.

const selectedId = ref(null)

function defaultSelection() {
  const wanted = Number(route.params.image)
  const byOrder = pictures.value.find((p) => p.displayOrder === wanted)
  return (byOrder ?? pictures.value[0])?.id ?? null
}

function reset() {
  selectedId.value = defaultSelection()
}

onMounted(reset)
watch(() => [route.params.id, route.params.subtheme, props.aboutMode], reset)

const selected = computed(() => pictures.value.find((p) => p.id === selectedId.value) ?? null)

// A pick among the node's own pictures updates the address as legacy's
// `?image=` did; a cross-theme related pick has no display order in this
// node's address to write, so the address is left alone.
function onSelect(id) {
  selectedId.value = id
  if (props.aboutMode) return
  const picture = pictures.value.find((p) => p.id === id)
  if (!picture) return
  router.replace({
    name: 'theme',
    params: {
      id: route.params.id,
      subtheme: route.params.subtheme ?? 'overview',
      image: String(picture.displayOrder),
    },
  })
}

// ── Text ───────────────────────────────────────────────────────────────────
//
// The quote and the body are the spec's; the two-tier heading (the owning
// theme's title, then the sub-theme's or "Overview") is the page's own.

const themeTitle = computed(() => themeText(theme.value, locale.value).title ?? theme.value?.internal_name ?? '')

const heading = computed(() => (props.aboutMode ? exhibitionTitle(locale.value) : themeTitle.value))

const subHeading = computed(() => {
  if (props.aboutMode) return exhibitionSubtitle(locale.value)
  if (subTheme.value) return themeText(subTheme.value, locale.value).title ?? subTheme.value.internal_name ?? ''
  return t('exhibition.theme.overview')
})

// Always the owning theme's numeral — legacy never numbered a sub-theme on
// its own page — and empty for the About theme.
const roman = computed(() => romanFor(owningTheme(theme.value)?.display_order ?? 1))

// The selected picture's own curated text in this node, keyed as its
// caption is: `<node id>/<picture item id>`. PictureNarrative renders it.
const contextualDescription = computed(() => {
  if (!node.value?.id || !selected.value?.id) return ''
  return tr('themes', `${node.value.id}/${selected.value.id}`, locale.value).contextual_description ?? ''
})

const subThemeNav = computed(() =>
  (theme.value?.sub_themes ?? []).map((sub, index) => ({
    index: index + 1,
    title: themeText(sub, locale.value).title ?? sub.internal_name ?? '',
    to: themeNodeRoute(sub),
  })),
)

const overviewTo = computed(() => (theme.value ? themeNodeRoute(theme.value) : null))

// Decoration, not a text: written twice, in the tour's navigation and in the
// About page's one-way link into the tour.
const nextArrow = '→'
</script>

<template>
  <EssayView v-if="node" :spec="spec" :id="node.id" class="mwnf-dxa-theme" :class="{ 'mwnf-dxa-theme--about': aboutMode }">
    <template #header>
      <div class="mwnf-dxa-theme__heading">
        <span v-if="roman" class="mwnf-dxa-theme__numeral">{{ t('exhibition.theme.romanLabel') }} {{ roman }} ▪ </span>{{ heading }}
      </div>
      <div class="mwnf-dxa-theme__subheading">{{ subHeading }}</div>
    </template>

    <template #panel>
      <PictureGallery :pictures="pictures" :selected-id="selectedId" @update:selected-id="onSelect" />
    </template>

    <template #after-body>
      <PictureNarrative
        v-if="!aboutMode"
        :picture="selected"
        :contextual-description="contextualDescription"
        @select="onSelect"
      />
    </template>

    <!-- The tour, then the sub-theme list, in legacy's order. About mode has
         neither: EssayView's `about` drops this block, and its one-way link
         into the tour is in `after` below. -->
    <template #navigation="{ previous, next }">
      <div class="mwnf-dxa-theme__tour">
        <RouterLink v-if="previous" :to="themeNodeRoute(previous)" class="mwnf-dxa-theme__tour-link">← {{ t('exhibition.theme.previous') }}</RouterLink>
        <span v-else></span>
        <RouterLink v-if="next" :to="themeNodeRoute(next)" class="mwnf-dxa-theme__tour-link">{{ t('exhibition.theme.next') }} {{ nextArrow }}</RouterLink>
      </div>

      <div v-if="subThemeNav.length" class="mwnf-dxa-theme__subthemes">
        <div class="mwnf-dxa-theme__subthemes-label">{{ t('exhibition.theme.inThisTheme') }}</div>
        <div class="mwnf-dxa-theme__subtheme">
          <RouterLink :to="overviewTo" :class="{ 'mwnf-dxa-theme__subtheme--current': subIndex === null }">{{ t('exhibition.theme.overview') }}</RouterLink>
        </div>
        <div v-for="entry in subThemeNav" :key="entry.index" class="mwnf-dxa-theme__subtheme">
          <RouterLink :to="entry.to" :class="{ 'mwnf-dxa-theme__subtheme--current': subIndex === entry.index }">{{ entry.index }}. {{ entry.title }}</RouterLink>
        </div>
      </div>
    </template>

    <!-- Filling `after` replaces its default SourceCredit, so the credit is
         drawn here too; About mode adds its one-way link into the tour. -->
    <template #after="{ next }">
      <div v-if="aboutMode && next" class="mwnf-dxa-theme__tour">
        <span></span>
        <RouterLink :to="themeNodeRoute(next)" class="mwnf-dxa-theme__tour-link">{{ t('exhibition.theme.next') }} {{ nextArrow }}</RouterLink>
      </div>
      <SourceCredit />
    </template>
  </EssayView>

  <div v-else class="mwnf-loader">{{ t('exhibition.theme.notInExhibition') }}</div>
</template>
