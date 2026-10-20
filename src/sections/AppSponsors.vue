<script setup>
import { computed, useSlots } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

const props = defineProps({
  title: { type: String, default: '' },
  // { name, href?, logo? } — the simple case: one flat list.
  sponsors: { type: Array, default: () => [] },
  // [{ title, sponsors: [{ name, href?, logo? }] }] — logos under headings.
  groups: { type: Array, default: () => [] },
})

const slots = useSlots()
const { t } = useI18n()
const groupsWithSponsors = computed(() => props.groups.filter((group) => group?.sponsors?.length))
// Evaluated at render, not cached: the slots object is not reactive, so a
// computed would miss a slot that appears after the first render.
function visible() {
  return Boolean(slots.default || props.sponsors.length || groupsWithSponsors.value.length)
}
</script>

<template>
  <section v-if="visible()" class="mwnf-sponsors" :aria-label="title || t('layout.sponsors.label')">
    <p v-if="title" class="mwnf-sponsors__title">{{ title }}</p>
    <slot>
      <ul v-if="sponsors.length" class="mwnf-sponsors__list">
        <li v-for="sponsor in sponsors" :key="sponsor.name">
          <component
            :is="sponsor.href ? 'a' : 'span'"
            class="mwnf-sponsors__item"
            :href="sponsor.href"
            :target="sponsor.href ? '_blank' : undefined"
            :rel="sponsor.href ? 'noopener' : undefined"
          >
            <img
              v-if="sponsor.logo"
              class="mwnf-sponsors__logo"
              :src="sponsor.logo"
              :alt="sponsor.name"
            />
            <template v-else>{{ sponsor.name }}</template>
          </component>
        </li>
      </ul>
      <div v-if="groupsWithSponsors.length" class="mwnf-sponsors__groups">
        <div v-for="group in groupsWithSponsors" :key="group.title" class="mwnf-sponsors__group">
          <p v-if="group.title" class="mwnf-sponsors__group-title">{{ group.title }}</p>
          <ul class="mwnf-sponsors__list">
            <li v-for="sponsor in group.sponsors" :key="sponsor.name">
              <component
                :is="sponsor.href ? 'a' : 'span'"
                class="mwnf-sponsors__item"
                :href="sponsor.href"
                :target="sponsor.href ? '_blank' : undefined"
                :rel="sponsor.href ? 'noopener' : undefined"
                :title="sponsor.name"
              >
                <img
                  v-if="sponsor.logo"
                  class="mwnf-sponsors__logo"
                  :src="sponsor.logo"
                  :alt="sponsor.name"
                />
                <template v-else>{{ sponsor.name }}</template>
              </component>
            </li>
          </ul>
        </div>
      </div>
    </slot>
  </section>
</template>
