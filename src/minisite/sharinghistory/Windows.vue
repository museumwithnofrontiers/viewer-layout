<script setup>
// The links to legacy's two windows and to MWNF's support page
// (_curator_and_image.php): the exhibition's curators, its cover image, and
// Support. On the home page they lead the logo band; on the other pages they
// close the bottom row.
import { openWindow } from '../exhibition.js'
import { SHARINGHISTORY_WINDOWS, useSharingHistoryExhibition } from './exhibition.js'

const SUPPORT = 'https://www.museumwnf.org/about/support'

const { href, label, picture } = useSharingHistoryExhibition()
const arrow = picture('legacy/arrow_curator.gif')
</script>

<template>
  <div>
    <a href="#" @click.prevent="openWindow(href({ name: 'credits' }), SHARINGHISTORY_WINDOWS.credits)">
      {{ label('band.curatedBy') }} <img v-if="arrow" :src="arrow" alt="" width="12" height="7">
    </a>
    <div>
      <a href="#" @click.prevent="openWindow(href({ name: 'cover-image' }), SHARINGHISTORY_WINDOWS.coverImage)">
        {{ label('band.coverImage') }} <img v-if="arrow" :src="arrow" alt="" width="12" height="7">
      </a>
    </div>
    <div>
      <a :href="SUPPORT">{{ label('band.support') }} <img v-if="arrow" :src="arrow" alt="" width="12" height="7"></a>
    </div>
  </div>
</template>
