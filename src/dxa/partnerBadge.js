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

// A partner's role in its project, as legacy's databases record it: the
// project partners, the associated ones and the further associated ones
// (collection_partner.level).
const EXHIBITION_STATUS = {
  partner: 'exhibition.partners.statusPartner',
  associated_partner: 'exhibition.partners.statusAssociated',
  minor_contributor: 'exhibition.partners.statusFurtherAssociated',
}

// Legacy's mwnf3 institutions table, the monuments' institutions.
const INSTITUTIONS_TABLE = 'mwnf3:institutions:'

/**
 * An exhibition's badge, as legacy's client draws it since MWNF-621
 * (exhibitions-client PartnersPage.vue, `statusLabel`): every owner comes
 * from one `/partners` list, and carries its own project's name, on that
 * project's colour, then its role: "Partner" for any partner of an
 * exhibition, else "Partner", "Associated", "Further associated" or no role
 * at all. A museum or a Sharing History partner has its role in its own
 * project; an mwnf3 institution its role in the exhibition's own project
 * (the package's `level`, which is what legacy's institutions query asked),
 * so a Discover Islamic Art institution prints the project's name alone.
 * `status` is null when there is no role to print.
 */
export function exhibitionPartnerBadge(partner) {
  const project = partner?.own_project
  if (!project?.name) return null
  const code = String(project.backward_compatibility ?? '').split(':').pop().toUpperCase()
  const level = String(partner?.backward_compatibility ?? '').startsWith(INSTITUTIONS_TABLE) ? partner.level : project.level
  return {
    name: project.name,
    status: project.exhibition ? EXHIBITION_STATUS.partner : (EXHIBITION_STATUS[level] ?? null),
    tone: project.exhibition ? 'exh' : (PROJECT_TONES[code] ?? ''),
  }
}
