<script setup>
// Legacy's breadcrumbs ("Home > Exhibition Trails > Tunisia > IFRIQIYA"):
// every step a link but the last. `crumbs`: [{ text, to }].
defineProps({
  crumbs: { type: Array, required: true },
})
</script>

<template>
  <nav class="mwnf-travels-crumbs">
    <template v-for="(crumb, i) in crumbs" :key="i">
      <template v-if="i > 0">&nbsp;&gt;&nbsp;</template>
      <RouterLink v-if="crumb.to && i < crumbs.length - 1" class="mwnf-travels-crumbs__link" :to="crumb.to">{{ crumb.text }}</RouterLink>
      <span v-else>{{ crumb.text }}</span>
    </template>
  </nav>
</template>
