<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import SmartLink from '../content/SmartLink.vue'

// A carousel of featured partner records: one showing at a time, rotated on a
// timer, with bullet controls. The site provides the records (filtered and
// shuffled on the server or in a view before passing here), image URLs,
// location names and descriptions. The carousel carries its own state: the
// current slide index and the timer.
const CAROUSEL_INTERVAL_MS = 8000

const props = defineProps({
  // Array of { id, name, logo, city, country, description, route } where route
  // is a router location object or { to } link prop.
  records: { type: Array, default: () => [] },
  // Or the partners themselves, as viewer-core's `partnerView()` builds them
  // (inventory-app#2033): the card takes the name, the first picture (or
  // logo), "city, country", and the description as plain text cut at
  // `descriptionLength` characters. Given, it wins over `records`.
  partners: { type: Array, default: () => [] },
  descriptionLength: { type: Number, default: 420 },
  headingEntry: { type: String, default: 'partner.list.featured' },
})

function plainText(html) {
  return String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function cut(text, chars) {
  if (!text || text.length <= chars) return text
  const at = text.lastIndexOf(' ', chars)
  return `${text.slice(0, at > 0 ? at : chars)}...`
}

const cards = computed(() =>
  props.partners.length
    ? props.partners.map((partner) => ({
      id: partner.id,
      name: partner.plainName,
      logo: partner.pictures?.[0]?.url ?? partner.logos?.[0]?.url ?? null,
      city: partner.city,
      country: partner.country,
      description: cut(plainText(partner.description), props.descriptionLength),
      route: partner.route,
    }))
    : props.records,
)

const current = ref(0)
let timer = null

function show(index) {
  current.value = index
  restart()
}

function restart() {
  if (timer) clearInterval(timer)
  if (cards.value.length > 0) {
    timer = setInterval(() => {
      current.value = (current.value + 1) % cards.value.length
    }, CAROUSEL_INTERVAL_MS)
  }
}

onMounted(restart)
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<template>
  <section v-if="cards.length" class="mwnf-featured-partners">
    <h2 class="mwnf-featured-partners__heading">{{ $t(headingEntry) }}</h2>
    <div class="mwnf-featured-partners__carousel">
      <SmartLink
        v-for="(record, index) in cards"
        v-show="index === current"
        :key="record.id"
        :to="record.route"
        class="mwnf-featured-partners__card"
      >
        <span v-if="record.logo" class="mwnf-featured-partners__image">
          <img :src="record.logo" :alt="record.name" class="mwnf-featured-partners__logo" />
        </span>
        <span class="mwnf-featured-partners__body">
          <span class="mwnf-featured-partners__name">{{ record.name }}</span>
          <span class="mwnf-featured-partners__location">
            <span v-if="record.city">{{ record.city }}, </span>{{ record.country }}
          </span>
          <span class="mwnf-featured-partners__description">{{ record.description }}</span>
        </span>
      </SmartLink>
    </div>
    <div v-if="cards.length > 1" class="mwnf-featured-partners__controls">
      <button
        v-for="(record, index) in cards"
        :key="record.id"
        class="mwnf-featured-partners__bullet"
        :class="{ 'mwnf-featured-partners__bullet--active': index === current }"
        :aria-label="`${$t('core.action.show')} ${record.name}`"
        @click="show(index)"
      ></button>
    </div>
  </section>
</template>
