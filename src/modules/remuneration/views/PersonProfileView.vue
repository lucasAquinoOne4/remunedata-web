<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, FileDown, UserX } from 'lucide-vue-next'
import { isFonte } from '../utils/search'
import { semLiquido, type Fonte } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import BaseChart from '@/shared/ui/BaseChart.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { usePerson } from '../composables/usePerson'
import { computeKpis, latestEntry } from '../utils/profile'
import { buildCompositionOption, buildEvolutionOption } from '../utils/charts'
import { csvFilename, downloadCsv, historyToCsv } from '../utils/csv'
import PersonHeader from '../components/PersonHeader.vue'
import PeerComparison from '../components/PeerComparison.vue'
import OtherSources from '../components/OtherSources.vue'
import FederalSheet from '../components/FederalSheet.vue'
import HistoryTable from '../components/HistoryTable.vue'
import TseCandidaturas from '../components/TseCandidaturas.vue'
import ParticipacoesSocietarias from '../components/ParticipacoesSocietarias.vue'

const route = useRoute()
const router = useRouter()
const fonte = computed<Fonte>(() => {
  const f = String(route.params.fonte ?? '').toUpperCase()
  return isFonte(f) ? f : 'DF'
})
const id = computed(() => String(route.params.id ?? ''))
const matricula = computed(() => {
  const m = route.query.matricula
  const v = Array.isArray(m) ? m[0] : m
  return v || undefined
})

const { data: profile, isLoading, isError } = usePerson(fonte, id, matricula)

const nome = computed(() => profile.value?.identidade?.nome || 'Servidor')
const ultimo = computed(() => (profile.value ? latestEntry(profile.value) : null))
const kpis = computed(() => computeKpis(ultimo.value))
const evolutionOption = computed(() => buildEvolutionOption(profile.value?.historico ?? [], !semLiquido(fonte.value)))
const compositionOption = computed(() => buildCompositionOption(ultimo.value?.componentes))
const hasComponents = computed(() => Object.keys(ultimo.value?.componentes ?? {}).length > 0)
const compositionHeight = computed(() => Math.max(180, Object.keys(ultimo.value?.componentes ?? {}).length * 34 + 24))

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'remuneration' })
}

function exportCsv() {
  if (!profile.value) return
  downloadCsv(csvFilename(nome.value, fonte.value), historyToCsv(profile.value.historico, fonte.value))
}
</script>

<template>
  <div class="space-y-6 pb-10">
    <div class="flex items-center justify-between gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
        @click="goBack"
      >
        <ArrowLeft class="w-4 h-4" /> Voltar à busca
      </button>
      <BaseButton
        v-if="profile && profile.historico.length"
        variant="outline"
        class="gap-2 text-xs font-bold rounded-xl"
        @click="exportCsv"
      >
        <FileDown class="w-4 h-4" /> Exportar histórico (CSV)
      </BaseButton>
    </div>

    <!-- Carregando -->
    <div v-if="isLoading" class="space-y-6" aria-busy="true">
      <BaseSkeleton height="160px" rounded="rounded-3xl" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseSkeleton v-for="i in 3" :key="i" height="96px" rounded="rounded-2xl" />
      </div>
      <BaseSkeleton height="320px" rounded="rounded-3xl" />
    </div>

    <!-- Indisponível / erro -->
    <div
      v-else-if="isError || !profile"
      class="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2"
    >
      <UserX class="w-10 h-10 mx-auto text-slate-300" />
      <h2 class="text-xl font-bold font-serif text-slate-900">Perfil indisponível</h2>
      <p class="text-sm text-slate-500">
        {{ isError ? 'Não foi possível carregar este perfil agora.' : 'Ainda não há dados de perfil para esta pessoa.' }}
      </p>
    </div>

    <template v-else>
      <PersonHeader :fonte="fonte" :nome="nome" :identidade="profile.identidade" />

      <!-- KPIs -->
      <div v-if="kpis && ultimo" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p class="text-[10px] uppercase tracking-widest font-black text-slate-400">
            Bruto · {{ formatCompetence(ultimo.mes, ultimo.ano) }}
          </p>
          <p class="text-3xl font-bold text-slate-900 mt-1">{{ formatCurrency(kpis.bruto) }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p class="text-[10px] uppercase tracking-widest font-black text-slate-400">Líquido</p>
          <p class="text-3xl font-bold text-slate-900 mt-1">{{ semLiquido(fonte) ? 'Não informado' : formatCurrency(kpis.liquido) }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p class="text-[10px] uppercase tracking-widest font-black text-slate-400">Descontos</p>
          <template v-if="semLiquido(fonte)">
            <p class="text-3xl font-bold text-slate-900 mt-1">Não informado</p>
            <p class="text-xs text-slate-500">A fonte publica apenas o valor bruto.</p>
          </template>
          <template v-else>
            <p class="text-3xl font-bold text-rose-600 mt-1">
              {{ kpis.descontosPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}%
            </p>
            <p class="text-xs text-slate-500">{{ formatCurrency(kpis.descontos) }} no mês</p>
          </template>
        </div>
      </div>
      <p v-else class="text-sm text-slate-400 text-center">Sem valores de remuneração para este perfil.</p>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <section
          v-if="profile.historico.length > 0"
          class="xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
        >
          <h3 class="text-xl font-bold font-serif text-slate-900 mb-1">Evolução</h3>
          <p class="text-sm text-slate-500 mb-4">
            {{ semLiquido(fonte) ? 'Remuneração bruta mês a mês.' : 'Remuneração bruta x líquida mês a mês.' }}
          </p>
          <BaseChart :option="evolutionOption" height="320px" />
        </section>
        <section
          v-if="hasComponents"
          class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6"
          :class="profile.historico.length > 0 ? 'xl:col-span-2' : 'xl:col-span-5'"
        >
          <h3 class="text-xl font-bold font-serif text-slate-900 mb-1">Composição</h3>
          <p class="text-sm text-slate-500 mb-2">
            <span class="inline-block w-2.5 h-2.5 rounded-sm bg-slate-900 mr-1"></span>proventos
            <span class="inline-block w-2.5 h-2.5 rounded-sm bg-rose-600 ml-3 mr-1"></span>descontos
          </p>
          <BaseChart :option="compositionOption" :height="compositionHeight" />
        </section>
      </div>

      <PeerComparison v-if="profile.pares && kpis" :pares="profile.pares" :bruto="kpis.bruto" />

      <HistoryTable
        v-if="profile.historico.length"
        :historico="profile.historico"
        :contexto-base="profile.contexto_base"
        :fonte="fonte"
      />

      <TseCandidaturas :candidaturas="profile.candidaturas_tse ?? []" />
      <ParticipacoesSocietarias :participacoes="profile.participacoes_societarias ?? []" />

      <OtherSources :matches="profile.outras_fontes" />
      <FederalSheet :ficha="profile.ficha_federal" />
    </template>
  </div>
</template>
