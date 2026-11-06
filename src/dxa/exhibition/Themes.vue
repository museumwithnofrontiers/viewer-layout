<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { renderInline, renderPlain, useI18n } from '@museumwnf/viewer-core'
import { labelOf, themes, tr } from './data.js'
import { themeNodeRoute } from './themeSpecs.js'

// The exhibition's themes as legacy's ThemesPage (exhibitions-client,
// inventory-app#2379): "Expand all Themes"; each theme a bar in the contrast
// colour, "Theme I ▪ <title>" with its caret, over four strips of its cover
// picture; opened (one at a time, or all), the picture and its caption on the
// left half, which is the main colour, and on the right the start of its
// presentation with "See more", "In This Theme" with its sub-themes, and
// "See Gallery for Theme I". It starts after the About theme, which legacy
// renders at /about.
const { listedThemes, pictureById, pictureParent, romanFor, themeText } = themes
const { t, locale } = useI18n()

const showAll = ref(false)
const open = ref(null)
function toggle(index) {
  if (showAll.value) return
  open.value = open.value === index ? null : index
}
function toggleAll() {
  showAll.value = !showAll.value
  open.value = null
}

// Legacy's `truncate(250, …)`: the text up to the last space before 250
// characters, then "...".
function excerpt(text) {
  if (!text || text.length <= 250) return text ?? ''
  return `${text.substring(0, text.lastIndexOf(' ', 250))}...`
}

// Legacy's caption under the cover: its record's name, holding museum,
// location and country, blanks dropped.
function coverCaption(cover) {
  const parent = cover ? pictureParent(cover) : null
  if (!parent) return ''
  const sheet = tr('items', parent.id, locale.value)
  return [labelOf('items', parent.id), sheet.holder, sheet.location, labelOf('countries', parent.country_id)]
    .filter(Boolean).join(', ')
}

const cards = computed(() => listedThemes.value.map((theme, index) => {
  const cover = theme.cover_picture_item_id ? pictureById.value.get(theme.cover_picture_item_id) : null
  const text = themeText(theme, locale.value)
  return {
    index,
    id: theme.id,
    title: text.title ?? theme.internal_name ?? '',
    numeral: romanFor(theme.display_order),
    cover: cover?.image_url ?? '',
    caption: coverCaption(cover),
    excerpt: excerpt(renderPlain(String(text.presentation ?? ''))),
    to: themeNodeRoute(theme),
    gallery: { name: 'theme-gallery', params: { id: String(theme.display_order - 1) } },
    subThemes: (theme.sub_themes ?? []).map((sub, n) => ({
      label: `${n + 1}. ${themeText(sub, locale.value).title ?? sub.internal_name ?? ''}`,
      to: themeNodeRoute(sub),
    })),
  }
}))
</script>

<template>
  <div class="mwnf-dxa-themes-page">
    <div class="mwnf-dxa-themes-page__container">
      <div class="mwnf-dxa-themes-page__show-all" @click="toggleAll">
        <span>{{ showAll ? t('exhibition.themes.collapseAll') : t('exhibition.themes.expandAll') }}</span>
      </div>
      <div v-for="card in cards" :key="card.id" class="mwnf-dxa-themes-page__theme">
        <div
          class="mwnf-dxa-themes-page__title"
          :class="{ 'mwnf-dxa-themes-page__title--fixed': showAll }"
          @click="toggle(card.index)"
        >
          <span>{{ t('exhibition.theme.romanLabel') }} {{ card.numeral }} ▪ <span v-html="renderInline(card.title)"></span>
            <template v-if="!showAll"> {{ open === card.index ? '▴' : '▾' }}</template>
          </span>
        </div>
        <div v-if="open !== card.index && !showAll" class="mwnf-dxa-themes-page__strips">
          <img v-for="n in 4" :key="n" :src="card.cover" alt="" />
        </div>
        <div v-else class="mwnf-dxa-themes-page__open">
          <div class="mwnf-dxa-themes-page__image">
            <img v-if="card.cover" :src="card.cover" :alt="renderPlain(card.title)" />
            <div v-if="card.caption" class="mwnf-dxa-themes-page__caption"><span v-html="renderInline(card.caption)"></span></div>
          </div>
          <div class="mwnf-dxa-themes-page__info">
            <div class="mwnf-dxa-themes-page__description">
              <span>{{ card.excerpt }}</span>
              {{ ' ' }}<RouterLink :to="card.to" class="mwnf-dxa-themes-page__link mwnf-dxa-themes-page__see-more">{{ t('exhibition.themes.seeMore') }}</RouterLink>
            </div>
            <div class="mwnf-dxa-themes-page__subthemes">
              <div class="mwnf-dxa-themes-page__subthemes-label">{{ t('exhibition.theme.inThisTheme') }}</div>
              <div v-for="sub in card.subThemes" :key="sub.label">
                <RouterLink :to="sub.to" class="mwnf-dxa-themes-page__link">{{ sub.label }}</RouterLink>
              </div>
            </div>
            <div class="mwnf-dxa-themes-page__gallery">
              <RouterLink :to="card.gallery">{{ t('exhibition.themes.seeGallery') }} {{ card.numeral }}</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
