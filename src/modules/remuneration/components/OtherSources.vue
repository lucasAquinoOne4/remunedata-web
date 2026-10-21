<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import type { OtherSourceMatch } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import FonteBadge from './FonteBadge.vue'

defineProps<{ matches: OtherSourceMatch[] }>()
</script>

<template>
  <section class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
    <div>
      <h3 class="text-xl font-bold font-serif text-slate-900">Outras fontes</h3>
      <p class="text-sm text-slate-500">Registros em outras bases que podem ser da mesma pessoa.</p>
    </div>

    <p class="flex items-start gap-2 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-3">
      <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
      <span>
        Cruzamento probabilístico: "Provável" usa nome e os 6 dígitos visíveis do CPF; "Possível" usa apenas o
        nome. Pode haver homônimos — confira cargo e órgão antes de concluir que se trata da mesma pessoa.
      </span>
    </p>

    <p v-if="matches.length === 0" class="text-sm text-slate-400 py-4 text-center">
      Nenhum registro correspondente encontrado em outras fontes.
    </p>

    <ul v-else class="divide-y divide-slate-100">
      <li v-for="m in matches" :key="`${m.fonte}-${m.id}`" class="py-3">
        <RouterLink
          :to="{ name: 'person', params: { fonte: m.fonte, id: m.id } }"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl hover:bg-slate-50 -mx-2 px-2 py-1"
        >
          <div class="min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <FonteBadge :fonte="m.fonte" />
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                :class="
                  m.confianca === 'provavel'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                "
              >
                {{ m.confianca === 'provavel' ? 'Provável' : 'Possível' }}
              </span>
            </div>
            <p class="font-bold text-slate-900 truncate">{{ m.nome }}</p>
            <p class="text-xs text-slate-500">
              {{ [m.cargo, m.orgao].filter(Boolean).join(' · ') || 'Sem cargo/órgão informado' }}
            </p>
            <p v-if="m.motivo" class="text-[11px] text-slate-400">{{ m.motivo }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="font-bold text-slate-900">{{ formatCurrency(m.valor_bruto) }}</p>
            <p class="text-[11px] text-slate-400">{{ formatCompetence(m.mes, m.ano) }}</p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
