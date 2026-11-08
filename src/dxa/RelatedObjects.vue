<script setup>
import SmartLink from '../content/SmartLink.vue'

// Legacy's Related Objects on a DXA item sheet (dxa-client's
// DatabaseItem.vue, inventory-app#2491): every related object as a 64px
// thumbnail, those in this site's package and those elsewhere alike, each
// linking to its record, and on hover a tooltip beside it with its name, its
// country and why it is related. Legacy's tooltip named the sheet's own
// object on every thumbnail (its query read the name from the source row);
// this one names the related object.
defineProps({
  heading: { type: String, default: '' },
  /** `[{ id, image, name (inline HTML), country?, justification?, to? | href? }]` */
  tiles: { type: Array, default: () => [] },
})
</script>

<template>
  <div v-if="tiles.length" class="mwnf-related-objects">
    <p v-if="heading" class="mwnf-related-objects__heading">{{ heading }}</p>
    <ul class="mwnf-related-objects__tiles">
      <li v-for="tile in tiles" :key="tile.id" class="mwnf-related-objects__tile">
        <SmartLink :to="tile.to" :href="tile.href" :external="Boolean(tile.href)" class="mwnf-related-objects__link">
          <img v-if="tile.image" :src="tile.image" alt="" loading="lazy" />
          <span v-else class="mwnf-related-objects__empty" aria-hidden="true"></span>
          <!-- eslint-disable-next-line vue/no-v-html -- the record's own Markdown, rendered and escaped by viewer-core -->
          <span class="mwnf-related-objects__name-sr" v-html="tile.name"></span>
        </SmartLink>
        <div class="mwnf-related-objects__tooltip" aria-hidden="true">
          <!-- eslint-disable-next-line vue/no-v-html -- as above -->
          <div><span v-html="tile.name"></span><template v-if="tile.country">, {{ tile.country }}</template></div>
          <div v-if="tile.justification">{{ tile.justification }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>
