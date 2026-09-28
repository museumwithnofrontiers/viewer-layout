<script setup>
import { computed, getCurrentInstance } from 'vue'

// The one place a content component makes a link. This package has no
// router of its own — a website's links are `href`s its own router produced,
// and with hash history a `#/item/1` navigates as a plain anchor. A website
// that hands over a route location (`to`) instead gets a `RouterLink` when
// its application registered one, which every vue-router application has,
// and a plain anchor otherwise. Nothing here imports vue-router.
//
// A `to` that is an absolute address (`https://…`, `mailto:…`) is never a
// route: it leaves the site, so it is always a plain anchor. Handed to
// `RouterLink`, it would be read as a path inside the site and become
// `#/https://…` — the DXA sites' sibling galleries, whose `legacy_host` is
// such an address, all linked to their own not-found page that way.
const props = defineProps({
  to: { type: [String, Object], default: null },
  href: { type: String, default: '' },
  external: { type: Boolean, default: false },
})

const ABSOLUTE = /^[a-z][a-z0-9+.-]*:/i

const RouterLink = getCurrentInstance()?.appContext.components.RouterLink ?? null
const absoluteTo = computed(() => typeof props.to === 'string' && ABSOLUTE.test(props.to))
const useRouter = computed(() => Boolean(props.to && RouterLink && !absoluteTo.value))
const plainHref = computed(() => props.href || (typeof props.to === 'string' ? props.to : ''))
</script>

<template>
  <component :is="RouterLink" v-if="useRouter" :to="to" v-bind="$attrs"><slot /></component>
  <a
    v-else
    :href="plainHref || undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    v-bind="$attrs"
  ><slot /></a>
</template>
