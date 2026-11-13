import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { loadEntities } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import { RelatedContent, SEE_ALSO_LABELS, seeAlsoOf, StandaloneItemSheet, trailTitle } from '../src/standalone/index.js'
import { layoutTexts } from './helpers.js'
import { settle } from './dxa/helpers.js'

// Legacy's "See also" at the foot of a product's item sheet (inventory-app#2538):
// Discover Islamic Art's "Related MWNF Travel Book" and Discover Baroque Art's
// exhibition trails, from the record's `travel_book` and `exhibition_trails`.

const texts = {
  ...layoutTexts,
  'core.status.loading': 'Loading…',
  'record.related.title': 'Related Content',
  'sheet.field.name': 'Name',
  'standalone.related.seeAlso': 'See also',
  'standalone.related.travelBook': 'Related MWNF Travel Book',
  'standalone.related.exhibitionTrail': 'Virtual Visit Exhibition Trail',
  'site.download': 'Download',
  'site.asPdf': 'As PDF',
}
const french = { 'standalone.related.seeAlso': 'Voir aussi', 'standalone.related.travelBook': 'Nos guides de voyage' }

const book = { url: 'https://example.org/publications/#/publication/p1' }
const trail = {
  url: 'https://example.org/travels/#/trail/t1',
  titles: { en: 'MAMLUK ART.', fr: 'L\'ART MAMELOUK' },
  subtitles: { en: 'The Splendour and Magic of the Sultans.' },
}

async function mountWith(component, { props = {}, locale = 'en', route = '/' } = {}) {
  const i18n = createI18n({ locale, messages: { en: texts, fr: french } })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<p>home</p>' } },
      { path: '/objects/:id', name: 'objects-detail', component: { template: '<p>detail</p>' } },
      { path: '/item/:id', name: 'item', component: { template: '<p>item</p>' } },
    ],
  })
  await router.push(route)
  await router.isReady()
  const wrapper = mount(component, { props, global: { plugins: [i18n, router] } })
  await settle(() => true, 1)
  return wrapper
}

describe('seeAlsoOf', () => {
  it('links the Travel Book in the page’s language, as legacy’s /book/<id>/<lang>', () => {
    expect(seeAlsoOf({ travel_book: book }, 'fr')).toEqual({
      heading: SEE_ALSO_LABELS.heading,
      links: [{ label: SEE_ALSO_LABELS.travelBook, href: 'https://example.org/publications/#/publication/p1/fr' }],
      groups: [],
    })
  })

  it('names each trail "<title> - <subtitle>" without their final period, its page in the page’s language', () => {
    expect(trailTitle(trail, 'en')).toBe('MAMLUK ART - The Splendour and Magic of the Sultans')
    expect(trailTitle(trail, 'fr')).toBe('L\'ART MAMELOUK - The Splendour and Magic of the Sultans')
    expect(trailTitle({ titles: { en: 'Alone.' } }, 'de')).toBe('Alone')
    expect(seeAlsoOf({ exhibition_trails: [trail] }, 'en').groups).toEqual([{
      heading: SEE_ALSO_LABELS.exhibitionTrail,
      links: [{ text: 'MAMLUK ART - The Splendour and Magic of the Sultans', href: 'https://example.org/travels/#/trail/t1?lang=en' }],
    }])
  })

  it('draws nothing for a record with no link, as legacy drew no "See also" then', () => {
    expect(seeAlsoOf({}, 'en')).toBeNull()
    expect(seeAlsoOf({ travel_book: null, exhibition_trails: [] }, 'en')).toBeNull()
  })
})

describe('the "See also" block', () => {
  it('draws the heading, the book’s link in a window of its own, and the trails', async () => {
    const wrapper = await mountWith(RelatedContent, {
      props: {
        seeAlso: seeAlsoOf({ travel_book: book, exhibition_trails: [trail] }, 'en'),
        download: { heading: 'site.download', print: 'site.asPdf' },
      },
    })
    const block = wrapper.find('.mwnf-standalone-related__see-also')
    expect(block.find('.mwnf-standalone-related__see-also-heading').text()).toBe('See also')
    const link = block.find('.mwnf-standalone-related__see-also-link')
    expect(link.text()).toBe('Related MWNF Travel Book')
    expect(link.attributes('href')).toBe('https://example.org/publications/#/publication/p1/en')
    expect(link.attributes('target')).toBe('_blank')
    const group = block.find('.mwnf-standalone-related__see-also-group')
    expect(group.find('p').text()).toBe('Virtual Visit Exhibition Trail')
    expect(group.find('a').attributes('href')).toBe('https://example.org/travels/#/trail/t1?lang=en')
    // Before the download links, as legacy's column ordered them.
    const html = wrapper.html()
    expect(html.indexOf('mwnf-standalone-related__see-also')).toBeLessThan(html.indexOf('mwnf-standalone-related__download'))
  })

  it('is drawn by the item sheet from the record, in the page’s language, unless the product says not to', async () => {
    await loadEntities(['objects'])
    const spec = { entity: 'objects', fields: [{ key: 'name', label: 'sheet.field.name', value: 'name' }], related: { route: 'objects-detail' } }
    let wrapper = await mountWith(StandaloneItemSheet, { route: '/objects/o1', locale: 'fr', props: { spec, id: 'o1' } })
    await settle(() => wrapper.find('.mwnf-standalone-related__see-also').exists(), 200)
    const block = wrapper.find('.mwnf-standalone-related__see-also')
    expect(block.find('.mwnf-standalone-related__see-also-heading').text()).toBe('Voir aussi')
    expect(block.find('.mwnf-standalone-related__see-also-link').text()).toBe('Nos guides de voyage')
    expect(block.find('.mwnf-standalone-related__see-also-link').attributes('href')).toBe('https://example.org/publications/#/publication/pub-trail/fr')
    expect(block.find('.mwnf-standalone-related__see-also-group a').text()).toBe('L\'ART MAMELOUK - The Splendour and Magic of the Sultans')
    wrapper.unmount()

    wrapper = await mountWith(StandaloneItemSheet, { route: '/objects/o1', props: { spec, id: 'o1', related: { seeAlso: false } } })
    await settle(() => wrapper.find('.mwnf-standalone-related').exists(), 200)
    expect(wrapper.find('.mwnf-standalone-related__see-also').exists()).toBe(false)
    wrapper.unmount()

    // A record without links draws no block.
    wrapper = await mountWith(StandaloneItemSheet, { route: '/objects/o2', props: { spec, id: 'o2' } })
    await settle(() => wrapper.find('.mwnf-standalone-related').exists(), 200)
    expect(wrapper.find('.mwnf-standalone-related__see-also').exists()).toBe(false)
    wrapper.unmount()
  })
})
