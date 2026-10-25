import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  AppBanner,
  AppContent,
  AppFooter,
  AppHeader,
  AppHyperlinks,
  AppNavigation,
  AppSponsors,
} from '../src/index.js'
import { globalWithI18n } from './helpers.js'

const cases = [
  {
    component: AppHeader,
    name: 'AppHeader',
    tag: 'header',
    props: { title: 'My Museum', subtitle: 'A subtitle' },
    texts: ['My Museum', 'A subtitle'],
  },
  {
    component: AppBanner,
    name: 'AppBanner',
    tag: 'section',
    props: { text: 'Welcome to the exhibition' },
    texts: ['Welcome to the exhibition'],
  },
  {
    component: AppNavigation,
    name: 'AppNavigation',
    tag: 'nav',
    props: { links: [{ label: 'Items', href: '#/items' }] },
    texts: ['Items'],
  },
  {
    component: AppHyperlinks,
    name: 'AppHyperlinks',
    tag: 'section',
    props: { links: [{ label: 'MWNF', href: 'https://example.org' }] },
    texts: ['MWNF'],
  },
  {
    component: AppSponsors,
    name: 'AppSponsors',
    tag: 'section',
    props: { sponsors: [{ name: 'Sponsor A' }] },
    texts: ['Sponsor A'],
  },
  {
    component: AppFooter,
    name: 'AppFooter',
    tag: 'footer',
    props: { text: '© MWNF' },
    texts: ['© MWNF'],
  },
]

