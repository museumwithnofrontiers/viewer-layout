<script setup>
// An exhibition's home page is the banner alone, and the banner is the
// shell's (Shell.vue): legacy's home route mounted four named views —
// banner, navigation, bottom banner, logos — and nothing in the default one.
// So the page is empty by design. It still has to exist: with no component
// on the `home` route, the router would fall back to viewer-core's generic
// home view, which prints a site-name heading and an entity list.
</script>

<template>
  <div class="mwnf-dxa-home"></div>
</template>
