<script setup>
import PartnerDetail from '../PartnerDetail.vue'
import { partnerDetail } from './data.js'

// Kept as `GalleryPartnerProfile` for a site that names it on a route of its
// own: the gallery partner page is the family's shared `PartnerDetail` since
// inventory-app#2034 (`standardRoutes` registers that directly). Removed by
// the major release that drops the family's old export names
// (inventory-app#2017).
defineProps({ id: { type: String, required: true } })
</script>

<template>
  <PartnerDetail :id="id" :family="partnerDetail" />
</template>