// The DXA family's smoke tests, written once (`@museumwnf/viewer-layout/dxa/testing`).
//
// Every gallery and every exhibition renders the same family pages
// (`galleryConfig`/`exhibitionConfig`), so they share one smoke test. A site's
// own tests/smoke.test.js calls the family's suite with what only it knows:
// its configuration, its texts and, for a gallery, the records of its own
// dataset the tests look for. A site may add tests of its own after the call.
//
// The suites run inside the site's own Vitest, which processes this package
// (viewer-core's `defineViewerConfig` inlines it): `vitest` and the data
// package resolve from the site.
import { describe, expect, it, vi } from 'vitest'
import { loadEntities, mergeMessages } from '@museumwnf/viewer-core'
import * as viewerCore from '@museumwnf/viewer-core'

// A link to a legacy site that has a new one is drawn with the new site's
// address from viewer-core 2.18.0 on (inventory-app#2482), as stored before.
const drawnAs = (url) => (url && typeof viewerCore.toNewSite === 'function' ? viewerCore.toNewSite(url) : url)
import {
  checkOfferedLanguages, checkRoutes, checkSectionMeta, checkTextsRendered, mountSite as mountOn,
} from '@museumwnf/viewer-core/testing'

const WAIT = { timeout: 20000 }

// The first word of a record's internal name: a term the keyword search is
// sure to find, whatever Markdown or punctuation the name carries.
const firstWord = (name) => name.match(/[\p{L}\p{N}]+/u)[0]

function mounter(config, sharedTexts, ownTexts) {
  // The same two layers main.js assembles, in the same order: the shared
  // bundle first, the site's own file last. Mounting without them would prove
  // nothing about the chrome — every text would render as its own name.
  const messages = mergeMessages(sharedTexts, { en: ownTexts })
  return { messages, mountSite: (hash = '#/') => mountOn(config, messages, hash) }
}

// The page's text nodes joined by spaces, for `checkTextsRendered`: a raw
// entry name sits inside one text node, while the host's `textContent` glues
// neighbouring blocks together ("… online exhibition." + "The Hijaz
// Railway" reads as an "exhibition.T…" name).
function spacedText(host) {
  const walker = host.ownerDocument.createTreeWalker(host, 4 /* NodeFilter.SHOW_TEXT */)
  const parts = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) parts.push(node.nodeValue)
  return { textContent: parts.join(' ') }
}

// The footer is legacy's: the portal links, the 2004–<year> line and the
// social-network icons, and no rights-holder line, which legacy never printed
// (inventory-app#2233).
function rightsTest(mountSite, manifest, messages) {
  it("renders legacy's footer: the portal links, the copyright line and the social links, no attribution", async () => {
    const { app, host } = await mountSite()
    expect(host.querySelector('.mwnf-footer__attribution')).toBeNull()
    expect(host.querySelector('.mwnf-footer__text').textContent)
      .toContain(`${messages.en['core.footer.copyright']} 2004–`)
    expect(host.querySelectorAll('.mwnf-footer__link').length).toBeGreaterThan(0)
    expect(host.querySelectorAll('.mwnf-footer__social-link')).toHaveLength(6)
    app.unmount()
  }, 20000)
}

// A gallery's tiles (legacy's ObjectGrid, dxa/gallery/ObjectGrid.vue), and
// how many a first page holds: legacy's twenty, or fewer when there are
// fewer (inventory-app#2423).
const TILE = '.mwnf-dxa-grid__entry'
const GALLERY_PAGE = 20
const firstPage = (count) => Math.min(GALLERY_PAGE, Number(count))

// The collection results as legacy's: the tiles, the "filter further by"
// column, "<n> result(s) out of <total>" and the page links. The first page
// holds twenty tiles, or every record when there are fewer, and page links
// come only with a second page, above and below the grid. A gallery's pages
// are the platform's pagination, an exhibition's legacy's own pager
// (inventory-app#2423, #2379). `collection` is no longer read: it pinned the
// old nine a page.
function collectionTest(mountSite, collection = {}, { pager = '.mwnf-pagination' } = {}) {
  void collection
  it('renders the collection results as legacy', async () => {
    const { app, host } = await mountSite('#/collection-results')
    await vi.waitFor(() => expect(host.querySelector(TILE)).not.toBeNull(), WAIT)
    expect(host.querySelector('.mwnf-catalogue')).not.toBeNull()
    expect(host.querySelector('.mwnf-catalogue__aside .mwnf-filter')).not.toBeNull()
    const count = host.querySelector('.mwnf-dxa-gallery-results__info p + p')
    expect(count).not.toBeNull()
    const objects = Number(count.textContent.match(/\d+/)?.[0] ?? NaN)
    expect(host.querySelectorAll(TILE).length).toBe(firstPage(objects))
    const paginations = host.querySelectorAll(pager).length
    if (objects <= GALLERY_PAGE) expect(paginations).toBe(0)
    else expect(paginations).toBe(2)
    app.unmount()
  }, 60000)
}

// An exhibition's search as legacy's (inventory-app#2379): the record in
// focus beside two columns of results, the empty search (`all-items`) every
// record, the empty result's three paragraphs with its link back to every
// record, and the tips under a Back button.
const EXHIBITION_RESULT = '.mwnf-dxa-exhibition-search__result'
function exhibitionSearchTests(mountSite, loadItems) {
  it('returns every renderable record for the all-items sentinel', async () => {
    const { app, host } = await mountSite('#/search?q=all-items')
    await vi.waitFor(() => expect(host.querySelector(EXHIBITION_RESULT)).not.toBeNull(), WAIT)
    expect(host.textContent).toContain('Results of your search')
    expect(host.querySelector('.mwnf-dxa-exhibition-search__main')).not.toBeNull()
    app.unmount()
  }, 30000)

  it('finds a record by a word of its name', async () => {
    const item = await loadItems()
    const term = firstWord(item.internal_name)
    const { app, host } = await mountSite(`#/search?q=${encodeURIComponent(term)}`)
    await vi.waitFor(() => expect(host.querySelector(EXHIBITION_RESULT)).not.toBeNull(), WAIT)
    expect(host.querySelector('.mwnf-dxa-exhibition-search__input').value).toBe(term)
    app.unmount()
  }, 30000)

  it('offers every record again after an empty keyword search', async () => {
    const { app, host } = await mountSite('#/search?q=zzz-nonexistent-keyword-zzz')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-exhibition-search__none')).not.toBeNull(), WAIT)
    expect(host.textContent).toContain('No results found.')
    expect(host.querySelector('a[href="#/search?q=all-items"]')).not.toBeNull()
    expect(host.querySelector('a[href="#/how-to-search"]')).not.toBeNull()
    app.unmount()
  }, 30000)

  it('renders the search tips under a Back button', async () => {
    const { app, host } = await mountSite('#/how-to-search')
    await vi.waitFor(() => expect(host.textContent).toContain('Boolean Full Text Search'), WAIT)
    expect(host.querySelector('.mwnf-dxa-exhibition-how-to .mwnf-back-link__button')).not.toBeNull()
    app.unmount()
  }, 30000)
}

