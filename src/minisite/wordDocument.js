import { mdInline, mdStrip, renderBlock } from '@museumwnf/viewer-core'

// "Download — As Word (text only)": legacy served each text as an HTML page
// with Word's content type (exhibition_doc_content.php,
// introduction_doc_content.php). This builds the same document from the same
// texts and hands it to the browser as a file. `title` is the document's
// <title>, legacy's own ("MWNF DISCOVER ISLAMIC ART: Exhibition").

const escape = (value) =>
  String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function save(name, title, body) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escape(title)}</title></head><body>${body}</body></html>`
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new window.Blob([html], { type: 'application/vnd.ms-word' }))
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}

const fileName = (...parts) => `${parts.map((p) => mdStrip(p).replace(/[,:]/g, '').replace(/ /g, '-')).join('-')}.doc`

/** The introduction: the exhibition's title, the introduction's heading and text, each picture's caption. */
export function introductionDocument({ documentTitle, title, header, text, captions }) {
  const items = captions
    .map((lines) => {
      const [name, ...rest] = lines
      const printed = [name ? `<strong>${escape(mdStrip(name))}</strong>` : '', ...rest.map((l) => escape(mdStrip(l)))]
      return `<div><br/>${printed.filter(Boolean).join('<br/>')}</div>`
    })
    .join('')
  save(
    `${mdStrip(title).replace(/ /g, '-')}-con.doc`,
    documentTitle,
    `<div><b>${escape(mdStrip(title))}</b><br/><br/></div>` +
      `<table border="0"><tr><td style="vertical-align:top"><div>${escape(mdStrip(header))}</div>` +
      `<div>${escape(mdStrip(text))}<br/><br/></div></td><td>${items}</td></tr></table>`,
  )
}

const CELL = "align='center' style='color:#000000;vertical-align:top;'"

function row(fields) {
  return (
    `<tr bgcolor="#FFFFFF"><td width='150px' ${CELL}>${escape(mdStrip(fields.name))}</td>` +
    `<td width='100px' ${CELL}>${escape(mdStrip(fields.dateLines.join(' ')))}</td>` +
    `<td width='100px' ${CELL}>${fields.details.map((d) => escape(mdStrip(d))).join('<br/>')}</td>` +
    `<td width='100px' ${CELL}>${mdInline(fields.justification)}`
  )
}

/**
 * An exhibition page: the exhibition's and the page's titles, the quote, the
 * text, and a table of the page's items, each item's further views nested
 * under it — legacy's headings, in English, as it printed them.
 */
export function pageDocument({ documentTitle, title, pageTitle, quote, text, slots }) {
  const header = '<tr><th>Name</th><th>Dynasty</th><th>Details</th><th>Justification</th></tr>'
  const rows = slots
    .map(([first, ...others]) => {
      const nested = others.length
        ? `<table width="100%" cellpadding="1" cellspacing="1" border="1" bgcolor="#FFFFFF">${header}${others
            .map((fields) => `${row(fields)}</td></tr>`)
            .join('')}</table>`
        : ''
      return `${row(first)}${nested}</td></tr>`
    })
    .join('')
  save(
    fileName(title, pageTitle),
    documentTitle,
    `<table width="100%" cellpadding="1" cellspacing="1" border="0" bgcolor="#CCCCCC">` +
      `<tr bgcolor="#FFFFFF"><td style="color:#000000"><b>${escape(mdStrip(title))} / ${escape(mdStrip(pageTitle))}<br/><br/></b></td></tr>` +
      `<tr bgcolor="#FFFFFF"><td style="color:#000000"><i>${escape(mdStrip(quote))}</i><br/><br/></td></tr>` +
      `<tr bgcolor="#FFFFFF"><td style="color:#000000">${renderBlock(text ?? '')}<br/><br/></td></tr>` +
      `<tr><td><table width="100%" cellpadding="1" cellspacing="2" border="0" bgcolor="#CCCCCC">${header}${rows}</table></td></tr></table>`,
  )
}
