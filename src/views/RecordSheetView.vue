<script setup>
import { computed, useSlots } from 'vue'
import { NotFoundView } from '@museumwnf/viewer-core'
import RecordView from './RecordView.vue'

// The DXA gallery/exhibition item sheet, composed. Everything a record page
// needs is already `RecordView` — the field sheet, the credits, the
// citation, the related records, the whole slot contract
// (`header, before-sheet, <dynamic row slots>, after-sheet, source, related,
// aside, after`). What sets a gallery/exhibition sheet apart from any other
// `RecordView` use is one thing only: an exhibition ships one build per
// language, and an id the data package carries may still be missing from
// *this* build's language subset (a member's `languages` array lists every
// language it has somewhere, but a given build only carries the text for
// its own — see the gallery/exhibition composables) — legacy 404s in that
// case, and `RecordView`'s own "not in the package" gate does not catch it,
// because it reads the whole package regardless of which languages this
// build shipped.
//
// `dataGetter`, when a website passes one, is exactly that language-subset
// lookup — a function of `id` returning the record when this build carries
// it, and a falsy value when it does not (an exhibition's own per-build
// `itemById.get`, unchanged). Supplied and it says no: the sheet renders
// `NotFoundView` before `RecordView` ever mounts. Omitted — a gallery, with
// no such split — the sheet is a bare `RecordView`, unconditionally.
//
// Everything else — `spec`, `id`, `entity`, and every slot a website fills,
// named or not — passes straight through to `RecordView` unchanged; this
// view owns no project UUID, no site name, no legacy key of its own. A
// site's `related`/`before-sheet`/`museum`(-row) slot content — the source
// database line, the chip colour, the timeline/glossary/dynasty popouts,
// the sibling-site cross-references — stays exactly what it is today: the
// website's own, filled through the slot, not this view's concern.

const props = defineProps({
  spec: { type: Object, required: true },
  id: { type: String, required: true },
  /** Set by viewer-core when this view renders a `features.entities` route. */
  entity: { type: String, default: '' },
  /**
   * `(id) => record | null | undefined` — a website's own language-subset
   * record lookup. Left unset, every `id` `RecordView` itself would find is
   * treated as present (the gallery shape). Supplied, an `id` it reports
   * missing 404s here, before `RecordView` mounts (the exhibition shape).
   */
  dataGetter: { type: Function, default: null },
})

const slots = useSlots()
// Every slot the website filled, forwarded to RecordView by name — this
// view declares none of its own, so there is nothing to filter out (compare
// RecordView's own `rowSlots`, which does filter, because it *does* own
// slots that are not row slots).
const slotNames = computed(() => Object.keys(slots))

const exists = computed(() => !props.dataGetter || props.dataGetter(props.id) != null)
</script>

<template>
  <RecordView v-if="exists" :spec="spec" :id="id" :entity="entity">
    <template v-for="name in slotNames" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps" />
    </template>
  </RecordView>
  <NotFoundView v-else />
</template>
