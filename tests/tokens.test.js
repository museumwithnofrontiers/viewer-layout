import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { AppHeader } from '../src/index.js'
import { globalWithI18n } from './helpers.js'

// vitest runs with the package root as cwd; ?raw imports and import.meta.url
// are both unreliable for CSS here, so read the file directly.
const layoutCss = readFileSync(resolve('src/styles/layout.css'), 'utf8')
// The content components follow the same rule, in their own stylesheet.
const contentCss = readFileSync(resolve('src/styles/content.css'), 'utf8')
const dxaCss = readFileSync(resolve('src/styles/dxa.css'), 'utf8')
const tokensReference = readFileSync(resolve('src/tokens.reference.css'), 'utf8')

// Every rule of a stylesheet, as jsdom's own parser reads it.
function cssRules(css) {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  const rules = [...style.sheet.cssRules]
  style.remove()
  return rules
}

describe('token styling', () => {
  afterEach(() => {
    document.head.querySelectorAll('style[data-test]').forEach((el) => el.remove())
    document.body.innerHTML = ''
  })

  it('a website token overrides the section computed style', () => {
    const style = document.createElement('style')
    style.setAttribute('data-test', '')
    // jsdom cascades custom properties but never substitutes var() into other
    // properties, so this asserts the two halves it can: the website token
    // reaches the section's computed style, and the stylesheet binds the
    // section background to that token. (Full substitution is covered by the
    // browser check of the consumer app.)
    style.textContent = `${layoutCss}\n.mwnf-header { --mwnf-header-background: rgb(10, 20, 30); }`
    document.head.appendChild(style)

    const wrapper = mount(AppHeader, {
      props: { title: 'My Museum' },
      attachTo: document.body,
      ...globalWithI18n(),
    })
    const computed = getComputedStyle(wrapper.element)
    // jsdom's rgb() serialization differs across versions (with/without
    // spaces after commas) - compare ignoring whitespace.
    expect(
      computed.getPropertyValue('--mwnf-header-background').replace(/\s/g, ''),
    ).toBe('rgb(10,20,30)')
    expect(layoutCss).toMatch(/\.mwnf-header\s*{[^}]*background-color:\s*var\(--mwnf-header-background/)
  })

  it('every token a stylesheet reads is in the reference file', () => {
    const declared = new Set(tokensReference.match(/--mwnf-[a-z0-9-]+/g))
    const read = new Set(`${layoutCss}\n${contentCss}\n${dxaCss}`.match(/--mwnf-[a-z0-9-]+/g))
    const missing = [...read].filter((token) => !declared.has(token))
    expect(missing, `tokens read but not documented:\n${missing.join('\n')}`).toEqual([])
  })

  // The accent is a surface colour. A theme that paints its menu or its
  // bands in it, as the exhibitions do with their pale contrast tone, would
  // otherwise hide every text that reads it.
  it.each([
    ['layout.css', layoutCss],
    ['content.css', contentCss],
    ['dxa.css', dxaCss],
  ])('%s never colours text with the accent', (name, css) => {
    const textColours = cssRules(css)
      .filter((rule) => rule.style?.getPropertyValue('color').includes('--mwnf-color-accent'))
      .map((rule) => rule.selectorText)
    expect(textColours).toEqual([])
  })

  // `:deep()` exists only in a component's scoped style. In a global
  // stylesheet the browser drops the whole rule without a word.
  it.each([
    ['layout.css', layoutCss],
    ['content.css', contentCss],
    ['dxa.css', dxaCss],
  ])('%s carries no scoped-style selector', (name, css) => {
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/:deep\(/)
  })

  // A link rule of the form `.container a` outranks `.mwnf-button` (an
  // element and a class against a class), so a button drawn as an anchor in
  // that container took the link colour over its own background — the
  // partner page's "View objects".
  it('leaves an action drawn as a button to the button rule', () => {
    document.body.innerHTML = `
      <div class="mwnf-partner-panel__actions">
        <a class="mwnf-button" href="#/partner/1/objects">View objects</a>
        <a href="#/partner/1">Read more</a>
      </div>`
    const [button, link] = document.querySelectorAll('.mwnf-partner-panel__actions a')
    const linkColours = cssRules(contentCss).filter((rule) => {
      const colour = rule.style?.getPropertyValue('color') ?? ''
      return colour.includes('--mwnf-link-text') || colour.includes('--mwnf-partner-link-color')
    })
    expect(linkColours.filter((rule) => button.matches(rule.selectorText)).map((rule) => rule.selectorText)).toEqual([])
    expect(linkColours.some((rule) => link.matches(rule.selectorText))).toBe(true)
  })

  it.each([
    ['layout.css', layoutCss],
    ['content.css', contentCss],
  ])('every color, font, spacing and radius in %s is token-driven', (name, layoutCss) => {
    const declarations = layoutCss
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split(';')
      .map((decl) => decl.slice(decl.lastIndexOf('{') + 1).replace(/\s+/g, ' ').trim())
      .filter((line) =>
        // `border-collapse` is structure, not a visual value; every other
        // border property carries a width, style or colour and is a token's.
        /^(background(-color)?|color|font-family|font-size|padding|padding-\S+|gap|margin(-\S+)?|border(?!-collapse)(-\S+)?|border-radius|line-height|height|max-height|font-weight):/.test(
          line,
        ),
      )
    const hardcoded = declarations.filter(
      (line) =>
        !line.includes('var(--mwnf-') &&
        !/^(margin|padding)[^:]*:\s*(0|0 0[^;]*|auto);?$/.test(line) &&
        !/inherit|transparent|currentColor|none|100%|auto/.test(line),
    )
    expect(hardcoded, `hardcoded values found:\n${hardcoded.join('\n')}`).toEqual([])
  })
})
