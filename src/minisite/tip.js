import { reactive } from 'vue'

// Legacy's tooltip (script/tooltip.js and libs/class.dhtmlatitle.inc.php): a
// small box that follows the pointer over a link, in the exhibition's colours,
// at the width each page asked for. `v-tip="{ text, width }"` on an element
// shows it; the shell draws the one box every page shares.

export const tip = reactive({ text: '', width: 100, x: 0, y: 0, visible: false })

function place(event) {
  tip.x = event.pageX
  tip.y = event.pageY
}

function bind(el, binding) {
  el.__tip = binding.value
}

export const vTip = {
  mounted(el, binding) {
    bind(el, binding)
    el.addEventListener('mouseenter', (event) => {
      const value = el.__tip
      if (!value?.text) return
      tip.text = value.text
      tip.width = value.width ?? 100
      place(event)
      tip.visible = true
    })
    el.addEventListener('mousemove', place)
    el.addEventListener('mouseleave', () => {
      tip.visible = false
    })
  },
  updated: bind,
  beforeUnmount() {
    tip.visible = false
  },
}
