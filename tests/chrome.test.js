import { describe, expect, it } from 'vitest'
import { chromeAsset, chromePicture, chromeSource } from '../src/index.js'

// A site's chrome files, as Vite's `import.meta.glob` over theme/assets/
// hands them over (README, "Site chrome").
const chrome = {
  '../theme/assets/logo.png': '/carpets/assets/logo-1a2b.png',
  '../theme/assets/dia.jpg': '/carpets/assets/dia-3c4d.jpg',
  '../theme/assets/chrome/thematic_gallery/thg_galleries/9/banner.jpg': '/carpets/assets/banner-5e6f.jpg',
}

describe('the chrome helpers', () => {
  it('find a file by its path under theme/assets/, whatever directory the glob ran from', () => {
    expect(chromeAsset(chrome, 'logo.png')).toBe('/carpets/assets/logo-1a2b.png')
    expect(chromeAsset({ '/theme/assets/logo.png': 'x.png' }, 'logo.png')).toBe('x.png')
    expect(chromeAsset({ '..\\theme\\assets\\logo.png': 'y.png' }, 'logo.png')).toBe('y.png')
    expect(chromeAsset(chrome, 'sh.jpg')).toBeNull()
    expect(chromeAsset(undefined, 'logo.png')).toBeNull()
  })

  it('find a package picture under chrome/ by its legacy path', () => {
    expect(chromePicture(chrome, 'thematic_gallery/thg_galleries/9/banner.jpg')).toBe('/carpets/assets/banner-5e6f.jpg')
    expect(chromePicture(chrome, '/thematic_gallery/thg_galleries/9/banner.jpg')).toBe('/carpets/assets/banner-5e6f.jpg')
    expect(chromePicture(chrome, 'thematic_gallery/thg_galleries/10/banner.jpg')).toBeNull()
    expect(chromePicture(chrome, null)).toBeNull()
  })

  it('take a URL as it is and anything else as a chrome key', () => {
    expect(chromeSource(chrome, 'https://example.org/logo.png')).toBe('https://example.org/logo.png')
    expect(chromeSource(chrome, '/assets/logo.png')).toBe('/assets/logo.png')
    expect(chromeSource(chrome, 'data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
    expect(chromeSource(chrome, 'dia.jpg')).toBe('/carpets/assets/dia-3c4d.jpg')
    expect(chromeSource(chrome, 'logo_black.png')).toBeNull()
    expect(chromeSource(chrome, '')).toBeNull()
  })
})
