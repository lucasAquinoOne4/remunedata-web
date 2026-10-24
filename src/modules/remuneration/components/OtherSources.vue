<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import type { OtherSourceMatch } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import FonteBadge from './FonteBadge.vue'

defineProps<{ matches: OtherSourceMatch[] }>()
</script>

<template>
  <section class="card-sub space-y-4">
    <div>
      <h3 class="section-title">Outras fontes</h3>
      <p class="section-sub">Registros em outras bases que podem ser da mesma pessoa.</p>
    </div>

    <p class="notice">
      <AlertTriangle />
      <span>
        Cruzamento probabilístico: "Provável" usa nome e os 6 dígitos visíveis do CPF; "Possível" usa apenas o
        nome. Pode haver homônimos — confira cargo e órgão antes de concluir que se trata da mesma pessoa.
      </span>
    </p>

    <p v-if="matches.length === 0" class="text-sm text-slate-500 py-3 text-center">
      Nenhum registro correspondente encontrado em outras fontes.
    </p>

    <ul v-else class="space-y-2">
      <li v-for="m in matches" :key="`${m.fonte}-${m.id}`">
        <RouterLink
          :to="{ name: 'person', params: { fonte: m.fonte, id: m.id } }"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-3 transition-colors"
        >
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <FonteBadge :fonte="m.fonte" />
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                :class="
                  m.confianca === 'provavel'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                "
              >
                {{ m.confianca === 'provavel' ? 'Provável' : 'Possível' }}
              </span>
            </div>
            <p class="font-semibold text-slate-900 break-words">{{ m.nome }}</p>
            <p class="text-xs text-slate-600">
              {{ [m.cargo, m.orgao].filter(Boolean).join(' · ') || 'Sem cargo/órgão informado' }}
            </p>
            <p v-if="m.motivo" class="text-xs text-slate-500">{{ m.motivo }}</p>
          </div>
          <div class="sm:text-right shrink-0">
            <p class="font-semibold text-slate-900">{{ formatCurrency(m.valor_bruto) }}</p>
            <p class="text-xs text-slate-500">{{ formatCompetence(m.mes, m.ano) }}</p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
