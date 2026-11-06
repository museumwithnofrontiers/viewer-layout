// The badge legacy's partner list drew under each partner's name
// (dxa-client's PartnersPage.vue): the partner's own project, then its status
// there — "Partner" for a project partner or any partner of an exhibition,
// "Affiliate" otherwise — on the project's colour. The package carries the
// project as `own_project` (inventory-app#2476); a partner without one gets no
// badge.

// Legacy's `backgroundColor()`: the colour by the project's legacy code. An
// exhibition's projects all share one; a project it doesn't name has none.
const PROJECT_TONES = {
  DGA: 'dga',
  ISL: 'isl',
  EPM: 'isl',
  AWE: 'awe',
  BAR: 'dba',
  GALLERIES: 'galleries',
  DCA: 'dca',
}

const GALLERY_WORDS = { partner: 'gallery.partners.statusPartner', affiliate: 'gallery.partners.statusAffiliate' }

/**
 * `{ name, status, tone }` for `partner`, or null: `status` is the entry name
 * of the status word, `tone` the colour's class suffix ('' for none). A
 * family passes its own entry names for the two words (`words`).
 */
export function partnerBadge(partner, words = GALLERY_WORDS) {
  const project = partner?.own_project
  if (!project?.name) return null
  const code = String(project.backward_compatibility ?? '').split(':').pop().toUpperCase()
  const tone = project.exhibition ? 'exh' : (PROJECT_TONES[code] ?? '')
  const isPartner = project.level === 'partner' || Boolean(project.exhibition)
  return {
    name: project.name,
    status: isPartner ? words.partner : words.affiliate,
    tone,
  }
}
