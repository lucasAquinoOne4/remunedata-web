<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { semLiquido, type ContextoBase, type Fonte, type PersonHistoryEntry } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import { collectComponentKeys, componentLabel, isDiscount } from '../utils/componentes'

const props = defineProps<{
  historico: PersonHistoryEntry[]
  contextoBase?: ContextoBase | null
  fonte?: Fonte
}>()
const semLiq = computed(() => semLiquido(props.fonte))

const ALL = 'todos'

// anos disponíveis, do mais recente para o mais antigo
const years = computed(() =>
  [...new Set(props.historico.map((h) => h.ano))].sort((a, b) => b - a),
)
const selected = ref<number | typeof ALL>(years.value[0] ?? ALL)

// se o histórico mudar (outra pessoa), volta para o ano mais recente
watch(years, (list) => {
  if (selected.value !== ALL && !list.includes(selected.value)) selected.value = list[0] ?? ALL
})

// mais recente primeiro, só do ano escolhido
const rows = computed(() =>
  [...props.historico]
    .filter((h) => selected.value === ALL || h.ano === selected.value)
    .reverse(),
)
// contexto econômico só aparece quando algum mês do ano escolhido tem os índices
const hasContext = computed(() => rows.value.some((h) => h.contexto && h.contexto.bruto_real != null))
const referenciaLabel = computed(() => {
  const ref = props.contextoBase?.referencia
  if (!ref) return ''
  const [ano, mes] = ref.split('-')
  return formatCompetence(mes, Number(ano))
})

// só as colunas que têm valor no ano escolhido
const keys = computed(() => collectComponentKeys(rows.value))

const countByYear = computed(() => {
  const counts = new Map<number, number>()
  for (const h of props.historico) counts.set(h.ano, (counts.get(h.ano) ?? 0) + 1)
  return counts
})

const yearIndex = computed(() =>
  selected.value === ALL ? -1 : years.value.indexOf(selected.value as number),
)
const canNewer = computed(() => yearIndex.value > 0)
const canOlder = computed(() => yearIndex.value >= 0 && yearIndex.value < years.value.length - 1)
function go(step: -1 | 1) {
  const next = years.value[yearIndex.value + step]
  if (next !== undefined) selected.value = next
}

const summary = computed(() => {
  const list = rows.value
  if (!list.length) return null
  const total = list.reduce((acc, h) => acc + h.valor_bruto, 0)
  const liquido = list.reduce((acc, h) => acc + h.valor_liquido, 0)
  return { meses: list.length, mediaBruto: total / list.length, totalBruto: total, totalLiquido: liquido }
})
</script>

<template>
  <section class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    <div class="p-6 pb-3 space-y-3">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 class="text-xl font-bold font-serif text-slate-900">Mês a mês</h3>
          <p class="text-sm text-slate-500">Todos os componentes informados pela fonte.</p>
        </div>
        <nav v-if="years.length > 1" class="flex flex-wrap items-center gap-1.5" aria-label="Paginação por anos">
          <button
            type="button"
            class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            :disabled="!canNewer"
            aria-label="Ano mais recente"
            @click="go(-1)"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            v-for="y in years"
            :key="y"
            type="button"
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors"
            :class="
              selected === y
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            "
            :aria-current="selected === y ? 'true' : undefined"
            :title="`${countByYear.get(y)} competências`"
            @click="selected = y"
          >
            {{ y }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors"
            :class="
              selected === ALL
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            "
            @click="selected = ALL"
          >
            Todos
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            :disabled="!canOlder"
            aria-label="Ano mais antigo"
            @click="go(1)"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </nav>
      </div>
      <p v-if="summary" class="text-xs text-slate-500" data-test="resumo-ano">
        {{ summary.meses }} {{ summary.meses === 1 ? 'competência' : 'competências' }} ·
        média bruta {{ formatCurrency(summary.mediaBruto) }} ·
        total bruto {{ formatCurrency(summary.totalBruto) }}<template v-if="!semLiq"> ·
        total líquido {{ formatCurrency(summary.totalLiquido) }}</template>
      </p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-500">
            <th class="sticky left-0 bg-slate-50 px-4 py-3 text-left">Competência</th>
            <th class="px-4 py-3 text-right">Bruto</th>
            <th class="px-4 py-3 text-right">Líquido</th>
            <template v-if="hasContext">
              <th class="px-4 py-3 text-right whitespace-nowrap text-sky-600" :title="contextoBase?.inflacao">
                Bruto em R$ de {{ referenciaLabel }}
              </th>
              <th class="px-4 py-3 text-right whitespace-nowrap text-sky-600" :title="contextoBase?.salario_minimo">
                Salários mín.
              </th>
              <th class="px-4 py-3 text-right whitespace-nowrap text-sky-600" :title="contextoBase?.teto">
                % do teto
              </th>
            </template>
            <th
              v-for="k in keys"
              :key="k"
              class="px-4 py-3 text-right whitespace-nowrap"
              :class="isDiscount(k) ? 'text-rose-500' : ''"
            >
              {{ componentLabel(k) }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="h in rows" :key="`${h.ano}-${h.mes}`" class="hover:bg-slate-50/70">
            <td class="sticky left-0 bg-white px-4 py-2.5 font-mono text-xs text-slate-600 whitespace-nowrap">
              {{ formatCompetence(h.mes, h.ano) }}
            </td>
            <td class="px-4 py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">{{ formatCurrency(h.valor_bruto) }}</td>
            <td class="px-4 py-2.5 text-right font-black text-slate-900 whitespace-nowrap">{{ semLiq ? 'não informado' : formatCurrency(h.valor_liquido) }}</td>
            <template v-if="hasContext">
              <td class="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap" data-test="ctx-real">
                <template v-if="h.contexto?.bruto_real != null">{{ formatCurrency(h.contexto.bruto_real) }}</template>
                <span v-else class="text-slate-300">—</span>
              </td>
              <td class="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap" data-test="ctx-sm">
                <template v-if="h.contexto?.salarios_minimos != null">
                  {{ h.contexto.salarios_minimos.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}
                </template>
                <span v-else class="text-slate-300">—</span>
              </td>
              <td class="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap" data-test="ctx-teto">
                <template v-if="h.contexto?.pct_teto != null">
                  {{ h.contexto.pct_teto.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}%
                </template>
                <span v-else class="text-slate-300">—</span>
              </td>
            </template>
            <td v-for="k in keys" :key="k" class="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
              <template v-if="h.componentes?.[k]">{{ formatCurrency(h.componentes[k]) }}</template>
              <span v-else class="text-slate-300">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="hasContext && contextoBase" class="px-6 py-3 text-[11px] text-slate-400 border-t border-slate-100" data-test="ctx-nota">
      {{ contextoBase.teto }}
    </p>
  </section>
</template>
