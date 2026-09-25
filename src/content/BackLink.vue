<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SmartLink from './SmartLink.vue'

// A "back" link: history first, then the fallback. It goes back through
// history when the previous page is one of this website's own — vue-router
// records that as `history.state.back`, which is null on the first page a
// visitor opened, whatever the tab held before — and to its fallback (`to` or
// `href`) otherwise, so a visitor who arrived from another site stays on this
// one. With no fallback it goes back through whatever history the tab has.
//
// Two shapes. The default is the DXA pages' button. `variant="bar"` is the
// products' back bar: a link carrying `.mwnf-back-bar`, whose address is the
// fallback, so it also opens in a new tab.

const router = useRouter()

const props = defineProps({
  label: { type: String, default: 'core.action.back' },
  to: { type: [String, Object], default: null },
  href: { type: String, default: '' },
  variant: { type: String, default: 'button', validator: (v) => ['button', 'bar'].includes(v) },
  // The bar's leading mark; the products draw `←`, or `‹` on a list's way back.
  arrow: { type: String, default: '←' },
})

const hasFallback = computed(() => Boolean(props.to || props.href))

function goesBack() {
  if (window.history.state?.back != null) return true
  return !hasFallback.value && window.history.length > 1
}

function handleClick() {
  if (goesBack()) router.back()
}

// `#` when there is no fallback: the click is always taken over then, since a
// hash router would read a bare `#` as its home page.
const barHref = computed(() => {
  if (props.to && router) return router.resolve(props.to).href
  return props.href || (typeof props.to === 'string' ? props.to : '') || '#'
})

function handleBarClick(event) {
  // A modified or middle click opens the fallback elsewhere, as a link does.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (goesBack()) {
    event.preventDefault()
    router.back()
  } else if (props.to && router) {
    event.preventDefault()
    router.push(props.to)
  } else if (!hasFallback.value) {
    event.preventDefault()
  }
}
</script>

<template>
  <a v-if="variant === 'bar'" :href="barHref" class="mwnf-back-bar mwnf-back-bar--link" @click="handleBarClick"><span class="mwnf-back-bar__arrow" aria-hidden="true">{{ arrow }}</span> <slot>{{ $t(label) }}</slot></a>
  <div v-else class="mwnf-back-link">
    <SmartLink v-if="hasFallback && !goesBack()" :to="to" :href="href" class="mwnf-back-link__button">
      ↩ {{ $t(label) }}
    </SmartLink>
    <button v-else class="mwnf-back-link__button" @click="handleClick">
      ↩ {{ $t(label) }}
    </button>
  </div>
</template>
