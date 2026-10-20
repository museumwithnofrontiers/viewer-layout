import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { PageShell } from '../src/index.js'
import { globalWithI18n } from './helpers.js'

describe('PageShell', () => {
  it('with only a default slot renders only the Content area', () => {
    const wrapper = mount(PageShell, {
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('main#mwnf-content').text()).toBe('Body')
    expect(wrapper.find('header').exists()).toBe(false)
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.find('footer').exists()).toBe(false)
    expect(wrapper.find('.mwnf-banner').exists()).toBe(false)
    expect(wrapper.find('.mwnf-hyperlinks').exists()).toBe(false)
    expect(wrapper.find('.mwnf-sponsors').exists()).toBe(false)
  })

  it('renders all seven sections in the fixed vertical order', () => {
    const wrapper = mount(PageShell, {
      props: {
        headerTitle: 'My Museum',
        bannerText: 'Welcome',
        navLinks: [{ label: 'Items', href: '#/items' }],
        hyperlinks: [{ label: 'MWNF', href: 'https://example.org' }],
        sponsors: [{ name: 'Sponsor A' }],
        footerText: '© MWNF',
      },
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    const order = Array.from(
      wrapper.element.querySelectorAll(
        '.mwnf-header, .mwnf-banner, .mwnf-nav, .mwnf-content, .mwnf-hyperlinks, .mwnf-sponsors, .mwnf-footer',
      ),
      (el) => el.className.split(' ')[0],
    )
    expect(order).toEqual([
      'mwnf-header',
      'mwnf-banner',
      'mwnf-nav',
      'mwnf-content',
      'mwnf-hyperlinks',
      'mwnf-sponsors',
      'mwnf-footer',
    ])
  })

  it('renders named slot content inside the matching section', () => {
    const wrapper = mount(PageShell, {
      slots: {
        header: '<span class="custom-header">Hand-made header</span>',
        default: '<p>Body</p>',
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('header .custom-header').text()).toBe('Hand-made header')
    expect(wrapper.find('footer').exists()).toBe(false)
  })

  it('re-emits update:language from the navigation', async () => {
    const wrapper = mount(PageShell, {
      props: { languages: ['en', 'fr'], language: 'en' },
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    await wrapper.find('select').setValue('fr')
    expect(wrapper.emitted('update:language')).toEqual([['fr']])
  })

  it('renders a skip link targeting the content area', () => {
    const wrapper = mount(PageShell, {
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    const skip = wrapper.find('.mwnf-skip-link')
    expect(skip.attributes('href')).toBe('#mwnf-content')
    expect(skip.text()).toBe('Skip to content')
  })

  it('renders a gallery chrome from props alone', async () => {
    const wrapper = mount(PageShell, {
      props: {
        headerHome: 'https://www.example.org/',
        headerEyebrow: 'MWNF Galleries',
        headerTitle: 'Carpets',
        headerTitleHref: '#/',
        headerLinks: [{ label: 'Home', href: '#/' }],
        search: { placeholder: 'Search', submitLabel: 'Search' },
        languages: [{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }],
        language: 'en',
        languagePlacement: 'header',
        languageStyle: 'buttons',
        bannerVariant: 'strip',
        bannerImage: 'banner.jpg',
        bannerEyebrow: 'Discover MWNF Galleries',
        bannerTitle: 'Carpets',
        bannerEnter: { label: '»', href: '#/collection' },
        navLinks: [{ label: 'Collection', href: '#/collection' }],
        notice: { title: 'Tip:', text: 'The database has been replaced.' },
        footerLinks: [{ label: 'About MWNF', href: 'https://www.example.org/about', external: true }],
        footerText: '© MWNF 2004–2026',
      },
      slots: { 'header-brand': '<span class="mark">MWNF</span>', default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('header .mwnf-header__home .mark').text()).toBe('MWNF')
    expect(wrapper.find('header .mwnf-header__eyebrow').text()).toBe('MWNF Galleries')
    // The switcher is in the header, as buttons, and not in the navigation.
    expect(wrapper.findAll('header .mwnf-header__language')).toHaveLength(2)
    expect(wrapper.find('nav select').exists()).toBe(false)
    await wrapper.findAll('header .mwnf-header__language')[1].trigger('click')
    expect(wrapper.emitted('update:language')).toEqual([['ar']])
    await wrapper.find('header .mwnf-header__search-input').setValue('bowl')
    await wrapper.find('header form').trigger('submit')
    expect(wrapper.emitted('search')).toEqual([['bowl']])
    expect(wrapper.find('.mwnf-banner--strip .mwnf-banner__title').text()).toContain('Carpets')
    expect(wrapper.find('nav .mwnf-nav__notice').text()).toContain('The database has been replaced.')
    expect(wrapper.find('footer .mwnf-footer__link').text()).toBe('About MWNF')
  })

  it('renders an exhibition chrome from props alone', () => {
    const wrapper = mount(PageShell, {
      props: {
        headerHome: 'https://www.example.org/',
        headerBrand: 'MWNF',
        headerLogos: [{ image: 'unaoc.png', alt: 'UNAOC' }],
        headerLogosTitle: 'Co-organisers',
        headerTitle: 'Virtual exhibitions',
        headerTitleHref: '#/about',
        bannerVariant: 'split',
        bannerImage: 'banner.jpg',
        bannerTitle: 'Water in Islam',
        bannerSubtitle: 'An exhibition',
        bannerHeadline: 'A *thousand* years.',
        bannerEnter: { label: 'Enter', href: '#/about' },
        bannerStrapline: 'A MWNF virtual exhibition',
        navLinks: [{ label: 'Themes', href: '#/themes' }],
        hyperlinksVariant: 'tiles',
        hyperlinksTitle: 'Water in Islam',
        hyperlinksTitleHref: '#/',
        hyperlinksSubtitle: 'An exhibition',
        hyperlinks: [{ label: 'About', description: 'Introduction', href: '#/about' }],
        sponsorGroups: [{ title: 'Under the patronage of', sponsors: [{ name: 'UNAOC', logo: 'unaoc.png' }] }],
        footerLinks: [{ label: 'Credits', href: 'https://www.example.org/credits', external: true }],
      },
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('header .mwnf-header__logos-title').text()).toBe('Co-organisers')
    expect(wrapper.find('.mwnf-banner--split .mwnf-banner__headline').html()).toContain('<em>thousand</em>')
    expect(wrapper.find('.mwnf-hyperlinks--tiles .mwnf-hyperlinks__description').text()).toBe('Introduction')
    expect(wrapper.find('.mwnf-sponsors__group-title').text()).toBe('Under the patronage of')
    expect(wrapper.find('footer .mwnf-footer__link').attributes('target')).toBe('_blank')
  })

  it('puts the menu before the banner with navigation-placement="before-banner", and after it by default', () => {
    const order = (placement) => {
      const wrapper = mount(PageShell, {
        props: { bannerText: 'Welcome', navLinks: [{ label: 'Items', href: '#/items' }], ...(placement ? { navigationPlacement: placement } : {}) },
        ...globalWithI18n(),
      })
      return Array.from(wrapper.element.querySelectorAll('.mwnf-banner, .mwnf-nav'), (el) => el.className.split(' ')[0])
    }
    expect(order()).toEqual(['mwnf-banner', 'mwnf-nav'])
    expect(order('after-banner')).toEqual(['mwnf-banner', 'mwnf-nav'])
    expect(order('before-banner')).toEqual(['mwnf-nav', 'mwnf-banner'])
  })

  it('draws the header mark as an image from header-brand-logo, linked home', () => {
    const wrapper = mount(PageShell, {
      props: { headerHome: 'https://www.museumwnf.org', headerBrandLogo: { src: '/assets/logo.png', alt: 'MWNF Logo' } },
      ...globalWithI18n(),
    })
    const home = wrapper.find('.mwnf-header__home')
    expect(home.attributes('href')).toBe('https://www.museumwnf.org')
    expect(home.find('img.mwnf-header__brand-logo').attributes('src')).toBe('/assets/logo.png')
    expect(home.find('img').attributes('alt')).toBe('MWNF Logo')
  })

  it('renders the footer social links as icon links, skipping an unknown icon', () => {
    const wrapper = mount(PageShell, {
      props: {
        footerText: '© MWNF',
        footerSocial: [
          { label: 'YouTube', href: 'https://www.youtube.com/channel/x', icon: 'youtube' },
          { label: 'Nowhere', href: 'https://nowhere.example', icon: 'nowhere' },
          { label: 'LinkedIn', href: 'https://www.linkedin.com/company/x/', icon: 'linkedin' },
        ],
      },
      ...globalWithI18n(),
    })
    const links = wrapper.findAll('.mwnf-footer__social-link')
    expect(links.map((a) => a.attributes('aria-label'))).toEqual(['YouTube', 'LinkedIn'])
    expect(links[0].attributes('href')).toBe('https://www.youtube.com/channel/x')
    expect(links[0].attributes('target')).toBe('_blank')
    expect(links[0].find('svg path').attributes('d')).toMatch(/^M/)
  })
})
