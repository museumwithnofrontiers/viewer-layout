// The composed views: a landing page, a results page and a record page made
// of the content components on viewer-core's composables, driven by a spec
// the website declares. A website names them in config.views (or on its
// own routes) and writes no page; one whose page is not this shape writes
// its own component, on the same components — the escape hatch stays open.
//
// They live here rather than in viewer-core because they are made of this
// package's components, and viewer-core does not depend on the layout.
import '../styles/content.css'

export { default as HomeView } from './HomeView.vue'
export { default as CatalogueResultsView } from './CatalogueResultsView.vue'
export { default as RecordView } from './RecordView.vue'
export { default as EssayView } from './EssayView.vue'
export { default as LinkListView } from './LinkListView.vue'
export { default as PartnerListView } from './PartnerListView.vue'
export { default as TextPageView } from './TextPageView.vue'
export { default as SearchFormView } from './SearchFormView.vue'
export { default as TimelineResultsView } from './TimelineResultsView.vue'
