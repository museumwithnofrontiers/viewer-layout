// What the standalone family's chrome reads from a site's config, as plain
// functions: a value given per language, a picture given as a key of the
// site's chrome map, and the record legacy's home page shows on a given day.
import { useSiteConfig } from '@museumwnf/viewer-core'
import { chromeSource } from '../chrome.js'

/**
 * A picture a config names: a key of the site's chrome map (its files under
 * theme/assets/, src/chrome.js) or a URL. Null when the map has no such file.
 */
export function useChromePicture() {
  const config = useSiteConfig()
  return (value) => chromeSource(config.chrome, value)
}

/**
 * A value given once or per language (`{ en: …, ar: … }`): the one for
 * `language`, else the English one, else the first.
 */
export function byLanguage(value, language) {
  if (!value || typeof value === 'string') return value ?? ''
  return value[language] ?? value.en ?? Object.values(value)[0] ?? ''
}

/** The day of the year, 0 on the 1st of January: PHP's `date('z')`. */
export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000)
}

/**
 * The entry of `list` for `date`: legacy's day-of-year pick
 * (`class.homepage_item.inc.php`), wrapping round a list shorter than the year.
 */
export function pickForDay(list, date = new Date()) {
  if (!list?.length) return null
  return list[dayOfYear(date) % list.length]
}

/**
 * A line of legacy's `home_items_img.txt` ("object;ISL;uk;Mus02;6;en*1": the
 * item's type, project, country, partner and number, a language, a picture
 * number) as the record's `backward_compatibility`
 * ("mwnf3:objects:ISL:uk:Mus02:6").
 */
export function legacyHomeItemKey(line) {
  const [type, ...rest] = String(line ?? '').split('*')[0].trim().split(';')
  if (!type || rest.length < 5) return ''
  return ['mwnf3', `${type}s`, ...rest.slice(0, rest.length - 1)].join(':')
}
