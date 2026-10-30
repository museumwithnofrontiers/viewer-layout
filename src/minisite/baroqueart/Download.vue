<script setup>
// "Download — As PDF (including images) / As Word (text only)" under every
// text. Legacy printed the page for its PDF (window.print()); a mini-site does
// so in every language, and builds the Word document from the page's own
// texts (`word`).
import { useI18n, useSiteConfig } from '@museumwnf/viewer-core'
import { chromeSource } from '../../chrome.js'
import { BAROQUEART_LABELS } from './exhibition.js'

defineProps({ word: { type: Function, required: true } })
const { t } = useI18n()
const config = useSiteConfig()
const asset = (path) => chromeSource(config.chrome, path)
const label = (key) => t(`${config.minisite?.texts ?? BAROQUEART_LABELS}.${key}`)

function print() {
  window.print()
}
</script>

<template>
  <div class="mwnf-baroqueart-download">
    <br><img :src="asset('legacy/print_dark.gif')" alt="" width="17" height="12"> / {{ label('download.heading') }}<br>
    <img :src="asset('legacy/arrow_inner_black.gif')" alt=""><a href="#" @click.prevent="print">{{ label('download.asPdf') }}</a><br>
    <img :src="asset('legacy/arrow_inner_black.gif')" alt=""><a href="#" @click.prevent="word()">{{ label('download.asWord') }}</a>
  </div>
</template>
