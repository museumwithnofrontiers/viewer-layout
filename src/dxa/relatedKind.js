// Which of an item sheet's two related blocks a `related_items` entry goes
// in: legacy's Related Objects (dxa-client DatabaseItem.vue drew only the
// related objects) or Related Monuments (Discover Islamic Art's sheet drew
// the monuments apart, under "Related monuments"). The exporters write each
// entry's `type` since inventory-app#2611; before that, an entry in the
// package takes its record's type and one outside counts as an object, as
// the sheet drew it then.
export function relatedKind(ref, itemById) {
  const type = ref?.type ?? itemById?.get(ref?.id)?.type
  return type === 'monument' ? 'monument' : 'object'
}
