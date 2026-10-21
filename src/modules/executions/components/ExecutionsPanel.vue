<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CheckCircle2, XCircle, Calendar, RefreshCw, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useExecutions } from '../composables/useExecutions'
import { ExecutionService } from '../services/execution.service'
import { formatDate } from '@/core/formatters/date'
import BaseTable from '@/shared/ui/BaseTable.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import ExecutionMonthlyProgress from '../components/ExecutionMonthlyProgress.vue'

const { data, isLoading, page, refetch } = useExecutions()
const isSyncing = ref(false)
const expandedRows = ref<Set<number>>(new Set())
const now = ref(new Date())

// Garante que o cálculo de duração considere UTC, já que a API retorna ISO UTC
const formatDuration = (start: string, end: string | null) => {
  const startTime = new Date(start).getTime()
  const endTime = end ? new Date(end).getTime() : now.value.getTime()
  const diff = endTime - startTime
  
  if (diff < 0) return '0s'
  
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m ${seconds % 60}s`
}

let timer: ReturnType<typeof window.setInterval> | null = null

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})

const toggleRow = (id: number) => {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
}

const tableHeaders = [
  { key: 'status', label: 'Status' },
  { key: 'ano_exercicio', label: 'Ano', class: 'font-bold' },
  { key: 'started_at', label: 'Início' },
  { key: 'duration', label: 'Duração' },
  { key: 'total_registros_coletados', label: 'Total Coletado', class: 'text-right font-mono' },
  { key: 'error_message', label: 'Observações', class: 'hidden lg:table-cell' },
]


const getStatusClass = (status: string) => {
  const s = status.toLowerCase()
  if (s === 'success') return 'bg-green-50 text-green-700 border-green-200'
  if (s === 'running') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (s === 'pending') return 'bg-slate-50 text-slate-600 border-slate-200'
  if (s === 'partial_success') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

const handleSync = async () => {
  const isAlreadyRunning = data.value?.items.some(i => i.status.toLowerCase() === 'running')
  
  let force = false
  if (isAlreadyRunning) {
    const confirmForce = window.confirm('Já existe uma execução em andamento. Deseja FORÇAR o reinício (desbloquear zumbis)?')
    if (!confirmForce) return
    force = true
  }

  const anoStr = window.prompt('Informe o ano para sincronização (ex: 2025):', '2025')
  if (!anoStr) return

  const ano = parseInt(anoStr)
  if (isNaN(ano)) {
    window.alert('Ano inválido!')
    return
  }

  try {
    isSyncing.value = true
    await ExecutionService.triggerSync(ano, force)
    window.alert(`Sincronização ${force ? 'FORÇADA' : 'disparada'} com sucesso!`)
    refetch()
  } catch {
    window.alert('Falha ao disparar sincronização. Verifique se a API está online.')
  } finally {
    isSyncing.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold text-slate-900 font-serif">Execuções</h2>
        <p class="text-slate-500">Log de auditoria das sincronizações de dados processados.</p>
      </div>
      <BaseButton :loading="isSyncing" @click="handleSync">
        <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': isSyncing }" />
        Sincronizar Dados
      </BaseButton>
    </div>

    <!-- Tabela -->
    <BaseTable :headers="tableHeaders" :items="data?.items || []" :is-loading="isLoading">
      <template #header-status>
        <div class="flex items-center gap-2">
          <span>Status</span>
        </div>
      </template>

      <template #cell-status="{ item }">
        <div class="flex items-center gap-3">
          <button 
            v-if="item.status.toLowerCase() !== 'pending'"
            class="p-1 hover:bg-slate-100 rounded transition-colors"
            @click="toggleRow(item.id)"
          >
            <ChevronDown v-if="!expandedRows.has(item.id)" class="w-4 h-4 text-slate-400" />
            <ChevronUp v-else class="w-4 h-4 text-slate-600" />
          </button>
          <div
            class="flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-bold w-fit"
            :class="getStatusClass(item.status)"
          >
            <CheckCircle2 v-if="item.status.toLowerCase() === 'success'" class="w-3.5 h-3.5" />
            <RefreshCw v-else-if="item.status.toLowerCase() === 'running'" class="w-3.5 h-3.5 animate-spin" />
            <RefreshCw v-else-if="item.status.toLowerCase() === 'pending'" class="w-3.5 h-3.5 text-slate-400" />
            <CheckCircle2 v-else-if="item.status.toLowerCase() === 'partial_success'" class="w-3.5 h-3.5" />
            <XCircle v-else class="w-3.5 h-3.5" />
            {{ item.status.replace('_', ' ').toUpperCase() }}
          </div>
        </div>
      </template>

      <!-- Expandable Row -->
      <template #row-after="{ item }">
        <tr v-if="expandedRows.has(item.id)" class="bg-slate-50/50">
          <td :colspan="tableHeaders.length" class="p-4 border-b border-slate-100">
            <ExecutionMonthlyProgress 
              :execution-id="item.id" 
              :status="item.status"
              :parent-total="item.total_registros_coletados"
            />
          </td>
        </tr>
      </template>

      <template #cell-started_at="{ item }">
        <span class="flex items-center gap-1.5 text-slate-600 font-medium">
          <Calendar class="w-3.5 h-3.5 text-slate-400" />
          {{ formatDate(item.started_at) }}
        </span>
      </template>

      <template #cell-duration="{ item }">
        <span class="text-xs text-slate-500">
          {{ formatDuration(item.started_at, item.finished_at) }}
        </span>
      </template>

      <template #cell-ano_exercicio="{ item }">
        <span class="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs font-bold">
          {{ item.ano_exercicio }}
        </span>
      </template>

      <template #cell-total_registros_coletados="{ item }">
        <span class="font-bold text-slate-900">
          {{ item.total_registros_coletados.toLocaleString('pt-BR') }}
        </span>
      </template>

      <template #cell-error_message="{ item }">
        <span class="text-xs text-slate-400 truncate max-w-xs block" :title="item.error_message || undefined">
          {{ item.error_message || 'Carga realizada com sucesso' }}
        </span>
      </template>
    </BaseTable>

    <!-- Paginação -->
    <div v-if="data && data.pages > 1" class="flex justify-end gap-2">
      <BaseButton variant="outline" size="sm" :disabled="page === 1" @click="page--">
        Anterior
      </BaseButton>
      <BaseButton variant="outline" size="sm" :disabled="page === data.pages" @click="page++">
        Próximo
      </BaseButton>
    </div>
  </div>
</template>
