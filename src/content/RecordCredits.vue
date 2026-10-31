<script setup>
import { computed } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

// The block under a sheet that says who made it: the credits, the working
// number, the citation. Both families print these; one printed them as a
// list and the other as sentences, and neither difference was a decision.
const props = defineProps({
  /** [{ label, value }] */
  credits: { type: Array, default: () => [] },
  workingNumber: { type: String, default: '' },
  workingNumberLabel: { type: String, default: '' },
  /** The sentence viewer-core's `citation()` assembles. */
  citation: { type: String, default: '' },
  heading: { type: String, default: '' },
  citationHeading: { type: String, default: '' },
})
const { t } = useI18n()
const visible = computed(() => props.credits.length > 0 || props.workingNumber || props.citation)
</script>

<template>
  <section v-if="visible" class="mwnf-credits">
    <h2 v-if="credits.length || workingNumber" class="mwnf-credits__heading">{{ heading || t('record.sheet.credits') }}</h2>
    <dl v-if="credits.length" class="mwnf-credits__list">
      <template v-for="credit in credits" :key="credit.label">
        <dt class="mwnf-credits__label">{{ credit.label }}</dt>
        <dd class="mwnf-credits__value">{{ credit.value }}</dd>
      </template>
    </dl>
    <p v-if="workingNumber" class="mwnf-credits__number">
      <!-- the space is explicit: the template's line break between the two is condensed away -->
      <template v-if="workingNumberLabel"><span class="mwnf-credits__label">{{ workingNumberLabel }}</span>{{ ' ' }}</template>
      <strong>{{ workingNumber }}</strong>
    </p>
    <template v-if="citation">
      <h2 class="mwnf-credits__heading">{{ citationHeading || t('record.citation.heading') }}</h2>
      <p class="mwnf-credits__citation">{{ citation }}</p>
    </template>
  </section>
</template>
