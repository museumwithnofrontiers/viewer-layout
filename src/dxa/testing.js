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

// The footer's attribution and terms-of-use link come from the data package's
// `manifest.rights`, read by the layout's own `SiteShell`.
function rightsTest(mountSite, manifest, messages) {
  it('renders the rights attribution and the terms link in the footer', async () => {
    const { app, host } = await mountSite()
    const attribution = host.querySelector('.mwnf-footer__attribution')
    expect(attribution).not.toBeNull()
    expect(attribution.textContent).toContain(manifest.rights.attribution)
    const terms = attribution.querySelector('a.mwnf-footer__terms')
    expect(terms.textContent).toBe(messages.en['record.source.termsOfUse'])
    expect(terms.getAttribute('href')).toBe(manifest.rights.terms_url)
    app.unmount()
  }, 20000)
}

// The collection results: the tiles, the "filter further by" column, the
// summary and the page links. A site may pin its own counts.
function collectionTest(mountSite, collection = {}) {
  it('renders the collection results on the composed results view', async () => {
    const { app, host } = await mountSite('#/collection-results')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-grid__tile')).not.toBeNull(), WAIT)
    expect(host.querySelector('.mwnf-catalogue')).not.toBeNull()
    expect(host.querySelector('.mwnf-catalogue__aside .mwnf-filter')).not.toBeNull()
    expect(host.querySelector('.mwnf-summary__count')).not.toBeNull()
    const tiles = host.querySelectorAll('.mwnf-grid__tile').length
    const paginations = host.querySelectorAll('.mwnf-pagination').length
    if (collection.tiles) expect(tiles).toBe(collection.tiles)
    else expect(tiles).toBeGreaterThan(0)
    if (collection.paginations) expect(paginations).toBe(collection.paginations)
    else expect(paginations).toBeGreaterThan(0)
    app.unmount()
  }, 60000)
}

