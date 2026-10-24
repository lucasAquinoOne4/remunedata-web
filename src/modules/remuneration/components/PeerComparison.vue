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
  <section class="card space-y-5">
    <div>
      <h3 class="section-title">Comparação com pares</h3>
      <p class="section-sub">
        {{ pares.criterio }}<template v-if="pares.cargo"> · {{ pares.cargo }}</template> ·
        {{ pares.n.toLocaleString('pt-BR') }} pessoas · {{ formatCompetence(pares.mes, pares.ano) }}
      </p>
    </div>

    <div class="space-y-2">
      <div class="relative h-2.5 rounded-full bg-slate-100">
        <div class="absolute inset-y-0 left-0 rounded-full bg-slate-300" :style="{ width: `${position}%` }"></div>
        <div
          class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-900 ring-4 ring-white shadow"
          :style="{ left: `${position}%` }"
          role="img"
          :aria-label="`Percentil ${Math.round(position)}`"
        ></div>
      </div>
      <div class="flex justify-between eyebrow">
        <span>Menor</span>
        <span>Percentil {{ Math.round(position) }}</span>
        <span>Maior</span>
      </div>
      <p class="text-sm font-semibold text-slate-900 pt-1">{{ percentilText(pares.percentil) }}</p>
    </div>

    <dl class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="rounded-xl bg-slate-900 text-white p-4 col-span-2 sm:col-span-1">
        <dt class="text-[11px] uppercase tracking-wider font-semibold text-slate-300">Esta pessoa</dt>
        <dd class="text-lg font-semibold mt-0.5">{{ formatCurrency(bruto) }}</dd>
      </div>
      <div v-for="s in stats" :key="s.label" class="rounded-xl bg-slate-50 border border-slate-100 p-4 last:col-span-2 sm:last:col-span-1">
        <dt class="eyebrow">{{ s.label }}</dt>
        <dd class="text-lg font-semibold text-slate-900 mt-0.5">{{ formatCurrency(s.value) }}</dd>
      </div>
    </dl>
  </section>
</template>
