<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Users, TrendingUp, Wallet, RefreshCw, Zap, ArrowRight, BarChart3 } from 'lucide-vue-next'
import { FONTES, FONTE_LABEL, type Fonte } from '@/core/types/api'
import { useStats } from '../composables/useStats'
import { buildFaixasOption, buildMonthlyOption, buildTopOrgaosOption } from '../utils/statsCharts'
import { usePeriods } from '@/modules/remuneration/composables/usePeriods'
import { yearsFor } from '@/modules/remuneration/utils/search'
import { formatCurrency } from '@/core/formatters/currency'
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
// só fontes com competências carregadas (as três originais sempre aparecem)
const fontes = computed(() =>
  FONTES.filter((f) => ['DF', 'SENADO', 'FEDERAL'].includes(f) || (periodsQuery.data.value?.[f]?.length ?? 0) > 0),
)
const { data, isLoading, isFetching, isError } = useStats(fonte, ano, ready)

const loading = computed(() => isLoading.value || !ready.value)
const hasData = computed(() => (data.value?.total_servidores ?? 0) > 0 || (data.value?.mensal.length ?? 0) > 0)

const monthlyOption = computed(() => buildMonthlyOption(data.value?.mensal ?? []))
const orgaosOption = computed(() => buildTopOrgaosOption((data.value?.top_orgaos ?? []).slice(0, 10)))
const faixasOption = computed(() => buildFaixasOption(data.value?.faixas ?? []))
const orgaosHeight = computed(() => Math.max(220, Math.min(10, data.value?.top_orgaos.length ?? 0) * 36 + 16))

const kpis = computed(() => [
  {
    key: 'total',
    title: 'Total de servidores',
    icon: Users,
    skeleton: '60%',
    value: (data.value?.total_servidores ?? 0).toLocaleString('pt-BR'),
    note: `${FONTE_LABEL[fonte.value]}${ano.value ? ` · ${ano.value}` : ''}`,
  },
  {
    key: 'media',
    title: 'Média salarial',
    icon: TrendingUp,
    skeleton: '80%',
    value: formatCurrency(data.value?.media_bruto ?? 0),
    note: 'Remuneração bruta média',
  },
  {
    key: 'gasto',
    title: 'Gasto total bruto',
    icon: Wallet,
    skeleton: '90%',
    value: formatCurrency(data.value?.total_bruto ?? 0),
    note: 'Soma das remunerações brutas no período',
  },
])

const charts = computed(() => [
  { key: 'mensal', title: 'Evolução mensal', subtitle: 'Total bruto (barras) e média bruta (linha)', option: monthlyOption.value, show: (data.value?.mensal.length ?? 0) > 0, height: '300px', span: 'xl:col-span-2' },
  { key: 'orgaos', title: 'Top órgãos', subtitle: 'Maior contingente de registros', option: orgaosOption.value, show: (data.value?.top_orgaos.length ?? 0) > 0, height: `${orgaosHeight.value}px`, span: '' },
  { key: 'faixas', title: 'Faixas salariais', subtitle: 'Distribuição de registros por faixa de remuneração bruta', option: faixasOption.value, show: (data.value?.faixas.length ?? 0) > 0, height: '300px', span: '' },
])
</script>

<template>
  <div class="space-y-6 pb-10">
    <!-- Cabeçalho -->
    <div class="space-y-4">
      <div class="space-y-1.5">
        <h2 class="page-title">Visão Geral</h2>
        <p class="page-lead">Panorama das remunerações por fonte e ano.</p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div
          class="flex gap-1 p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto min-w-0"
          role="tablist"
          aria-label="Fonte"
        >
          <button
            v-for="f in fontes"
            :key="f"
            type="button"
            role="tab"
            :aria-selected="fonte === f"
            class="shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors"
            :class="fonte === f ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'"
            @click="fonte = f"
          >
            {{ FONTE_LABEL[f] }}
          </button>
        </div>
        <div class="flex items-center gap-3">
          <select
            :value="ano ?? ''"
            :disabled="years.length === 0"
            aria-label="Ano"
            class="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-900/5 disabled:opacity-50"
            @change="chosenAno = Number(($event.target as HTMLSelectElement).value) || null"
          >
            <option v-if="years.length === 0" value="">Ano</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <RefreshCw v-if="isFetching && !isLoading" class="w-4 h-4 animate-spin text-slate-400" />
        </div>
      </div>
    </div>

    <!-- Upgrade CTA Banner -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div
        v-if="!subStore.isPremium"
        class="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <p class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              <Zap class="w-3 h-3 fill-current" />
              Acesso gratuito
            </p>
            <h3 class="font-serif text-xl font-semibold tracking-tight">Libere o poder total do RemuneData</h3>
            <p class="text-slate-300 max-w-xl text-sm leading-relaxed">
              Você está vendo o dashboard resumido. Assine um plano para desbloquear a consulta pública, filtros por cargo/órgão e detalhes de servidores.
            </p>
          </div>
          <RouterLink to="/subscriptions/plans" class="shrink-0">
            <BaseButton class="bg-white text-slate-900 border-none px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
              Ver planos disponíveis
              <ArrowRight class="w-4 h-4" />
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </Transition>

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="k in kpis" :key="k.key" class="card">
        <div class="flex items-center justify-between gap-3">
          <p class="eyebrow">{{ k.title }}</p>
          <component :is="k.icon" class="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        </div>
        <BaseSkeleton v-if="loading" height="32px" :width="k.skeleton" class="mt-2" />
        <p v-else class="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mt-1.5 break-words">{{ k.value }}</p>
        <p class="text-xs text-slate-600 mt-1">{{ k.note }}</p>
      </div>
    </div>

    <div v-if="isError && !data" class="py-14 text-center border border-dashed border-slate-300 rounded-2xl bg-white">
      <p class="text-red-700 font-semibold">Falha ao carregar as estatísticas</p>
      <p class="text-sm text-slate-600">Tente novamente em instantes.</p>
    </div>
    <div
      v-else-if="!loading && !hasData"
      class="py-14 text-center border border-dashed border-slate-300 rounded-2xl bg-white"
    >
      <BarChart3 class="w-8 h-8 mx-auto text-slate-300 mb-2" />
      <p class="font-semibold text-slate-800">Ainda não há estatísticas para esta fonte/ano.</p>
      <p class="text-sm text-slate-600">Escolha outra fonte ou aguarde a próxima carga de dados.</p>
    </div>

    <!-- Gráficos: cada cartão carrega e falha de forma independente -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <section v-for="c in charts" :key="c.key" class="card" :class="c.span">
        <h3 class="section-title">{{ c.title }}</h3>
        <p class="section-sub mb-4">{{ c.subtitle }}</p>
        <div v-if="loading" class="space-y-3 py-4">
          <BaseSkeleton v-for="i in 5" :key="i" height="24px" :width="`${100 - i * 12}%`" />
        </div>
        <BaseChart v-else-if="c.show" :option="c.option" :height="c.height" />
        <p v-else class="py-10 text-center text-sm text-slate-500">Sem dados para este gráfico.</p>
      </section>
    </div>
  </div>
</template>
