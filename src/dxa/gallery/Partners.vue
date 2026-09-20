<script setup>
import { RouterLink } from 'vue-router'
import { I18nText } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import PartnerListView from '../../views/PartnerListView.vue'
import { partnerObjectsRoute, labelOf, partnerList } from './data.js'

// The gallery partners list (epic #1731, from carpets/amulets — byte-
// identical), on the platform's composed partner-list view: the grouping,
// the sort toggle and the query are the view's, from `partnerList`
// (dxa/gallery/data.js). What fills the one slot the default row cannot:
// legacy's "Read more"/"View objects" pair and the "no objects" line a
// partner holding none still gets (decision MWNF-384, recorded in
// `@museumwnf/viewer-core/dxa`'s `useGalleryPartner`).
</script>

<template>
  <div class="mwnf-dxa-partners">
    <PartnerListView :spec="partnerList">
      <template #before>
        <BackLink />
        <I18nText id="mwnf-dxa-partners-intro" class="mwnf-prose" dir="auto" keypath="gallery.partners.intro" />
      </template>

      <template #row="{ partner, row }">
        <div class="mwnf-dxa-partner-text">
          <div class="mwnf-dxa-partner-name">
            <RouterLink :to="row.route">
              {{ labelOf('partners', partner.id) }}<span v-if="row.city">, {{ row.city }}</span>
            </RouterLink>
          </div>
          <div class="mwnf-dxa-partner-meta" v-if="partner.item_count">
            {{ partner.item_count }} {{ $t('partner.item.objectsInSite') }}
          </div>
          <div class="mwnf-dxa-partner-meta mwnf-dxa-partner-meta--empty" v-else>
            {{ $t('gallery.partner.noObjectsInGallery') }}
          </div>
          <div class="mwnf-dxa-partner-links">
            <RouterLink :to="row.route">{{ $t('gallery.action.readMore') }}</RouterLink>
            <template v-if="partner.item_count">
              <span class="mwnf-dxa-partner-link-divider">|</span>
              <RouterLink :to="partnerObjectsRoute(partner)">{{ $t('gallery.action.viewObjects') }}</RouterLink>
            </template>
          </div>
        </div>
        <div class="mwnf-dxa-partner-logo" v-if="row.logo">
          <img :src="row.logo" :alt="labelOf('partners', partner.id)" loading="lazy" />
        </div>
      </template>
    </PartnerListView>
  </div>
</template>
