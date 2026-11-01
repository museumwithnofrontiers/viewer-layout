<script setup>
import { computed } from 'vue'
import { removeEndingPoint, renderInline, renderPlain, useI18n } from '@museumwnf/viewer-core'
import SmartLink from '../content/SmartLink.vue'

// "Today's highlight from the Permanent Collection": one record, its picture,
// and legacy's lines about it (`diaTemplates/randomText.php`):
// - the name; "Also known as:" the other name; the date, then the period or
//   dynasty after a comma; the materials; the holding museum — each without
//   its ending period;
// - then the place: the location and the country, or the line the site
//   composes itself (`place`: Islamic Art's adds the province);
// - then the link to the record's page.
// `text` is the record's translation, `country` the country's name, already
// resolved; every label is an entry name.
const props = defineProps({
  record: { type: Object, default: null },
  text: { type: Object, default: () => ({}) },
  country: { type: String, default: '' },
  to: { type: [String, Object], default: null },
  /** Legacy's picture of the day, in place of the record's own first picture. */
  picture: { type: String, default: '' },
  /** The place line as the site composes it, in place of "location, country". */
  place: { type: String, default: null },
  heading: { type: String, default: '' },
  alsoKnownAs: { type: String, default: '' },
  action: { type: String, default: '' },
})
const { t } = useI18n()

const clean = (value) => removeEndingPoint(Array.isArray(value) ? value.join('; ') : value)

const lines = computed(() => {
  const text = props.text ?? {}
  const out = []
  const name = clean(text.name ?? props.record?.internal_name ?? '')
  if (name) out.push(renderInline(name))
  const other = clean(text.alternate_name)
  if (other) out.push(`${props.alsoKnownAs ? `${t(props.alsoKnownAs)} ` : ''}${renderInline(other)}`)
  const when = [clean(text.dates), clean(text.dynasty)].filter(Boolean).join(', ')
  if (when) out.push(renderInline(when))
  for (const field of ['materials', 'holder']) {
    const value = clean(text[field])
    if (value) out.push(renderInline(value))
  }
  return out
})
const place = computed(() => props.place ?? [clean(props.text?.location), props.country].filter(Boolean).join(', '))
const image = computed(() => props.picture || (props.record?.images?.[0]?.url ?? ''))
const alt = computed(() => renderPlain(String(props.text?.name ?? props.record?.internal_name ?? '')))
</script>

<template>
  <div v-if="record" class="mwnf-standalone-highlight">
    <SmartLink v-if="image" class="mwnf-standalone-highlight__media" :to="to">
      <img class="mwnf-standalone-highlight__image" :src="image" :alt="alt" />
    </SmartLink>
    <p v-if="heading" class="mwnf-standalone-highlight__heading"><strong>{{ t(heading) }}</strong></p>
    <p class="mwnf-standalone-highlight__lines">
      <template v-for="(line, index) in lines" :key="index"><span v-html="line"></span><br /></template>
    </p>
    <p v-if="place" class="mwnf-standalone-highlight__place">{{ renderPlain(place) }}</p>
    <p v-if="action" class="mwnf-standalone-highlight__action"><SmartLink :to="to">{{ t(action) }}</SmartLink></p>
  </div>
</template>
