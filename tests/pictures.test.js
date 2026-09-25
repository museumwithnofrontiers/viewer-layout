import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PictureGallery from '../src/dxa/PictureGallery.vue'
import PictureNarrative from '../src/dxa/PictureNarrative.vue'
import { globalWithI18n } from './helpers.js'

// The DXA exhibition theme page's two seams, extracted from Theme.vue
// (museumwithnofrontiers/inventory-app#1729 / story #1811): PictureGallery
// (the panel + thumbnail strip) and PictureNarrative (the curated text and
// related-picture blocks below it). A website passes fully-resolved picture
// objects — see docs/theme-components.md — so no data-package fixture is
// needed here, only the exhibition texts these two components default to.

const texts = {
  'exhibition.theme.seeItemEntry': 'See item entry',
  'exhibition.theme.recordNotInSite': 'Not part of this site.',
  'exhibition.theme.additionalContent': 'Nothing selected yet.',
  'exhibition.theme.addRelatedWorks': 'Add related works',
  'exhibition.theme.hideRelatedWorks': 'Hide related works',
  'exhibition.related.items': 'Related',
  'exhibition.related.reciprocal': 'See the full context.',
}

function pkg(overrides = {}) {
  return globalWithI18n({ messages: { en: texts, ...overrides.messages } })
}

describe('PictureGallery', () => {
  const pictures = [
    {
      id: 'p1',
      image: 'p1.jpg',
      imageAlt: 'Picture one',
      name: '<em>Bowl</em>',
      imageCaption: 'Detail',
      detail: 'Fixture Museum, Cairo, Egypt',
      fields: [{ label: 'Also known as', value: 'The Blue Bowl' }],
      to: '/item/p1',
      backRelated: [],
    },
    {
      id: 'p2',
      image: 'p2.jpg',
      imageAlt: 'Picture two',
      name: 'Plate',
      imageCaption: '',
      detail: '',
      to: null,
      backRelated: [{ picture: { id: 'p1' }, reciprocalText: 'x' }],
    },
  ]

  it('shows the selected picture, its fields, and the record link', () => {
    const wrapper = mount(PictureGallery, { props: { pictures, selectedId: 'p1' }, ...pkg() })
    expect(wrapper.find('.mwnf-picture-gallery__image img').attributes('src')).toBe('p1.jpg')
    expect(wrapper.find('.mwnf-picture-gallery__detail--title').html()).toContain('Detail, ')
    expect(wrapper.find('.mwnf-picture-gallery__detail--title').html()).toContain('<em>Bowl</em>')
    expect(wrapper.text()).toContain('Also known as')
    expect(wrapper.text()).toContain('The Blue Bowl')
    expect(wrapper.text()).toContain('Fixture Museum, Cairo, Egypt')
    expect(wrapper.find('.mwnf-picture-gallery__link').text()).toContain('See item entry')
  })

  it('shows the unresolved message when the picture has no parent in the package', () => {
    const wrapper = mount(PictureGallery, { props: { pictures, selectedId: 'p2' }, ...pkg() })
    expect(wrapper.find('.mwnf-picture-gallery__link').exists()).toBe(false)
    expect(wrapper.find('.mwnf-picture-gallery__unresolved').text()).toBe('Not part of this site.')
  })

  it('shows the empty message when nothing is selected', () => {
    const wrapper = mount(PictureGallery, { props: { pictures, selectedId: null }, ...pkg() })
    expect(wrapper.find('.mwnf-picture-gallery__empty').text()).toBe('Nothing selected yet.')
  })

  it('hides a related-work target behind the toggle by default, and reveals it on click', async () => {
    const wrapper = mount(PictureGallery, { props: { pictures, selectedId: 'p1' }, ...pkg() })
    expect(wrapper.findAll('.mwnf-picture-gallery__thumb')).toHaveLength(1)
    const toggle = wrapper.find('.mwnf-picture-gallery__toggle input')
    expect(toggle.exists()).toBe(true)
    await toggle.setValue(true)
    expect(wrapper.findAll('.mwnf-picture-gallery__thumb')).toHaveLength(2)
    expect(wrapper.find('.mwnf-picture-gallery__toggle').text()).toBe('Hide related works')
  })

  it('emits update:selectedId when a thumbnail is clicked', async () => {
    const wrapper = mount(PictureGallery, { props: { pictures, selectedId: 'p1' }, ...pkg() })
    await wrapper.find('.mwnf-picture-gallery__thumb button').trigger('click')
    expect(wrapper.emitted('update:selectedId')).toEqual([['p1']])
  })
})

describe('PictureNarrative', () => {
  const picture = {
    id: 'p1',
    image: 'p1.jpg',
    imageAlt: 'Picture one',
    name: 'Bowl',
    detail: 'Fixture Museum',
    related: [
      { picture: { id: 'p3', image: 'p3.jpg', imageAlt: 'Plate', name: 'Plate', detail: '' }, text: 'Same workshop' },
    ],
    backRelated: [
      { picture: { id: 'p4', image: 'p4.jpg', imageAlt: 'Jug', name: 'Jug', detail: '' }, reciprocalText: 'Companion piece' },
    ],
  }

  it('renders nothing without a picture', () => {
    const wrapper = mount(PictureNarrative, { props: { picture: null }, ...pkg() })
    expect(wrapper.find('.mwnf-picture-narrative').exists()).toBe(false)
  })

  it('renders the contextual description as Markdown', () => {
    const wrapper = mount(PictureNarrative, {
      props: { picture, contextualDescription: 'A **bold** claim.' },
      ...pkg(),
    })
    expect(wrapper.find('.mwnf-picture-narrative__text').html()).toContain('<strong>bold</strong>')
  })

  it('renders the forward related block, with the current picture as the non-clickable main image', () => {
    const wrapper = mount(PictureNarrative, { props: { picture }, ...pkg() })
    const headings = wrapper.findAll('.mwnf-picture-narrative__heading')
    expect(headings[0].text()).toBe('Related')
    expect(wrapper.find('.mwnf-picture-narrative__image--main img').attributes('src')).toBe('p1.jpg')
    expect(wrapper.text()).toContain('Same workshop')
  })

  it('emits select when a related target is clicked', async () => {
    const wrapper = mount(PictureNarrative, { props: { picture }, ...pkg() })
    const buttons = wrapper.findAll('.mwnf-picture-narrative__image button')
    await buttons[0].trigger('click')
    expect(wrapper.emitted('select')).toEqual([['p3']])
  })

  it('renders the backward block with the reciprocal text, and its own fallback when none is given', async () => {
    const wrapper = mount(PictureNarrative, { props: { picture }, ...pkg() })
    expect(wrapper.text()).toContain('Companion piece')

    const noReciprocal = { ...picture, backRelated: [{ picture: { id: 'p4', image: 'p4.jpg', name: 'Jug' }, reciprocalText: '' }] }
    const fallback = mount(PictureNarrative, { props: { picture: noReciprocal }, ...pkg() })
    expect(fallback.text()).toContain('See the full context.')
  })

  it('emits select when the backward source is clicked', async () => {
    const wrapper = mount(PictureNarrative, { props: { picture }, ...pkg() })
    const sourceButton = wrapper.findAll('.mwnf-picture-narrative__related')[1].find('button')
    await sourceButton.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['p4']])
  })
})
