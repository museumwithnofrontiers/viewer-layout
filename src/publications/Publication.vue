<script setup>
// Legacy's book page (BookPage.vue, `/book/<id>/<language>`): the category
// and "<language> version"; "This title is available in:" and the book's
// languages, one of them current; the current version — its cover ("Image
// Coming Soon" without one), its year and language, its format and size,
// "Look Inside" (the sample PDF) and "View Credits" (the credits PDF); the
// book's country and project; the version's title, subtitle, authors,
// photographers, editors, counts, publisher and ISBN, "About This Book",
// "More About This Book" (folded) and its note. Under it, when the language
// has more than one version, "Editions of <title>. <subtitle>, <language>
// version" and every version, a click making it the current one.
//
// The labels are read in the version's language, English where it has none,
// as legacy's were (R(language)); the book's texts are its translation in
// that language, a version's own texts first (D-P9). Legacy's availability
// line and its shop links ("Get It From") are not drawn: the package carries
// no stock flag, and the shop links are not exported (D-P8). The publisher
// popup read publisher records the package does not carry (D-P4).
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { byId, isRtl, renderBlock, useI18n } from '@museumwnf/viewer-core'
import { usePublications } from './data.js'
import {
  availableLanguages, displayLanguage, documentsOf, editionsByYear, editionText, present,
} from './rules.js'

const props = defineProps({
  id: { type: String, required: true },
  /** The version's language, legacy's `/book/<id>/<language>`; the book's main language when absent. */
  language: { type: String, default: '' },
})
const { t, tIn } = useI18n()
const router = useRouter()

const editionIndex = byId('editions')
const publication = computed(() => byId('publications').value.get(props.id) ?? null)
// The book's texts in every language it has a version in: its tabs name them.
const data = usePublications({ languagesToLoad: () => (publication.value ? availableLanguages(publication.value, editionIndex.value) : []) })

const languages = computed(() => (publication.value ? availableLanguages(publication.value, data.editionById.value) : []))
const current = computed(() => (publication.value ? displayLanguage(publication.value, data.editionById.value, props.language || null) : 'en'))
const dir = computed(() => (isRtl(current.value) ? 'rtl' : 'ltr'))
/** A label in the version's language, English where legacy had none. */
const label = (key) => tIn(current.value, key)

const editions = computed(() => (publication.value ? editionsByYear(publication.value, data.editionById.value, current.value) : []))
const index = ref(0)
watch([() => props.id, current], () => { index.value = 0 })
const edition = computed(() => editions.value[index.value] ?? editions.value[0] ?? null)

const bookText = computed(() => (publication.value ? data.text(publication.value, current.value) : {}))
const texts = computed(() => editions.value.map((row) => editionText(bookText.value, row)))
const text = computed(() => texts.value[index.value] ?? editionText(bookText.value, null))
const documents = computed(() => documentsOf(edition.value))
const cover = computed(() => edition.value?.cover?.url ?? (editions.value.length ? null : publication.value?.cover?.url ?? null))

const categoryLabel = computed(() => {
  const entry = data.categories.value.find((row) => row.category && row.category === publication.value?.category)
  return entry ? t(entry.label) : ''
})

// Legacy's getCoverInfoString(): the year, then "<language> version".
const coverInfo = computed(() => [edition.value?.publish_year, label('publications.edition.languageVersion')].filter(present).join(', '))

const moreAbout = ref(false)
const html = (value) => (present(value) ? renderBlock(String(value), { breaks: true }) : '')

function selectLanguage(code) {
  if (code !== current.value) router.replace({ name: 'publication', params: { id: props.id, language: code } })
}

function selectEdition(i) {
  index.value = i
  moreAbout.value = false
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { /* jsdom */ }
  }
}
</script>

