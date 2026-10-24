<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import type { TseCandidatura } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'

defineProps<{ candidaturas: TseCandidatura[] }>()
</script>

<template>
  <section
    v-if="candidaturas.length"
    class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4"
    data-test="tse"
  >
    <div>
      <h3 class="text-xl font-bold font-serif text-slate-900">Candidaturas e patrimônio declarado</h3>
      <p class="text-sm text-slate-500">Dados abertos do TSE: declarações feitas pela própria pessoa ao se candidatar.</p>
    </div>

    <p class="flex items-start gap-2 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-3">
      <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
      <span>
        Cruzamento provável: nome idêntico e os mesmos 6 dígitos centrais do CPF. Não é confirmação de identidade.
        O patrimônio é o valor declarado na época e não representa a situação atual.
      </span>
    </p>

    <article v-for="c in candidaturas" :key="c.ano_eleicao" class="rounded-2xl border border-slate-100 p-4 space-y-3">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="space-y-0.5">
          <p class="font-bold text-slate-900">
            {{ c.ano_eleicao }} · {{ [c.cargo, c.uf].filter(Boolean).join(' · ') || 'Candidatura' }}
          </p>
          <p class="text-xs text-slate-500">
            {{ [c.partido, c.ocupacao, c.resultado || c.situacao].filter(Boolean).join(' · ') }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-[10px] uppercase tracking-widest font-black text-slate-400">Patrimônio declarado</p>
          <p class="text-xl font-bold text-slate-900" data-test="tse-patrimonio">
            {{ formatCurrency(c.patrimonio_declarado) }}
          </p>
        </div>
      </div>
      <ul v-if="c.bens.length" class="divide-y divide-slate-100 text-sm">
        <li v-for="b in c.bens" :key="b.tipo" class="flex justify-between gap-3 py-1.5">
          <span class="text-slate-600">{{ b.tipo }} <span class="text-slate-400">({{ b.quantidade }})</span></span>
          <span class="font-semibold text-slate-900 whitespace-nowrap">{{ formatCurrency(b.valor) }}</span>
        </li>
      </ul>
      <p v-else class="text-xs text-slate-400">Nenhum bem declarado.</p>
    </article>
  </section>
</template>
