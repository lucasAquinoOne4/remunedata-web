<script setup lang="ts">
import { computed } from 'vue'
import type { PersonPeers } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import { clampPct, percentilText } from '../utils/profile'

const props = defineProps<{ pares: PersonPeers; bruto: number }>()

const position = computed(() => clampPct(props.pares.percentil))

/** Posição relativa de uma marca (mediana/p90) na escala do percentil não é conhecida; mostramos valores. */
const stats = computed(() => [
  { label: 'Mediana', value: props.pares.mediana_bruto },
  { label: 'Média', value: props.pares.media_bruto },
  { label: 'P90', value: props.pares.p90_bruto },
])
</script>

<template>
  <section class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
    <div>
      <h3 class="text-xl font-bold font-serif text-slate-900">Comparação com pares</h3>
      <p class="text-sm text-slate-500">
        {{ pares.criterio }}<template v-if="pares.cargo"> · {{ pares.cargo }}</template> ·
        {{ pares.n.toLocaleString('pt-BR') }} pessoas · {{ formatCompetence(pares.mes, pares.ano) }}
      </p>
    </div>

    <div class="space-y-2">
      <div class="relative h-3 rounded-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300">
        <div
          class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-900 ring-4 ring-white shadow"
          :style="{ left: `${position}%` }"
          role="img"
          :aria-label="`Percentil ${Math.round(position)}`"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span>Menor</span>
        <span>Percentil {{ Math.round(position) }}</span>
        <span>Maior</span>
      </div>
      <p class="text-sm font-semibold text-slate-800">{{ percentilText(pares.percentil) }}</p>
    </div>

    <dl class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="rounded-2xl bg-slate-900 text-white p-4">
        <dt class="text-[10px] uppercase tracking-widest font-black text-slate-400">Esta pessoa</dt>
        <dd class="text-lg font-bold">{{ formatCurrency(bruto) }}</dd>
      </div>
      <div v-for="s in stats" :key="s.label" class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
        <dt class="text-[10px] uppercase tracking-widest font-black text-slate-400">{{ s.label }}</dt>
        <dd class="text-lg font-bold text-slate-900">{{ formatCurrency(s.value) }}</dd>
      </div>
    </dl>
  </section>
</template>
