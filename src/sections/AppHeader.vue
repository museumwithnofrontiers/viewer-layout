<script setup>
import { computed, ref, useSlots } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

// The header every website needs, from props: a mark linking home, a title
// cell with a line above it, a group of logos, a row of links, a search
// form, and — for a website that puts it here rather than in the navigation
// — the language switcher. A website fills what it has; the rest renders
// nothing.
const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  /** The line above the title (a platform name, a tagline). */
  eyebrow: { type: String, default: '' },
  /** Where the title cell links to; none when empty. */
  titleHref: { type: String, default: '' },
  /** Where the mark links to; the mark itself is the `brand` slot or `brand` text. */
  home: { type: String, default: '' },
  brand: { type: String, default: '' },
  /** The mark as an image, { src, alt }; the `brand` slot still wins over it. */
  brandLogo: { type: Object, default: null },
  /** [{ image, alt, href? }] */
  logos: { type: Array, default: () => [] },
  logosTitle: { type: String, default: '' },
  /** [{ label, href, external? }] */
  links: { type: Array, default: () => [] },
  /** { placeholder, submitLabel } — renders a search form emitting `search`. */
  search: { type: Object, default: null },
  /** Languages: 'en' or { code, label }; rendered only when `languageStyle` is set. */
  languages: { type: Array, default: () => [] },
  language: { type: String, default: '' },
  /** 'select' | 'buttons' | '' (no switcher in the header). */
  languageStyle: { type: String, default: '' },
})

const emit = defineEmits(['search', 'update:language'])
const slots = useSlots()
const { t } = useI18n()

const normalizedLanguages = computed(() =>
  props.languages.map((l) => (typeof l === 'string' ? { code: l, label: l } : l)),
)
const switcher = computed(() => props.languageStyle && normalizedLanguages.value.length > 1)

const visible = computed(() =>
  Boolean(
    slots.default ||
      slots.brand ||
      props.title ||
      props.subtitle ||
      props.eyebrow ||
      props.brand ||
      props.brandLogo?.src ||
      props.logos.length ||
      props.links.length ||
      props.search ||
      switcher.value,
  ),
)

const term = ref('')
function submit() {
  emit('search', term.value)
  term.value = ''
}
</script>

<template>
  <header v-if="visible" class="mwnf-header">
    <slot>
      <div class="mwnf-header__inner">
        <div v-if="slots.brand || brand || brandLogo?.src || logos.length" class="mwnf-header__brand">
          <component
            :is="home ? 'a' : 'span'"
            v-if="slots.brand || brand || brandLogo?.src"
            class="mwnf-header__home"
            :href="home || undefined"
          >
            <slot name="brand"><img v-if="brandLogo?.src" class="mwnf-header__brand-logo" :src="brandLogo.src" :alt="brandLogo.alt ?? ''" /><template v-else>{{ brand }}</template></slot>
          </component>
          <div v-if="logos.length" class="mwnf-header__logos">
            <p v-if="logosTitle" class="mwnf-header__logos-title">{{ logosTitle }}</p>
            <ul class="mwnf-header__logo-list">
              <li v-for="logo in logos" :key="logo.image">
                <component
                  :is="logo.href ? 'a' : 'span'"
                  class="mwnf-header__logo"
                  :href="logo.href || undefined"
                  :title="logo.alt"
                  :target="logo.href ? '_blank' : undefined"
                  :rel="logo.href ? 'noopener' : undefined"
                >
                  <img :src="logo.image" :alt="logo.alt ?? ''" />
                </component>
              </li>
            </ul>
          </div>
        </div>

        <component
          :is="titleHref ? 'a' : 'div'"
          v-if="title || subtitle || eyebrow"
          class="mwnf-header__lockup"
          :href="titleHref || undefined"
        >
          <p v-if="eyebrow" class="mwnf-header__eyebrow">{{ eyebrow }}</p>
          <p v-if="title" class="mwnf-header__title">{{ title }}</p>
          <p v-if="subtitle" class="mwnf-header__subtitle">{{ subtitle }}</p>
        </component>

        <div v-if="links.length || search || switcher" class="mwnf-header__tools">
          <ul v-if="links.length" class="mwnf-header__links">
            <li v-for="link in links" :key="link.href ?? link.label">
              <a
                class="mwnf-header__link"
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener' : undefined"
              >{{ link.label }}</a>
            </li>
          </ul>
          <form v-if="search" class="mwnf-header__search" role="search" @submit.prevent="submit">
            <input
              v-model="term"
              class="mwnf-header__search-input"
              type="search"
              :placeholder="search.placeholder ?? ''"
              :aria-label="search.placeholder ?? search.submitLabel ?? ''"
            />
            <button class="mwnf-header__search-submit" type="submit" :aria-label="search.submitLabel ?? ''">
              {{ search.submitText ?? '⌕' }}
            </button>
          </form>
          <div v-if="switcher && languageStyle === 'buttons'" class="mwnf-header__languages" role="group" :aria-label="t('layout.language.label')">
            <button
              v-for="l in normalizedLanguages"
              :key="l.code"
              type="button"
              class="mwnf-header__language"
              :class="{ 'mwnf-header__language--active': l.code === language }"
              :aria-pressed="l.code === language ? 'true' : 'false'"
              :lang="l.code"
              @click="emit('update:language', l.code)"
            >{{ l.label }}</button>
          </div>
          <label v-else-if="switcher" class="mwnf-header__languages">
            <span class="mwnf-header__language-label">{{ t('layout.language.label') }}</span>
            <select
              class="mwnf-header__language-select"
              :value="language"
              @change="emit('update:language', $event.target.value)"
            >
              <option v-for="l in normalizedLanguages" :key="l.code" :value="l.code">{{ l.label }}</option>
            </select>
          </label>
        </div>
      </div>
    </slot>
  </header>
</template>