function searchTests(mountSite, loadItems) {
  const tile = TILE
  it('returns every renderable object for the all-objects sentinel', async () => {
    const { app, host } = await mountSite('#/search?q=all-objects')
    await vi.waitFor(() => expect(host.querySelector(tile)).not.toBeNull(), WAIT)
    expect(host.textContent).toContain('All objects')
    app.unmount()
  }, 30000)

  it('renders a keyword search on the composed results view', async () => {
    const item = await loadItems()
    const term = firstWord(item.internal_name)
    const { app, host } = await mountSite(`#/search?q=${encodeURIComponent(term)}`)
    await vi.waitFor(() => expect(host.querySelector(tile)).not.toBeNull(), WAIT)
    expect(host.textContent).toContain(`“${term}”`)
    app.unmount()
  }, 30000)

  it('offers the two ways out of an empty keyword search', async () => {
    const { app, host } = await mountSite('#/search?q=zzz-nonexistent-keyword-zzz')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-catalogue')).not.toBeNull(), WAIT)
    expect(host.textContent).toContain('No items match your search.')
    expect(host.querySelector('a[href="#/how-to-search"]')).not.toBeNull()
    expect(host.querySelector('a[href="#/collection"]')).not.toBeNull()
    app.unmount()
  }, 30000)

  it('renders the search how-to essay on the composed text page view', async () => {
    const { app, host } = await mountSite('#/how-to-search')
    await vi.waitFor(() => expect(host.textContent).toContain('Boolean Full Text Search'), WAIT)
    expect(host.querySelector('a[href="#/collection"]')).not.toBeNull()
    app.unmount()
  }, 30000)
}

