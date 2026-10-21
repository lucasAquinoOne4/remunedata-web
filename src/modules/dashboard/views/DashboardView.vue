<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Users, TrendingUp, Wallet, RefreshCw, Zap, ArrowRight, BarChart3 } from 'lucide-vue-next'
import { FONTES, FONTE_LABEL, type Fonte } from '@/core/types/api'
import { useStats } from '../composables/useStats'
import { buildFaixasOption, buildMonthlyOption, buildTopOrgaosOption } from '../utils/statsCharts'
import { usePeriods } from '@/modules/remuneration/composables/usePeriods'
import { yearsFor } from '@/modules/remuneration/utils/search'
import { formatCurrency } from '@/core/formatters/currency'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseChart from '@/shared/ui/BaseChart.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useSubscriptionStore } from '@/modules/subscriptions/store/subscriptionStore'

const subStore = useSubscriptionStore()

const fonte = ref<Fonte>('DF')
const chosenAno = ref<number | null>(null)

const periodsQuery = usePeriods()
const years = computed(() => yearsFor(periodsQuery.data.value, fonte.value))
// ano efetivo: o escolhido ou o mais recente carregado para a fonte
const ano = computed<number | null>(() => chosenAno.value ?? years.value[0] ?? null)

watch(fonte, () => {
  chosenAno.value = null
})

const ready = computed(() => periodsQuery.isFetched.value)
const { data, isLoading, isFetching, isError } = useStats(fonte, ano, ready)

const loading = computed(() => isLoading.value || !ready.value)
const hasData = computed(() => (data.value?.total_servidores ?? 0) > 0 || (data.value?.mensal.length ?? 0) > 0)

const monthlyOption = computed(() => buildMonthlyOption(data.value?.mensal ?? []))
const orgaosOption = computed(() => buildTopOrgaosOption((data.value?.top_orgaos ?? []).slice(0, 10)))
const faixasOption = computed(() => buildFaixasOption(data.value?.faixas ?? []))
const orgaosHeight = computed(() => Math.max(220, Math.min(10, data.value?.top_orgaos.length ?? 0) * 36 + 16))

const charts = computed(() => [
  { key: 'mensal', title: 'Evolução mensal', subtitle: 'Total bruto (barras) e média bruta (linha)', option: monthlyOption.value, show: (data.value?.mensal.length ?? 0) > 0, height: '320px', span: 'xl:col-span-2' },
  { key: 'orgaos', title: 'Top órgãos', subtitle: 'Maior contingente de registros', option: orgaosOption.value, show: (data.value?.top_orgaos.length ?? 0) > 0, height: `${orgaosHeight.value}px`, span: '' },
  { key: 'faixas', title: 'Faixas salariais', subtitle: 'Distribuição de registros por faixa de remuneração bruta', option: faixasOption.value, show: (data.value?.faixas.length ?? 0) > 0, height: '300px', span: '' },
])
</script>

