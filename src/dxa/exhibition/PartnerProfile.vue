<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PartnerDetail from '../PartnerDetail.vue'
import { partnerDetail } from './data.js'

// Kept as `ExhibitionPartnerProfile` for a site that names it on a route of
// its own: the exhibition partner page is the family's shared
// `PartnerDetail` since inventory-app#2034 (`standardRoutes` registers that
// directly). Like the page it replaces, it reads the partner's id from the
// route. Removed by the major release that drops the family's old export
// names (inventory-app#2017).
const props = defineProps({
  variant: { type: String, default: 'partner' },
})

const route = useRoute()
const id = computed(() => String(route.params.id))
</script>

<template>
  <PartnerDetail :id="id" :family="partnerDetail" :variant="props.variant" />
</template>