<script setup lang="ts">
import { computed } from 'vue'
import type { PeriodsResponse } from '@/core/types/api'
import { MESES, monthsFor, monthName, yearsFor, type SearchState } from '../utils/search'

const props = defineProps<{
  state: SearchState
  periods: PeriodsResponse | undefined
}>()

const emit = defineEmits<{
  (e: 'update:cargo', value: string): void
  (e: 'update:orgao', value: string): void
  (e: 'update:ano', value: number | null): void
  (e: 'update:mes', value: string): void
}>()

const specific = computed(() => (props.state.fonte === 'ALL' ? null : props.state.fonte))
const years = computed(() => (specific.value ? yearsFor(props.periods, specific.value) : []))
const months = computed(() => {
  if (!specific.value || !props.state.ano) return []
  const available = monthsFor(props.periods, specific.value, props.state.ano)
  return available.length ? [...available].sort() : MESES.map((_, i) => String(i + 1).padStart(2, '0'))
})

const inputClass =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all'
const labelClass = 'text-[11px] font-semibold text-slate-600 uppercase tracking-wider'

function onAno(event: Event) {
  const v = (event.target as HTMLSelectElement).value
  emit('update:ano', v ? Number(v) : null)
  emit('update:mes', '')
}
</script>

<template>
  <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    <div class="space-y-1">
      <label class="block" :class="labelClass" for="f-cargo">Cargo</label>
      <input
        id="f-cargo"
        :value="state.cargo"
        type="text"
        placeholder="Ex.: Analista, Professor…"
        :class="inputClass"
        @input="emit('update:cargo', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="space-y-1">
      <label class="block" :class="labelClass" for="f-orgao">Órgão</label>
      <input
        id="f-orgao"
        :value="state.orgao"
        type="text"
        placeholder="Ex.: Secretaria de Saúde…"
        :class="inputClass"
        @input="emit('update:orgao', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <template v-if="specific">
      <div class="space-y-1">
        <label class="block" :class="labelClass" for="f-ano">Ano</label>
        <select id="f-ano" :value="state.ano ?? ''" :class="inputClass" @change="onAno">
          <option value="">Mais recente</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div class="space-y-1">
        <label class="block" :class="labelClass" for="f-mes">Mês</label>
        <select
          id="f-mes"
          :value="state.mes"
          :disabled="!state.ano"
          :class="[inputClass, !state.ano && 'opacity-50']"
          @change="emit('update:mes', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ state.ano ? 'Mais recente do ano' : 'Selecione o ano' }}</option>
          <option v-for="m in months" :key="m" :value="m">{{ monthName(m) }}</option>
        </select>
      </div>
    </template>
    <p v-else class="md:col-span-2 text-xs text-slate-500 self-end pb-2">
      Em "Todas", cada fonte usa o seu período mais recente. Escolha uma fonte para filtrar por ano e mês.
    </p>
  </div>
</template>
