<script setup>
// The exhibition's home page (exhibitions/BAR/generic_index.php,
// generic_homelogo.php): its title and line over legacy's picture, the menu —
// the introduction and every theme, the later ones in a second column
// (`minisite.menuSecondColumnFrom`) — and the band: who curated the
// exhibition (its own credits text), the partner institutions' list, each
// curator named over its logo, and beside them the designer
// (`minisite.design`). Which curators, their logos and their links are the
// site's own (`minisite.curators`); how the band shows them is here. The home
// picture (`minisite.banner`) is drawn in the frame's footer, where legacy
// placed it.
import { computed, watch } from 'vue'
import { curatorLink } from '../rules.js'
import { vTip } from '../tip.js'
import { useBaroqueartExhibition } from './exhibition.js'
import { curatorLabel } from './rules.js'

const { label, lang, data, root, themes, text, title, settings, picture, glossaryFor } = useBaroqueartExhibition()

const description = computed(() =>
  root.value ? data.mdInline(text(root.value.id).description, { glossary: glossaryFor(root.value.id) }) : '',
)

// $_HOME_MENU_COL2: the introduction and the themes before this position in
// the first column, the rest in the second.
const split = computed(() => (settings.menuSecondColumnFrom ?? Infinity) - 1)
const firstColumn = computed(() => themes.value.slice(0, split.value).map((theme, i) => ({ theme, number: i + 1 })))
const secondColumn = computed(() => themes.value.slice(split.value).map((theme, i) => ({ theme, number: split.value + i + 1 })))

const curators = computed(() => settings.curators ?? [])

const curatorName = (curator) =>
  curatorLabel(curator, {
    partnerName: (id) => data.tr('partners', id, lang.value).name,
    partnerCountry: (id) => data.partnerById.value.get(id)?.country_id,
    countryName: (id) => data.tr('countries', id, lang.value).name,
  })
const curatorHref = (curator) => curatorLink(curator, settings.partnerHref)

const credits = computed(() => (root.value ? text(root.value.id).extra?.credits ?? '' : ''))
const design = computed(() => settings.design ?? null)
const banner = computed(() => picture(settings.banner))

const background = computed(() => picture(lang.value === 'ar' ? 'legacy/home_bg_ar.jpg' : 'legacy/home_bg.jpg'))

watch([title, lang], () => {
  document.title = [label('identity.windowTitle'), title.value].filter(Boolean).join(' | ')
}, { immediate: true })
</script>

<template>
  <div class="mwnf-baroqueart-home">
    <div class="mwnf-baroqueart-home__bg1" />
    <div class="mwnf-baroqueart-home__bg2" :style="{ backgroundImage: background ? `url(${background})` : 'none' }" />
    <div class="mwnf-baroqueart-home__title">{{ title }}</div>
    <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
    <div class="mwnf-baroqueart-home__description" v-html="description" />
    <div class="mwnf-baroqueart-home__menu">
      <div>&gt; <router-link :to="{ name: 'introduction' }">{{ label('home.introduction') }}</router-link></div>
      <div v-for="{ theme, number } in firstColumn" :key="theme.id">
        &gt; <router-link :to="{ name: 'exhibition', params: { theme: number } }">{{ text(theme.id).title }}</router-link>
      </div>
    </div>
    <div v-if="secondColumn.length" class="mwnf-baroqueart-home__menu2">
      <div v-for="{ theme, number } in secondColumn" :key="theme.id">
        &gt; <router-link :to="{ name: 'exhibition', params: { theme: number } }">{{ text(theme.id).title }}</router-link>
      </div>
    </div>
  </div>
  <div class="mwnf-baroqueart-partners">
    <div class="mwnf-baroqueart-partners__curators">
      <div class="mwnf-baroqueart-partners__line">{{ label('home.curatedBy') }}</div>
      <!-- eslint-disable-next-line vue/no-v-html -- the exhibition's own Markdown, rendered and escaped by viewer-core -->
      <div class="mwnf-baroqueart-partners__tab" v-html="data.mdInline(credits)" />
      <div class="mwnf-baroqueart-partners__cooperation">
        {{ label('home.cooperation') }} <a :href="settings.partnerListHref">{{ label('home.partnerInstitutions') }}</a>
      </div>
      <div class="mwnf-baroqueart-partners__tab">
        <template v-for="(curator, i) in curators" :key="curator.logo">
          {{ curatorName(curator) }}<br>
          <a v-tip="{ text: curatorName(curator), width: 220 }" class="mwnf-baroqueart-partners__curator" :href="curatorHref(curator)"><img :src="picture(curator.logo)" alt=""></a>
          <span v-if="i < curators.length - 1" class="mwnf-baroqueart-partners__gap" :style="{ width: `${curator.space ?? 0}px` }" />
        </template>
      </div>
    </div>
    <div v-if="design" class="mwnf-baroqueart-partners__design">
      {{ label('home.design') }}
      <div class="mwnf-baroqueart-partners__design-tab">{{ design.name }}</div>
      <div class="mwnf-baroqueart-partners__design-tab">
        <a :href="design.href" target="_blank" rel="noopener"><img :src="picture(design.logo)" alt=""></a>
      </div>
    </div>
  </div>
  <Teleport v-if="banner" defer to=".mwnf-baroqueart-footer">
    <div class="mwnf-baroqueart-home__banner" :style="{ backgroundImage: `url(${banner})` }" aria-hidden="true" />
  </Teleport>
</template>
