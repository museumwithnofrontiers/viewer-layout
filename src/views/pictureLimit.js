// A record page's pictures, cut to the number legacy's page fetched: Discover
// Baroque Art's monument query read `LIMIT 0,15`. `limit` is a number or a
// function of the page's context; 0, a negative number or none keeps them all.
export function limitPictures(pictures, limit, ctx) {
  const n = typeof limit === 'function' ? limit(ctx) : limit
  return Number.isInteger(n) && n > 0 ? pictures.slice(0, n) : pictures
}
