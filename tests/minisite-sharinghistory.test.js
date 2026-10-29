import { describe, expect, it } from 'vitest'
import {
  LABELS, sharinghistoryCaption, sharinghistoryListedSubthemes, sharinghistoryListedThemes,
  sharinghistoryNavigation, sharinghistoryPageRoute, sharinghistoryPageWithNext, sharinghistoryReadingOrder,
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

  it('list only the themes and subthemes with a title, as legacy listed them', () => {
    const titles = { en: { t1: 'Commodities', s1: 'Raw materials' }, fr: { t2: 'Routes' } }
    const titleIn = (id, lang) => titles[lang]?.[id]
    const themes = [{ id: 't1' }, { id: 'untitled' }, { id: 't2' }]
    expect(sharinghistoryListedThemes(themes, titleIn, 'en').map((t) => t.id)).toEqual(['t1'])
    expect(sharinghistoryListedThemes(themes, titleIn, 'fr').map((t) => t.id)).toEqual(['t2'])
    // No theme titled in the page language: legacy listed the English ones.
    expect(sharinghistoryListedThemes(themes, titleIn, 'ar').map((t) => t.id)).toEqual(['t1'])
    expect(sharinghistoryListedSubthemes([{ id: 's1' }, { id: 's2' }], titleIn, 'en').map((s) => s.id)).toEqual(['s1'])
    expect(sharinghistoryListedSubthemes([{ id: 's1' }], titleIn, 'ar')).toEqual([])
  })

  it("draw a page's pictures by position, each with its views in order, and never a relation alone", () => {
    const node = {
      items: [
        { id: 'b', display_order: 1, variant_order: 2, image_url: 'b.jpg', curator_status: 'Y' },
        { id: 'a', display_order: 1, variant_order: 1, image_url: 'a.jpg', curator_status: 'Y' },
        { id: 'c', display_order: 2, variant_order: null, image_url: 'c.jpg', curator_status: 'Y' },
        { id: 'related-only', display_order: 3, variant_order: null, curator_status: 'Y' },
      ],
    }
    expect(sharinghistorySlotsOf(node).map((s) => [s.n, s.variants.map((v) => v.id)])).toEqual([
      [1, ['a', 'b']],
      [2, ['c']],
    ])
  })

  it('draw only the views whose relation the curator approved, and a position only with its main view', () => {
    const node = {
      items: [
        { id: 'a', display_order: 1, variant_order: 1, image_url: 'a.jpg', curator_status: 'Y' },
        { id: 'b', display_order: 1, variant_order: 2, image_url: 'b.jpg', curator_status: 'N' },
        { id: 'c', display_order: 2, variant_order: 1, image_url: 'c.jpg', curator_status: 'N' },
        { id: 'd', display_order: 2, variant_order: 2, image_url: 'd.jpg', curator_status: 'Y' },
        { id: 'e', display_order: 3, variant_order: 1, image_url: 'e.jpg' },
      ],
    }
    expect(sharinghistorySlotsOf(node).map((s) => [s.n, s.variants.map((v) => v.id)])).toEqual([[1, ['a']]])
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
    const links = sharinghistoryRelatedLinks({ parent: 'https://p', exhibitionId: 'x', title: 'TRAVELLING abroad', furtherReading: { name: 'further-reading' } })
    expect(links).toEqual([
      { key: 'politicalTimeline', href: 'https://p/#/timeline/results?collection=pc' },
      { key: 'thematicTimeline', href: 'https://p/#/timeline/results?collection=x', tipText: 'Travelling Abroad' },
      { key: 'gallery', href: 'https://p/#/permanent-collection/results?exhibition=x', tip: 'galleryTip' },
      { key: 'furtherReading', to: { name: 'further-reading' }, tip: 'furtherReadingTip' },
    ])
  })

  it("narrow the gallery to a page's theme and subtheme; a theme's overview lists its thematic timeline first", () => {
    const overview = sharinghistoryRelatedLinks({ parent: 'https://p', exhibitionId: 'x', themeId: 't', furtherReading: {} })
    expect(overview.map((l) => l.key)).toEqual(['thematicTimeline', 'politicalTimeline', 'gallery', 'furtherReading'])
    expect(overview[2].href).toBe('https://p/#/permanent-collection/results?exhibition=x&theme=t')
    const subtheme = sharinghistoryRelatedLinks({ parent: 'https://p', exhibitionId: 'x', themeId: 't', subthemeId: 's', furtherReading: {} })
    expect(subtheme.map((l) => l.key)).toEqual(['politicalTimeline', 'thematicTimeline', 'gallery', 'furtherReading'])
    expect(subtheme[2].href).toBe('https://p/#/permanent-collection/results?exhibition=x&theme=t&chapter=s')
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
