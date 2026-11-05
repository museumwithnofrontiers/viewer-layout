<script setup>
import { ref, watch } from 'vue'
import { useI18n } from '@museumwnf/viewer-core/i18n'

// The sheet: labelled values in order, from the rows viewer-core's
// `sheetRows()` computes out of the site's own field spec. Two layouts,
// both legacy — a table (the standalone sites) and a definition list (the
// DXA sites) — and one behaviour they share: a short description folded
// behind a toggle when a full one is shown as well.
//
// A row rendered `custom` or `link` is handed to a slot named after its key,
// so a site renders its holding-museum link its own way without rebuilding
// the sheet.
const props = defineProps({
  /** From viewer-core's `sheetRows()`: [{ key, label, render, value, html }]. */
  rows: { type: Array, default: () => [] },
  /** 'table' | 'list' */
  layout: { type: String, default: 'table' },
  dir: { type: String, default: '' },
  /** { html, label? } — a short description shown behind a toggle. */
  shortDescription: { type: Object, default: null },
  /** The key of the row the short description follows; the end of the sheet when absent. */
  shortDescriptionAfter: { type: String, default: 'description' },
  /** Show the short description open. */
  shortDescriptionOpen: { type: Boolean, default: false },
  /** The toggle's words, as entry names: `{ view, hide }`. */
  toggleLabels: { type: Object, default: () => ({}) },
})
const { t } = useI18n()
const toggleLabel = (open) => t(open
  ? props.toggleLabels.hide ?? 'record.action.hideShortDescription'
  : props.toggleLabels.view ?? 'record.action.viewShortDescription')

const showShort = ref(props.shortDescriptionOpen)
watch(() => props.shortDescription, () => { showShort.value = props.shortDescriptionOpen })

const isCustom = (row) => row.render === 'custom' || row.render === 'link'
</script>

<template>
  <div class="mwnf-sheet" :class="`mwnf-sheet--${layout}`" :dir="dir || undefined">
    <component :is="layout === 'list' ? 'dl' : 'table'" class="mwnf-sheet__rows">
      <tbody v-if="layout !== 'list'">
        <template v-for="row in rows" :key="row.key">
          <tr class="mwnf-sheet__row" :class="`mwnf-sheet__row--${row.key}`">
            <th class="mwnf-sheet__label" scope="row">{{ row.label }}</th>
            <td class="mwnf-sheet__value">
              <slot v-if="isCustom(row)" :name="row.key" :row="row">
                <a v-if="row.render === 'link'" :href="row.value" target="_blank" rel="noopener">{{ row.value }}</a>
              </slot>
              <span v-else :class="`mwnf-sheet__${row.render}`" v-html="row.html"></span>
            </td>
          </tr>
          <tr v-if="shortDescription && row.key === shortDescriptionAfter" class="mwnf-sheet__row mwnf-sheet__row--short">
            <th class="mwnf-sheet__label" scope="row">
              <button type="button" class="mwnf-sheet__toggle" :aria-expanded="showShort ? 'true' : 'false'" @click="showShort = !showShort">
                {{ toggleLabel(showShort) }}
              </button>
            </th>
            <td class="mwnf-sheet__value"><div v-if="showShort" class="mwnf-sheet__block" v-html="shortDescription.html"></div></td>
          </tr>
        </template>
      </tbody>
      <template v-else>
        <template v-for="row in rows" :key="row.key">
          <dt class="mwnf-sheet__label" :class="`mwnf-sheet__label--${row.key}`">{{ row.label }}</dt>
          <dd class="mwnf-sheet__value">
            <slot v-if="isCustom(row)" :name="row.key" :row="row">
              <a v-if="row.render === 'link'" :href="row.value" target="_blank" rel="noopener">{{ row.value }}</a>
            </slot>
            <span v-else :class="`mwnf-sheet__${row.render}`" v-html="row.html"></span>
          </dd>
          <template v-if="shortDescription && row.key === shortDescriptionAfter">
            <dt class="mwnf-sheet__label mwnf-sheet__label--short">
              <button type="button" class="mwnf-sheet__toggle" :aria-expanded="showShort ? 'true' : 'false'" @click="showShort = !showShort">
                {{ toggleLabel(showShort) }}
              </button>
            </dt>
            <dd class="mwnf-sheet__value"><div v-if="showShort" class="mwnf-sheet__block" v-html="shortDescription.html"></div></dd>
          </template>
        </template>
      </template>
    </component>
  </div>
</template>
