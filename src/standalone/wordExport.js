// Legacy's "As Word (text only)" (export.php): the sheet's texts as an HTML
// page Word opens, sent as a .doc download. The sheet is read as drawn — its
// labels as legacy's h3, its values, sections and credits as paragraphs —
// so the file says what the page says, without the pictures, the related
// content or the page's own controls.

const STYLE = `html { height: 100%; margin-bottom: 1px; }
body, p, div, td { font: Normal 11px/14px verdana, arial, helvetica; }
body { padding: 0px; border: 0px; border-spacing: 0px; margin: 0px auto; }
div { padding: 0px; border: 0px; border-spacing: 0px; margin: 0px; }
p { font: Normal 11px/14px Verdana, Arial, Helvetica; padding: 3px; padding-left: 8px; padding-bottom: 30px; line-height: 1.4em; margin: 0px 0px 10px 0px; }
a, a:link, a:hover, a:visited, a:active { text-decoration: none; }
h3 { font: Normal 11px/14px Verdana, Arial, Helvetica; padding-left: 8px; padding-right: 8px; font-weight: bold; margin: 0px; }
.item_description { font-family: Verdana, Arial, Helvetica, sans-serif; padding-top: 25px; padding-bottom: 25px; width: 990px; }`

const HEADINGS = '.mwnf-sheet__label, .mwnf-sheet-section__heading, .mwnf-credits__heading'
const TEXTS = '.mwnf-sheet__value, .mwnf-sheet-section__body, .mwnf-credits__citation, .mwnf-credits__list > dt, .mwnf-credits__number, .mwnf-sheet__short .mwnf-sheet__block'
const DROPPED = 'button, img, svg, picture, video, audio, iframe, script, style, [role="tooltip"], [aria-hidden="true"]'

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

const INLINE = new Set(['I', 'EM', 'B', 'STRONG', 'U', 'SUP', 'SUB'])
const BLOCK = new Set(['P', 'DIV', 'LI', 'UL', 'OL', 'SECTION'])

// A text as legacy's export wrote it: its words, its emphasis and its line
// breaks, nothing of the page's own markup (classes, controls, pictures,
// tooltips, links); paragraphs one after another, an empty line between.
function cleaned(element) {
  const blocks = [[]]
  const current = () => blocks[blocks.length - 1]
  const breakBlock = () => { if (current().length) blocks.push([]) }
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      current().push(escapeHtml(node.textContent))
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE || node.matches(DROPPED)) return
    if (node.tagName === 'BR') {
      current().push('<br/>')
      return
    }
    const block = BLOCK.has(node.tagName)
    const tag = INLINE.has(node.tagName) ? node.tagName.toLowerCase() : ''
    if (block) breakBlock()
    if (tag) current().push(`<${tag}>`)
    for (const child of node.childNodes) walk(child)
    if (tag) current().push(`</${tag}>`)
    if (block) breakBlock()
  }
  for (const child of element.childNodes) walk(child)
  return blocks.map((parts) => parts.join('').replace(/\s+/g, ' ').trim()).filter(Boolean).join('<br/>\n<br/>')
}

/**
 * The document for the sheet drawn under `root` (the item sheet's middle
 * column and its credits): a heading per label, a paragraph per value.
 */
export function sheetDocument(root, { title = '', dir = '' } = {}) {
  const shown = (element) => {
    for (let node = element; node && node !== root.parentElement; node = node.parentElement) {
      if (node.hidden || getComputedStyle(node).display === 'none') return false
    }
    return true
  }
  const parts = []
  for (const element of root.querySelectorAll(`${HEADINGS}, ${TEXTS}`)) {
    if (element.closest('.mwnf-standalone-item__left, .mwnf-standalone-related') || !shown(element)) continue
    if (element.matches('.mwnf-credits__list > dt')) {
      const value = element.nextElementSibling
      parts.push(`<p>${escapeHtml(element.textContent.trim())} ${value ? cleaned(value) : ''}</p>`)
      continue
    }
    const html = cleaned(element)
    if (!html) continue
    parts.push(element.matches(HEADINGS) ? `<h3>${html}</h3>` : `<p>${html}</p>`)
  }
  const direction = dir === 'rtl' ? ' style="direction: rtl;"' : ''
  return `<html>
<title>${escapeHtml(title)}</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<head>
<style>
${STYLE}
</style>
</head>
<body>
<div class="content">
<div class="item_description">
<table border="0" cellspacing="0" cellpadding="0"><tr><td valign="top"${direction}>
${parts.join('\n')}
</td></tr></table>
</div>
</div>
</body>
</html>`
}

/** Hands the document to the browser as `fileName`, as export.php's attachment. */
export function downloadWord(html, fileName) {
  const url = URL.createObjectURL(new Blob(['﻿', html], { type: 'application/msword' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * Legacy's timeline "As Word (text only)" (export_hcr_content.php): the
 * heading line, then every event of the search, not one page of it, in a
 * table, its date and country on one row and its description on the next.
 *
 *   heading: the line over the table ("TIMELINE | 1000 to 1200 | EGYPT")
 *   heads: { date, countryDescription }
 *   rows: [{ date, country, html }]   // `html` the description as rendered
 *   empty: what legacy wrote when nothing matched
 */
export function timelineDocument({ title = '', heading = '', heads = {}, rows = [], empty = '', dir = '' } = {}) {
  const align = dir === 'rtl' ? 'direction: rtl; text-align: right;' : 'text-align: left;'
  const description = (html) => {
    const holder = document.createElement('div')
    holder.innerHTML = html ?? ''
    return cleaned(holder)
  }
  const body = rows.length
    ? `<tr><td style="padding:10px;">
<table border='1' cellspacing='1' cellpadding='1' width="100%">
<tr>
<td style="padding:5px;" width="28%"><b>${escapeHtml(heads.date)}</b></td>
<td style="padding:5px;" width="36%"><b>${escapeHtml(heads.countryDescription)}</b></td>
<td width="37%"><b></b></td>
</tr>
${rows.map((row) => `<tr>
<td style="padding:5px; vertical-align:top;">&nbsp;${escapeHtml(row.date)}</td>
<td style="padding:5px;">${escapeHtml(row.country)}</td>
<td>&nbsp;</td>
</tr>
<tr>
<td style="padding:5px;">&nbsp;</td>
<td style="padding:5px;" colspan="2"><span>${description(row.html)}</span></td>
</tr>`).join('\n')}
</table>
</td></tr>
<tr><td>&nbsp;</td></tr>`
    : `<tr><td style="padding-top:100px;padding-left:350px;">${escapeHtml(empty)}</td></tr>`
  return `<html>
<title>${escapeHtml(title)}</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<head>
<style>
${STYLE}
</style>
</head>
<body>
<div class="content">
<div class="item_description">
<table style="${align}" border="0" width="750px">
<tr><td class="txt" align="left" width="750px"><div style="width: 750px;">&nbsp;&nbsp;${escapeHtml(heading).replace(/^([^|]*)/, '<b>$1</b>')}</div></td></tr>
<tr><td>&nbsp;</td></tr>
${body}
</table>
</div>
</div>
</body>
</html>`
}
