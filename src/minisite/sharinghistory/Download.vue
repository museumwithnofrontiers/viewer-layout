<script setup>
// "Download — As PDF (including images) / As Word (text only)" under every
// text: the page printed, and a Word document of the page's texts, as
// legacy's *_doc_content.php pages served them (an HTML document with Word's
// content type). `title` names the document; `blocks` are its texts in
// order, each `{ heading?, text }` in Markdown.
import { mdStrip, renderBlock } from '@museumwnf/viewer-core'
import { useSharingHistoryExhibition } from './exhibition.js'

const props = defineProps({
  title: { type: String, required: true },
  blocks: { type: Array, default: () => [] },
})
const { label, picture } = useSharingHistoryExhibition()

const escape = (value) =>
  String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function word() {
  const body = props.blocks
    .map(({ heading, text }) => `${heading ? `<h2>${escape(mdStrip(heading))}</h2>` : ''}${text ? renderBlock(text) : ''}`)
    .join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escape(mdStrip(props.title))}</title></head><body><h1>${escape(mdStrip(props.title))}</h1>${body}</body></html>`
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new window.Blob([html], { type: 'application/vnd.ms-word' }))
  link.download = `${mdStrip(props.title).replace(/[,:]/g, '').replace(/ /g, '-')}.doc`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}
</script>

<template>
  <div class="mwnf-sh-download">
    <img :src="picture('legacy/print.gif')" alt="" width="14" height="14"> / {{ label('download.heading') }}<br>
    <img :src="picture('legacy/arrow_inner_black.gif')" alt="" class="mwnf-sh-arrow" width="11" height="8"><a href="#" @click.prevent="window.print()">{{ label('download.asPdf') }}</a><br>
    <img :src="picture('legacy/arrow_inner_black.gif')" alt="" class="mwnf-sh-arrow" width="11" height="8"><a href="#" @click.prevent="word">{{ label('download.asWord') }}</a>
  </div>
</template>
