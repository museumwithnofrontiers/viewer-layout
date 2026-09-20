<script setup>
import { RouterLink } from 'vue-router'
import { I18nText } from '@museumwnf/viewer-core'
import PartnerListView from '../../views/PartnerListView.vue'
import BackLink from '../../content/BackLink.vue'
import { partnerObjectsRoute, partnerListSpec } from './data.js'

// The partners list (epic #1731, from colours/water-in-islam — byte-
// identical), on the platform's composed list view: the country grouping
// and the A–Z / Z–A toggle are `PartnerListView`'s, driven by
// `partnerListSpec` (dxa/exhibition/data.js). What fills the `#row` slot —
// the "N object(s)" / "no objects" meta line and the Read More / View
// Objects links legacy printed under every name, from the MWNF-384 branch
// that lists a partner whether or not it holds anything.
</script>

<template>
  <div class="mwnf-dxa-partners">
    <PartnerListView :spec="partnerListSpec">
      <template #before>
        <div class="mwnf-dxa-partners-options">
          <BackLink />
        </div>
        <!-- A shared entry, not this exhibition's own: the only thing that
             made the old `txtPartners` exhibition-specific was an absolute
             URL to its own Themes page, which is `#/themes` now. -->
        <I18nText id="mwnf-dxa-partners-intro" class="mwnf-prose" dir="auto" keypath="exhibition.partners.intro" />
      </template>

      <template #row="{ partner, row }">
        <div class="mwnf-dxa-partner-text">
          <div class="mwnf-dxa-partner-name">
            <RouterLink :to="row.route">
              <span v-html="row.name"></span><span v-if="row.city">, {{ row.city }}</span>
            </RouterLink>
          </div>
          <div class="mwnf-dxa-partner-meta" v-if="partner.item_count">
            {{ partner.item_count }} {{ $t('partner.item.objectsInSite') }}
          </div>
          <div class="mwnf-dxa-partner-meta mwnf-dxa-partner-meta--empty" v-else>
            {{ $t('exhibition.partner.noObjectsInExhibition') }}
          </div>
          <div class="mwnf-dxa-partner-links">
            <RouterLink :to="row.route">{{ $t('exhibition.action.readMore') }}</RouterLink>
            <template v-if="partner.item_count">
              <span class="mwnf-dxa-partner-link-divider">|</span>
              <RouterLink :to="partnerObjectsRoute(partner)">{{ $t('exhibition.action.viewObjects') }}</RouterLink>
            </template>
          </div>
        </div>
        <div class="mwnf-dxa-partner-logo" v-if="row.logo">
          <img :src="row.logo" :alt="row.name" loading="lazy" />
        </div>
      </template>
    </PartnerListView>
  </div>
</template>
