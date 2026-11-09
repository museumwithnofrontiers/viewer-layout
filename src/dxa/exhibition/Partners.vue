<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import SmartLink from '../../content/SmartLink.vue'
import PartnerListView from '../../views/PartnerListView.vue'
import { exhibitionPartnerBadge as badge } from '../partnerBadge.js'
import { partnerObjectsRoute, partnerListSpec } from './data.js'

// An exhibition's partners list as legacy's (exhibitions-client
// PartnersPage.vue, inventory-app#2379): the galleries' page (Back and the
// country-order toggle on one line, the introduction and the countries in a
// centred column, each partner its name and city, its project badge, Read
// more · View Items, and its logo) in the exhibition's colours and sizes. The
// badge is `exhibitionPartnerBadge`'s (dxa/partnerBadge.js); a record of
// legacy's mwnf3 institutions takes the institution's pages, every other
// owner the partner's (MWNF-621). A partner holding nothing here (MWNF-384)
// keeps its row without View Items. The
// grouping and the order are PartnerListView's, from `partnerListSpec`
// (dxa/exhibition/data.js); legacy sorted a partner listed once per project
// by the project's name. Legacy wrote the words here in English on every
// language's page; they are the exhibition's own entries.
const spec = {
  ...partnerListSpec,
  objectsRoute: partnerObjectsRoute,
  orderToggle: false,
  tiebreak: (partner) => partner.own_project?.name ?? '',
}
</script>

<template>
  <div class="mwnf-dxa-partners mwnf-dxa-gallery-partners mwnf-dxa-exhibition-partners">
    <PartnerListView :spec="spec">
      <template #before="{ t, orderDir, toggleOrder }">
        <div class="mwnf-dxa-gallery-partners__options">
          <BackLink />
          <div class="mwnf-dxa-gallery-partners__order">
            <button type="button" @click="toggleOrder">
              {{ t(orderDir === 'asc' ? 'partner.list.sortDescending' : 'partner.list.sortAscending') }}
            </button>
          </div>
        </div>
        <I18nText id="mwnf-dxa-partners-intro" class="mwnf-dxa-gallery-partners__intro" dir="auto" keypath="exhibition.partners.intro" />
      </template>

      <template #group-heading="{ group }">
        <div class="mwnf-dxa-gallery-partners__country">{{ group.label }}</div>
      </template>

      <template #row="{ partner, view, t }">
        <div class="mwnf-dxa-gallery-partners__partner">
          <div class="mwnf-dxa-gallery-partners__text">
            <SmartLink class="mwnf-dxa-gallery-partners__name" :to="view.route">
              <span v-html="view.name"></span><span v-if="view.city" class="mwnf-dxa-gallery-partners__city">, {{ view.city }}</span>
            </SmartLink>
            <div
              v-if="badge(partner)"
              class="mwnf-dxa-partner-badge"
              :class="badge(partner).tone && `mwnf-dxa-partner-badge--${badge(partner).tone}`"
            ><template v-if="badge(partner).name">{{ badge(partner).name + ' ' }}</template><span v-if="badge(partner).status" class="mwnf-dxa-partner-badge__status">{{ t(badge(partner).status) }}</span></div>
            <div class="mwnf-dxa-gallery-partners__links">
              <SmartLink :to="view.route">{{ t('partner.action.readMore') }}</SmartLink>
              <template v-if="partner.item_count > 0 && view.objectsRoute">
                <span class="mwnf-dxa-gallery-partners__divider" aria-hidden="true">|</span>
                <SmartLink :to="view.objectsRoute">{{ t('exhibition.partners.viewItems') }}</SmartLink>
              </template>
            </div>
          </div>
          <div class="mwnf-dxa-gallery-partners__logo">
            <img v-if="view.logos?.[0]" :src="view.logos[0].url" :alt="view.plainName" loading="lazy" />
          </div>
        </div>
      </template>
    </PartnerListView>
  </div>
</template>
