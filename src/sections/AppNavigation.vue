<script setup>
import { computed, ref, useSlots } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

const props = defineProps({
  // Plain links: { label, href, active?, external? }. No router coupling —
  // websites pass hrefs produced by their own router (hash URLs work as plain
  // hrefs).
  links: { type: Array, default: () => [] },
  // Languages: 'en' or { code, label }.
  languages: { type: Array, default: () => [] },
  language: { type: String, default: '' },
  /** Whether this section renders the switcher; a website may put it in the header instead. */
  languageSwitcher: { type: Boolean, default: true },
  /** { title?, text } — a standing notice under the links. */
  notice: { type: Object, default: null },
})

const emit = defineEmits(['update:language'])

const slots = useSlots()
const { t } = useI18n()

const normalizedLanguages = computed(() =>
  props.languages.map((l) => (typeof l === 'string' ? { code: l, label: l } : l)),
)
const switcher = computed(() => props.languageSwitcher && normalizedLanguages.value.length > 1)

// Evaluated at render, not cached: the slots object is not reactive, so a
// computed would miss a slot that appears after the first render.
function visible() {
  return Boolean(slots.default || props.links.length || switcher.value || props.notice)
}

// On a narrow screen the links fold behind a button; following one closes
// them again. The button is in the document at every width and shown by the
// stylesheet below the breakpoint, so the behaviour costs no script.
const open = ref(false)
</script>

<template>
  <nav v-if="visible()" class="mwnf-nav" :class="{ 'mwnf-nav--open': open }" :aria-label="t('layout.nav.label')">
    <div class="mwnf-nav__bar">
      <button
        v-if="links.length"
        type="button"
        class="mwnf-nav__toggle"
        :aria-expanded="open ? 'true' : 'false'"
        aria-controls="mwnf-nav-links"
        @click="open = !open"
      >
        <span class="mwnf-nav__toggle-icon" aria-hidden="true">☰</span>
        {{ t('layout.nav.menu') }}
      </button>
      <slot>
        <ul v-if="links.length" id="mwnf-nav-links" class="mwnf-nav__links">
          <li v-for="link in links" :key="link.href ?? link.label">
            <a
              class="mwnf-nav__link"
              :class="{ 'mwnf-nav__link--active': link.active }"
              :href="link.href"
              :aria-current="link.active ? 'page' : undefined"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener' : undefined"
              @click="open = false"
            >{{ link.label }}</a>
          </li>
        </ul>
      </slot>
      <label v-if="switcher" class="mwnf-nav__language">
        <span class="mwnf-nav__language-label">{{ t('layout.language.label') }}</span>
        <select
          class="mwnf-nav__language-select"
          :value="language"
          @change="emit('update:language', $event.target.value)"
        >
          <option v-for="l in normalizedLanguages" :key="l.code" :value="l.code">{{ l.label }}</option>
        </select>
      </label>
    </div>
    <p v-if="notice && (notice.text || notice.title)" class="mwnf-nav__notice">
      <strong v-if="notice.title" class="mwnf-nav__notice-title">{{ notice.title }}</strong>
      {{ notice.text }}
    </p>
  </nav>
</template>
