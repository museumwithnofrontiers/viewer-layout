<script setup>
import { useSlots } from 'vue'

const slots = useSlots()
// Evaluated at render, not cached: the slots object is not reactive, so a
// computed would miss a slot that appears after the first render.
function visible() {
  return Boolean(slots.default)
}
</script>

<template>
  <main v-if="visible()" id="mwnf-content" class="mwnf-content">
    <slot />
  </main>
</template>
