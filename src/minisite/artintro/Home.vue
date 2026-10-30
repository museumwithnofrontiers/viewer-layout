<script setup>
// The Artistic Introduction's home page (gai/generic_index.php): its title,
// its subtitle, its text and its credits over legacy's picture, the menu of
// its themes — the later ones in a second column, from
// `minisite.menuSecondColumnFrom` on — and, in its corner, legacy's links to
// MWNF's social media (`minisite.social`).
import { computed, watch } from 'vue'
import { useExhibition } from '../exhibition.js'

const { label, lang, data, root, themes, text, title, settings, picture, glossaryFor } = useExhibition()

const own = computed(() => (root.value ? text(root.value.id) : {}))
const description = computed(() =>
  root.value ? data.mdInline(own.value.description, { glossary: glossaryFor(root.value.id) }) : '',
)

// $_HOME_MENU_COL2: the themes before this position in the first column, the
// rest in the second, which legacy marked with a "> " the first had not.
const split = computed(() => (settings.menuSecondColumnFrom ?? Infinity) - 1)
const firstColumn = computed(() => themes.value.slice(0, split.value).map((theme, i) => ({ theme, number: i + 1 })))
const secondColumn = computed(() => themes.value.slice(split.value).map((theme, i) => ({ theme, number: split.value + i + 1 })))

const social = computed(() => settings.social ?? [])
const background = computed(() => picture(lang.value === 'ar' ? 'legacy/home_bg_ar.jpg' : 'legacy/home_bg.jpg'))

watch([title, lang], () => {
  document.title = [label('identity.windowTitle'), title.value].filter(Boolean).join(' | ')
}, { immediate: true })
</script>

<template>
  <div class="mwnf-artintro-home" :style="{ backgroundImage: background ? `url(${background})` : 'none' }">
    <!-- eslint-disable vue/no-v-html -- the introduction's own Markdown, rendered and escaped by viewer-core -->
    <div class="mwnf-artintro-home__title" v-html="data.mdInline(title)" />
    <div class="mwnf-artintro-home__subtitle" v-html="data.mdInline(own.extra?.subtitle ?? '')" />
    <div class="mwnf-artintro-home__description" v-html="description" />
    <div class="mwnf-artintro-home__credits" v-html="data.mdInline(own.extra?.credits ?? '')" />
    <!-- eslint-enable vue/no-v-html -->
    <div class="mwnf-artintro-home__menu">
      <div v-for="{ theme, number } in firstColumn" :key="theme.id">
        <router-link :to="{ name: 'page', params: { theme: number } }">{{ text(theme.id).title }}</router-link>
      </div>
    </div>
    <div v-if="secondColumn.length" class="mwnf-artintro-home__menu2">
      <div v-for="{ theme, number } in secondColumn" :key="theme.id">
        &gt; <router-link :to="{ name: 'page', params: { theme: number } }">{{ text(theme.id).title }}</router-link>
      </div>
    </div>
    <div v-if="social.length" class="mwnf-artintro-home__icons">
      <div class="mwnf-artintro-home__social">
        <a v-for="link in social" :key="link.href" :href="link.href" target="_blank" rel="noopener">
          <span
            class="mwnf-artintro-home__icon"
            :style="{ maskImage: `url(&quot;${picture(link.icon)}&quot;)`, width: `${link.aspect ?? 1}em` }"
            aria-hidden="true"
          />
        </a>
      </div>
      <!-- legacy's line break after the links, which lifts them off the page's foot -->
      <br>
    </div>
  </div>
</template>
