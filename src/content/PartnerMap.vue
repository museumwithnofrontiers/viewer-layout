<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

// An embedded map for a partner's location, using OpenStreetMap's keyless public
// embed. Coordinates (latitude, longitude) drive the map centre and marker; zoom
// (default 15) scales the view. The title above the map and the "map of X" label
// on the full-map link are catalogue entries, so a site can translate them.
// This component surfaces the map provider choice: the iframe `src` and the
// full-map link are OSM-specific; swapping to another provider means changing
// only this component, not any caller.
const props = defineProps({
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  zoom: { type: Number, default: 15 },
  // The defaults below must be names the shared `partner` section carries.
  mapTitleEntry: { type: String, default: 'partner.map.map' },
  mapOfEntry: { type: String, default: 'partner.map.mapOf' },
  openMapLinkEntry: { type: String, default: 'partner.map.openInOpenStreetMap' },
  label: { type: String, default: '' },
})

const { t } = useI18n()

const hasLocation = computed(() =>
  Number.isFinite(props.latitude) && Number.isFinite(props.longitude)
)

// OSM's embed takes a bounding box rather than a zoom level; derive one whose
// span shrinks as the record's zoom grows, so a zoom-16 location pin still reads
// as a street-level view.
const bbox = computed(() => {
  const span = 360 / Math.pow(2, Math.max(1, Math.min(19, props.zoom || 15)))
  const [lat, lon] = [props.latitude, props.longitude]
  return [lon - span, lat - span / 2, lon + span, lat + span / 2].join('%2C')
})

const src = computed(() =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.value}&layer=mapnik&marker=${props.latitude}%2C${props.longitude}`
)

// A text is never interpolated (viewer-core's texts carry no placeholders),
// so the partner's name sits next to "Map of", not inside it.
const frameTitle = computed(() => (props.label ? `${t(props.mapOfEntry)} ${props.label}` : t(props.mapTitleEntry)))

const fullMap = computed(() =>
  `https://www.openstreetmap.org/?mlat=${props.latitude}&mlon=${props.longitude}#map=${props.zoom || 15}/${props.latitude}/${props.longitude}`
)
</script>

<template>
  <div v-if="hasLocation" class="mwnf-partner-map">
    <p class="mwnf-partner-map__title">{{ $t(mapTitleEntry) }}</p>
    <iframe
      :src="src"
      :title="frameTitle"
      loading="lazy"
      referrerpolicy="no-referrer"
      class="mwnf-partner-map__embed"
    ></iframe>
    <p class="mwnf-partner-map__link">
      <a :href="fullMap" target="_blank" rel="noopener">↗ {{ $t(openMapLinkEntry) }}</a>
    </p>
  </div>
</template>
