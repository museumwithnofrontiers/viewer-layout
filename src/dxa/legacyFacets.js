// dxa-api hands the galleries' and exhibitions' clients each tag list sorted
// by PHP's sort(): byte order, so capitals come before small letters
// ("Racing Car", "SUV", "Sedan Chair"). The countries come in the order of
// their names. The collection entrance and the results page's "Filter further
// by:" list them so (inventory-app#2423).
const byteOrder = (a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0)

export function withLegacyTagOrder(facets) {
  return Object.fromEntries(Object.entries(facets ?? {}).map(([key, definition]) => [
    key,
    key === 'country' ? definition : { ...definition, sort: byteOrder },
  ]))
}
