import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RelatedObjects from '../../src/dxa/RelatedObjects.vue'
import { relatedKind } from '../../src/dxa/relatedKind.js'

describe('RelatedObjects', () => {
  const tiles = [
    { id: 'a', image: 'https://example.test/a.jpg', name: '<i>Bowl</i>', country: 'Algeria', justification: 'Same workshop', to: '/item/a' },
    { id: 'b', image: '', name: 'Dish', country: '', justification: '', href: 'https://example.test/islamicart/#/item/b' },
  ]

  it('draws every related object as a thumbnail with its tooltip', () => {
    const wrapper = mount(RelatedObjects, { props: { heading: 'Related Objects', tiles } })
    expect(wrapper.find('.mwnf-related-objects__heading').text()).toBe('Related Objects')
    const tilesFound = wrapper.findAll('.mwnf-related-objects__tile')
    expect(tilesFound).toHaveLength(2)
    expect(tilesFound[0].find('img').attributes('src')).toBe('https://example.test/a.jpg')
    expect(tilesFound[0].find('.mwnf-related-objects__tooltip').text()).toContain('Bowl, Algeria')
    expect(tilesFound[0].find('.mwnf-related-objects__tooltip').text()).toContain('Same workshop')
    // One elsewhere opens its own site, in a new tab, as legacy's remote link did.
    const outside = tilesFound[1].find('a')
    expect(outside.attributes('href')).toBe('https://example.test/islamicart/#/item/b')
    expect(outside.attributes('target')).toBe('_blank')
    expect(tilesFound[1].find('.mwnf-related-objects__empty').exists()).toBe(true)
  })

  it('draws nothing without related objects', () => {
    const wrapper = mount(RelatedObjects, { props: { heading: 'Related Objects', tiles: [] } })
    expect(wrapper.find('.mwnf-related-objects').exists()).toBe(false)
  })
})

describe('relatedKind', () => {
  const itemById = new Map([['m-here', { id: 'm-here', type: 'monument' }], ['o-here', { id: 'o-here', type: 'object' }]])

  it('reads the type the exporter writes on the entry', () => {
    expect(relatedKind({ id: 'x', type: 'monument' }, itemById)).toBe('monument')
    expect(relatedKind({ id: 'm-here', type: 'object' }, itemById)).toBe('object')
  })

  it('falls back to the record in the package, and counts an untyped entry outside as an object', () => {
    expect(relatedKind({ id: 'm-here' }, itemById)).toBe('monument')
    expect(relatedKind({ id: 'o-here' }, itemById)).toBe('object')
    expect(relatedKind({ id: 'elsewhere' }, itemById)).toBe('object')
    expect(relatedKind({ id: 'elsewhere' })).toBe('object')
  })
})
