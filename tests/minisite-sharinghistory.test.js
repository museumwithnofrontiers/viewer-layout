import { describe, expect, it } from 'vitest'
import {
  LABELS, sharinghistoryCaption, sharinghistoryNavigation, sharinghistoryPageRoute, sharinghistoryPageWithNext, sharinghistoryReadingOrder,
  sharinghistoryRelatedLinks,
  sharinghistoryRoutes, sharinghistorySettings, sharinghistorySlotsOf,
} from '../src/minisite/index.js'

const themes = [{ id: 't1' }, { id: 't2' }]
const children = (id) => ({ t1: [{ id: 's11' }, { id: 's12' }], t2: [] })[id] ?? []

describe("Sharing History's mini-sites", () => {
  it('read their own label set', () => {
    expect(LABELS.SH).toBe('minisiteSharingHistory')
    expect(sharinghistorySettings({ parent: 'https://p' })).toEqual({ parent: 'https://p', texts: 'minisiteSharingHistory', family: 'SH' })
  })

  it("walk each theme's overview, then its subthemes, as legacy's Next Page did", () => {
    const pages = sharinghistoryReadingOrder(themes, children)
    expect(pages.map((p) => [p.theme, p.page, p.node.id])).toEqual([
      [1, 0, 't1'],
      [1, 1, 's11'],
      [1, 2, 's12'],
      [2, 0, 't2'],
    ])
    expect(sharinghistoryPageWithNext(pages, 1, 2).next).toEqual({ name: 'theme', params: { theme: 2 } })
    expect(sharinghistoryPageWithNext(pages, 2, 0).next).toBeNull()
    expect(sharinghistoryPageRoute(pages[1])).toEqual({ name: 'subtheme', params: { theme: 1, page: 1 } })
  })

  it("draw a page's pictures by position, each with its views in order, and never a relation alone", () => {
    const node = {
      items: [
        { id: 'b', display_order: 1, variant_order: 2, image_url: 'b.jpg' },
        { id: 'a', display_order: 1, variant_order: 1, image_url: 'a.jpg' },
        { id: 'c', display_order: 2, variant_order: 1, image_url: 'c.jpg' },
        { id: 'related-only', display_order: 3, variant_order: null },
      ],
    }
    expect(sharinghistorySlotsOf(node).map((s) => [s.n, s.variants.map((v) => v.id)])).toEqual([
      [1, ['a', 'b']],
      [2, ['c']],
    ])
  })

  it("print an object's caption as showItem() did, the curator's text only when its status is Y", () => {
    const countryName = (id) => ({ are: 'United Arab Emirates (Sharjah)' })[id] ?? ''
    const own = {
      name: '*Interview*',
      dates: 'Published 1849',
      holder: 'Sharjah Art Museum',
      location: 'Sharjah',
      artist: 'David Roberts',
      materials: 'Lithograph',
    }
    const entry = { curator_status: 'Y', justifications: { en: { curator: 'The scene  is', partner: null } } }
    expect(sharinghistoryCaption({ item: { type: 'object', country_id: 'are' }, own, entry, lang: 'en', countryName })).toEqual({
      name: '*Interview*',
      date: 'Published 1849',
      place: 'Sharjah Art Museum, Sharjah, United Arab Emirates (Sharjah)',
      artist: 'David Roberts',
      material: 'Lithograph',
      architects: '',
      justification: 'The scene is',
    })
    expect(
      sharinghistoryCaption({ item: { type: 'object' }, own, entry: { ...entry, curator_status: 'N' }, lang: 'en', countryName }).justification,
    ).toBe('')
    expect(
      sharinghistoryCaption({ item: { type: 'monument' }, own: { ...own, architects: 'Sinan' }, entry: {}, lang: 'en', countryName }),
    ).toMatchObject({ place: 'Sharjah', artist: '', material: '', architects: 'Sinan' })
  })

  it("link Related Content to the parent site's pages and the further reading here", () => {
    expect(sharinghistoryRelatedLinks({ parent: 'https://p', exhibitionId: 'x', furtherReading: { name: 'further-reading' } })).toEqual([
      { key: 'politicalTimeline', href: 'https://p/#/timeline/results?collection=pc' },
      { key: 'thematicTimeline', href: 'https://p/#/timeline/results?collection=x', tip: true },
      { key: 'gallery', href: 'https://p/#/permanent-collection/results?exhibition=x', tip: 'galleryTip' },
      { key: 'furtherReading', to: { name: 'further-reading' }, tip: 'furtherReadingTip' },
    ])
  })

  it('declare their routes, legacy windows drawn bare, and their frame', () => {
    const routes = sharinghistoryRoutes((name) => ({ section: name }))
    expect(routes.map((r) => r.name)).toEqual(['home', 'introduction', 'theme', 'subtheme', 'further-reading', 'credits', 'cover-image', 'zoom'])
    expect(routes.filter((r) => r.meta.bare).map((r) => r.meta.bare)).toEqual(['credits', 'cover-image', 'zoom'])
    const nav = sharinghistoryNavigation({ languages: [], parent: 'https://p', profiles: [{ text: 'Austria', href: 'https://p/#/x' }] })
    expect(nav.menu.find((m) => m.label === 'menu.historicalProfiles').links).toEqual([{ text: 'Austria', href: 'https://p/#/x' }])
    expect(nav.homeHref).toBe('https://p/#/')
  })
})
