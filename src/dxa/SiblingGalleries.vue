<script setup>
import SmartLink from '../content/SmartLink.vue'

// Two blocks of gallery links: sibling galleries in this instance, and the
// other MWNF virtual museums. Each gallery/museum is a record with an optional
// image; when the image is missing, a text placeholder shows instead. Galleries
// may be unresolved (no link); they render as non-clickable tiles.
//
// The site builds the galleries array from its data and provides the museums
// array with labels and links constructed through its own routing or site config.
const props = defineProps({
  // Array of { id, name, image?, route } where route is a router location or link prop
  galleries: { type: Array, default: () => [] },
  // Array of { name, to | href, accent?, textColor? } for other MWNF museums
  museums: { type: Array, default: () => [] },
  galleriesHeadingEntry: { type: String, default: 'sibling.galleries' },
  seeMoreGalleriesEntry: { type: String, default: 'sibling.seeMoreGalleries' },
  seeMoreGalleriesHref: { type: String, default: '' },
  museumsHeadingEntry: { type: String, default: 'sibling.otherVirtualMuseums' },
})
</script>

<template>
  <section class="mwnf-sibling-galleries">
    <!-- Sibling galleries block -->
    <div v-if="galleries.length" class="mwnf-sibling-galleries__galleries">
      <div class="mwnf-sibling-galleries__header">
        <p class="mwnf-sibling-galleries__heading">{{ $t(galleriesHeadingEntry) }}</p>
        <a
          v-if="seeMoreGalleriesHref"
          :href="seeMoreGalleriesHref"
          target="_blank"
          rel="noopener"
          class="mwnf-sibling-galleries__see-more"
        >
          {{ $t(seeMoreGalleriesEntry) }} »
        </a>
      </div>
      <div class="mwnf-sibling-galleries__grid">
        <SmartLink
          v-for="gallery in galleries"
          :key="gallery.id"
          :to="gallery.route"
          class="mwnf-sibling-galleries__gallery"
          :class="{ 'mwnf-sibling-galleries__gallery--no-link': !gallery.route }"
        >
          <span v-if="gallery.image" class="mwnf-sibling-galleries__image">
            <img :src="gallery.image" :alt="gallery.name" />
          </span>
          <span v-else class="mwnf-sibling-galleries__image mwnf-sibling-galleries__image--empty"></span>
          <p class="mwnf-sibling-galleries__name">{{ gallery.name }}</p>
        </SmartLink>
      </div>
    </div>

    <!-- MWNF museums block -->
    <div v-if="museums.length" class="mwnf-sibling-galleries__museums">
      <div class="mwnf-sibling-galleries__heading">{{ $t(museumsHeadingEntry) }}</div>
      <div class="mwnf-sibling-galleries__museums-grid">
        <a
          v-for="museum in museums"
          :key="museum.name"
          :href="museum.href || museum.to"
          target="_blank"
          rel="noopener"
          class="mwnf-sibling-galleries__museum"
          :style="{
            '--mwnf-museum-bg': museum.accent || 'var(--mwnf-color-border)',
            '--mwnf-museum-text': museum.textColor || 'inherit',
          }"
        >
          <div class="mwnf-sibling-galleries__museum-image">
            {{ museum.name.split(' ').map(w => w[0]).join('') }}
          </div>
          <p class="mwnf-sibling-galleries__museum-name">{{ museum.name }}</p>
        </a>
      </div>
    </div>
  </section>
</template>
