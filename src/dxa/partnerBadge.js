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

const EXHIBITION_WORDS = { partner: 'exhibition.partners.statusPartner', affiliate: 'exhibition.partners.statusAffiliate' }

// Legacy's institutions table: the only source of its `/institutions` list.
const INSTITUTIONS_TABLE = 'mwnf3:institutions:'

/**
 * An exhibition's badge (exhibitions-client PartnersPage.vue). Legacy listed
 * its `/partners` with their project's badge and its `/institutions` (the
 * monuments' institutions) as "Partner Institution (Monuments)" or "Affiliate
 * Institution (Monuments)". The package types a Sharing History partner as an
 * institution too, but legacy took it from `/partners`, so only a record of
 * legacy's institutions table takes the institution's badge.
 */
export function exhibitionPartnerBadge(partner) {
  if (partner?.type === 'institution' && String(partner.backward_compatibility ?? '').startsWith(INSTITUTIONS_TABLE)) {
    return {
      name: '',
      status: partner.level === 'partner' ? 'exhibition.partners.institutionPartner' : 'exhibition.partners.institutionAffiliate',
      tone: 'institution',
    }
  }
  return partnerBadge(partner, EXHIBITION_WORDS)
}
