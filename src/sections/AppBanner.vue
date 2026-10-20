<script setup>
import { computed, ref, useSlots } from 'vue'
import { renderBlock } from '@museumwnf/viewer-core/i18n'

// The banner in the shapes the websites have: a plain image with a line under
// it; a tall `strip` with the site's name over the image (a gallery's home);
// a `split` with the image beside a title block and an entry link (an
// exhibition's home); a narrow `section` strip with the section's title over
// it (every other page). The caption of the image — the record it is a
// detail from — is data the website passes; the component only renders it.
const props = defineProps({
  /** '' (image + text) | 'strip' | 'split' | 'section' */
  variant: { type: String, default: '' },
  image: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  text: { type: String, default: '' },
  /** A string, or { name, partner, location, country }. */
  caption: { type: [String, Object], default: '' },
  /** The words before the caption's name ("Detail from"). */
  captionLabel: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  titleHref: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  /** Markdown, rendered through viewer-core. */
  headline: { type: String, default: '' },
  /** { label, href, ariaLabel? } */
  enter: { type: Object, default: null },
  strapline: { type: String, default: '' },
})

const slots = useSlots()
// Evaluated at render, not cached: the slots object is not reactive, so a
// computed would miss a slot that appears after the first render.
function visible() {
  return Boolean(slots.default || props.image || props.text || props.title || props.eyebrow || props.headline)
}

const headlineHtml = computed(() => (props.headline ? renderBlock(props.headline) : ''))

const captionParts = computed(() => {
  const caption = props.caption
  if (!caption) return null
  const name = typeof caption === 'string' ? caption : (caption.name ?? '')
  const rest =
    typeof caption === 'string'
      ? ''
      : [caption.partner, caption.location, caption.country].filter(Boolean).join(', ')
  return { name: [props.captionLabel, name].filter(Boolean).join(' '), rest }
})

const alt = computed(() => props.imageAlt || captionParts.value?.name || props.title)

const failed = ref(false)
</script>

<template>
  <section
    v-if="visible()"
    class="mwnf-banner"
    :class="variant ? `mwnf-banner--${variant}` : ''"
  >
    <slot>
      <template v-if="!variant">
        <img v-if="image" class="mwnf-banner__image" :src="image" :alt="imageAlt" />
        <p v-if="text" class="mwnf-banner__text">{{ text }}</p>
      </template>

      <div v-else class="mwnf-banner__frame">
        <div class="mwnf-banner__media">
          <img
            v-if="image && !failed"
            class="mwnf-banner__image"
            :src="image"
            :alt="alt"
            @error="failed = true"
          />
          <div v-else class="mwnf-banner__fallback" aria-hidden="true"></div>
          <p v-if="captionParts && variant !== 'section'" class="mwnf-banner__caption">
            <span class="mwnf-banner__caption-name">{{ captionParts.name }}</span>
            <span v-if="captionParts.rest" class="mwnf-banner__caption-rest">{{ captionParts.rest }}</span>
          </p>
        </div>

        <div class="mwnf-banner__body">
          <p v-if="eyebrow" class="mwnf-banner__eyebrow">{{ eyebrow }}</p>
          <component
            :is="titleHref ? 'a' : 'p'"
            v-if="title"
            class="mwnf-banner__title"
            :href="titleHref || undefined"
          >
            {{ title }}
            <a
              v-if="variant === 'strip' && enter"
              class="mwnf-banner__enter"
              :href="enter.href"
              :aria-label="enter.ariaLabel"
            >{{ enter.label }}</a>
          </component>
          <p v-if="subtitle" class="mwnf-banner__subtitle">{{ subtitle }}</p>
          <div v-if="headlineHtml" class="mwnf-banner__headline" v-html="headlineHtml"></div>
          <a
            v-if="variant !== 'strip' && enter"
            class="mwnf-banner__enter"
            :href="enter.href"
            :aria-label="enter.ariaLabel"
          >{{ enter.label }}</a>
          <p v-if="strapline" class="mwnf-banner__strapline">{{ strapline }}</p>
          <p v-if="text" class="mwnf-banner__text">{{ text }}</p>
          <!-- A section strip carries the caption at the end of its title band. -->
          <p v-if="captionParts && variant === 'section'" class="mwnf-banner__caption">
            <span class="mwnf-banner__caption-name">{{ captionParts.name }}</span>
            <span v-if="captionParts.rest" class="mwnf-banner__caption-rest">{{ captionParts.rest }}</span>
          </p>
        </div>
      </div>
    </slot>
  </section>
</template>
