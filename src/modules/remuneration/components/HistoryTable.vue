<script setup lang="ts">
import { computed } from 'vue'
import type { PersonHistoryEntry } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import { collectComponentKeys, componentLabel, isDiscount } from '../utils/componentes'

const props = defineProps<{ historico: PersonHistoryEntry[] }>()

const keys = computed(() => collectComponentKeys(props.historico))
// mais recente primeiro
const rows = computed(() => [...props.historico].reverse())
</script>

<template>
  <section class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
    <div class="p-6 pb-3">
      <h3 class="text-xl font-bold font-serif text-slate-900">Mês a mês</h3>
      <p class="text-sm text-slate-500">Todos os componentes informados pela fonte.</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-500">
            <th class="sticky left-0 bg-slate-50 px-4 py-3 text-left">Competência</th>
            <th class="px-4 py-3 text-right">Bruto</th>
            <th class="px-4 py-3 text-right">Líquido</th>
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
            <td class="px-4 py-2.5 text-right font-black text-slate-900 whitespace-nowrap">{{ formatCurrency(h.valor_liquido) }}</td>
            <td v-for="k in keys" :key="k" class="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
              <template v-if="h.componentes?.[k]">{{ formatCurrency(h.componentes[k]) }}</template>
              <span v-else class="text-slate-300">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
