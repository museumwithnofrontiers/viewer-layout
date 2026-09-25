<script setup>
import { I18nText } from '@museumwnf/viewer-core'
import BackLink from '../../content/BackLink.vue'
import PartnerListView from '../../views/PartnerListView.vue'
import { partnerList, partnerObjectsRoute } from './data.js'

// The gallery partners list (epic #1731, from carpets/amulets), on the
// platform's composed partner-list view: the grouping, the sort toggle and
// the query are the view's, from `partnerList` (dxa/gallery/data.js). Each
// row is `PartnerPanel`'s `line` (inventory-app#2034) with what legacy
// printed under every name: the object count, or the "no objects" line a
// partner holding none still gets (decision MWNF-384, recorded in
// `@museumwnf/viewer-core/dxa`'s `useGalleryPartner`), then Read more · View
// objects.
const spec = {
  ...partnerList,
  objectsRoute: partnerObjectsRoute,
  actions: true,
  emptyLabel: 'gallery.partner.noObjectsInGallery',
}
</script>

<template>
  <div class="mwnf-dxa-partners">
    <PartnerListView :spec="spec">
      <template #before>
        <BackLink />
        <I18nText id="mwnf-dxa-partners-intro" class="mwnf-prose" dir="auto" keypath="gallery.partners.intro" />
      </template>
    </PartnerListView>
  </div>
</template>