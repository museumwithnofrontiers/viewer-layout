import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { loadEntities, useDataPackage, useSiteConfig } from '@museumwnf/viewer-core'
import { createI18n } from '@museumwnf/viewer-core/i18n'
import GalleryShell from '../../src/dxa/gallery/Shell.vue'
import GalleryHome from '../../src/dxa/gallery/Home.vue'
import ExhibitionShell from '../../src/dxa/exhibition/Shell.vue'
import { gallery } from '../../src/dxa/gallery/data.js'
import { exhibition } from '../../src/dxa/exhibition/data.js'
import { layoutTexts } from '../helpers.js'
import { settle, sharedDxaTexts } from './helpers.js'

// The two family shells and the gallery home against the fixture package
// (inventory-app#2233): the title legacy read from its build settings, the
// site's own chrome files, the hub's overrides, an exhibition's home image.

const texts = {
  ...layoutTexts,
  ...sharedDxaTexts,
  'core.project.galleries': 'MWNF Galleries',
  'gallery.banner.discoverGalleries': 'Discover MWNF Galleries',
  'gallery.home.logosLabel': 'Set up on the occasion of',
  'glass.home.iyogLogo': 'United Nations International Year of Glass',
  'hub.banner.welcome': 'Welcome to',
}

const chrome = {
  '../theme/assets/logo.png': '/site/assets/logo.png',
  '../theme/assets/dia.jpg': '/site/assets/dia.jpg',
  '../theme/assets/chrome/thg/banner.jpg': '/site/assets/banner.jpg',
  '../theme/assets/chrome/thg/home_image.jpg': '/site/assets/home_image.jpg',
  '../theme/assets/chrome/thg/logos/1.jpg': '/site/assets/iyog.jpg',
  '../theme/assets/chrome/thg/logo/42/1.jpg': '/site/assets/unaoc.jpg',
  '../theme/assets/chrome/upload/a.jpg': '/site/assets/popup-a.jpg',
}

// The shells read the site's config through `useSiteConfig()`, which hands
// out one object outside a viewer: each test sets the keys it needs on it.
// `banner` is the variant every gallery config sets (galleryConfig).
const siteConfig = useSiteConfig()
const SET = ['chrome', 'brand', 'galleryShell', 'homeLogos', 'links', 'banner', 'sponsorLogos', 'logos', 'media', 'navigation']
beforeEach(() => { siteConfig.banner = { variant: ({ section }) => (section === 'home' ? 'strip' : 'section') } })
afterEach(() => { for (const key of SET) delete siteConfig[key] })

async function mountChrome(component, { section = 'collection', slots = { default: '<p>page</p>' } } = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<p>home</p>' }, meta: { section: 'home' } },
      { path: '/collection', name: 'collection', component: { template: '<p>collection</p>' }, meta: { section: 'collection' } },
    ],
  })
  await router.push(section === 'home' ? '/' : '/collection')
  await router.isReady()
  const i18n = createI18n({ locale: 'en', messages: { en: texts } })
  const wrapper = mount(component, { slots, global: { plugins: [i18n, router] } })
  await settle(() => true, 1)
  return wrapper
}

beforeAll(async () => {
  await loadEntities(['gallery', 'exhibition', 'items', 'partners', 'countries'])
  await useDataPackage().loadTranslations('items', 'en')
})

