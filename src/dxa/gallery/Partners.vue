<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import SmartLink from '../../content/SmartLink.vue'
import PartnerListView from '../../views/PartnerListView.vue'
import { partnerBadge } from '../partnerBadge.js'
import { partnerList, partnerObjectsRoute } from './data.js'

// The gallery partners list, drawn as legacy's (dxa-client's
// PartnersPage.vue, inventory-app#2423): a white page, the Back button and
// the country-order toggle on one line, then a centred column of country
// bands. Each partner is its name and city, its project badge, Read more ·
// View objects, and its logo on the right; a partner holding nothing here
// (decision MWNF-384) keeps its row without View objects. Legacy printed no
// object count. The grouping and the order are PartnerListView's, from
// `partnerList` (dxa/gallery/data.js); legacy sorted a partner listed once
// per project by the project's name.
const spec = {
  ...partnerList,
  objectsRoute: partnerObjectsRoute,
  orderToggle: false,
  tiebreak: (partner) => partner.own_project?.name ?? '',
}
</script>

<template>
  <div class="mwnf-dxa-partners mwnf-dxa-gallery-partners">
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
        <I18nText id="mwnf-dxa-partners-intro" class="mwnf-dxa-gallery-partners__intro" dir="auto" keypath="gallery.partners.intro" />
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
              v-if="partnerBadge(partner)"
              class="mwnf-dxa-partner-badge"
              :class="partnerBadge(partner).tone && `mwnf-dxa-partner-badge--${partnerBadge(partner).tone}`"
            >{{ partnerBadge(partner).name }} <span class="mwnf-dxa-partner-badge__status">{{ t(partnerBadge(partner).status) }}</span></div>
            <div class="mwnf-dxa-gallery-partners__links">
              <SmartLink :to="view.route">{{ t('partner.action.readMore') }}</SmartLink>
              <template v-if="partner.item_count > 0 && view.objectsRoute">
                <span class="mwnf-dxa-gallery-partners__divider" aria-hidden="true">|</span>
                <SmartLink :to="view.objectsRoute">{{ t('partner.action.viewObjects') }}</SmartLink>
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
