<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlidersHorizontal, X, SearchX, Lightbulb, FileDown } from 'lucide-vue-next'
import { FONTE_LABEL, FONTES, type Fonte, type Suggestion } from '@/core/types/api'
import { useRemunerationSearch } from '../composables/useRemunerationSearch'
import { useSuggest } from '../composables/useSuggest'
import { formatTotal, PREVIEW_SIZE } from '../utils/search'
import { exportSearch, type ExportFormat } from '../services/remuneration.service'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import SearchBox from '../components/SearchBox.vue'
import SearchTabs from '../components/SearchTabs.vue'
import SearchFilters from '../components/SearchFilters.vue'
import ResultList from '../components/ResultList.vue'
import PaginationBar from '../components/PaginationBar.vue'
import FonteBadge from '../components/FonteBadge.vue'

const search = useRemunerationSearch()
const { state, effective, sources, counts } = search

const showFilters = ref(false)
const nomeRef = computed({ get: () => state.nome, set: (v: string) => (state.nome = v) })
const fonteRef = computed(() => state.fonte)
const typing = computed(() => state.nome.trim().length >= 3)
const { suggestions, isFetching: suggestLoading } = useSuggest(nomeRef, fonteRef, typing)

const term = computed(() => effective.value.nome)
const filtersActive = computed(() => search.chips.value.length > 0)

function pickSuggestion(s: Suggestion) {
  state.nome = s.nome
  search.flushNome()
}

const exporting = ref<ExportFormat | null>(null)
const exportError = ref(false)
async function doExport(formato: ExportFormat) {
  const params = search.exportParams.value
  if (!params) return
  exporting.value = formato
  exportError.value = false
  try {
    await exportSearch(params, formato)
  } catch {
    exportError.value = true
  } finally {
    exporting.value = null
  }
}

const examples = ['Maria da Silva', 'Professor', 'Médico', 'Analista']
function tryExample(text: string) {
  state.nome = text
  search.flushNome()
}

function seeAll(f: Fonte) {
  search.setFonte(f)
}

const total = computed(() =>
  state.fonte === 'ALL'
    ? FONTES.reduce((acc, f) => acc + (counts.value[f]?.total ?? 0), 0)
    : (search.activeData.value?.total ?? 0),
)
const noResults = computed(
  () => search.criteria.value && !search.isInitialLoading.value && !search.isError.value && total.value === 0,
)
</script>

