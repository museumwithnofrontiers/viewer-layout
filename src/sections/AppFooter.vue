<script setup>
import { computed, useSlots } from 'vue'
import SocialLinks from './SocialLinks.vue'
import { SOCIAL_ICONS } from './socialLinks.js'

const props = defineProps({
  text: { type: String, default: '' },
  /** [{ label, href, external? }] rendered beside the text. */
  links: { type: Array, default: () => [] },
  // The rights-holder sentence — set only when the site declares `site.origin`
  // and the package carries a `rights` block; empty otherwise, so `text`
  // alone still renders exactly as before.
  attributionLabel: { type: String, default: '' },
  attributionText: { type: String, default: '' },
  termsHref: { type: String, default: '' },
  termsLabel: { type: String, default: '' },
  /** [{ label, href, icon }] — the social-network icons after the text; `icon` a key of SOCIAL_ICONS. */
  social: { type: Array, default: () => [] },
})

const slots = useSlots()
const socialLinks = computed(() => props.social.filter((link) => SOCIAL_ICONS[link.icon]))
// Evaluated at render, not cached: the slots object is not reactive, so a
// computed would miss a slot that appears after the first render.
function visible() {
  return Boolean(slots.default || props.text || props.links.length || props.attributionText || socialLinks.value.length)
}
</script>

<template>
  <footer v-if="visible()" class="mwnf-footer">
    <slot>
      <ul v-if="links.length" class="mwnf-footer__links">
        <li v-for="link in links" :key="link.href ?? link.label">
          <a
            class="mwnf-footer__link"
            :href="link.href"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener' : undefined"
          >{{ link.label }}</a>
        </li>
      </ul>
      <p v-if="text" class="mwnf-footer__text">{{ text }}</p>
      <p v-if="attributionText" class="mwnf-footer__attribution">
        <span v-if="attributionLabel" class="mwnf-footer__attribution-label">{{ attributionLabel }}</span>
        {{ attributionText }}
        <a v-if="termsHref" class="mwnf-footer__terms" :href="termsHref">{{ termsLabel }}</a>
      </p>
      <SocialLinks :links="socialLinks" />
    </slot>
  </footer>
</template>
