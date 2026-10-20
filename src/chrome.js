// A site's chrome files (inventory-app#2233, D7): the logos, banners, tiles
// and backgrounds a website keeps in its own repository under
// `theme/assets/`, handed to the layout as the map Vite's
// `import.meta.glob('../theme/assets/**/*.{jpg,jpeg,png,gif,svg}', { eager: true, query: '?url', import: 'default' })`
// builds. Its keys are the paths as the site's config file sees them
// (`../theme/assets/chrome/…`); the layout looks a file up by its path under
// `theme/assets/` (`logo.png`, `chrome/<legacy path>`), whatever directory
// the glob ran from.

const PREFIX = /^.*?theme\/assets\//
const normalised = new WeakMap()

function normalisedMap(chrome) {
  let map = normalised.get(chrome)
  if (!map) {
    map = new Map()
    for (const [key, url] of Object.entries(chrome)) {
      if (typeof url === 'string' && url) map.set(normaliseKey(key), url)
    }
    normalised.set(chrome, map)
  }
  return map
}

function normaliseKey(key) {
  return String(key).replaceAll('\\', '/').replace(PREFIX, '').replace(/^(\.\/|\/)+/, '')
}

/**
 * The URL of the site's chrome file at `key` (a path under `theme/assets/`),
 * or null when the site supplies none.
 */
export function chromeAsset(chrome, key) {
  if (!chrome || typeof chrome !== 'object' || !key) return null
  return normalisedMap(chrome).get(normaliseKey(key)) ?? null
}

/**
 * The site's file for a picture the data package names by its legacy path
 * (`banner_image_path`, a sibling gallery's `image_path`…): the file kept at
 * `theme/assets/chrome/<path>`, or null.
 */
export function chromePicture(chrome, path) {
  return path ? chromeAsset(chrome, `chrome/${String(path).replace(/^\/+/, '')}`) : null
}

/**
 * A logo or picture field a config sets: a URL is used as it is, anything
 * else is a key of the chrome map. Null when it resolves to nothing.
 */
export function chromeSource(chrome, value) {
  if (!value || typeof value !== 'string') return null
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(value)) return value
  return chromeAsset(chrome, value)
}