describe('GalleryShell', () => {
  it("titles an inner page with the gallery's own project, legacy's 'Discover … Art', under 'MWNF Galleries'", async () => {
    gallery.value.project_id = 'p-isl'
    try {
      const wrapper = await mountChrome(GalleryShell)
      expect(wrapper.find('.mwnf-header__eyebrow').text()).toBe('MWNF Galleries')
      expect(wrapper.find('.mwnf-header__title').text()).toBe('Discover Islamic Art (package)')
    } finally {
      delete gallery.value.project_id
    }
  })

  it("falls back to the gallery's name when the gallery is no project of its own", async () => {
    const wrapper = await mountChrome(GalleryShell)
    expect(wrapper.find('.mwnf-header__title').text()).toBe('Fixture Museum')
  })

  it('puts "Discover MWNF Galleries" over the title on the home banner, with no title in the header', async () => {
    siteConfig.chrome = chrome
    gallery.value.banner_image_path = 'thg/banner.jpg'
    try {
      const wrapper = await mountChrome(GalleryShell, { section: 'home' })
      expect(wrapper.find('.mwnf-banner__eyebrow').text()).toBe('Discover MWNF Galleries')
      expect(wrapper.find('.mwnf-banner__title').text()).toContain('Fixture Museum')
      expect(wrapper.find('.mwnf-banner__image').attributes('src')).toBe('/site/assets/banner.jpg')
      expect(wrapper.find('.mwnf-header__title').exists()).toBe(false)
    } finally {
      delete gallery.value.banner_image_path
    }
  })

  it("draws the site's logo file, and the text mark without one", async () => {
    siteConfig.chrome = chrome
    siteConfig.brand = { logo: 'logo.png', alt: 'MWNF Logo' }
    const withLogo = await mountChrome(GalleryShell)
    expect(withLogo.find('img.mwnf-header__brand-logo').attributes('src')).toBe('/site/assets/logo.png')
    expect(withLogo.find('.mwnf-dxa-logo-mark').exists()).toBe(false)

    siteConfig.chrome = {}
    const without = await mountChrome(GalleryShell)
    expect(without.find('img.mwnf-header__brand-logo').exists()).toBe(false)
    expect(without.find('.mwnf-dxa-logo-mark').text()).toBe('MWNF')
  })

  it("takes a site's own chrome from config.galleryShell, over the package (the galleries hub)", async () => {
    siteConfig.chrome = chrome
    siteConfig.galleryShell = {
      bannerEyebrow: 'hub.banner.welcome',
      bannerTitle: 'MWNF Galleries',
      bannerImage: 'chrome/thg/home_image.jpg',
      bannerCaption: { name: 'Lamp', partner: 'Museum', location: 'Cairo', country: 'Egypt' },
      headerTitle: 'Partners',
    }
    const home = await mountChrome(GalleryShell, { section: 'home' })
    expect(home.find('.mwnf-banner__eyebrow').text()).toBe('Welcome to')
    expect(home.find('.mwnf-banner__title').text()).toContain('MWNF Galleries')
    expect(home.find('.mwnf-banner__image').attributes('src')).toBe('/site/assets/home_image.jpg')
    expect(home.find('.mwnf-banner__caption').text()).toContain('Lamp')
    const inner = await mountChrome(GalleryShell)
    expect(inner.find('.mwnf-header__title').text()).toBe('Partners')
  })
})

describe('GalleryShell, as legacy', () => {
  it("offers no site-language switcher: the record's own bar is the only one", async () => {
    siteConfig.navigation = { languages: [{ code: 'en', label: 'English' }, { code: 'fr', label: 'Français' }] }
    const wrapper = await mountChrome(GalleryShell)
    expect(wrapper.find('.mwnf-header__languages').exists()).toBe(false)
    expect(wrapper.find('.mwnf-nav__languages, .mwnf-nav select').exists()).toBe(false)
  })

  it('reads an empty galleryShell line as no line, keeps the header title off the home page, and drops the tip on request', async () => {
    siteConfig.galleryShell = { bannerEyebrow: '', headerEyebrow: '', headerTitle: 'Partners', notice: false }
    const home = await mountChrome(GalleryShell, { section: 'home' })
    expect(home.find('.mwnf-banner__eyebrow').exists()).toBe(false)
    expect(home.find('.mwnf-header__title').exists()).toBe(false)
    expect(home.find('.mwnf-nav__notice').exists()).toBe(false)
    const inner = await mountChrome(GalleryShell)
    expect(inner.find('.mwnf-header__eyebrow').exists()).toBe(false)
    expect(inner.find('.mwnf-header__title').text()).toBe('Partners')
  })
})