describe.each(cases)('$name', ({ component, tag, props, texts }) => {
  it('renders nothing without props or slot', () => {
    const wrapper = mount(component, globalWithI18n())
    expect(wrapper.find(tag).exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('renders its element and content when props are set', () => {
    const wrapper = mount(component, { props, ...globalWithI18n() })
    expect(wrapper.find(tag).exists()).toBe(true)
    for (const text of texts) {
      expect(wrapper.text()).toContain(text)
    }
  })

  it('renders slot content', () => {
    const wrapper = mount(component, {
      slots: { default: '<span class="custom">Custom</span>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find(tag).exists()).toBe(true)
    expect(wrapper.find('.custom').text()).toBe('Custom')
  })
})

describe('AppContent', () => {
  it('renders nothing without a slot', () => {
    const wrapper = mount(AppContent, globalWithI18n())
    expect(wrapper.find('main').exists()).toBe(false)
  })

  it('wraps the default slot in <main id="mwnf-content">', () => {
    const wrapper = mount(AppContent, {
      slots: { default: '<p>Body</p>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('main#mwnf-content').text()).toBe('Body')
  })
})

describe('AppHeader', () => {
  it('renders the mark, the eyebrow, the logos and the links from props', () => {
    const wrapper = mount(AppHeader, {
      props: {
        home: 'https://www.example.org/',
        brand: 'MWNF',
        eyebrow: 'MWNF Galleries',
        title: 'Carpets',
        titleHref: '#/',
        logos: [{ image: 'unaoc.png', alt: 'UNAOC', href: 'https://unaoc.example.org' }],
        logosTitle: 'Co-organisers',
        links: [
          { label: 'Home', href: '#/' },
          { label: 'All galleries', href: 'https://galleries.example.org', external: true },
        ],
      },
      ...globalWithI18n(),
    })
    const home = wrapper.find('.mwnf-header__home')
    expect(home.attributes('href')).toBe('https://www.example.org/')
    expect(home.text()).toBe('MWNF')
    expect(wrapper.find('.mwnf-header__eyebrow').text()).toBe('MWNF Galleries')
    expect(wrapper.find('a.mwnf-header__lockup').attributes('href')).toBe('#/')
    expect(wrapper.find('.mwnf-header__logos-title').text()).toBe('Co-organisers')
    expect(wrapper.find('.mwnf-header__logo img').attributes('alt')).toBe('UNAOC')
    const links = wrapper.findAll('.mwnf-header__link')
    expect(links.map((l) => l.text())).toEqual(['Home', 'All galleries'])
    expect(links[1].attributes('target')).toBe('_blank')
    expect(links[1].attributes('rel')).toBe('noopener')
    expect(links[0].attributes('target')).toBeUndefined()
  })

  it('renders the mark from the brand slot', () => {
    const wrapper = mount(AppHeader, {
      props: { home: '#/' },
      slots: { brand: '<span class="mark">M</span>' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-header__home .mark').text()).toBe('M')
  })

  it('renders a search form and emits the term', async () => {
    const wrapper = mount(AppHeader, {
      props: { search: { placeholder: 'Search the collection', submitLabel: 'Search' } },
      ...globalWithI18n(),
    })
    const input = wrapper.find('.mwnf-header__search-input')
    expect(input.attributes('placeholder')).toBe('Search the collection')
    expect(wrapper.find('.mwnf-header__search-submit').attributes('aria-label')).toBe('Search')
    await input.setValue('bowl')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('search')).toEqual([['bowl']])
    expect(input.element.value).toBe('')
  })

  it('renders the languages as buttons when asked, and emits the choice', async () => {
    const wrapper = mount(AppHeader, {
      props: {
        title: 'Carpets',
        languages: [
          { code: 'en', label: 'English' },
          { code: 'ar', label: 'العربية' },
        ],
        language: 'en',
        languageStyle: 'buttons',
      },
      ...globalWithI18n(),
    })
    const buttons = wrapper.findAll('.mwnf-header__language')
    expect(buttons.map((b) => b.text())).toEqual(['English', 'العربية'])
    expect(buttons[0].classes()).toContain('mwnf-header__language--active')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:language')).toEqual([['ar']])
  })

  it('renders the languages as a select when asked', async () => {
    const wrapper = mount(AppHeader, {
      props: { title: 'Carpets', languages: ['en', 'fr'], language: 'en', languageStyle: 'select' },
      ...globalWithI18n(),
    })
    await wrapper.find('select').setValue('fr')
    expect(wrapper.emitted('update:language')).toEqual([['fr']])
  })

  it('renders no switcher unless a style is set', () => {
    const wrapper = mount(AppHeader, {
      props: { title: 'Carpets', languages: ['en', 'fr'], language: 'en' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-header__languages').exists()).toBe(false)
  })
})

describe('AppNavigation', () => {
  it('renders no switcher for a single language', () => {
    const wrapper = mount(AppNavigation, {
      props: { links: [{ label: 'Items', href: '#/items' }], languages: ['en'], language: 'en' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('select').exists()).toBe(false)
  })

  it('renders the switcher with the English label and emits update:language', async () => {
    const wrapper = mount(AppNavigation, {
      props: { languages: ['en', 'fr'], language: 'en' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-nav__language-label').text()).toBe('Language')
    await wrapper.find('select').setValue('fr')
    expect(wrapper.emitted('update:language')).toEqual([['fr']])
  })

  it('uses the label of the active language when the application has one', () => {
    const wrapper = mount(AppNavigation, {
      props: { languages: ['en', 'fr'], language: 'fr' },
      ...globalWithI18n({
        locale: 'fr',
        messages: { fr: { 'layout.language.label': 'Langue' } },
      }),
    })
    expect(wrapper.find('.mwnf-nav__language-label').text()).toBe('Langue')
  })

  it('falls back to English for a language that has not translated the label', () => {
    const wrapper = mount(AppNavigation, {
      props: { languages: ['en', 'fr'], language: 'fr' },
      ...globalWithI18n({ locale: 'fr', messages: { fr: {} } }),
    })
    expect(wrapper.find('.mwnf-nav__language-label').text()).toBe('Language')
  })

  it('leaves the switcher out when the website puts it in the header', () => {
    const wrapper = mount(AppNavigation, {
      props: { links: [{ label: 'Items', href: '#/items' }], languages: ['en', 'fr'], language: 'en', languageSwitcher: false },
      ...globalWithI18n(),
    })
    expect(wrapper.find('select').exists()).toBe(false)
  })

  it('marks the active link with aria-current', () => {
    const wrapper = mount(AppNavigation, {
      props: {
        links: [
          { label: 'Home', href: '#/' },
          { label: 'Items', href: '#/items', active: true },
        ],
      },
      ...globalWithI18n(),
    })
    const active = wrapper.find('.mwnf-nav__link--active')
    expect(active.text()).toBe('Items')
    expect(active.attributes('aria-current')).toBe('page')
  })

  it('opens an external link in a new window', () => {
    const wrapper = mount(AppNavigation, {
      props: { links: [{ label: 'My Collection', href: 'https://example.org/mycollection', external: true }] },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-nav__link').attributes('target')).toBe('_blank')
  })

  it('folds the links behind a menu button that closes on navigation', async () => {
    const wrapper = mount(AppNavigation, {
      props: { links: [{ label: 'Items', href: '#/items' }] },
      ...globalWithI18n(),
    })
    const toggle = wrapper.find('.mwnf-nav__toggle')
    expect(toggle.text()).toContain('Menu')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('nav').classes()).toContain('mwnf-nav--open')
    await wrapper.find('.mwnf-nav__link').trigger('click')
    expect(wrapper.find('nav').classes()).not.toContain('mwnf-nav--open')
  })

  it('renders a notice under the links', () => {
    const wrapper = mount(AppNavigation, {
      props: { notice: { title: 'Tip:', text: 'The database has been replaced.' } },
      ...globalWithI18n(),
    })
    const notice = wrapper.find('.mwnf-nav__notice')
    expect(notice.find('.mwnf-nav__notice-title').text()).toBe('Tip:')
    expect(notice.text()).toContain('The database has been replaced.')
  })
})

describe('AppBanner', () => {
  const caption = { name: 'Bowl', partner: 'A Museum', location: 'Cairo', country: 'Egypt' }

  it('renders the strip variant: eyebrow, title and entry over the image, caption from the record', () => {
    const wrapper = mount(AppBanner, {
      props: {
        variant: 'strip',
        image: 'banner.jpg',
        caption,
        captionLabel: 'Detail from',
        eyebrow: 'Discover MWNF Galleries',
        title: 'Carpets',
        enter: { label: '»', href: '#/collection', ariaLabel: 'Go to the collection' },
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('section').classes()).toContain('mwnf-banner--strip')
    expect(wrapper.find('.mwnf-banner__image').attributes('alt')).toBe('Detail from Bowl')
    expect(wrapper.find('.mwnf-banner__caption-name').text()).toBe('Detail from Bowl')
    expect(wrapper.find('.mwnf-banner__caption-rest').text()).toBe('A Museum, Cairo, Egypt')
    expect(wrapper.find('.mwnf-banner__eyebrow').text()).toBe('Discover MWNF Galleries')
    expect(wrapper.find('.mwnf-banner__title').text()).toContain('Carpets')
    const enter = wrapper.find('.mwnf-banner__enter')
    expect(enter.attributes('href')).toBe('#/collection')
    expect(enter.attributes('aria-label')).toBe('Go to the collection')
  })

  // An exhibition's caption: the item's own holding museum, never its partner,
  // and the province where legacy printed it ("Marija Bistrica, North-West
  // Croatia, Croatia" for a monument, which has no holding museum).
  it('composes the caption from holder, location, province and country', () => {
    const wrapper = mount(AppBanner, {
      props: { variant: 'strip', image: 'banner.jpg', caption: { name: 'Hellenbach Manor', holder: '', location: 'Marija Bistrica', province: 'North-West Croatia', country: 'Croatia' } },
      ...globalWithI18n(),
    })
    expect(wrapper.find('.mwnf-banner__caption-rest').text()).toBe('Marija Bistrica, North-West Croatia, Croatia')
  })
  it('renders the split variant with a Markdown headline through the shared pipeline', () => {
    const wrapper = mount(AppBanner, {
      props: {
        variant: 'split',
        image: 'banner.jpg',
        title: 'Water in Islam',
        subtitle: 'An exhibition',
        headline: 'A **thousand** years <b>of</b> water.',
        enter: { label: 'Enter', href: '#/about' },
        strapline: 'A MWNF virtual exhibition',
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('section').classes()).toContain('mwnf-banner--split')
    const headline = wrapper.find('.mwnf-banner__headline')
    expect(headline.html()).toContain('<strong>thousand</strong>')
    expect(headline.html()).toContain('&lt;b&gt;')
    expect(headline.html()).not.toContain('<b>')
    expect(wrapper.find('.mwnf-banner__subtitle').text()).toBe('An exhibition')
    expect(wrapper.find('.mwnf-banner__enter').text()).toBe('Enter')
    expect(wrapper.find('.mwnf-banner__strapline').text()).toBe('A MWNF virtual exhibition')
  })

  it('renders the section variant with the title it is given and a string caption', () => {
    const wrapper = mount(AppBanner, {
      props: { variant: 'section', image: 'banner.jpg', title: 'Collection', caption: 'Detail from a bowl' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('section').classes()).toContain('mwnf-banner--section')
    expect(wrapper.find('.mwnf-banner__title').text()).toBe('Collection')
    expect(wrapper.find('.mwnf-banner__caption-name').text()).toBe('Detail from a bowl')
    expect(wrapper.find('.mwnf-banner__image').attributes('alt')).toBe('Detail from a bowl')
  })

  it('falls back to a block when the image fails', async () => {
    const wrapper = mount(AppBanner, {
      props: { variant: 'section', image: 'missing.jpg', title: 'About' },
      ...globalWithI18n(),
    })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.mwnf-banner__fallback').exists()).toBe(true)
  })

  it('links the title when asked', () => {
    const wrapper = mount(AppBanner, {
      props: { variant: 'strip', title: 'Carpets', titleHref: '#/' },
      ...globalWithI18n(),
    })
    expect(wrapper.find('a.mwnf-banner__title').attributes('href')).toBe('#/')
  })
})

describe('AppHyperlinks tiles', () => {
  it('renders a title block beside tiles with descriptions', () => {
    const wrapper = mount(AppHyperlinks, {
      props: {
        variant: 'tiles',
        title: 'Water in Islam',
        titleHref: '#/',
        subtitle: 'An exhibition',
        links: [
          { label: 'About', description: 'Introduction', href: '#/about' },
          { label: 'Themes', description: 'Content at a glance', href: '#/themes' },
        ],
      },
      ...globalWithI18n(),
    })
    expect(wrapper.find('section').classes()).toContain('mwnf-hyperlinks--tiles')
    expect(wrapper.find('a.mwnf-hyperlinks__lockup').attributes('href')).toBe('#/')
    expect(wrapper.find('.mwnf-hyperlinks__subtitle').text()).toBe('An exhibition')
    const tiles = wrapper.findAll('.mwnf-hyperlinks__link')
    expect(tiles[1].find('.mwnf-hyperlinks__label').text()).toBe('Themes')
    expect(tiles[1].find('.mwnf-hyperlinks__description').text()).toBe('Content at a glance')
  })
})

describe('AppSponsors groups', () => {
  it('renders logos under group headings, and the flat list beside them', () => {
    const wrapper = mount(AppSponsors, {
      props: {
        sponsors: [{ name: 'Flat' }],
        groups: [
          { title: 'Under the patronage of', sponsors: [{ name: 'UNAOC', logo: 'unaoc.png', href: 'https://unaoc.example.org' }] },
          { title: 'Empty', sponsors: [] },
        ],
      },
      ...globalWithI18n(),
    })
    const groups = wrapper.findAll('.mwnf-sponsors__group')
    expect(groups).toHaveLength(1)
    expect(groups[0].find('.mwnf-sponsors__group-title').text()).toBe('Under the patronage of')
    const item = groups[0].find('a.mwnf-sponsors__item')
    expect(item.attributes('target')).toBe('_blank')
    expect(item.find('img').attributes('alt')).toBe('UNAOC')
    expect(wrapper.text()).toContain('Flat')
  })

  it('renders from groups alone', () => {
    const wrapper = mount(AppSponsors, {
      props: { groups: [{ title: 'Support', sponsors: [{ name: 'Someone' }] }] },
      ...globalWithI18n(),
    })
    expect(wrapper.find('section').exists()).toBe(true)
    expect(wrapper.text()).toContain('Someone')
  })
})

describe('AppFooter links', () => {
  it('renders the links beside the text', () => {
    const wrapper = mount(AppFooter, {
      props: {
        text: '© MWNF',
        links: [
          { label: 'About MWNF', href: 'https://example.org/about', external: true },
          { label: 'Credits', href: '#/credits' },
        ],
      },
      ...globalWithI18n(),
    })
    const links = wrapper.findAll('.mwnf-footer__link')
    expect(links.map((l) => l.text())).toEqual(['About MWNF', 'Credits'])
    expect(links[0].attributes('rel')).toBe('noopener')
    expect(wrapper.find('.mwnf-footer__text').text()).toBe('© MWNF')
  })
})
