<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import type { TseCandidatura } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'

defineProps<{ candidaturas: TseCandidatura[] }>()
</script>

<template>
  <section v-if="candidaturas.length" class="card-sub space-y-4" data-test="tse">
    <div>
      <h3 class="section-title">Candidaturas e patrimônio declarado</h3>
      <p class="section-sub">Dados abertos do TSE: declarações feitas pela própria pessoa ao se candidatar.</p>
    </div>

    <p class="notice">
      <AlertTriangle />
      <span>
        Cruzamento provável: nome idêntico e os mesmos 6 dígitos centrais do CPF. Não é confirmação de identidade.
        O patrimônio é o valor declarado na época e não representa a situação atual.
      </span>
    </p>

    <article v-for="c in candidaturas" :key="c.ano_eleicao" class="rounded-xl bg-white border border-slate-200 p-4 space-y-3">
      <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div class="space-y-0.5 min-w-0">
          <p class="font-semibold text-slate-900">
            {{ c.ano_eleicao }} · {{ [c.cargo, c.uf].filter(Boolean).join(' · ') || 'Candidatura' }}
          </p>
          <p class="text-xs text-slate-600">
            {{ [c.partido, c.ocupacao, c.resultado || c.situacao].filter(Boolean).join(' · ') }}
          </p>
        </div>
        <div class="sm:text-right">
          <p class="eyebrow">Patrimônio declarado</p>
          <p class="text-lg font-semibold text-slate-900" data-test="tse-patrimonio">
            {{ formatCurrency(c.patrimonio_declarado) }}
          </p>
        </div>
      </div>
      <ul v-if="c.bens.length" class="divide-y divide-slate-100 text-sm border-t border-slate-100">
        <li v-for="b in c.bens" :key="b.tipo" class="flex justify-between gap-3 py-2">
          <span class="text-slate-700">{{ b.tipo }} <span class="text-slate-500">({{ b.quantidade }})</span></span>
          <span class="font-medium text-slate-900 whitespace-nowrap">{{ formatCurrency(b.valor) }}</span>
        </li>
      </ul>
      <p v-else class="text-xs text-slate-500">Nenhum bem declarado.</p>
    </article>
  </section>
</template>