<template>
  <div class="space-y-6 pb-10">
    <div class="flex flex-col gap-1">
      <h2 class="text-3xl font-bold text-slate-900 font-serif tracking-tight">Consulta Pública</h2>
      <p class="text-slate-500 font-medium">
        Encontre servidores no Governo do DF, Senado e Executivo Federal. Os resultados aparecem enquanto você digita.
      </p>
    </div>

    <div class="space-y-3">
      <SearchBox
        v-model="nomeRef"
        :suggestions="suggestions"
        :loading="suggestLoading || search.isFetching.value"
        @select="pickSuggestion"
        @submit="search.flushNome"
      />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <SearchTabs
          :model-value="state.fonte"
          :counts="counts"
          :loading="search.isFetching.value"
          @update:model-value="search.setFonte"
        />
        <button
          type="button"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors"
          :class="showFilters ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
          :aria-expanded="showFilters"
          @click="showFilters = !showFilters"
        >
          <SlidersHorizontal class="w-4 h-4" />
          Filtros
          <span v-if="search.chips.value.length" class="text-[11px] font-black bg-slate-900 text-white rounded-full px-1.5">
            {{ search.chips.value.length }}
          </span>
        </button>
      </div>

      <SearchFilters
        v-if="showFilters"
        :state="state"
        :periods="search.periods.value"
        @update:cargo="state.cargo = $event"
        @update:orgao="state.orgao = $event"
        @update:ano="state.ano = $event"
        @update:mes="state.mes = $event"
      />

      <div v-if="filtersActive" class="flex flex-wrap items-center gap-2">
        <span
          v-for="chip in search.chips.value"
          :key="chip.key"
          class="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold"
        >
          <span class="text-slate-400">{{ chip.label }}:</span> {{ chip.value }}
          <button
            type="button"
            class="p-0.5 rounded-full hover:bg-white/20"
            :aria-label="`Remover filtro ${chip.label}`"
            @click="search.clearFilter(chip.key)"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
        <button type="button" class="text-xs font-semibold text-slate-500 hover:text-slate-900 underline" @click="search.clearAll">
          Limpar tudo
        </button>
      </div>
    </div>

    <!-- Estado inicial / dicas -->
    <div
      v-if="!search.criteria.value"
      class="bg-white border border-dashed border-slate-300 rounded-3xl p-8 md:p-12 text-center space-y-4"
    >
      <div class="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
        <Lightbulb class="w-6 h-6" />
      </div>
      <h3 class="text-xl font-bold font-serif text-slate-900">Comece digitando um nome</h3>
      <ul class="text-sm text-slate-500 space-y-1">
        <li>Digite ao menos 2 letras do nome — acentos e maiúsculas não importam.</li>
        <li>Use <kbd class="font-mono border border-slate-200 rounded px-1 bg-slate-50">/</kbd> para focar a busca de qualquer lugar.</li>
        <li>Abra "Filtros" para buscar só por cargo ou órgão.</li>
      </ul>
      <div class="flex flex-wrap justify-center gap-2 pt-2">
        <button
          v-for="e in examples"
          :key="e"
          type="button"
          class="px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          @click="tryExample(e)"
        >
          {{ e }}
        </button>
      </div>
    </div>

    <!-- Carregando (primeira busca) -->
    <div v-else-if="search.isInitialLoading.value" class="space-y-3" aria-busy="true">
      <BaseSkeleton v-for="i in 6" :key="i" height="64px" rounded="rounded-2xl" />
    </div>

    <!-- Erro -->
    <div v-else-if="search.isError.value" class="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-6 text-center">
      <p class="font-bold">Não foi possível buscar agora.</p>
      <p class="text-sm">Tente novamente em instantes.</p>
    </div>

    <!-- Sem resultados -->
    <div v-else-if="noResults" class="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2">
      <SearchX class="w-8 h-8 mx-auto text-slate-300" />
      <h3 class="text-lg font-bold text-slate-900">Nenhum servidor encontrado</h3>
      <p class="text-sm text-slate-500">
        Tente menos letras, remova filtros ou escolha outra fonte. Pode não haver dados carregados no período.
      </p>
    </div>

    <!-- Todas: seções agrupadas -->
    <div v-else-if="state.fonte === 'ALL'" class="space-y-8" :class="{ 'opacity-70 transition-opacity': search.isFetching.value }">
      <section v-for="f in FONTES" :key="f" class="space-y-3">
        <template v-if="sources[f].data.value && sources[f].data.value!.items.length">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-xl font-bold font-serif text-slate-900">{{ FONTE_LABEL[f] }}</h3>
              <FonteBadge :fonte="f" short />
              <span class="text-sm text-slate-500">
                {{ formatTotal(sources[f].data.value!.total, sources[f].data.value!.total_capped) }} resultados
              </span>
            </div>
            <button
              v-if="sources[f].data.value!.total > PREVIEW_SIZE"
              type="button"
              class="text-sm font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-4"
              @click="seeAll(f)"
            >
              Ver todos
            </button>
          </div>
          <ResultList :items="sources[f].data.value!.items.slice(0, PREVIEW_SIZE)" :term="term" />
        </template>
        <BaseSkeleton v-else-if="sources[f].isFetching.value" height="56px" rounded="rounded-2xl" />
      </section>
    </div>

    <!-- Fonte específica -->
    <div v-else-if="search.activeData.value" class="space-y-4" :class="{ 'opacity-70 transition-opacity': search.isFetching.value }">
      <div class="flex items-center justify-end gap-2 text-sm">
        <span v-if="exportError" class="text-red-600 font-medium">Não foi possível exportar.</span>
        <button
          v-for="f in (['csv', 'xlsx'] as const)"
          :key="f"
          type="button"
          :disabled="exporting !== null"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50"
          :title="f === 'csv' ? 'Até 5.000 linhas' : 'Até 1.000 linhas'"
          @click="doExport(f)"
        >
          <FileDown class="w-4 h-4" />
          {{ exporting === f ? 'Gerando...' : f.toUpperCase() }}
        </button>
      </div>
      <ResultList :items="search.activeData.value.items" :term="term" />
      <PaginationBar
        :page="state.page"
        :pages="search.activeData.value.pages"
        :total="search.activeData.value.total"
        :capped="search.activeData.value.total_capped"
        :shown="search.activeData.value.items.length"
        @change="search.setPage"
      />
    </div>
  </div>
</template>
