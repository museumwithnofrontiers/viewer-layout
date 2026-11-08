import { describe, expect, it } from 'vitest'
import { exhibitionPartnerBadge } from '../../src/dxa/partnerBadge.js'

const sharingHistory = {
  name: 'Sharing History',
  backward_compatibility: 'mwnf3_sharing_history:sh_projects:awe',
  level: 'partner',
  exhibition: false,
}

describe('exhibitionPartnerBadge', () => {
  it("badges a Sharing History partner by its project, as legacy's /partners", () => {
    const partner = {
      type: 'institution',
      backward_compatibility: 'mwnf3_sharing_history:sh_partners:lb_01',
      level: null,
      own_project: sharingHistory,
    }
    expect(exhibitionPartnerBadge(partner)).toEqual({
      name: 'Sharing History',
      status: 'exhibition.partners.statusPartner',
      tone: 'awe',
    })
  })

  it("badges a monument's institution as legacy's /institutions", () => {
    const institution = (level) => ({
      type: 'institution',
      backward_compatibility: 'mwnf3:institutions:Mon81:ma',
      level,
      own_project: { name: 'Water in Islam', backward_compatibility: 'mwnf3:projects:EXWAT', level: 'partner', exhibition: true },
    })
    expect(exhibitionPartnerBadge(institution('partner'))).toEqual({
      name: '',
      status: 'exhibition.partners.institutionPartner',
      tone: 'institution',
    })
    expect(exhibitionPartnerBadge(institution(null)).status).toBe('exhibition.partners.institutionAffiliate')
  })

  it("badges a museum by its project's status", () => {
    const museum = {
      type: 'museum',
      backward_compatibility: 'mwnf3:museums:Mus01:ma',
      own_project: { name: 'Discover Islamic Art', backward_compatibility: 'mwnf3:projects:ISL', level: null, exhibition: false },
    }
    expect(exhibitionPartnerBadge(museum)).toEqual({
      name: 'Discover Islamic Art',
      status: 'exhibition.partners.statusAffiliate',
      tone: 'isl',
    })
  })
})
