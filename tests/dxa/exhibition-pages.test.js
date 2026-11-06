import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { globalWithI18n } from '../helpers.js'
import Pages from '../../src/dxa/exhibition/Pages.vue'

// Legacy's exhibition pager (exhibitions-client PagesComponent.vue,
// inventory-app#2379): up to fifteen numbers with the current one in their
// middle, sliding back from the last page.

function numbers(currentPage, lastPage) {
  const wrapper = mount(Pages, { props: { pageInfo: { currentPage, lastPage } }, ...globalWithI18n() })
  return wrapper.findAll('.mwnf-dxa-exhibition-pages__numbers button').map((button) => Number(button.text()))
}

describe('exhibition Pages', () => {
  it('shows every page up to fifteen', () => {
    expect(numbers(1, 2)).toEqual([1, 2])
    expect(numbers(3, 15)).toHaveLength(15)
  })

  it('keeps fifteen numbers, the current page in their middle once past it, sliding back from the last', () => {
    expect(numbers(5, 30)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1))
    expect(numbers(12, 30)).toEqual(Array.from({ length: 15 }, (_, i) => i + 5))
    expect(numbers(29, 30)).toEqual(Array.from({ length: 15 }, (_, i) => i + 16))
  })

  it('draws nothing for a single page', () => {
    expect(numbers(1, 1)).toEqual([])
  })
})
