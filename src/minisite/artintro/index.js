// Discover Islamic Art's Artistic Introduction (gai/): one site of its own,
// inside the frame of Discover Islamic Art's virtual exhibitions. It shares
// with them how every mini-site reads its records (../exhibition.js), the
// frame (../Shell.vue), the zoom window, the caption rules and the tooltip;
// its home page and its pages are its own. Its stylesheet
// (minisite-artintro.css) is imported by ../index.js.

export { default as ArtIntroHome } from './Home.vue'
export { default as ArtIntroPage } from './Page.vue'
export { artintroNavigation, artintroRoutes, artintroSettings } from './routes.js'
