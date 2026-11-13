// The portal footer legacy's books pages drew (FooterComponent.vue, read from
// www.museumwnf.org/api/footer): four columns of links and the bottom line.
import { mwnfLinks } from '@museumwnf/viewer-core'

const portal = mwnfLinks.portal

export const PUBLICATIONS_FOOTER = Object.freeze({
  columns: [
    {
      heading: 'publications.footer.more',
      links: [
        { label: 'publications.footer.chronology', href: `${portal}/about/chronology` },
        { label: 'publications.footer.support', href: `${portal}/about/support` },
        { label: 'publications.footer.volunteers', href: `${portal}/about/volunteers` },
        { label: 'publications.footer.honoraryCommittee', href: `${portal}/about/honorary-committee` },
        { label: 'publications.footer.commemoration', href: `${portal}/about/commemoration` },
      ],
    },
    {
      heading: 'publications.footer.archive',
      links: [
        { label: 'publications.footer.leagueOfArabStates', href: `${portal}/league-of-arab-states/` },
        { label: 'publications.footer.cafeteria', href: `${portal}/cafeteria/` },
      ],
    },
    {
      heading: 'publications.footer.others',
      links: [
        { label: 'publications.footer.pressLounge', href: `${portal}/about/press-lounge` },
        { label: 'publications.footer.languagePolicy', href: `${portal}/about/language-policy` },
      ],
    },
    {
      heading: 'publications.footer.contact',
      links: [
        { label: 'publications.footer.contactTeam', href: mwnfLinks.contact },
        { label: 'publications.footer.contactPartners', href: `${portal}/partner_list.php` },
      ],
    },
  ],
  bottom: [
    { label: 'publications.footer.contactLink', href: mwnfLinks.contact },
    { label: 'publications.footer.legalNotice', href: mwnfLinks.legalNotice },
    { label: 'publications.footer.credits', href: mwnfLinks.credits },
    { label: 'publications.footer.cookies', href: mwnfLinks.cookies },
  ],
})