<template>
  <div class="space-y-8 pb-10">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-4xl font-bold text-slate-900 font-serif tracking-tight">Visão Geral</h2>
        <p class="text-slate-500 font-medium">Panorama das remunerações por fonte e ano.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm" role="tablist" aria-label="Fonte">
          <button
            v-for="f in FONTES"
            :key="f"
            type="button"
            role="tab"
            :aria-selected="fonte === f"
            class="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
            :class="fonte === f ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-50'"
            @click="fonte = f"
          >
            {{ FONTE_LABEL[f] }}
          </button>
        </div>
        <select
          :value="ano ?? ''"
          :disabled="years.length === 0"
          aria-label="Ano"
          class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50"
          @change="chosenAno = Number(($event.target as HTMLSelectElement).value) || null"
        >
          <option v-if="years.length === 0" value="">Ano</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <RefreshCw v-if="isFetching && !isLoading" class="w-4 h-4 animate-spin text-slate-400" />
      </div>
    </div>

    <!-- Upgrade CTA Banner -->
    <Transition
      enter-active-class="transition duration-700 ease-out"
      enter-from-class="transform -translate-y-8 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-500 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-8 opacity-0"
    >
      <div 
        v-if="!subStore.isPremium"
        class="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700"
      >
        <div class="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2 text-center md:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-[10px] font-black uppercase tracking-widest border border-slate-700">
              <Zap class="w-3 h-3 text-white fill-current" />
              Acesso Gratuito
            </div>
            <h3 class="text-2xl font-bold font-serif tracking-tight">Libere o poder total do RemuneData</h3>
            <p class="text-slate-400 max-w-lg text-sm font-medium">
              Você está vendo o dashboard resumido. Assine um plano para desbloquear a consulta pública, filtros por cargo/órgão e detalhes de servidores.
            </p>
          </div>
          <RouterLink to="/subscriptions/plans">
            <BaseButton class="bg-white text-slate-900 border-none px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
              Ver Planos Disponíveis
              <ArrowRight class="w-4 h-4" />
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </Transition>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BaseCard title="Total de Servidores" :icon="Users">
        <BaseSkeleton v-if="loading" height="32px" width="60%" class="mt-1" />
        <p v-else class="text-3xl font-bold text-slate-900 mt-1">
          {{ (data?.total_servidores ?? 0).toLocaleString('pt-BR') }}
        </p>
        <template #footer>
          <p class="text-xs text-slate-500">{{ FONTE_LABEL[fonte] }}<template v-if="ano"> · {{ ano }}</template></p>
        </template>
      </BaseCard>

      <BaseCard title="Média Salarial" :icon="TrendingUp">
        <BaseSkeleton v-if="loading" height="32px" width="80%" class="mt-1" />
        <p v-else class="text-3xl font-bold text-slate-900 mt-1">{{ formatCurrency(data?.media_bruto ?? 0) }}</p>
        <template #footer>
          <p class="text-xs text-slate-400 font-bold italic">Remuneração bruta média</p>
        </template>
      </BaseCard>

      <BaseCard title="Gasto Total Bruto" :icon="Wallet">
        <BaseSkeleton v-if="loading" height="32px" width="90%" class="mt-1" />
        <p v-else class="text-3xl font-bold text-slate-900 mt-1">{{ formatCurrency(data?.total_bruto ?? 0) }}</p>
        <template #footer>
          <p class="text-xs text-slate-500">Soma das remunerações brutas no período</p>
        </template>
      </BaseCard>
    </div>

    <div v-if="isError && !data" class="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
      <p class="text-red-500 font-bold">Falha ao carregar as estatísticas</p>
      <p class="text-sm text-slate-400">Tente novamente em instantes.</p>
    </div>
    <div
      v-else-if="!loading && !hasData"
      class="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white"
    >
      <BarChart3 class="w-8 h-8 mx-auto text-slate-300 mb-2" />
      <p class="font-bold text-slate-700">Ainda não há estatísticas para esta fonte/ano.</p>
      <p class="text-sm text-slate-400">Escolha outra fonte ou aguarde a próxima carga de dados.</p>
    </div>

    <!-- Gráficos: cada cartão carrega e falha de forma independente -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <section
        v-for="c in charts"
        :key="c.key"
        class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm"
        :class="c.span"
      >
        <h3 class="text-2xl font-bold text-slate-900 font-serif">{{ c.title }}</h3>
        <p class="text-sm text-slate-500 font-medium mb-6">{{ c.subtitle }}</p>
        <div v-if="loading" class="space-y-3 py-4">
          <BaseSkeleton v-for="i in 5" :key="i" height="24px" :width="`${100 - i * 12}%`" />
        </div>
        <BaseChart v-else-if="c.show" :option="c.option" :height="c.height" />
        <p v-else class="py-10 text-center text-sm text-slate-400">Sem dados para este gráfico.</p>
      </section>
    </div>
  </div>
</template>