describe('GalleryHome', () => {
  it('names the other virtual museums over their picture banners when the site supplies them', async () => {
    siteConfig.chrome = chrome
    siteConfig.links = { islamicArt: 'https://islamicart.example', baroqueArt: 'https://baroqueart.example', sharingHistory: 'https://sh.example', galleries: 'https://galleries.example' }
    const wrapper = await mountChrome(GalleryHome, { section: 'home', slots: {} })
    const museums = wrapper.findAll('.mwnf-sibling-galleries__museum')
    expect(museums[0].find('.mwnf-sibling-galleries__museum-image--picture img').attributes('src')).toBe('/site/assets/dia.jpg')
    // No dba.jpg here: Discover Baroque Art keeps the flat block.
    expect(museums[1].find('.mwnf-sibling-galleries__museum-image--picture').exists()).toBe(false)
  })

  it("draws a site's home logos strip, and none without it", async () => {
    siteConfig.chrome = chrome
    siteConfig.homeLogos = [{ image: 'thg/logos/1.jpg', href: 'https://iyog2022.org/', alt: 'glass.home.iyogLogo' }]
    const wrapper = await mountChrome(GalleryHome, { section: 'home', slots: {} })
    expect(wrapper.find('.mwnf-dxa-home-logos__label').text()).toBe('Set up on the occasion of')
    const logo = wrapper.find('.mwnf-dxa-home-logos__logo')
    expect(logo.attributes('href')).toBe('https://iyog2022.org/')
    expect(logo.find('img').attributes('src')).toBe('/site/assets/iyog.jpg')
    expect(logo.find('img').attributes('alt')).toBe('United Nations International Year of Glass')

    delete siteConfig.homeLogos
    const without = await mountChrome(GalleryHome, { section: 'home', slots: {} })
    expect(without.find('.mwnf-dxa-home-logos').exists()).toBe(false)
  })
})

describe('ExhibitionShell', () => {
  it("offers legacy's header select, the codes in capitals", async () => {
    siteConfig.navigation = { languages: [{ code: 'en', label: 'EN' }, { code: 'fr', label: 'FR' }] }
    const wrapper = await mountChrome(ExhibitionShell)
    expect(wrapper.findAll('.mwnf-header__language-select option').map((o) => o.text())).toEqual(['EN', 'FR'])
  })

  it("draws the sponsors' logos from the site's files, never the inventory's image_url", async () => {
    siteConfig.chrome = chrome
    siteConfig.logos = { sponsorGroups: (logos) => [{ title: 'Support', sponsors: logos.map((l) => ({ name: l.alt, href: l.href, logo: l.image })) }] }
    exhibition.value.logos = [
      { image_url: 'https://inventory.example/pub/1.jpg', legacy_path: 'thg/logo/42/1.jpg', labels: { en: 'UNAOC' }, url: 'https://www.unaoc.org/', category_id: 1 },
    ]
    try {
      const fromPackage = await mountChrome(ExhibitionShell)
      expect(fromPackage.find('.mwnf-sponsors img').attributes('src')).toBe('/site/assets/unaoc.jpg')
      expect(fromPackage.html()).not.toContain('inventory.example/pub')

      siteConfig.sponsorLogos = [{ image: 'dia.jpg', alt: 'Own sponsor', href: 'https://own.example' }]
      const own = await mountChrome(ExhibitionShell)
      expect(own.findAll('.mwnf-sponsors img').map((i) => i.attributes('src'))).toEqual(['/site/assets/dia.jpg'])
    } finally {
      delete exhibition.value.logos
    }
  })

  it("draws the popup notice's pictures from the site's files when it keeps them", async () => {
    siteConfig.chrome = chrome
    siteConfig.media = { legacyHost: 'https://images.example' }
    exhibition.value.popup_logos = { en: '![](https://images.example/full/upload/a.jpg) ![](https://images.example/full/upload/b.jpg)' }
    exhibition.value.popup_logo_show = true
    try {
      const wrapper = await mountChrome(ExhibitionShell)
      const sources = wrapper.findAll('.mwnf-popup-logo img').map((i) => i.attributes('src'))
      expect(sources).toEqual(['/site/assets/popup-a.jpg', 'https://images.example/full/upload/b.jpg'])
    } finally {
      delete exhibition.value.popup_logos
      delete exhibition.value.popup_logo_show
    }
  })

  it("shows legacy's composed home image on the home page, and the banner on the others", async () => {
    siteConfig.chrome = chrome
    exhibition.value.banner_image_path = 'thg/banner.jpg'
    exhibition.value.homepage_image_path = 'thg/home_image.jpg'
    try {
      const home = await mountChrome(ExhibitionShell, { section: 'home' })
      expect(home.find('.mwnf-banner__image').attributes('src')).toBe('/site/assets/home_image.jpg')
      const inner = await mountChrome(ExhibitionShell)
      expect(inner.find('.mwnf-banner__image').attributes('src')).toBe('/site/assets/banner.jpg')
    } finally {
      delete exhibition.value.banner_image_path
      delete exhibition.value.homepage_image_path
    }
  })
})
