<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { Database, Loader2, Play, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-vue-next'
import { FONTE_LABEL, type Fonte, type LoadSource, type PeriodRef } from '@/core/types/api'
import { useLoads, useTriggerLoad } from '../composables/useLoads'
import { groupMonthsByYear, isValidPeriod, suggestNextPeriod } from '../utils/loads'
import { MESES } from '@/modules/remuneration/utils/search'
import ExecutionsPanel from '@/modules/executions/components/ExecutionsPanel.vue'

const { data, isLoading, isError, error, refetch, isFetching } = useLoads()
const trigger = useTriggerLoad()

const missing = computed(
  () => isError.value && isAxiosError(error.value) && [404, 501].includes(error.value.response?.status ?? 0),
)

interface Form {
  ano: number
  mes: string
}
const forms = reactive<Record<string, Form>>({})
const pending = ref<Fonte | null>(null)
const feedback = reactive<Record<string, { ok: boolean; text: string }>>({})

// Inicializa o formulário de cada fonte (fora do render) com o próximo período sugerido
watch(
  () => data.value?.fontes,
  (fontes) => {
    for (const source of fontes ?? []) {
      if (!forms[source.fonte]) {
        const next: PeriodRef = suggestNextPeriod(source.ultimo)
        forms[source.fonte] = { ano: next.ano, mes: next.mes }
      }
    }
  },
  { immediate: true },
)

function formFor(source: LoadSource): Form {
  return forms[source.fonte] ?? { ano: new Date().getFullYear(), mes: '01' }
}

function ask(source: LoadSource) {
  const f = formFor(source)
  if (!isValidPeriod(f.ano, f.mes)) {
    feedback[source.fonte] = { ok: false, text: 'Informe um ano (2000–2100) e um mês válidos.' }
    return
  }
  delete feedback[source.fonte]
  pending.value = source.fonte
}

async function confirm(source: LoadSource) {
  const f = formFor(source)
  pending.value = null
  try {
    const res = await trigger.mutateAsync({ fonte: source.fonte, ano: f.ano, mes: f.mes })
    feedback[source.fonte] =
      res.status === 'queued'
        ? { ok: true, text: `Carga ${f.mes}/${f.ano} enfileirada (tarefa ${res.task_id}).` }
        : { ok: false, text: res.detalhe || 'Carga ignorada: já existe uma execução ou o período já foi carregado.' }
  } catch (e) {
    const status = isAxiosError(e) ? e.response?.status : undefined
    feedback[source.fonte] = {
      ok: false,
      text: status === 404 || status === 501 ? 'Este endpoint de carga ainda não está disponível no backend.' : 'Falha ao disparar a carga.',
    }
  }
}

const num = (n: number) => n.toLocaleString('pt-BR')
</script>

<template>
  <div class="space-y-8 pb-10">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Database class="w-7 h-7 text-blue-400" /> Carga de dados
        </h1>
        <p class="text-slate-400 font-medium mt-1">
          Situação das bases por fonte e disparo manual de cargas mensais.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
        @click="refetch()"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isFetching }" /> Atualizar
      </button>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-72 rounded-3xl bg-white/5 animate-pulse"></div>
    </div>

    <div v-else-if="missing" class="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
      O endpoint de cargas ainda não está disponível no backend. Os dados aparecerão aqui assim que ele for publicado.
    </div>
    <div v-else-if="isError" class="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
      Não foi possível carregar o estado das cargas.
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <section
        v-for="source in data?.fontes ?? []"
        :key="source.fonte"
        class="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-5"
      >
        <header class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-black text-white">{{ FONTE_LABEL[source.fonte] ?? source.fonte }}</h2>
            <p class="text-xs text-slate-500 font-mono">{{ source.fonte }}</p>
          </div>
          <span
            v-if="source.em_execucao"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30"
          >
            <Loader2 class="w-3 h-3 animate-spin" /> Em execução
          </span>
          <span
            v-else
            class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
          >
            Ocioso
          </span>
        </header>

        <dl class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-black/20 p-3">
            <dt class="text-[10px] uppercase tracking-widest font-black text-slate-500">Registros</dt>
            <dd class="text-xl font-bold text-white">{{ num(source.total_registros) }}</dd>
          </div>
          <div class="rounded-2xl bg-black/20 p-3">
            <dt class="text-[10px] uppercase tracking-widest font-black text-slate-500">Último mês</dt>
            <dd class="text-xl font-bold text-white">
              {{ source.ultimo ? `${source.ultimo.mes}/${source.ultimo.ano}` : '—' }}
            </dd>
          </div>
        </dl>

        <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
          <p v-if="source.meses.length === 0" class="text-sm text-slate-500">Nenhum mês carregado.</p>
          <div v-for="g in groupMonthsByYear(source.meses)" :key="g.ano">
            <p class="text-xs font-bold text-slate-400 mb-1">
              {{ g.ano }} <span class="text-slate-600">· {{ num(g.registros) }} registros</span>
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="m in g.meses"
                :key="m.mes"
                class="px-2 py-0.5 rounded-md text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                :title="`${num(m.registros)} registros`"
              >
                {{ m.mes }}
              </span>
            </div>
          </div>
        </div>

        <!-- Disparo -->
        <div class="pt-4 border-t border-white/10 space-y-3">
          <div class="flex gap-2">
            <input
              v-model.number="formFor(source).ano"
              type="number"
              min="2000"
              max="2100"
              aria-label="Ano"
              class="w-24 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <select
              v-model="formFor(source).mes"
              aria-label="Mês"
              class="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option v-for="(nome, i) in MESES" :key="nome" :value="String(i + 1).padStart(2, '0')">
                {{ String(i + 1).padStart(2, '0') }} · {{ nome }}
              </option>
            </select>
          </div>

          <button
            v-if="pending !== source.fonte"
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
            :disabled="trigger.isPending.value || source.em_execucao"
            @click="ask(source)"
          >
            <Play class="w-4 h-4" /> Carregar período
          </button>
          <div v-else class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
            <p class="text-sm text-amber-200">
              Confirmar carga de <strong>{{ source.fonte }}</strong> para
              <strong>{{ formFor(source).mes }}/{{ formFor(source).ano }}</strong>?
            </p>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 px-3 py-2 rounded-lg text-sm font-bold bg-amber-500 text-slate-900 hover:bg-amber-400"
                @click="confirm(source)"
              >
                Confirmar
              </button>
              <button
                type="button"
                class="flex-1 px-3 py-2 rounded-lg text-sm font-bold bg-white/10 text-slate-200 hover:bg-white/20"
                @click="pending = null"
              >
                Cancelar
              </button>
            </div>
          </div>

          <p
            v-if="feedback[source.fonte]"
            class="flex items-start gap-2 text-xs"
            :class="feedback[source.fonte].ok ? 'text-emerald-300' : 'text-red-300'"
            role="status"
          >
            <CheckCircle2 v-if="feedback[source.fonte].ok" class="w-4 h-4 shrink-0" />
            <AlertCircle v-else class="w-4 h-4 shrink-0" />
            {{ feedback[source.fonte].text }}
          </p>
        </div>
      </section>
    </div>

    <!-- Coletas anuais do DF (resumo vindo de /loads) -->
    <section v-if="data?.coleta_df?.length" class="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 class="text-lg font-black text-white mb-3">Coletas do DF</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-[10px] uppercase tracking-widest text-slate-500">
            <tr>
              <th class="py-2 pr-4">Ano</th>
              <th class="py-2 pr-4">Status</th>
              <th class="py-2 pr-4 text-right">Meses</th>
              <th class="py-2 text-right">Registros</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-300">
            <tr v-for="c in data.coleta_df" :key="c.id">
              <td class="py-2 pr-4 font-bold text-white">{{ c.ano }}</td>
              <td class="py-2 pr-4">{{ c.status }}</td>
              <td class="py-2 pr-4 text-right">{{ c.meses_processados }}</td>
              <td class="py-2 text-right">{{ num(c.registros) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Tela de progresso mensal do DF (existente) -->
    <section class="rounded-3xl bg-white text-slate-900 p-6">
      <ExecutionsPanel />
    </section>
  </div>
</template>
