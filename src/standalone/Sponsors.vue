<script setup>
import { computed } from 'vue'
import { renderBlock, renderInline, useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// The standalone family's band above the footer, in columns, as legacy laid
// out its `section.sponsors` / `section.cooperation`: Islamic Art's "set up
// with the support of" with its sponsors' marks, Baroque Art's cooperation
// sentence, Sharing History's three columns of labelled logo groups and links.
//
//   columns: [{
//     width: 1–12,                             // legacy's grid share (default: an equal share)
//     lead: entry, text: entry, break: true,   // an italic lead, then Markdown; `break` puts the text on its own line
//     title: entry,                            // a heading over the column's logos or links
//     logos: [{ src, alt: entry, href, note: entry }],   // `note`: Markdown shown under the band when the mark is chosen
//     links: [{ label: entry, to | href, external }],
//   }]
//
// Every text is an entry name; the band resolves them.
const props = defineProps({
  columns: { type: Array, default: () => [] },
})
const { t } = useI18n()

const view = computed(() => props.columns.map((column, index) => ({
  key: index,
  width: column.width ?? null,
  lead: column.lead ? renderInline(t(column.lead)) : '',
  text: column.text ? renderInline(t(column.text)) : '',
  break: Boolean(column.break),
  title: column.title ? t(column.title) : '',
  logos: (column.logos ?? []).map((logo) => ({
    src: logo.src,
    alt: logo.alt ? t(logo.alt) : '',
    href: logo.href ?? '',
    note: logo.note ? renderBlock(t(logo.note)) : '',
  })),
  links: (column.links ?? []).map((link) => ({ ...link, label: t(link.label) })),
})))
</script>

<template>
  <div class="mwnf-standalone-sponsors">
    <div
      v-for="column in view"
      :key="column.key"
      class="mwnf-standalone-sponsors__column"
      :style="column.width ? { flexGrow: column.width } : undefined"
    >
      <p v-if="column.lead || column.text" class="mwnf-standalone-sponsors__text">
        <i v-if="column.lead" v-html="column.lead"></i>
        <br v-if="column.lead && column.break" /><template v-else-if="column.lead && column.text">{{ ' ' }}</template>
        <span v-if="column.text" v-html="column.text"></span>
      </p>
      <p v-if="column.title" class="mwnf-standalone-sponsors__title">{{ column.title }}</p>
      <ul v-if="column.logos.length" class="mwnf-standalone-sponsors__logos">
        <li v-for="logo in column.logos" :key="logo.src">
          <details v-if="logo.note" class="mwnf-standalone-sponsors__note">
            <summary><img :src="logo.src" :alt="logo.alt" /></summary>
            <div class="mwnf-standalone-sponsors__note-body" v-html="logo.note"></div>
          </details>
          <a v-else-if="logo.href" :href="logo.href" target="_blank" rel="noopener"><img :src="logo.src" :alt="logo.alt" /></a>
          <img v-else :src="logo.src" :alt="logo.alt" />
        </li>
      </ul>
      <ul v-if="column.links.length" class="mwnf-standalone-sponsors__links">
        <li v-for="link in column.links" :key="link.label">
          <SmartLink :to="link.to" :href="link.href" :external="Boolean(link.external)">{{ link.label }}</SmartLink>
        </li>
      </ul>
    </div>
  </div>
</template>
