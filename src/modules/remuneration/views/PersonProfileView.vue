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
  <div class="space-y-5 pb-10">
    <div class="flex items-center justify-between gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg -ml-1 px-1 py-1"
        @click="goBack"
      >
        <ArrowLeft class="w-4 h-4" /> Voltar à busca
      </button>
      <BaseButton
        v-if="profile && profile.historico.length"
        variant="outline"
        class="gap-2 text-xs font-semibold rounded-xl"
        @click="exportCsv"
      >
        <FileDown class="w-4 h-4" /> <span class="hidden sm:inline">Exportar histórico (CSV)</span><span class="sm:hidden">CSV</span>
      </BaseButton>
    </div>

    <!-- Carregando -->
    <div v-if="isLoading" class="space-y-5" aria-busy="true">
      <BaseSkeleton height="160px" rounded="rounded-2xl" />
      <BaseSkeleton height="110px" rounded="rounded-2xl" />
      <BaseSkeleton height="320px" rounded="rounded-2xl" />
    </div>

    <!-- Indisponível / erro -->
    <div
      v-else-if="isError || !profile"
      class="card p-12 text-center space-y-2"
    >
      <UserX class="w-10 h-10 mx-auto text-slate-300" />
      <h2 class="section-title">Perfil indisponível</h2>
      <p class="text-sm text-slate-600">
        {{ isError ? 'Não foi possível carregar este perfil agora.' : 'Ainda não há dados de perfil para esta pessoa.' }}
      </p>
    </div>

    <template v-else>
      <PersonHeader :fonte="fonte" :nome="nome" :identidade="profile.identidade" />

      <!-- KPIs: um bloco só, o bruto em destaque -->
      <section
        v-if="kpis && ultimo"
        class="card p-0 grid grid-cols-2 md:grid-cols-3 overflow-hidden"
        aria-label="Remuneração do último mês"
      >
        <div class="col-span-2 md:col-span-1 p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-100">
          <p class="eyebrow">Bruto · {{ formatCompetence(ultimo.mes, ultimo.ano) }}</p>
          <p class="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mt-1.5">{{ formatCurrency(kpis.bruto) }}</p>
        </div>
        <div class="p-4 sm:p-6 border-r border-slate-100">
          <p class="eyebrow">Líquido</p>
          <p class="text-xl sm:text-3xl font-semibold tracking-tight text-slate-900 mt-1.5">{{ semLiquido(fonte) ? 'Não informado' : formatCurrency(kpis.liquido) }}</p>
        </div>
        <div class="p-4 sm:p-6 md:border-l md:border-slate-100">
          <p class="eyebrow">Descontos</p>
          <template v-if="semLiquido(fonte)">
            <p class="text-xl sm:text-3xl font-semibold tracking-tight text-slate-900 mt-1.5">Não informado</p>
            <p class="text-xs text-slate-600 mt-1">A fonte publica apenas o valor bruto.</p>
          </template>
          <template v-else>
            <p class="text-xl sm:text-3xl font-semibold tracking-tight text-slate-900 mt-1.5">
              {{ kpis.descontosPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}%
            </p>
            <p class="text-xs text-slate-600 mt-1">{{ formatCurrency(kpis.descontos) }} no mês</p>
          </template>
        </div>
      </section>
      <p v-else class="text-sm text-slate-500 text-center">Sem valores de remuneração para este perfil.</p>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <section
          v-if="profile.historico.length > 0"
          class="card lg:col-span-3"
        >
          <h3 class="section-title">Evolução</h3>
          <p class="section-sub mb-4">
            {{ semLiquido(fonte) ? 'Remuneração bruta mês a mês.' : 'Remuneração bruta x líquida mês a mês.' }}
          </p>
          <BaseChart :option="evolutionOption" height="300px" />
        </section>
        <section
          v-if="hasComponents"
          class="card"
          :class="profile.historico.length > 0 ? 'lg:col-span-2' : 'lg:col-span-5'"
        >
          <h3 class="section-title">Composição</h3>
          <p class="section-sub mb-3 flex items-center gap-x-4">
            <span class="inline-flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-slate-900"></span>proventos</span>
            <span class="inline-flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-rose-600"></span>descontos</span>
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

      <!-- Cruzamentos com outras bases: secundários, com avisos próprios -->
      <section class="space-y-4 pt-4" aria-labelledby="cruzamentos-titulo">
        <div>
          <h2 id="cruzamentos-titulo" class="eyebrow">Cruzamentos com outras bases</h2>
          <p class="text-sm text-slate-600 mt-1 max-w-3xl">
            Registros ligados a esta pessoa por nome e dígitos parciais do CPF. São indícios, não confirmação de identidade.
          </p>
        </div>
        <TseCandidaturas :candidaturas="profile.candidaturas_tse ?? []" />
        <ParticipacoesSocietarias :participacoes="profile.participacoes_societarias ?? []" />
        <OtherSources :matches="profile.outras_fontes" />
      </section>

      <FederalSheet :ficha="profile.ficha_federal" />
    </template>
  </div>
</template>
