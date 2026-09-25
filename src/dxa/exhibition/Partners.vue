<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import PartnerListView from '../../views/PartnerListView.vue'
import BackLink from '../../content/BackLink.vue'
import { partnerObjectsRoute, partnerListSpec } from './data.js'

// The partners list (epic #1731, from colours/water-in-islam), on the
// platform's composed list view: the country grouping and the A–Z / Z–A
// toggle are `PartnerListView`'s, driven by `partnerListSpec`
// (dxa/exhibition/data.js). Each row is `PartnerPanel`'s `line`
// (inventory-app#2034) with what legacy printed under every name: the
// object count, or the "no objects" line — the MWNF-384 branch lists a
// partner whether or not it holds anything — then Read more · View objects.
const spec = {
  ...partnerListSpec,
  objectsRoute: partnerObjectsRoute,
  actions: true,
  emptyLabel: 'exhibition.partner.noObjectsInExhibition',
}
</script>

<template>
  <div class="mwnf-dxa-partners">
    <PartnerListView :spec="spec">
      <template #before>
        <div class="mwnf-dxa-partners-options">
          <BackLink />
        </div>
        <!-- A shared entry, not this exhibition's own: the only thing that
             made the old `txtPartners` exhibition-specific was an absolute
             URL to its own Themes page, which is `#/themes` now. -->
        <I18nText id="mwnf-dxa-partners-intro" class="mwnf-prose" dir="auto" keypath="exhibition.partners.intro" />
      </template>
    </PartnerListView>
  </div>
</template>