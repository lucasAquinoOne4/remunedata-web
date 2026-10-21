<script setup lang="ts">
import type { RemunerationItem } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import { personRoute } from '../utils/search'
import FonteBadge from './FonteBadge.vue'
import HighlightedText from './HighlightedText.vue'

defineProps<{
  items: RemunerationItem[]
  term: string
  showFonte?: boolean
}>()
</script>

<template>
  <div>
    <!-- Desktop: tabela -->
    <div class="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50/70 border-b border-slate-100">
          <tr class="text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th class="px-5 py-3">Servidor</th>
            <th class="px-5 py-3 hidden lg:table-cell">Órgão</th>
            <th class="px-5 py-3">Cargo</th>
            <th class="px-5 py-3">Ref.</th>
            <th class="px-5 py-3 text-right">Bruto</th>
            <th class="px-5 py-3 text-right">Líquido</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in items" :key="`${item.fonte}-${item.id}`" class="hover:bg-slate-50/70 transition-colors">
            <td class="px-5 py-3.5 max-w-[280px]">
              <RouterLink
                :to="personRoute(item)"
                class="font-bold text-slate-900 hover:underline decoration-slate-300 underline-offset-4"
              >
                <HighlightedText :text="item.nome_servidor" :term="term" />
              </RouterLink>
              <div v-if="showFonte" class="mt-1"><FonteBadge :fonte="item.fonte" short /></div>
            </td>
            <td class="px-5 py-3.5 hidden lg:table-cell text-sm text-slate-600 max-w-[240px]">
              <span class="line-clamp-2" :title="item.nome_orgao || undefined">{{ item.nome_orgao || '—' }}</span>
            </td>
            <td class="px-5 py-3.5 text-sm text-slate-600 max-w-[220px]">
              <span class="line-clamp-2" :title="item.cargo || undefined">{{ item.cargo || '—' }}</span>
            </td>
            <td class="px-5 py-3.5">
              <span class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 whitespace-nowrap">
                {{ formatCompetence(item.mes_referencia, item.ano_exercicio) }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
              {{ formatCurrency(item.valor_bruto) }}
            </td>
            <td class="px-5 py-3.5 text-right font-black text-slate-900 whitespace-nowrap">
              {{ formatCurrency(item.valor_liquido) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile: cards -->
    <ul class="md:hidden space-y-3">
      <li v-for="item in items" :key="`${item.fonte}-${item.id}`">
        <RouterLink
          :to="personRoute(item)"
          class="block bg-white rounded-2xl border border-slate-200 p-4 shadow-sm active:bg-slate-50"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="font-bold text-slate-900 leading-snug">
              <HighlightedText :text="item.nome_servidor" :term="term" />
            </p>
            <FonteBadge v-if="showFonte" :fonte="item.fonte" short />
          </div>
          <p v-if="item.cargo" class="text-sm text-slate-600 mt-1">{{ item.cargo }}</p>
          <p v-if="item.nome_orgao" class="text-xs text-slate-400 mt-0.5">{{ item.nome_orgao }}</p>
          <div class="mt-3 flex items-end justify-between">
            <span class="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-600">
              {{ formatCompetence(item.mes_referencia, item.ano_exercicio) }}
            </span>
            <div class="text-right">
              <p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Bruto / Líquido</p>
              <p class="text-sm text-slate-900">
                <span class="font-bold">{{ formatCurrency(item.valor_bruto) }}</span>
                <span class="text-slate-300 mx-1">/</span>
                <span class="font-black">{{ formatCurrency(item.valor_liquido) }}</span>
              </p>
            </div>
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