function searchTests(mountSite, loadItems) {
  it('returns every renderable object for the all-objects sentinel', async () => {
    const { app, host } = await mountSite('#/search?q=all-objects')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-grid__tile')).not.toBeNull(), WAIT)
    expect(host.textContent).toContain('All objects')
    app.unmount()
  }, 30000)

  it('renders a keyword search on the composed results view', async () => {
    const item = await loadItems()
    const term = firstWord(item.internal_name)
    const { app, host } = await mountSite(`#/search?q=${encodeURIComponent(term)}`)
    await vi.waitFor(() => expect(host.querySelector('.mwnf-grid__tile')).not.toBeNull(), WAIT)
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

// A record related to an item but outside this site's own package is listed
// with its project, not as a bare legacy code. Nothing to check in a package
// whose related records are all its own.
function outsideReferenceTest(mountSite, manifest, sharedTexts) {
  it('names the project of a related record outside this site', async () => {
    const [items] = await loadEntities(['items'])
    const item = items.find((i) => (i.related_items ?? []).some((ref) => ref.in_package === false))
    if (!item) return
    const projects = item.related_items
      .filter((ref) => ref.in_package === false)
      .map((ref) => manifest.projects[ref.project_id]?.name?.en)
    const notHere = sharedTexts.en['gallery.results.notInThisGallery']
    const { app, host } = await mountSite(`#/item/${item.id}`)
    const outsideRow = () => [...host.querySelectorAll('.mwnf-sheet-related__references li')]
      .find((li) => li.textContent.includes(notHere))
    await vi.waitFor(() => expect(outsideRow()).toBeTruthy(), WAIT)
    const row = outsideRow()
    expect(row.querySelector('.mwnf-chip')).not.toBeNull()
    expect(projects).toContain(row.textContent.replace(notHere, '').trim())
    expect(row.querySelector('code')).toBeNull()
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
 *     results offer, the `galleryTiles` the gallery's first page shows and a
 *     `galleryItem` text on it;
 *   - `partner`: `{ id, name, city, country, objects }` — a partner with
 *     objects, a position and a translated city — and `tiles`, its objects
 *     page's first page, when that is fewer than `objects`;
 *   - optionally `collection: { tiles, paginations }`, and the `about` and
 *     `credits` texts their pages show.
 */
export function describeGallerySmoke({ config, sharedTexts, ownTexts, manifest, namespace, picks }) {
  const { messages, mountSite } = mounter(config, sharedTexts, ownTexts)
  const { chip, noticeItem = null, dynasty = null, timeline, partner } = picks

  describe('gallery smoke test', () => {
    it('mounts against the configured data package', async () => {
      const { app, host } = await mountSite()
      expect(host.textContent).toContain(config.siteName)
      expect(host.querySelector('.mwnf-page')).not.toBeNull()
      // The family's Home view replaces viewer-core's generic one.
      expect(host.querySelector('.vc-home')).toBeNull()
      app.unmount()
    }, 20000)

    collectionTest(mountSite, picks.collection)

    it('renders the collection entrance on the composed search form view', async () => {
      const { app, host } = await mountSite('#/collection')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-search-form')).not.toBeNull(), WAIT)
      // The country dropdown plus at least one populated tag category, and
      // the shared from/to year buckets.
      expect(host.querySelectorAll('.mwnf-search-form .mwnf-facet').length).toBeGreaterThan(1)
      expect(host.querySelector('.mwnf-search-form__dates')).not.toBeNull()
      expect(host.textContent).toContain('this Gallery’s database')
      app.unmount()
    }, 30000)

    searchTests(mountSite, async () => (await loadEntities(['items']))[0][0])

    it('renders the about page on the composed text page view', async () => {
      const { app, host } = await mountSite('#/about')
      const prose = host.querySelector('.mwnf-prose')
      expect(prose.textContent.trim().length).toBeGreaterThan(0)
      if (picks.about) expect(host.textContent).toContain(picks.about)
      app.unmount()
    }, 20000)

    it('renders the credits page on the composed text page view', async () => {
      const { app, host } = await mountSite('#/credits')
      const prose = host.querySelector('.mwnf-prose')
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
      // The "Source database" line names the item's project from the manifest.
      const projectName = manifest.projects[items[0].project_id]?.name?.en ?? ''
      expect(host.querySelector('.mwnf-sheet-source').textContent).toContain(projectName)
      app.unmount()
    }, 60000)

    outsideReferenceTest(mountSite, manifest, sharedTexts)

    // The chip's colour and text come from `projectColors` and the manifest's
    // project name, keyed by the item's `project_id`.
    it('colours and names the source-database chip from the manifest projects section', async () => {
      const { app, host } = await mountSite(`#/item/${chip.item}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet-source .mwnf-chip')).not.toBeNull(), WAIT)
      const line = host.querySelector('.mwnf-sheet-source__line')
      expect(line.textContent).toContain(chip.project)
      expect(line.querySelector('.mwnf-chip').classList.contains(chip.className)).toBe(true)
      app.unmount()
    }, 60000)

    // The Explore-partner notice shows for the projects `noticeProjects`
    // lists, and stays off every other.
    it.skipIf(!noticeItem)('shows the explore-partner notice only for the project dataset.config.js lists', async () => {
      const epm = await mountSite(`#/item/${noticeItem}`)
      await vi.waitFor(() => expect(epm.host.querySelector('.mwnf-sheet-source')).not.toBeNull(), WAIT)
      expect(epm.host.querySelector('.mwnf-sheet-notice')).not.toBeNull()
      epm.app.unmount()

      const other = await mountSite(`#/item/${chip.item}`)
      await vi.waitFor(() => expect(other.host.querySelector('.mwnf-sheet-source')).not.toBeNull(), WAIT)
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
      expect(links().some((a) => a.getAttribute('href') === project.related_database_url)).toBe(true)
      if (project.artistic_introduction_url) {
        expect(host.textContent).toContain('Artistic Introduction')
        expect(links().some((a) => a.getAttribute('href') === project.artistic_introduction_url)).toBe(true)
      } else {
        expect(host.textContent).not.toContain('Artistic Introduction')
      }
      app.unmount()
    }, 60000)

    // A borrowed item's tile names its project. A long name is truncated on
    // the tile, so a prefix is matched.
    it('shows the source project on a collection-results tile, from the manifest', async () => {
      const [items] = await loadEntities(['items'])
      const item = items.find((i) => i.id === chip.item)
      const { app, host } = await mountSite(`#/search?q=${encodeURIComponent(item.internal_name.replace(/[*_]/g, ''))}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-grid__tile')).not.toBeNull(), WAIT)
      expect(host.textContent).toContain(`for project ${chip.project.slice(0, 15)}`)
      app.unmount()
    }, 30000)

    it('renders the source credit on the item sheet, addressed to this deployed site', async () => {
      const [items] = await loadEntities(['items'])
      const item = items[0]
      const { app, host } = await mountSite(`#/item/${item.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-source-credit')).not.toBeNull(), WAIT)
      const link = host.querySelector('.mwnf-source-credit a')
      expect(link.textContent).toBe(link.getAttribute('href'))
      expect(link.getAttribute('href').startsWith(`${config.site.origin}/#/item/${item.id}`)).toBe(true)
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

    it('renders the timeline gallery on the composed results view', async () => {
      const { app, host } = await mountSite(`#/timeline/gallery?country=${timeline.code}`)
      await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-grid__tile').length).toBeGreaterThan(0), WAIT)
      if (timeline.galleryTiles) expect(host.querySelectorAll('.mwnf-grid__tile').length).toBe(timeline.galleryTiles)
      expect(host.querySelector('.mwnf-summary').textContent).toContain(timeline.country)
      if (timeline.galleryItem) expect(host.textContent).toContain(timeline.galleryItem)
      app.unmount()
    }, 60000)

    // The entrance's country control writes the inventory id, and the results
    // it submits to filter on it.
    it("submits the timeline entrance's country control (an id) to a results address that actually filters", async () => {
      const { app, host } = await mountSite('#/timeline')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-facet__select')).not.toBeNull(), WAIT)
      const countrySelect = host.querySelectorAll('.mwnf-facet__select')[0]
      countrySelect.value = timeline.id
      countrySelect.dispatchEvent(new window.Event('change', { bubbles: true }))
      host.querySelector('form.mwnf-timeline__filters').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
      await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-timeline__row').length).toBeGreaterThan(0), WAIT)
      if (timeline.rows) expect(host.querySelectorAll('.mwnf-timeline__row').length).toBe(timeline.rows)
      expect(host.querySelector('.mwnf-timeline__caption').textContent).toContain(timeline.country)
      app.unmount()
    }, 60000)

    // The object count is the gallery's own entry over the shared one.
    it('renders the partners list on the composed partner-list view', async () => {
      const { app, host } = await mountSite('#/partners')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-partner-list__row')).not.toBeNull(), WAIT)
      expect(host.textContent).toContain(partner.country)
      expect(host.textContent).toContain(partner.name)
      expect(host.textContent).toContain(`${partner.objects} object(s) in this site`)
      app.unmount()
    }, 60000)

    it('renders a partner profile on the composed record view', async () => {
      const { app, host } = await mountSite(`#/partner/${partner.id}`)
      // The name and the city arrive with the translations the view loads.
      await vi.waitFor(() => expect(host.textContent).toContain(partner.name), WAIT)
      await vi.waitFor(() => expect(host.textContent).toContain(partner.city), WAIT)
      expect(host.querySelector('.mwnf-partner-map')).not.toBeNull()
      // The credit renders whatever the page's own citation switch says.
      expect(host.querySelector('.mwnf-source-credit')).not.toBeNull()
      app.unmount()
    }, 60000)

    it("renders a partner's objects on the composed grid results view", async () => {
      const { app, host } = await mountSite(`#/partner/${partner.id}/objects`)
      await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-grid__tile').length).toBe(partner.tiles ?? partner.objects), WAIT)
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
      expect(checkTextsRendered(host, {
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

    collectionTest(mountSite, collection)

    it('renders the item sheet on the composed record view', async () => {
      const items = await loadItems()
      const item = items.find((i) => i.project_id) ?? items[0]
      const { app, host } = await mountSite(`#/item/${item.id}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-sheet__label')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-record')).not.toBeNull()
      expect(host.querySelector('.mwnf-dxa-item__languages')).not.toBeNull()
      expect(host.querySelector('.mwnf-sheet-related')).not.toBeNull()
      const projectName = manifest.projects?.[item.project_id]?.name?.en
      if (projectName) expect(host.querySelector('.mwnf-sheet-source__line').textContent).toContain(projectName)
      // The glossary tool is the layout's own, on every sheet.
      expect(host.querySelector('.mwnf-glossary-tool')).not.toBeNull()
      // The source credit: origin plus this item's route.
      const creditLink = host.querySelector('.mwnf-source-credit a')
      expect(creditLink).not.toBeNull()
      expect(creditLink.textContent.startsWith(config.site.origin)).toBe(true)
      expect(creditLink.textContent.endsWith(`#/item/${item.id}`)).toBe(true)
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
        expect(!!host.querySelector(`a[href="${project.related_database_url}"]`)).toBe(!!project.related_database_url)
        expect(!!host.querySelector(`a[href="${project.artistic_introduction_url}"]`)).toBe(!!project.artistic_introduction_url)
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

    it('renders the partners list on the composed list view', async () => {
      const partner = (await visiblePartners()).find((p) => partnerNames[p.id]?.name)
      const { app, host } = await mountSite('#/partners')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-partner-list')).not.toBeNull(), WAIT)
      // Country groups, all open, and the A-Z / Z-A toggle.
      expect(host.querySelectorAll('.mwnf-partner-list__group-heading').length).toBeGreaterThan(0)
      expect(host.querySelector('.mwnf-partner-list__toggle-button')).not.toBeNull()
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

    it('renders a partner objects page on the composed results view', async () => {
      const partner = (await visiblePartners()).find((p) => p.item_count > 0)
      const { app, host } = await mountSite(`#/partner/${partner.id}/objects`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-grid__tile')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-catalogue')).not.toBeNull()
      expect(host.textContent).toContain(partnerNames[partner.id]?.name ?? partner.id)
      app.unmount()
    }, 30000)

    it('renders the collection entrance on the composed search form view', async () => {
      const { app, host } = await mountSite('#/collection')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-search-form')).not.toBeNull(), WAIT)
      expect(host.querySelectorAll('.mwnf-search-form .mwnf-facet').length).toBeGreaterThan(1)
      expect(host.querySelector('.mwnf-search-form__dates')).not.toBeNull()
      expect(host.querySelector('.mwnf-search-form__how-to')).not.toBeNull()
      expect(host.textContent).toContain('Have you already been at')
      app.unmount()
    }, 30000)

    searchTests(mountSite, async () => (await loadItems()).find((i) => !i.languages?.length || i.languages.includes('en')))

    it('renders the themes list on the composed accordion', async () => {
      const { app, host } = await mountSite('#/themes')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-cards--accordion')).not.toBeNull(), WAIT)
      expect(host.querySelectorAll('.mwnf-cards__details').length).toBeGreaterThan(0)
      app.unmount()
    }, 30000)

    it('renders a theme on the composed essay view', async () => {
      const [, , , themes] = await loadEntities(['exhibition', 'items', 'partners', 'themes'])
      const theme = themePick
        ? themes.find((t) => t.id === themePick.id)
        : themes.find((t) => t.display_order > 1) ?? themes[0]
      const { app, host } = await mountSite(`#/theme/${themePick ? themePick.id : theme.display_order - 1}`)
      await vi.waitFor(() => expect(host.querySelector('.mwnf-essay')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-essay').className).not.toContain('mwnf-essay--about')
      // The Roman label beside the theme's own title.
      expect(host.querySelector('.mwnf-dxa-theme__heading').textContent).toMatch(/[IVX]/)
      expect(host.querySelector('.mwnf-essay__side')).not.toBeNull()
      expect(host.querySelector('.mwnf-picture-gallery__selected, .mwnf-picture-gallery__empty')).not.toBeNull()
      expect(host.querySelector('.mwnf-essay__nav')).not.toBeNull()
      // The selected picture's caption is its parent record's label.
      if (themePick?.pictureTitle) {
        expect(host.querySelector('.mwnf-picture-gallery__detail--title').textContent).toContain(themePick.pictureTitle)
      } else {
        expect(host.querySelector('.mwnf-picture-gallery__detail--title, .mwnf-picture-gallery__empty')).not.toBeNull()
      }
      const subNav = host.querySelector('.mwnf-dxa-theme__subthemes')
      for (const title of themePick?.subthemes ?? []) expect(subNav.textContent).toContain(title)
      if (subNav) expect(subNav.textContent.trim().length).toBeGreaterThan(0)
      // The texts are read through the tree's own entity: a wrong one renders
      // internal names or nothing.
      const prose = host.querySelector('.mwnf-essay__prose, .mwnf-essay__body')
      expect(prose?.textContent?.trim()).toBeTruthy()
      const title = host.querySelector('.mwnf-essay__title')
      if (title && theme) expect(title.textContent).not.toBe(theme.internal_name)
      const creditLink = host.querySelector('.mwnf-source-credit a')
      expect(creditLink).not.toBeNull()
      expect(creditLink.textContent.startsWith(config.site.origin)).toBe(true)
      app.unmount()
    }, 30000)

    it('renders the theme gallery on the composed results view', async () => {
      const { app, host } = await mountSite('#/theme-gallery/1')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-grid__tile')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-catalogue')).not.toBeNull()
      app.unmount()
    }, 30000)

    it('renders the timeline entrance on the composed timeline view, as a form', async () => {
      const { app, host } = await mountSite('#/timeline')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-timeline')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-timeline__filters')).not.toBeNull()
      // The entrance renders the form alone: no results row, no summary.
      expect(host.querySelector('.mwnf-timeline__row')).toBeNull()
      expect(host.querySelector('.mwnf-summary')).toBeNull()
      expect(host.textContent).toContain('Have you already been at')
      app.unmount()
    }, 30000)

    it('renders the timeline results on the composed timeline view', async () => {
      const { app, host } = await mountSite('#/timeline-results')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-summary')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-timeline')).not.toBeNull()
      expect(host.textContent).toContain('Events found')
      app.unmount()
    }, 30000)

    it('offers "See Gallery" from the timeline results when the period has objects', async () => {
      const dated = await datedItem()
      const { app, host } = await mountSite(
        `#/timeline-results?country=${dated.country_id}&begin=${dated.start_date}&end=${dated.end_date ?? dated.start_date}`,
      )
      await vi.waitFor(() => expect(host.querySelector('.mwnf-timeline__gallery')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-timeline__gallery').textContent).toContain('See Gallery')
      app.unmount()
    }, 30000)

    it('renders the timeline gallery on the composed results view', async () => {
      const dated = await datedItem()
      const { app, host } = await mountSite(
        `#/timeline/gallery?country=${dated.country_id}&begin=${dated.start_date}&end=${dated.end_date ?? dated.start_date}`,
      )
      await vi.waitFor(() => expect(host.querySelector('.mwnf-catalogue')).not.toBeNull(), WAIT)
      // The item that seeded the query overlaps its own period.
      expect(host.querySelector('.mwnf-grid__tile')).not.toBeNull()
      app.unmount()
    }, 30000)

    // The inventory id and the legacy two-letter code filter the same rows.
    it('timeline country id filter produces the same results as the legacy two-letter code', async () => {
      const items = await loadItems()
      const greek = items.find((i) => Number.isFinite(i.start_date) && i.country_id === 'grc')
      if (!greek) return
      const period = `begin=${greek.start_date}&end=${greek.end_date ?? greek.start_date}`
      const byId = await mountSite(`#/timeline-results?country=grc&${period}`)
      await vi.waitFor(() => expect(byId.host.querySelector('.mwnf-summary')).not.toBeNull(), WAIT)
      const byCode = await mountSite(`#/timeline-results?country=gr&${period}`)
      await vi.waitFor(() => expect(byCode.host.querySelector('.mwnf-summary')).not.toBeNull(), WAIT)
      expect(byId.host.querySelectorAll('.mwnf-timeline__row').length).toBe(byCode.host.querySelectorAll('.mwnf-timeline__row').length)
      const galleryId = byId.host.querySelector('.mwnf-timeline__gallery')
      const galleryCode = byCode.host.querySelector('.mwnf-timeline__gallery')
      if (galleryId && galleryCode) expect(galleryId.textContent).toBe(galleryCode.textContent)
      const firstRow = byId.host.querySelector('.mwnf-timeline__row')
      if (firstRow) expect(firstRow.textContent).toContain('Greece')
      byId.app.unmount()
      byCode.app.unmount()
    }, 60000)

    it('renders the related content on the composed link list', async () => {
      const { app, host } = await mountSite('#/related')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-link-list')).not.toBeNull(), WAIT)
      if (relatedContent) {
        expect(host.querySelector('.mwnf-link-list__groups')).not.toBeNull()
        expect(host.querySelectorAll('.mwnf-link-list__item').length).toBeGreaterThan(0)
      } else {
        expect(host.querySelector('.mwnf-link-list__groups, .mwnf-link-list__empty')).not.toBeNull()
      }
      app.unmount()
    }, 30000)

    it('renders about on the composed essay view, in about mode', async () => {
      const { app, host } = await mountSite('#/about')
      await vi.waitFor(() => expect(host.querySelector('.mwnf-essay')).not.toBeNull(), WAIT)
      expect(host.querySelector('.mwnf-essay').className).toContain('mwnf-essay--about')
      // About mode drops the side column and the picture narrative.
      expect(host.querySelector('.mwnf-essay__side')).toBeNull()
      expect(host.querySelector('.mwnf-picture-narrative')).toBeNull()
      expect(host.textContent).toContain(config.siteName)
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
      expect(checkTextsRendered(host, {
        namespaces: [namespace, 'core', 'layout', 'catalogue', 'record', 'sheet', 'timeline', 'partner', 'exhibition'],
      })).toEqual([])
      app.unmount()
    }, 20000)

    rightsTest(mountSite, manifest, messages)
  })
}
