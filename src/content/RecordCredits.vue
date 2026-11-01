<script setup>
import { computed } from 'vue'
import { renderInline } from '@museumwnf/viewer-core'
import { useI18n } from '@museumwnf/viewer-core/i18n'

// The block under a sheet that says who made it: the credits, the working
// number, the citation. Both families print these; one printed them as a
// list and the other as sentences, and neither difference was a decision.
const props = defineProps({
  /** [{ label, value, people? }], `people` [{ name, heading, biography }] printing each person apart; a biography is Markdown, inline, its line breaks kept */
  credits: { type: Array, default: () => [] },
  workingNumber: { type: String, default: '' },
  workingNumberLabel: { type: String, default: '' },
  /** The sentence viewer-core's `citation()` assembles. */
  citation: { type: String, default: '' },
  /** A site's own citation, as HTML it has escaped (RecordView's `citation.format`). */
  citationHtml: { type: String, default: '' },
  heading: { type: String, default: '' },
  citationHeading: { type: String, default: '' },
})
const { t } = useI18n()
const visible = computed(() => props.credits.length > 0 || props.workingNumber || props.citation || props.citationHtml)
</script>

<template>
  <section v-if="visible" class="mwnf-credits">
    <h2 v-if="credits.length || workingNumber" class="mwnf-credits__heading mwnf-credits__heading--credits">{{ heading || t('record.sheet.credits') }}</h2>
    <dl v-if="credits.length" class="mwnf-credits__list">
      <template v-for="credit in credits" :key="credit.label">
        <dt class="mwnf-credits__label">{{ credit.label }}</dt>
        <dd v-if="credit.people" class="mwnf-credits__value">
          <template v-for="(person, index) in credit.people" :key="index">
            <template v-if="index">, </template>
            <!-- eslint-disable-next-line vue/no-v-html -- the person's own Markdown, rendered and escaped by viewer-core -->
            <span v-if="person.biography" class="mwnf-credits__person" tabindex="0">{{ person.name }}<span class="mwnf-credits__biography" role="tooltip"><b>{{ person.heading }}</b><br><br><span v-html="renderInline(person.biography, { breaks: true })"></span></span></span>
            <template v-else>{{ person.name }}</template>
          </template>
        </dd>
        <dd v-else class="mwnf-credits__value">{{ credit.value }}</dd>
      </template>
    </dl>
    <p v-if="workingNumber" class="mwnf-credits__number">
      <!-- the space is explicit: the template's line break between the two is condensed away -->
      <template v-if="workingNumberLabel"><span class="mwnf-credits__label">{{ workingNumberLabel }}</span>{{ ' ' }}</template>
      <strong>{{ workingNumber }}</strong>
    </p>
    <template v-if="citation || citationHtml">
      <h2 class="mwnf-credits__heading mwnf-credits__heading--citation">{{ citationHeading || t('record.citation.heading') }}</h2>
      <p v-if="citationHtml" class="mwnf-credits__citation" v-html="citationHtml"></p>
      <p v-else class="mwnf-credits__citation">{{ citation }}</p>
    </template>
  </section>
</template>
