<script setup>
import { computed } from 'vue'
import { SOCIAL_ICONS } from './socialLinks.js'

// The social-network icon links legacy's footers carried, on their own: the
// footer draws them from `social`, and a site that writes its own `#footer`
// (Explore) draws `mwnfSocialLinks` with this instead of copying the icons.
const props = defineProps({
  /** [{ label, href, icon }] — `icon` one of youtube, x, facebook, instagram, weibo, linkedin; an unknown one is skipped. */
  links: { type: Array, default: () => [] },
})

const known = computed(() => props.links.filter((link) => SOCIAL_ICONS[link.icon]))
</script>

<template>
  <ul v-if="known.length" class="mwnf-footer__social">
    <li v-for="link in known" :key="link.href">
      <a class="mwnf-footer__social-link" :href="link.href" target="_blank" rel="noopener" :aria-label="link.label" :title="link.label">
        <svg class="mwnf-footer__social-icon" :viewBox="SOCIAL_ICONS[link.icon].viewBox" aria-hidden="true" focusable="false">
          <path fill="currentColor" :d="SOCIAL_ICONS[link.icon].path" />
        </svg>
      </a>
    </li>
  </ul>
</template>
