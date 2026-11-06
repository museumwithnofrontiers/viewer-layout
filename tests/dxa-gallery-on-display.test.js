import { describe, expect, it } from 'vitest'
import { siblingSiteUrl } from '@museumwnf/viewer-core'
import { galleryExhibitionSections } from '../src/dxa/gallery/onDisplay.js'

// A gallery item sheet's "On display in → Exhibition(s)" as legacy's
// DatabaseItem.vue drew it (inventory-app#2423).

const titled = (id, titles) => ({ id, titles })

const virtual = (overrides = {}) => ({
  list: 'virtual',
  site: 'islamicart-muslim-west',
  path: '/exhibition/6/3',
  project: { id: 'isl', name: 'Discover Islamic Art' },
  exhibition: titled('mw', { en: 'The Muslim West', fr: 'L’Occident musulman' }),
  theme: titled('t6', { en: 'Settlements and Domestic Life', fr: 'Habitat et vie domestique' }),
  subtheme: null,
  legacy_order: [27],
  ...overrides,
})

const online = (exhibition, theme, subtheme, itemId, path) => ({
  list: 'exhibition',
  site: 'the-table-is-set',
  path,
  project: null,
  exhibition,
  theme,
  subtheme,
  legacy_order: [itemId],
})

const table = titled('tis', { en: 'The Table Is Set' })
const qalam = titled('wbq', { en: 'With Brush and Qalam', fr: 'Au pinceau et au qalam' })

describe('galleryExhibitionSections', () => {
  it("lists a mini-site's places under their project, in English in every language, the themes apart", () => {
    const record = {
      exhibition_references: [
        virtual(),
        virtual({
          list: 'sharing_history',
          site: 'sharinghistory-fine-and-applied-arts',
          path: '/theme/4/1',
          project: { id: 'awe', name: 'Sharing History' },
          exhibition: titled('faa', { en: 'Fine & Applied Arts' }),
          theme: titled('t4', { en: 'The concept of revivals' }),
          subtheme: titled('s1', { en: 'Neo-Mudéjar' }),
        }),
      ],
    }
    const [section] = galleryExhibitionSections(record, 'fr')
    expect(section.caption).toBe('Discover Islamic Art')
    expect(section.links.map((link) => link.label)).toEqual([
      'The Muslim West | <span class="mwnf-on-display__theme">Settlements and Domestic Life</span>',
      'Fine &amp; Applied Arts | <span class="mwnf-on-display__theme">The concept of revivals</span> | <span class="mwnf-on-display__theme">Neo-Mudéjar</span>',
    ])
    expect(section.links[0].href).toBe(siblingSiteUrl('islamicart-muslim-west', '/exhibition/6/3'))
    expect(section.links.every((link) => link.external)).toBe(true)
  })

  it("lists the online exhibitions' sub-themes by title, leaving out the article, then by legacy's item id", () => {
    const record = {
      exhibition_references: [
        online(table, titled('soc', { en: 'Social Life' }), titled('sym', { en: 'Food Symbolism' }), 12, '/theme/2/1/12'),
        online(qalam, titled('cal', { en: 'Calligraphy' }), titled('ink', { en: 'Ink' }), 4, '/theme/1/1/4'),
        online(table, titled('rel', { en: 'Religion' }), titled('fest', { en: 'Festivals' }), 2, '/theme/3/2/2'),
      ],
    }
    const sections = galleryExhibitionSections(record, 'en')
    expect(sections.map((s) => [s.caption, s.links.map((link) => link.label)])).toEqual([
      ['The Table Is Set', [
        'Religion | <span class="mwnf-on-display__theme">Festivals</span>',
        'Social Life | <span class="mwnf-on-display__theme">Food Symbolism</span>',
      ]],
      ['With Brush and Qalam', ['Calligraphy | <span class="mwnf-on-display__theme">Ink</span>']],
    ])
  })

  it('shows the online exhibitions the page language has, else the English ones', () => {
    const record = {
      exhibition_references: [
        online(table, titled('soc', { en: 'Social Life' }), titled('sym', { en: 'Food Symbolism' }), 12, '/theme/2/1/12'),
        online(qalam, titled('cal', { en: 'Calligraphy', fr: 'Calligraphie' }), titled('ink', { en: 'Ink' }), 4, '/theme/1/1/4'),
      ],
    }
    expect(galleryExhibitionSections(record, 'fr').map((s) => [s.caption, s.links[0].label])).toEqual([
      ['Au pinceau et au qalam', 'Calligraphie | <span class="mwnf-on-display__theme">Ink</span>'],
    ])
    expect(galleryExhibitionSections(record, 'ar').map((s) => s.caption)).toEqual(['The Table Is Set', 'With Brush and Qalam'])
  })

  it('has nothing to list for a record in no exhibition', () => {
    expect(galleryExhibitionSections({}, 'en')).toEqual([])
    expect(galleryExhibitionSections({ exhibition_references: [] }, 'en')).toEqual([])
  })
})
