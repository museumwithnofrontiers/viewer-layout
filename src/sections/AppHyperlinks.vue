<script setup>
import { useSlots } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

const props = defineProps({
  /** '' (a list of links) | 'tiles' (a title block beside tiles) */
  variant: { type: String, default: '' },
  title: { type: String, default: '' },
  titleHref: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  // { label, href, description?, external? }
  links: { type: Array, default: () => [] },
})

const slots = useSlots()
const { t } = useI18n()
// Evaluated at render, not cached: the slots object is not reactive, so a
// computed would miss a slot that appears after the first render.
function visible() {
  return Boolean(slots.default || props.links.length)
}
</script>

<template>
  <section
    v-if="visible()"
    class="mwnf-hyperlinks"
    :class="variant ? `mwnf-hyperlinks--${variant}` : ''"
    :aria-label="title || t('layout.hyperlinks.label')"
  >
    <template v-if="variant === 'tiles'">
      <component
        :is="titleHref ? 'a' : 'div'"
        v-if="title || subtitle"
        class="mwnf-hyperlinks__lockup"
        :href="titleHref || undefined"
      >
        <p v-if="title" class="mwnf-hyperlinks__title">{{ title }}</p>
        <p v-if="subtitle" class="mwnf-hyperlinks__subtitle">{{ subtitle }}</p>
      </component>
    </template>
    <p v-else-if="title" class="mwnf-hyperlinks__title">{{ title }}</p>
    <slot>
      <ul class="mwnf-hyperlinks__list">
        <li v-for="link in links" :key="link.href ?? link.label">
          <a
            class="mwnf-hyperlinks__link"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener' : undefined"
          >
            <span class="mwnf-hyperlinks__label">{{ link.label }}</span>
            <span v-if="link.description" class="mwnf-hyperlinks__description">{{ link.description }}</span>
          </a>
        </li>
      </ul>
    </slot>
  </section>
</template>
