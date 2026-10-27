<script setup>
// "Download — As PDF (including images) / As Word (text only)" under every
// text. Legacy printed the page for its PDF in Arabic and Turkish
// (window.print()); a mini-site does so in every language, and builds the
// Word document from the page's own texts (`word`).
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { chromeSource } from '../chrome.js'

defineProps({ word: { type: Function, required: true } })
const { t } = useI18n()
const config = useSiteConfig()
const asset = (path) => chromeSource(config.chrome, path)

function print() {
  window.print()
}
</script>

<template>
  <div class="mwnf-minisite-download">
    <br><img :src="asset('legacy/print_dark.gif')" alt="" width="17" height="12"> / {{ t('minisite.download.heading') }}<br>
    <img :src="asset('legacy/arrow_inner_black.gif')" alt=""><a href="#" @click.prevent="print">{{ t('minisite.download.asPdf') }}</a><br>
    <img :src="asset('legacy/arrow_inner_black.gif')" alt=""><a href="#" @click.prevent="word()">{{ t('minisite.download.asWord') }}</a>
  </div>
</template>
