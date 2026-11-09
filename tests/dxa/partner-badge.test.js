import { describe, expect, it } from 'vitest'
import { exhibitionPartnerBadge } from '../../src/dxa/partnerBadge.js'

const sharingHistory = (level) => ({
  name: 'Sharing History',
  backward_compatibility: 'mwnf3_sharing_history:sh_projects:awe',
  level,
  exhibition: false,
})

describe('exhibitionPartnerBadge', () => {
  it("badges a Sharing History partner by its project and its role there, as legacy's /partners", () => {
    const partner = (level) => ({
      type: 'institution',
      backward_compatibility: 'mwnf3_sharing_history:sh_partners:lb_01',
      level: null,
      own_project: sharingHistory(level),
    })
    expect(exhibitionPartnerBadge(partner('partner'))).toEqual({
      name: 'Sharing History',
      status: 'exhibition.partners.statusPartner',
      tone: 'awe',
    })
    expect(exhibitionPartnerBadge(partner('associated_partner')).status).toBe('exhibition.partners.statusAssociated')
    expect(exhibitionPartnerBadge(partner('minor_contributor')).status).toBe('exhibition.partners.statusFurtherAssociated')
  })

  it("badges a monument's institution by its own project, with its role in the exhibition's project", () => {
    const institution = (level, ownProject) => ({
      type: 'institution',
      backward_compatibility: 'mwnf3:institutions:Mon01:jo',
      level,
      own_project: ownProject,
    })
    const islamicArt = { name: 'Discover Islamic Art', backward_compatibility: 'mwnf3:projects:ISL', level: 'partner', exhibition: false }
    // The Hijaz Railway's jo/Mon01: the project's name alone, whatever its
    // role in Discover Islamic Art itself.
    expect(exhibitionPartnerBadge(institution(null, islamicArt))).toEqual({
      name: 'Discover Islamic Art',
      status: null,
      tone: 'isl',
    })
    expect(exhibitionPartnerBadge(institution('associated_partner', islamicArt)).status).toBe('exhibition.partners.statusAssociated')
    // sy/Mon91, an institution of the exhibition itself.
    expect(exhibitionPartnerBadge(institution(null, { name: 'The Hijaz Railway', backward_compatibility: 'mwnf3:projects:GalEx5', level: null, exhibition: true }))).toEqual({
      name: 'The Hijaz Railway',
      status: 'exhibition.partners.statusPartner',
      tone: 'exh',
    })
    expect(exhibitionPartnerBadge(institution('partner', null))).toBeNull()
  })

  it("badges a museum by its project, as a partner of an exhibition or by its role", () => {
    const museum = (ownProject) => ({ type: 'museum', backward_compatibility: 'mwnf3:museums:Mus01:ma', own_project: ownProject })
    expect(exhibitionPartnerBadge(museum({ name: 'The Hijaz Railway', backward_compatibility: 'mwnf3:projects:GalEx5', level: null, exhibition: true }))).toEqual({
      name: 'The Hijaz Railway',
      status: 'exhibition.partners.statusPartner',
      tone: 'exh',
    })
    // A museum with no role in its project keeps the project's name alone.
    expect(exhibitionPartnerBadge(museum({ name: 'Discover Islamic Art', backward_compatibility: 'mwnf3:projects:ISL', level: null, exhibition: false }))).toEqual({
      name: 'Discover Islamic Art',
      status: null,
      tone: 'isl',
    })
    expect(exhibitionPartnerBadge(museum(null))).toBeNull()
  })
})
