import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      // Five entry points: the whole package; the content components on
      // their own, so a page that composes a list and a pagination does not
      // carry the shell with them; the composed views, which a website names
      // in its configuration; `SiteShell`, which — like the composed
      // views — reads `@museumwnf/viewer-core` itself and so cannot be part
      // of the package root (see `src/components/index.js`); and the DXA
      // family pages (epic inventory-app#1731) plus `standardRoutes`, which
      // read `@museumwnf/viewer-core/dxa` the same way. What they share is
      // emitted once.
      entry: {
        index: 'src/index.js',
        content: 'src/content/index.js',
        views: 'src/views/index.js',
        components: 'src/components/index.js',
        dxa: 'src/dxa/index.js',
      },
      formats: ['es'],
      fileName: (format, name) => `${name}.js`,
    },
    // One stylesheet for every entry: `style.css` stays the one file a
    // website imports, whichever entry point its code reaches.
    cssCodeSplit: false,
    rollupOptions: {
      // viewer-core is the application's, not ours: the layout reads the
      // active language, the records and the engine from the same instance
      // the application installed. `vue-router` is external for the same
      // reason — `SearchFormView` navigates on the application's own router
      // instance, the one every website already provides.
      external: ['vue', 'vue-router', '@museumwnf/viewer-core', '@museumwnf/viewer-core/i18n', '@museumwnf/viewer-core/dxa'],
      output: {
        assetFileNames: 'viewer-layout.[ext]',
      },
    },
  },
  resolve: {
    alias: {
      // The composed views read records through viewer-core, which reads the
      // data package through this alias; the tests stand a fixture package
      // behind it, as a website stands its own.
      '@inventory-data': fileURLToPath(new URL('./tests/fixtures/data-package', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    server: {
      deps: {
        // viewer-core ships .vue source and reads the alias above through
        // import.meta.glob; Node cannot do either unless Vitest processes
        // the package instead of externalizing it.
        inline: ['@museumwnf/viewer-core'],
      },
    },
  },
})