<template>
  <div class="mwnf-books-publication">
    <p v-if="!publication" class="mwnf-books-list__empty">{{ t('core.detail.notFound') }}</p>
    <template v-else>
      <div class="mwnf-books-publication__header">
        <span v-if="categoryLabel" class="mwnf-books-publication__category">{{ categoryLabel }}, </span>
        <span class="mwnf-books-publication__language">{{ label('publications.edition.languageVersion') }}</span>
      </div>
      <div class="mwnf-books-publication__versions">
        {{ label('publications.publication.languages') }}:
        <button
          v-for="code in languages"
          :key="code"
          type="button"
          class="mwnf-books-publication__version"
          :class="{ 'mwnf-books-publication__version--current': code === current }"
          :aria-pressed="code === current"
          @click="selectLanguage(code)"
        >{{ data.languageName(code) }}</button>
      </div>

      <div class="mwnf-books-edition" :dir="dir" :lang="current">
        <div class="mwnf-books-edition__cover-column">
          <div v-if="cover" class="mwnf-books-edition__cover"><img :src="cover" alt=""></div>
          <div v-else class="mwnf-books-edition__cover mwnf-books-edition__cover--none">{{ t('publications.card.imageComingSoon') }}</div>
          <div class="mwnf-books-edition__cover-info">
            <div v-if="coverInfo">{{ coverInfo }}</div>
            <div v-if="present(edition?.binding)" class="mwnf-books-edition__format">
              {{ edition.binding }}<span v-if="present(edition.dimensions)"> ({{ edition.dimensions }})</span>
            </div>
            <div v-if="documents.sample" class="mwnf-books-edition__pdf">
              <a :href="documents.sample" target="_blank" rel="noopener">{{ label('publications.edition.lookInside') }}</a>
            </div>
            <div v-if="documents.credits" class="mwnf-books-edition__pdf">
              <a :href="documents.credits" target="_blank" rel="noopener">{{ label('publications.edition.credits') }}</a>
            </div>
          </div>
        </div>

        <div class="mwnf-books-edition__information">
          <div class="mwnf-books-edition__group">
            <div v-if="data.countryName(publication.country_id)" class="mwnf-books-edition__country">{{ data.countryName(publication.country_id) }}</div>
            <div v-if="data.projectName(publication.project_id)" class="mwnf-books-edition__project">{{ data.projectName(publication.project_id) }}</div>
          </div>
          <div class="mwnf-books-edition__group">
            <div v-if="present(text.title)" class="mwnf-books-edition__title">{{ String(text.title).toUpperCase() }}</div>
            <div v-if="present(text.subtitle)" class="mwnf-books-edition__subtitle">{{ text.subtitle }}</div>
          </div>
          <div class="mwnf-books-edition__group">
            <div v-if="present(text.authors)">{{ label('publications.edition.authors') }}: {{ text.authors }}</div>
            <div v-if="present(text.photographers)">{{ label('publications.edition.photographers') }}: {{ text.photographers }}</div>
            <div v-if="present(text.editors)">{{ label('publications.edition.editors') }}: {{ text.editors }}</div>
            <div v-if="present(text.pages)">{{ label('publications.edition.pages') }}: {{ text.pages }}</div>
            <div v-if="present(text.images)">{{ label('publications.edition.images') }}: {{ text.images }}</div>
            <div v-if="present(text.plans)" class="mwnf-books-edition__plans">{{ label('publications.edition.plans') }}: {{ text.plans }}</div>
          </div>
          <div class="mwnf-books-edition__group">
            <div v-if="present(edition?.publisher)" class="mwnf-books-edition__publisher">{{ label('publications.edition.publishers') }}: {{ edition.publisher }}</div>
            <div v-if="present(edition?.isbn)" class="mwnf-books-edition__isbn">{{ label('publications.edition.isbn') }}: {{ edition.isbn }}</div>
          </div>
          <div v-if="present(text.about)" class="mwnf-books-edition__about">
            <div class="mwnf-books-edition__about-header">{{ label('publications.edition.about') }}</div>
            <div class="mwnf-books-edition__prose" v-html="html(text.about)"></div>
          </div>
          <div v-if="present(text.moreAbout)" class="mwnf-books-edition__more-about">
            <button type="button" class="mwnf-books-edition__more-about-header" :aria-expanded="moreAbout" @click="moreAbout = !moreAbout">
              {{ label('publications.edition.moreAbout') }}
            </button>
            <div v-show="moreAbout" class="mwnf-books-edition__prose" v-html="html(text.moreAbout)"></div>
          </div>
          <div v-if="present(text.note)" class="mwnf-books-edition__note mwnf-books-edition__prose" v-html="html(text.note)"></div>
        </div>
      </div>

      <div v-if="editions.length > 1" class="mwnf-books-editions" :dir="dir" :lang="current">
        <div class="mwnf-books-editions__information">
          {{ label('publications.edition.editionsOf') }} <span>{{ text.title }}. </span>
          <span v-if="present(text.subtitle)" class="mwnf-books-editions__subtitle">{{ text.subtitle }}, </span>{{ label('publications.edition.languageVersion') }}
        </div>
        <div class="mwnf-books-editions__list" :class="{ 'mwnf-books-editions__list--scroll': editions.length > 4 }">
          <div
            v-for="(row, i) in editions"
            :key="row.id"
            class="mwnf-books-editions__item"
            :class="{ 'mwnf-books-editions__item--current': i === index }"
            role="button"
            tabindex="0"
            :aria-pressed="i === index"
            @click="selectEdition(i)"
            @keydown.enter.prevent="selectEdition(i)"
          >
            <div v-if="row.cover" class="mwnf-books-editions__image"><img :src="row.cover.url" alt="" loading="lazy"></div>
            <div class="mwnf-books-editions__group">
              <div v-if="present(row.publisher)">{{ label('publications.edition.publishers') }}: {{ row.publisher }}</div>
              <div v-if="present(row.binding)" class="mwnf-books-editions__format">{{ row.binding }}</div>
              <div v-if="present(row.dimensions)">{{ row.dimensions }}</div>
              <div v-if="present(row.isbn)">{{ row.isbn }}</div>
              <div v-if="present(row.publish_year)">{{ row.publish_year }}</div>
              <div v-if="present(row.edition)">{{ label('publications.edition.edition') }}: {{ row.edition }}</div>
            </div>
            <div class="mwnf-books-editions__group">
              <div v-if="documentsOf(row).sample" class="mwnf-books-edition__pdf">
                <a :href="documentsOf(row).sample" target="_blank" rel="noopener" @click.stop>{{ label('publications.edition.lookInside') }}</a>
              </div>
              <div v-if="documentsOf(row).credits" class="mwnf-books-edition__pdf">
                <a :href="documentsOf(row).credits" target="_blank" rel="noopener" @click.stop>{{ label('publications.edition.credits') }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