// Legacy's Related Objects: every related object a thumbnail under "Related
// Objects", those outside this site's package too (inventory-app#2491). One
// outside whose project has a site of its own links to it there.
function relatedObjectsTest(mountSite, manifest, sharedTexts) {
  it('draws every related object as a thumbnail, those outside the gallery too', async () => {
    const [items] = await loadEntities(['items'])
    const item = items.find((i) => (i.related_items ?? []).some((ref) => ref.in_package === false))
      ?? items.find((i) => (i.related_items ?? []).length)
    if (!item) return
    const { app, host } = await mountSite(`#/item/${item.id}?lang=en`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-related-objects__tile')).not.toBeNull(), WAIT)
    const block = host.querySelector('.mwnf-related-objects')
    expect(block.querySelector('.mwnf-related-objects__heading').textContent).toBe(sharedTexts.en['gallery.related.objects'])
    expect(block.querySelectorAll('.mwnf-related-objects__tile')).toHaveLength(item.related_items.length)
    const outside = item.related_items.find((ref) => ref.in_package === false && manifest.projects[ref.project_id]?.home_site)
    if (outside) {
      const hrefs = [...block.querySelectorAll('.mwnf-related-objects__link')].map((a) => a.getAttribute('href') ?? '')
      expect(hrefs.some((href) => href.endsWith(`/item/${outside.id}`))).toBe(true)
    }
    expect(host.querySelector('.mwnf-sheet-related__references')).toBeNull()
    app.unmount()
  }, 60000)
}

function configTests(config, routes) {
  it('declares every canonical route by name, and every legacy shape as a redirect', () => {
    expect(checkRoutes(config, routes)).toEqual([])
  })

  // Every route needs a section for the menu to know where it is, which the
  // config-driven `SiteShell` also relies on for the active menu entry and the
  // banner-title fallback.
  it('gives every route a section', () => {
    expect(checkSectionMeta(config)).toEqual([])
  })

  it('offers the languages the package declares for the site, where the items carry them', () => {
    expect(checkOfferedLanguages(config)).toEqual([])
  })

  it('reads nothing but the manifest before it mounts', () => {
    expect(config.media.legacyHost).toMatch(/^https:/)
    expect(Object.keys(config.links)).toEqual(
      expect.arrayContaining(['portal', 'galleries', 'myCollection', 'about', 'contact', 'legalNotice', 'credits', 'cookies']),
    )
  })
}

/**
 * The smoke test every DXA gallery runs.
 *
 * - `config`, `sharedTexts` (viewer-i18n's gallery catalogues), `ownTexts`
 *   (locales/en.json), `manifest` (the data package's) and `namespace` (this
 *   gallery's own text namespace, package.json's `viewerI18n.namespace`).
 * - `picks`: records of this gallery's own dataset, each named in the test
 *   that uses it:
 *   - `chip`: `{ item, project, className }` — an item borrowed from another
 *     project, whose project has a related-database address, with that
 *     project's name and its `projectColors` class;
 *   - `noticeItem`: an item of Explore Islamic Art Collections, or `null`
 *     when the gallery borrows none;
 *   - `dynasty`: `{ item, name }` — an item whose dynasty has a translated
 *     history, or `null` when no dynasty has one;
 *   - `timeline`: `{ code, id, country }` — a country this gallery has dated
 *     items in: its legacy two-letter code, its inventory id, its name; and,
 *     optionally, the exact `rows` the results' first page shows, the events
 *     `found` when that is more, an `event` text, the `gallery` count the
 *     results offer and a `galleryItem` text on the gallery's first page;
 *   - `partner`: `{ id, name, city, country, objects }` — a partner with
 *     objects, a position and a translated city;
 *   - optionally `collection: { paginations }` (read only when the results
 *     have a second page), and the `about` and `credits` texts their pages
 *     show.
 * A first page of tiles holds legacy's twenty, or every object when there
 * are fewer; the suite counts that itself, so `collection.tiles`,
 * `timeline.galleryTiles` and `partner.tiles` are no longer read.
 */
export function describeGallerySmoke({ config, sharedTexts, ownTexts, manifest, namespace, picks }) {
  const { messages, mountSite } = mounter(config, sharedTexts, ownTexts)
  const { chip, noticeItem = null, dynasty = null, timeline, partner } = picks

  describe('gallery smoke test', () => {
    it('mounts against the configured data package', async () => {
      const { app, host } = await mountSite()
      // The home banner's title is legacy's: the gallery's own project name
      // where the gallery is one ("Discover Carpet Art"), its name elsewhere.
      const title = manifest.projects?.[manifest.gallery?.project_id]?.name?.en ?? config.siteName
      await vi.waitFor(() => expect(host.querySelector('.mwnf-banner__title')?.textContent ?? '').toContain(title), WAIT)
      expect(host.querySelector('.mwnf-page')).not.toBeNull()
      // The family's Home view replaces viewer-core's generic one.
      expect(host.querySelector('.vc-home')).toBeNull()
      app.unmount()
    }, 20000)

    // Legacy's home drew three of the gallery's partners at random, whichever
    // they were (dxa-api /partners/featured, inventory-app#2405).
    it("draws up to three of the gallery's partners into the featured carousel", async () => {
      const [partners] = await loadEntities(['partners'])
      const { app, host } = await mountSite()
      await vi.waitFor(() => expect(host.querySelector('.mwnf-featured-partners__name')).not.toBeNull(), WAIT)
      // One bullet a partner, when there is more than one to turn through.
      if (partners.length > 1) expect(host.querySelectorAll('.mwnf-featured-partners__bullet').length).toBe(Math.min(3, partners.length))
      app.unmount()
    }, 20000)

    collectionTest(mountSite, picks.collection, { pager: '.mwnf-dxa-gallery-pages' })

    it("renders the collection entrance as legacy's", async () => {
      const { app, host } = await mountSite('#/collection')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-gallery-collection__select')).not.toBeNull(), WAIT)
      // The country dropdown plus at least one populated category, each
      // opening on its name, and the start and end dates with their years.
      const lists = [...host.querySelectorAll('.mwnf-dxa-gallery-collection__select')]
      expect(lists.length).toBeGreaterThan(3)
      for (const list of lists) expect(list.selectedOptions[0]?.disabled).toBe(true)
      const dates = host.querySelectorAll('.mwnf-dxa-gallery-collection__dates select')
      expect(dates).toHaveLength(2)
      expect(dates[0].options.length).toBeGreaterThan(1)
      // Legacy's text, naming the gallery: "… exploring the <name> database."
      expect(host.querySelector('.mwnf-dxa-gallery-collection__description em')?.textContent).toBeTruthy()
      expect(host.querySelector('.mwnf-dxa-gallery-collection__description').textContent).toContain(' database. A range of filters')
      app.unmount()
    }, 30000)

    searchTests(mountSite, async () => (await loadEntities(['items']))[0][0], { gallery: true })

    it("renders the about page as legacy's text page", async () => {
      const { app, host } = await mountSite('#/about')
      const prose = host.querySelector('.mwnf-dxa-gallery-text__body')
      expect(prose.textContent.trim().length).toBeGreaterThan(0)
      if (picks.about) expect(host.textContent).toContain(picks.about)
      app.unmount()
    }, 20000)

    it("renders the credits page as legacy's text page", async () => {
      const { app, host } = await mountSite('#/credits')
      const prose = host.querySelector('.mwnf-dxa-gallery-text__body')
      expect(prose.textContent.trim().length).toBeGreaterThan(0)
      if (picks.credits) expect(host.textContent).toContain(picks.credits)
      app.unmount()
    }, 20000)

    it('renders the item sheet on the composed record view', async () => {
      const [items] = await loadEntities(['items'])
      const { app, host } = await mountSite(`#/item/${items[0].id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet__label')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-record')).not.toBeNull()
      expect(host.querySelector('.mwnf-dxa-item__languages')).not.toBeNull()
      expect(host.querySelector('.mwnf-sheet-related')).not.toBeNull()
      // Related content is legacy's sidebar, and the record's internal key
      // is never shown.
      expect(host.querySelector('.mwnf-record__aside .mwnf-sheet-related')).not.toBeNull()
      expect(host.textContent).not.toContain('mwnf3:')
      // Legacy's sheet (inventory-app#2423): Source and My Collection under
      // the pictures, and the citation names the item's project from the
      // manifest.
      expect(host.querySelectorAll('.mwnf-record__media .mwnf-dxa-gallery-item__links a')).toHaveLength(2)
      const projectName = manifest.projects[items[0].project_id]?.name?.en ?? ''
      expect(host.querySelector('.mwnf-dxa-gallery-item__credits').textContent).toContain(projectName)
      app.unmount()
    }, 60000)

    // On display in (inventory-app#2423): the exhibition pages that show an
    // item, a mini-site's under its project, each an online exhibition's under
    // its title. A package exported before the field has none to show.
    it('lists the exhibition pages that show an item under On display in', async () => {
      const [items] = await loadEntities(['items'])
      const item = items.find((i) => i.exhibition_references?.some((ref) => ref.list !== 'exhibition'))
        ?? items.find((i) => i.exhibition_references?.length)
      if (!item) return
      const { app, host } = await mountSite(`#/item/${item.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-on-display__caption')).not.toBeNull(), WAIT)
      const lines = [...host.querySelectorAll('.mwnf-on-display__item')].map((li) => li.textContent)
      for (const ref of item.exhibition_references.filter((r) => r.list !== 'exhibition')) {
        const name = ref.exhibition.titles.en ?? Object.values(ref.exhibition.titles)[0]
        if (name) expect(lines.some((line) => line.includes(name))).toBe(true)
      }
      app.unmount()
    }, 60000)

    // Legacy heads a record's videos "Related Videos" (and its audio "Related
    // Audio"), each a ↗ line of the sidebar (inventory-app#2423).
    it('lists a record\'s videos under "Related Videos"', async () => {
      const [items] = await loadEntities(['items'])
      const item = items.find((i) => i.media?.some((m) => m.type === 'video' && m.url && (!m.language || m.language === 'en')))
      if (!item) return
      const { app, host } = await mountSite(`#/item/${item.id}?lang=en`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet-related__media--video')).not.toBeNull(), WAIT)
      const block = host.querySelector('.mwnf-sheet-related__media--video')
      expect(block.querySelector('.mwnf-sheet-related__heading').textContent).toBe('Related Videos')
      const video = item.media.find((m) => m.type === 'video' && m.url && (!m.language || m.language === 'en'))
      expect([...block.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toContain(video.url)
      expect(host.querySelector('.mwnf-related-media')).toBeNull()
      app.unmount()
    }, 60000)

    relatedObjectsTest(mountSite, manifest, sharedTexts)

    // The Source box takes the colour `projectColors` gives the item's
    // project, and the citation its name from the manifest.
    it("colours the Source box and names the citation's project from the manifest projects section", async () => {
      const { app, host } = await mountSite(`#/item/${chip.item}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-gallery-item__source')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-dxa-gallery-item__project').textContent).toContain(chip.project)
      expect(host.querySelector('.mwnf-dxa-gallery-item__source').classList.contains(chip.className)).toBe(true)
      app.unmount()
    }, 60000)

    // The Explore-partner notice shows for the projects `noticeProjects`
    // lists, and stays off every other.
    it.skipIf(!noticeItem)('shows the explore-partner notice only for the project dataset.config.js lists', async () => {
      const epm = await mountSite(`#/item/${noticeItem}`)
      await vi.waitFor(() => expect(epm.host.querySelector('.mwnf-dxa-gallery-item__source')).not.toBeNull(), WAIT)
      expect(epm.host.querySelector('.mwnf-sheet-notice')).not.toBeNull()
      epm.app.unmount()

      const other = await mountSite(`#/item/${chip.item}`)
      await vi.waitFor(() => expect(other.host.querySelector('.mwnf-dxa-gallery-item__source')).not.toBeNull(), WAIT)
      expect(other.host.querySelector('.mwnf-sheet-notice')).toBeNull()
      other.app.unmount()
    }, 60000)

    // The related-database and artistic-introduction blocks render exactly
    // when the item's project carries the address.
    it('renders the related-database and artistic-introduction links from the manifest', async () => {
      const [items] = await loadEntities(['items'])
      const item = items.find((i) => i.id === chip.item)
      const project = manifest.projects[item.project_id]
      const { app, host } = await mountSite(`#/item/${item.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet-related')).not.toBeNull(), WAIT)
      const links = () => Array.from(host.querySelectorAll('.mwnf-sheet-related a'))

      expect(project.related_database_url).toBeTruthy()
      expect(host.textContent).toContain('Search Related Database')
      expect(links().some((a) => a.getAttribute('href') === drawnAs(project.related_database_url))).toBe(true)
      if (project.artistic_introduction_url) {
        expect(host.textContent).toContain('Artistic Introduction')
        expect(links().some((a) => a.getAttribute('href') === drawnAs(project.artistic_introduction_url))).toBe(true)
      } else {
        expect(host.textContent).not.toContain('Artistic Introduction')
      }
      app.unmount()
    }, 60000)

    // A borrowed item's tile names its project on its card.
    it('shows the source project on a collection-results tile, from the manifest', async () => {
      const [items] = await loadEntities(['items'])
      const item = items.find((i) => i.id === chip.item)
      const { app, host } = await mountSite(`#/search?q=${encodeURIComponent(item.internal_name.replace(/[*_]/g, ''))}`)
      await vi.waitFor(() => expect(host.querySelector(TILE)).not.toBeNull(), WAIT)
      const projects = [...host.querySelectorAll('.mwnf-dxa-grid__project span')].map((span) => span.textContent)
      expect(projects.some((name) => name.startsWith(chip.project.slice(0, 15)))).toBe(true)
      app.unmount()
    }, 30000)

    // Legacy's Source box pointed at the record in its home database: now the
    // record's page on its project's home site, a sibling of this one
    // (`manifest.projects`' `home_site`), or this page when it has none.
    it("points the Source box at the record's home site, or this page", async () => {
      const [items] = await loadEntities(['items'])
      const item = items[0]
      const { app, host } = await mountSite(`#/item/${item.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-gallery-item__source a')).not.toBeNull(), WAIT)
      const link = host.querySelector('.mwnf-dxa-gallery-item__source a')
      expect(link.textContent).toBe(link.getAttribute('href'))
      const home = manifest.projects[item.project_id]?.home_site
      let origin = config.site.origin
      while (origin.endsWith('/')) origin = origin.slice(0, -1)
      const expected = home && home !== manifest.site?.key
        ? `${origin.slice(0, origin.lastIndexOf('/'))}/${home}/#/item/${item.id}`
        : `${origin}/#/item/${item.id}`
      expect(link.getAttribute('href').startsWith(expected)).toBe(true)
      expect(host.querySelector('.mwnf-source-credit')).toBeNull()
      app.unmount()
    }, 60000)

    it.skipIf(!dynasty)('renders the layout glossary tool and dynasty popouts on the item sheet', async () => {
      const { app, host } = await mountSite(`#/item/${dynasty.item}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dynasty-list')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-glossary-tool')).not.toBeNull()
      expect(host.querySelector('.mwnf-dynasty-list__heading').textContent).toContain('Dynasties')
      expect(host.textContent).toContain(dynasty.name)
      app.unmount()
    }, 60000)

    // The timeline, by the legacy two-letter code and by the inventory id:
    // both addresses produce the same rows.
    for (const [label, country] of [['the legacy code', timeline.code], ['the inventory id', timeline.id]]) {
      it(`renders the timeline results for a country given by ${label}`, async () => {
        const { app, host } = await mountSite(`#/timeline-results?country=${country}`)
        await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-timeline__row').length).toBeGreaterThan(0), WAIT)
        if (timeline.rows) expect(host.querySelectorAll('.mwnf-timeline__row').length).toBe(timeline.rows)
        if (timeline.found ?? timeline.rows) {
          expect(host.querySelector('.mwnf-summary').textContent).toContain(String(timeline.found ?? timeline.rows))
        }
        if (timeline.event) await vi.waitFor(() => expect(host.textContent).toContain(timeline.event), WAIT)
        await vi.waitFor(() => expect(host.querySelector('.mwnf-timeline__gallery')).not.toBeNull(), WAIT)
        if (timeline.gallery) expect(host.querySelector('.mwnf-timeline__gallery').textContent).toContain(String(timeline.gallery))
        app.unmount()
      }, 60000)
    }

    // (`timeline.galleryTiles` is no longer read: it counted the old nine a
    // page. The `gallery` count is the results' own period's, while this
    // address takes every date, so only legacy's twenty a page is checked.)
    it('renders the timeline gallery on the composed results view', async () => {
      const { app, host } = await mountSite(`#/timeline/gallery?country=${timeline.code}`)
      await vi.waitFor(() => expect(host.querySelectorAll(TILE).length).toBeGreaterThan(0), WAIT)
      expect(host.querySelectorAll(TILE).length).toBeLessThanOrEqual(GALLERY_PAGE)
      expect(host.querySelector('.mwnf-summary').textContent).toContain(timeline.country)
      if (timeline.galleryItem) expect(host.textContent).toContain(timeline.galleryItem)
      app.unmount()
    }, 60000)

    // Legacy's entrance (TimelinePage.vue): the country list, then Go, which
    // fills in the first and last dates on offer; the results filter on the
    // country chosen.
    it("submits the timeline entrance's country with Go to results that actually filter", async () => {
      const { app, host } = await mountSite('#/timeline')
      await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-dxa-timeline__country option').length).toBeGreaterThan(2), WAIT)
      const countrySelect = host.querySelector('.mwnf-dxa-timeline__country')
      const option = [...countrySelect.options].find((o) => o.value === timeline.id || o.value === timeline.code)
      countrySelect.value = option.value
      countrySelect.dispatchEvent(new window.Event('change', { bubbles: true }))
      host.querySelector('.mwnf-dxa-timeline__go button').click()
      await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-timeline__row').length).toBeGreaterThan(0), WAIT)
      expect(host.querySelector('.mwnf-timeline__caption').textContent).toContain(timeline.country)
      app.unmount()
    }, 60000)

    // Legacy's list (PartnersPage.vue): each partner's name and its links,
    // View objects for one holding something; no object count.
    it("renders the partners list as legacy's", async () => {
      const { app, host } = await mountSite('#/partners')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-gallery-partners__partner')).not.toBeNull(), WAIT)
      expect(host.textContent).toContain(partner.country)
      expect(host.textContent).toContain(partner.name)
      expect(host.querySelector(`.mwnf-dxa-gallery-partners__links a[href="#/partner/${partner.id}/objects"]`)).not.toBeNull()
      expect(host.textContent).not.toContain('object(s) in this site')
      app.unmount()
    }, 60000)

    // Legacy's PartnerProfile (inventory-app#2423): "View Objects" beside the
    // tabs, Google's map under "Museum on Google Maps", no source credit.
    it('renders a partner profile as legacy', async () => {
      const { app, host } = await mountSite(`#/partner/${partner.id}?lang=en`)
      // The name and the city arrive with the translations the view loads.
      await vi.waitFor(() => expect(host.textContent).toContain(partner.name), WAIT)
      await vi.waitFor(() => expect(host.textContent).toContain(partner.city), WAIT)
      expect(host.querySelector('.mwnf-dxa-gallery-profile')).not.toBeNull()
      expect(host.querySelector('.mwnf-partner-map')).not.toBeNull()
      expect(host.querySelector('.mwnf-dxa-profile-map-label').textContent).toBe('Museum on Google Maps')
      expect(host.querySelector('.mwnf-partner-panel__actions').textContent).toContain('View Objects')
      expect(host.querySelector('.mwnf-source-credit')).toBeNull()
      app.unmount()
    }, 60000)

    // (`partner.tiles` is no longer read: the first page holds twenty, or all.)
    it("renders a partner's objects on legacy's grid", async () => {
      const { app, host } = await mountSite(`#/partner/${partner.id}/objects`)
      await vi.waitFor(() => expect(host.querySelectorAll(TILE).length).toBe(firstPage(partner.objects)), WAIT)
      expect(host.textContent).toContain(partner.name)
      app.unmount()
    }, 60000)

    configTests(config, {
      names: [
        'home', 'collection', 'collection-results', 'item', 'search-results', 'search-how-to',
        'partners', 'partner', 'partner-objects', 'timeline', 'timeline-results', 'timeline-gallery',
        'about', 'credits',
      ],
      legacyPaths: [
        '/database-item/:uid(.*)/:language',
        '/partner/:country/:id/:language',
        '/partner-objects/:country/:id/:page',
        '/timeline-gallery/:country/:start/:end/:page',
      ],
    })

    // Every deep link and legacy redirect targets these name/path pairs, so
    // they must not move.
    it('pins every route name to its path', () => {
      const routes = config.extraViews
        .map((r) => ({ name: r.name, path: r.path }))
        .sort((a, b) => a.name.localeCompare(b.name))
      expect(routes).toEqual([
        { name: 'about', path: '/about' },
        { name: 'collection', path: '/collection' },
        { name: 'collection-results', path: '/collection-results' },
        { name: 'credits', path: '/credits' },
        { name: 'home', path: '/' },
        { name: 'item', path: '/item/:id' },
        { name: 'partner', path: '/partner/:id' },
        { name: 'partner-objects', path: '/partner/:id/objects' },
        { name: 'partners', path: '/partners' },
        { name: 'search-how-to', path: '/how-to-search' },
        { name: 'search-results', path: '/search' },
        { name: 'timeline', path: '/timeline' },
        { name: 'timeline-gallery', path: '/timeline/gallery' },
        { name: 'timeline-results', path: '/timeline-results' },
      ])
    })

    // `SiteShell` marks a menu entry active by comparing its section to the
    // current route's.
    it('marks the current section active in the menu, and renders the header, footer and search', async () => {
      const { app, host } = await mountSite('#/partners')
      await vi.waitFor(() => expect(host.querySelector('a[href="#/partners"]')).not.toBeNull(), WAIT)
      const active = host.querySelector('.mwnf-nav__link--active')
      expect(active?.getAttribute('href')).toBe('#/partners')
      expect(active?.getAttribute('aria-current')).toBe('page')
      expect(host.querySelector('a[href="#/timeline"]')?.classList.contains('mwnf-nav__link--active')).toBe(false)
      expect(host.querySelector('a[href="#/"]')).not.toBeNull()
      expect(host.querySelector('a[href="https://www.museumwnf.org/about"]')).not.toBeNull()
      expect(host.querySelector('.mwnf-header__search-input')).not.toBeNull()
      app.unmount()
    }, 20000)

    // What a gallery contributes to a legacy address is the mapping; that the
    // router turns it into a redirect is viewer-core's own test.
    it('maps a legacy address onto the canonical route', async () => {
      const [items, partners] = await loadEntities(['items', 'partners'])
      const [itemFor, partnerFor, objectsFor, galleryFor] = config.legacyRoutes

      const item = items.find((i) => i.backward_compatibility)
      expect(await itemFor.resolve({ uid: item.backward_compatibility.split(':').join('/') })).toEqual({
        name: 'item',
        params: { id: item.id },
      })
      expect(await itemFor.resolve({ uid: 'mwnf3/objects/NOPE/xx/Mus00/0' })).toBeNull()

      const legacyPartner = partners.find((p) => (p.backward_compatibility ?? '').split(':').length >= 4)
      const [, , legacyId, country] = legacyPartner.backward_compatibility.split(':')
      expect(await partnerFor.resolve({ country, id: legacyId })).toEqual({
        name: 'partner',
        params: { id: legacyPartner.id },
      })
      expect(await objectsFor.resolve({ country, id: legacyId, page: '3' })).toEqual({
        name: 'partner-objects',
        params: { id: legacyPartner.id },
        query: { page: '3' },
      })
      // The page number and the period leave the path for the query, and an
      // open bound stops being the literal 'any'.
      expect(galleryFor.resolve({ country: 'uk', start: 'any', end: '1500', page: '2' })).toEqual({
        name: 'timeline-gallery',
        query: { country: 'uk', end: '1500', page: '2' },
      })
    }, 20000)

    // A missing text renders as its own name rather than as an error, so the
    // rendered page is searched for one, in every namespace a page reads.
    it('renders the shared texts and its own over them', async () => {
      const { app, host } = await mountSite()
      const text = host.textContent
      expect(text).toContain('Skip to content')
      expect(text).toContain('All MWNF Galleries')
      expect(text).toContain('Tip:')
      expect(checkTextsRendered(spacedText(host), {
        namespaces: [namespace, 'core', 'layout', 'catalogue', 'record', 'sheet', 'timeline', 'partner', 'gallery'],
      })).toEqual([])
      app.unmount()
    }, 20000)

    rightsTest(mountSite, manifest, messages)
  })
}

/**
 * The smoke test every DXA exhibition runs. It finds the records it needs in
 * the exhibition's own package.
 *
 * - `config` with its `noticeProjects` and `projectColors`, `sharedTexts`
 *   (viewer-i18n's exhibition catalogues), `ownTexts` (locales/en.json),
 *   `manifest`, `partnerNames` and `dynastyNames` (the package's English
 *   partner and dynasty translations) and `namespace` (this exhibition's own
 *   text namespace).
 * - Optionally, `collection: { tiles, paginations }`; `theme: { id,
 *   pictureTitle, subthemes }`, a theme whose first picture and sub-theme
 *   titles the theme page shows; `relatedContent: true` when the
 *   related-content page must list entries; and `dynasties: false` for an
 *   exhibition no dynasty of which has a translated history.
 */
export function describeExhibitionSmoke({
  config, noticeProjects, projectColors, sharedTexts, ownTexts, manifest, partnerNames, dynastyNames, namespace,
  collection, theme: themePick, relatedContent = false, dynasties = true,
}) {
  const { messages, mountSite } = mounter(config, sharedTexts, ownTexts)
  const loadItems = async () => (await loadEntities(['exhibition', 'items']))[1]
  const visiblePartners = async () => {
    const [exhibition, partners] = await loadEntities(['exhibition', 'partners'])
    const hidden = new Set(exhibition.hidden_partner_ids ?? [])
    return partners.filter((p) => !hidden.has(p.id))
  }
  const datedItem = async () => (await loadItems()).find((i) => Number.isFinite(i.start_date) && i.country_id)

  describe('exhibition smoke test', () => {
    it('mounts against the configured data package', async () => {
      const { app, host } = await mountSite()
      expect(host.textContent).toContain(config.siteName)
      expect(host.querySelector('.mwnf-page')).not.toBeNull()
      expect(host.querySelector('.vc-home')).toBeNull()
      app.unmount()
    }, 20000)

    collectionTest(mountSite, collection, { pager: '.mwnf-dxa-exhibition-pages' })

    // Legacy's sheet, the galleries' (inventory-app#2379): Source and My
    // Collection under the pictures, the citation naming the item's project,
    // the related content in the sidebar.
    it('renders the item sheet as legacy', async () => {
      const items = await loadItems()
      const item = items.find((i) => i.project_id) ?? items[0]
      const { app, host } = await mountSite(`#/item/${item.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet__label')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-record')).not.toBeNull()
      expect(host.querySelector('.mwnf-dxa-item__languages .mwnf-languages__button')).not.toBeNull()
      expect(host.querySelector('.mwnf-record__aside .mwnf-sheet-related')).not.toBeNull()
      expect(host.textContent).not.toContain('mwnf3:')
      expect(host.querySelectorAll('.mwnf-record__media .mwnf-dxa-gallery-item__links a')).toHaveLength(2)
      const projectName = manifest.projects?.[item.project_id]?.name?.en
      if (projectName) expect(host.querySelector('.mwnf-dxa-gallery-item__credits').textContent).toContain(projectName)
      // The glossary tool is the layout's own, on every sheet.
      expect(host.querySelector('.mwnf-glossary-tool')).not.toBeNull()
      expect(host.querySelector('.mwnf-dxa-gallery-item__source a')).not.toBeNull()
      app.unmount()
    }, 60000)

    // On display in: this exhibition's own pages that show the item open
    // here, as legacy's did.
    it("lists the exhibition's own pages that show an item under On display in", async () => {
      const items = await loadItems()
      const item = items.find((i) => i.exhibition_references?.some((ref) => ref.site === manifest.site?.key))
      if (!item) return
      const { app, host } = await mountSite(`#/item/${item.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-on-display__caption')).not.toBeNull(), WAIT)
      const own = item.exhibition_references.find((ref) => ref.site === manifest.site.key)
      expect(host.querySelector(`.mwnf-on-display a[href="#${own.path}"]`)).not.toBeNull()
      app.unmount()
    }, 60000)

    // One sheet per project the package references, so every gate value is
    // exercised: an absent address is as provable as a present one.
    it('gates the related-database link, the Artistic Introduction link and the Explore-partner notice on the manifest project', async () => {
      const items = await loadItems()
      const seen = new Set()
      const sample = items.filter((i) => {
        if (!i.project_id || seen.has(i.project_id) || !manifest.projects?.[i.project_id]) return false
        seen.add(i.project_id)
        return true
      })
      expect(sample.length).toBeGreaterThan(0)
      for (const item of sample) {
        const project = manifest.projects[item.project_id]
        const { app, host } = await mountSite(`#/item/${item.id}`)
        await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet-related')).not.toBeNull(), WAIT)
        expect(!!host.querySelector(`a[href="${drawnAs(project.related_database_url)}"]`)).toBe(!!project.related_database_url)
        expect(!!host.querySelector(`a[href="${drawnAs(project.artistic_introduction_url)}"]`)).toBe(!!project.artistic_introduction_url)
        expect(!!host.querySelector('.mwnf-sheet-notice')).toBe(noticeProjects.includes(item.project_id))
        // Every project needs its chip colour, or the chip falls back to the
        // layout's default swatch.
        expect(projectColors[item.project_id]).toBeTruthy()
        app.unmount()
      }
    }, 120000)

    // A dynasty with a history gets a popout; one without gets none.
    it.skipIf(!dynasties)('renders a dynasty popout on an item sheet that has one', async () => {
      const items = await loadItems()
      const item = items.find((i) =>
        (!i.languages?.length || i.languages.includes('en'))
        && (i.dynasty_ids ?? []).some((id) => dynastyNames[id]?.history))
      expect(item).toBeTruthy()
      const dynastyId = item.dynasty_ids.find((id) => dynastyNames[id]?.history)
      const { app, host } = await mountSite(`#/item/${item.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dynasty-list')).not.toBeNull(), WAIT)
      expect(host.querySelectorAll('.mwnf-dynasty').length).toBeGreaterThan(0)
      expect(host.textContent).toContain(dynastyNames[dynastyId].name)
      app.unmount()
    }, 60000)

    it("renders the partners list as legacy's", async () => {
      const partner = (await visiblePartners()).find((p) => partnerNames[p.id]?.name)
      const { app, host } = await mountSite('#/partners')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-gallery-partners__partner')).not.toBeNull(), WAIT)
      // Country bands, the A-Z / Z-A toggle beside Back.
      expect(host.querySelectorAll('.mwnf-dxa-gallery-partners__country').length).toBeGreaterThan(0)
      expect(host.querySelector('.mwnf-dxa-gallery-partners__order button')).not.toBeNull()
      expect(host.textContent).toContain(partnerNames[partner.id].name)
      app.unmount()
    }, 30000)

    it('renders a partner profile on the composed record view', async () => {
      const partner = (await visiblePartners()).find((p) => p.type !== 'institution' && partnerNames[p.id]?.name)
      const { app, host } = await mountSite(`#/partner/${partner.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-record')).not.toBeNull(), WAIT)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-record').textContent.trim().length).toBeGreaterThan(0), WAIT)
      // The tab strip and the map are the page's own slots.
      expect(host.querySelector('[role="tablist"], .mwnf-dxa-profile-links')).not.toBeNull()
      expect(host.querySelector('.mwnf-partner-map')).not.toBeNull()
      app.unmount()
    }, 30000)

    it("renders a partner's items on legacy's grid", async () => {
      const partner = (await visiblePartners()).find((p) => p.item_count > 0)
      const { app, host } = await mountSite(`#/partner/${partner.id}/objects`)
      await vi.waitFor(() => expect(host.querySelector(TILE)).not.toBeNull(), WAIT)
      expect(host.querySelectorAll(TILE).length).toBeLessThanOrEqual(GALLERY_PAGE)
      expect(host.querySelector('.mwnf-dxa-exhibition-partner-objects__profile a')).not.toBeNull()
      expect(host.textContent).toContain(partnerNames[partner.id]?.name ?? partner.id)
      app.unmount()
    }, 30000)

    it("renders the collection entrance as legacy's", async () => {
      const { app, host } = await mountSite('#/collection')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-exhibition-collection')).not.toBeNull(), WAIT)
      expect(host.querySelectorAll('.mwnf-dxa-exhibition-collection__select').length).toBeGreaterThan(3)
      expect(host.querySelector('.mwnf-dxa-exhibition-collection__dates')).not.toBeNull()
      expect(host.textContent).toContain('Have you already been at')
      app.unmount()
    }, 30000)

    exhibitionSearchTests(mountSite, async () => (await loadItems()).find((i) => !i.languages?.length || i.languages.includes('en')))

    it("renders the themes list as legacy's", async () => {
      const { app, host } = await mountSite('#/themes')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-themes-page__theme')).not.toBeNull(), WAIT)
      expect(host.querySelectorAll('.mwnf-dxa-themes-page__theme').length).toBeGreaterThan(0)
      expect(host.querySelector('.mwnf-dxa-themes-page__show-all')).not.toBeNull()
      app.unmount()
    }, 30000)

    // Legacy's ThemeComponent (inventory-app#2379): the thumbnails, the
    // chosen picture and its details, the theme's bar with its numeral, its
    // texts, the tour and "In This Theme".
    it("renders a theme as legacy's", async () => {
      const [, , , themes] = await loadEntities(['exhibition', 'items', 'partners', 'themes'])
      const theme = themePick
        ? themes.find((t) => t.id === themePick.id)
        : themes.find((t) => t.display_order > 1) ?? themes[0]
      const { app, host } = await mountSite(`#/theme/${themePick ? themePick.id : theme.display_order - 1}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-theme-page__content')).not.toBeNull(), WAIT)
      // The numeral is in the section banner's "Theme I ▪ …", as legacy's SubBanner.
      await vi.waitFor(() => expect(host.querySelector('.mwnf-banner').textContent).toMatch(/ [IVX]+ ▪ /), WAIT)
      // And in the theme's bar, as legacy's deployed client draws it: "IV ▪ Islam in China".
      expect(host.querySelector('.mwnf-dxa-theme-page__theme-title').textContent.trim()).toMatch(/^[IVXLC]+ ▪ \S/)
      expect(host.querySelector('.mwnf-dxa-theme-page__selected, .mwnf-dxa-theme-page__empty')).not.toBeNull()
      expect(host.querySelector('.mwnf-dxa-theme-page__tour')).not.toBeNull()
      if (themePick?.pictureTitle) {
        expect(host.querySelector('.mwnf-dxa-theme-page__details').textContent).toContain(themePick.pictureTitle)
      }
      const inThisTheme = host.querySelector('.mwnf-dxa-theme-page__links')
      for (const title of themePick?.subthemes ?? []) expect(inThisTheme.textContent).toContain(title)
      // The texts are read through the tree's own entity: a wrong one renders
      // internal names or nothing.
      const title = host.querySelector('.mwnf-dxa-theme-page__title')
      expect(title?.textContent?.trim()).toBeTruthy()
      if (theme) expect(title.textContent).not.toBe(theme.internal_name)
      app.unmount()
    }, 30000)

    it("renders a theme's gallery on legacy's grid", async () => {
      const { app, host } = await mountSite('#/theme-gallery/1')
      await vi.waitFor(() => expect(host.querySelector(TILE)).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-dxa-theme-gallery-page')).not.toBeNull()
      app.unmount()
    }, 30000)

    // The timeline pages as legacy's (inventory-app#2379). An exhibition
    // without a chronology keeps the pages reachable by address, empty.
    const EVENT = '.mwnf-dxa-exhibition-timeline-results__event'
    it("renders the timeline entrance as legacy's form", async () => {
      const { app, host } = await mountSite('#/timeline')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-timeline__dates')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-dxa-timeline__go button')).not.toBeNull()
      expect(host.querySelector(EVENT)).toBeNull()
      expect(host.textContent).toContain('Have you already been at')
      app.unmount()
    }, 30000)

    it("renders the timeline results as legacy's", async () => {
      const { app, host } = await mountSite('#/timeline-results')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-exhibition-timeline-results__band')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-dxa-exhibition-timeline-results__current').textContent).toContain('Results')
      app.unmount()
    }, 30000)

    it('offers "See Gallery" from the timeline results when the period has objects', async () => {
      const dated = await datedItem()
      const { app, host } = await mountSite(
        `#/timeline-results?country=${dated.country_id}&begin=${dated.start_date}&end=${dated.end_date ?? dated.start_date}`,
      )
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-exhibition-timeline-results__body')).not.toBeNull(), WAIT)
      // Legacy offered the box only beside events.
      if (host.querySelector(EVENT)) {
        await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-exhibition-timeline-results__related a')).not.toBeNull(), WAIT)
        expect(host.querySelector('.mwnf-dxa-exhibition-timeline-results__related').textContent).toContain('See Gallery')
      }
      app.unmount()
    }, 30000)

    it("renders the timeline gallery on legacy's grid", async () => {
      const dated = await datedItem()
      const { app, host } = await mountSite(
        `#/timeline/gallery?country=${dated.country_id}&begin=${dated.start_date}&end=${dated.end_date ?? dated.start_date}`,
      )
      // The item that seeded the query overlaps its own period.
      await vi.waitFor(() => expect(host.querySelector(TILE)).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-dxa-exhibition-timeline-gallery')).not.toBeNull()
      app.unmount()
    }, 30000)

    // The inventory id and the legacy two-letter code filter the same rows.
    it('timeline country id filter produces the same results as the legacy two-letter code', async () => {
      const items = await loadItems()
      const greek = items.find((i) => Number.isFinite(i.start_date) && i.country_id === 'grc')
      if (!greek) return
      const period = `begin=${greek.start_date}&end=${greek.end_date ?? greek.start_date}`
      const byId = await mountSite(`#/timeline-results?country=grc&${period}`)
      await vi.waitFor(() => expect(byId.host.querySelector('.mwnf-dxa-exhibition-timeline-results__body')).not.toBeNull(), WAIT)
      const byCode = await mountSite(`#/timeline-results?country=gr&${period}`)
      await vi.waitFor(() => expect(byCode.host.querySelector('.mwnf-dxa-exhibition-timeline-results__body')).not.toBeNull(), WAIT)
      expect(byId.host.querySelectorAll(EVENT).length).toBe(byCode.host.querySelectorAll(EVENT).length)
      const galleryId = byId.host.querySelector('.mwnf-dxa-exhibition-timeline-results__related a')
      const galleryCode = byCode.host.querySelector('.mwnf-dxa-exhibition-timeline-results__related a')
      if (galleryId && galleryCode) expect(galleryId.textContent).toBe(galleryCode.textContent)
      byId.app.unmount()
      byCode.app.unmount()
    }, 60000)

    it("renders the related content as legacy's", async () => {
      const { app, host } = await mountSite('#/related')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-related-page')).not.toBeNull(), WAIT)
      if (relatedContent) {
        await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-dxa-related-page__entry').length).toBeGreaterThan(0), WAIT)
      }
      app.unmount()
    }, 30000)

    // Legacy's AboutPage is its ThemeComponent on the About theme.
    it("renders about as legacy's theme page", async () => {
      const [exhibition] = await loadEntities(['exhibition'])
      const { app, host } = await mountSite('#/about')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-dxa-about .mwnf-dxa-theme-page__content')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-dxa-theme-page__selected, .mwnf-dxa-theme-page__empty')).not.toBeNull()
      expect(host.textContent).toContain(config.siteName)
      // The exhibition's own audio and video, legacy's "Related Audio/Videos" (theme 0).
      const ownMedia = (exhibition?.media ?? []).filter((entry) => !entry.language || entry.language === 'en')
      if (ownMedia.length) {
        expect(host.querySelectorAll('.mwnf-dxa-theme-page__media-entry')).toHaveLength(ownMedia.length)
      }
      app.unmount()
    }, 30000)

    configTests(config, {
      names: [
        'home', 'about', 'themes', 'theme', 'theme-gallery', 'collection', 'collection-results',
        'item', 'search-results', 'search-how-to', 'partners', 'partner', 'partner-objects',
        'institution', 'institution-monuments', 'related', 'timeline', 'timeline-results',
        'timeline-gallery', 'credits',
      ],
      legacyPaths: [
        '/database-item/:uid(.*)/:language',
        '/partner/:country/:id/:language',
        '/partner-objects/:country/:id/:page',
        '/institution/:country/:id/:language',
        '/institution-monuments/:country/:id/:page',
        '/timeline-gallery/:country/:start/:end/:page',
      ],
    })

    it('maps a legacy address onto the canonical route', async () => {
      const [, items, partners] = await loadEntities(['exhibition', 'items', 'partners'])
      const [itemFor, partnerFor, objectsFor, institutionFor, monumentsFor, galleryFor] = config.legacyRoutes

      const item = items.find((i) => i.backward_compatibility)
      expect(await itemFor.resolve({ uid: item.backward_compatibility.split(':').join('/') })).toEqual({
        name: 'item',
        params: { id: item.id },
      })
      expect(await itemFor.resolve({ uid: 'mwnf3/objects/NOPE/xx/Mus00/0' })).toBeNull()

      const museum = partners.find((p) => p.type !== 'institution' && (p.backward_compatibility ?? '').split(':').length >= 4)
      const [, , museumId, museumCountry] = museum.backward_compatibility.split(':')
      expect(await partnerFor.resolve({ country: museumCountry, id: museumId })).toEqual({
        name: 'partner',
        params: { id: museum.id },
      })
      expect(await objectsFor.resolve({ country: museumCountry, id: museumId, page: '3' })).toEqual({
        name: 'partner-objects',
        params: { id: museum.id },
        query: { page: '3' },
      })
      // An institution reaches the institution pages, the same component
      // under another name.
      expect(await institutionFor.resolve({ country: museumCountry, id: museumId })).toEqual({
        name: 'institution',
        params: { id: museum.id },
      })
      expect(await monumentsFor.resolve({ country: museumCountry, id: museumId, page: '1' })).toEqual({
        name: 'institution-monuments',
        params: { id: museum.id },
        query: {},
      })
      // The page number and the period leave the path for the query; an open
      // bound stops being the literal 'any', and `start` becomes `begin`.
      expect(galleryFor.resolve({ country: 'uk', start: 'any', end: '1500', page: '2' })).toEqual({
        name: 'timeline-gallery',
        query: { country: 'uk', end: '1500', page: '2' },
      })
      expect(galleryFor.resolve({ country: 'uk', start: '1200', end: 'any', page: '1' })).toEqual({
        name: 'timeline-gallery',
        query: { country: 'uk', begin: '1200' },
      })
    }, 20000)

    it('renders the shared texts and its own over them', async () => {
      const { app, host } = await mountSite()
      const text = host.textContent
      expect(text).toContain('Skip to content')
      expect(text).toContain('Themes')
      expect(text).toContain('A MWNF online exhibition.')
      expect(checkTextsRendered(spacedText(host), {
        namespaces: [namespace, 'core', 'layout', 'catalogue', 'record', 'sheet', 'timeline', 'partner', 'exhibition'],
      })).toEqual([])
      app.unmount()
    }, 20000)

    rightsTest(mountSite, manifest, messages)
  })
}
