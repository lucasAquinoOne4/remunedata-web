<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, ChevronLeft, ChevronRight, FileDown, Filter } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import { useRemunerationSearch } from '../composables/useRemunerationSearch'
import { RemunerationService } from '../services/remuneration.service'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseTable from '@/shared/ui/BaseTable.vue'
import BaseSelectSearch from '@/shared/ui/BaseSelectSearch.vue'
import BaseSkeleton from '@/shared/ui/BaseSkeleton.vue'

const { 
  filters, 
  data, 
  isFetching,
  isLoading: isInitialLoading,
  setPage, 
  applySearch 
} = useRemunerationSearch()

const showMobileFilters = ref(false)

const fontes = [
  { v: 'DF', l: 'Governo do DF' },
  { v: 'SENADO', l: 'Senado Federal' },
]

// Ao trocar de fonte, limpa cargo/órgão (cada fonte tem listas diferentes)
const changeFonte = () => {
  filters.value.cargo = ''
  filters.value.orgao = ''
  applySearch()
}

// Busca filtros distintos (Cargos e Órgãos) - Cache de 24h conforme API
const { data: distinctFilters, isLoading: isLoadingFilters } = useQuery({
  queryKey: ['remuneration', 'distinct-filters', computed(() => filters.value.fonte)],
  queryFn: () => RemunerationService.getDistinctFilters(filters.value.fonte),
  staleTime: 1000 * 60 * 60 * 24, 
})

const handleExport = async (type: 'xlsx' | 'csv') => {
  try {
    const url = await RemunerationService.getExportUrl(type)
    window.open(url, '_blank')
  } catch {
    window.alert('Erro ao gerar exportação. Verifique se existem execuções finalizadas.')
  }
}

const tableHeaders = [
  { key: 'nome_servidor', label: 'Servidor' },
  { key: 'orgao', label: 'Órgão', class: 'hidden lg:table-cell' },
  { key: 'cargo', label: 'Cargo', class: 'hidden md:table-cell' },
  { key: 'referencia', label: 'Referência' },
  { key: 'valor_bruto', label: 'Vlr. Bruto' },
  { key: 'valor_liquido', label: 'Vlr. Líquido' },
]

const anos = [2026, 2025, 2024, 2023, 2022, 2021, 2020]
const meses = [
  { v: '01', l: 'Janeiro' },
  { v: '02', l: 'Fevereiro' },
  { v: '03', l: 'Março' },
  { v: '04', l: 'Abril' },
  { v: '05', l: 'Maio' },
  { v: '06', l: 'Junho' },
  { v: '07', l: 'Julho' },
  { v: '08', l: 'Agosto' },
  { v: '09', l: 'Setembro' },
  { v: '10', l: 'Outubro' },
  { v: '11', l: 'Novembro' },
  { v: '12', l: 'Dezembro' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-3xl font-bold text-slate-900 font-serif tracking-tight">Consulta Pública</h2>
        <p class="text-slate-500 font-medium">Explore os dados de remuneração do Distrito Federal.</p>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton 
          variant="outline" 
          class="md:hidden gap-2" 
          @click="showMobileFilters = !showMobileFilters"
        >
          <Filter class="w-4 h-4" />
          Filtros
        </BaseButton>
        <div class="hidden sm:flex gap-2">
          <BaseButton variant="outline" class="gap-2 text-xs font-bold" @click="handleExport('xlsx')">
            <FileDown class="w-4 h-4" />
            XLSX (1k)
          </BaseButton>
          <BaseButton variant="outline" class="gap-2 text-xs font-bold" @click="handleExport('csv')">
            <FileDown class="w-4 h-4" />
            CSV (5k)
          </BaseButton>
        </div>
      </div>
    </div>
  
    <!-- Filtros -->
    <div 
      class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 transition-all"
      :class="{ 'hidden md:block': !showMobileFilters }"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-6 gap-6">
        <!-- Fonte -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Fonte</label>
          <select
            v-model="filters.fonte"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium appearance-none cursor-pointer"
            @change="changeFonte"
          >
            <option v-for="f in fontes" :key="f.v" :value="f.v">{{ f.l }}</option>
          </select>
        </div>

        <!-- Nome -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome do Servidor</label>
          <div class="relative group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input
              v-model="filters.nome"
              type="text"
              placeholder="Ex: FRANCISCO..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
              @keyup.enter="applySearch"
            />
          </div>
        </div>

        <!-- Cargo -->
        <div v-if="isLoadingFilters" class="space-y-1">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Cargo</label>
          <BaseSkeleton height="42px" rounded="rounded-xl" />
        </div>
        <BaseSelectSearch
          v-else
          v-model="filters.cargo"
          :options="distinctFilters?.cargos || []"
          label="Cargo"
          placeholder="Selecione o cargo..."
          @change="applySearch"
        />

        <!-- Órgão -->
        <div v-if="isLoadingFilters" class="space-y-1">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Órgão</label>
          <BaseSkeleton height="42px" rounded="rounded-xl" />
        </div>
        <BaseSelectSearch
          v-else
          v-model="filters.orgao"
          :options="distinctFilters?.orgaos || []"
          label="Órgão"
          placeholder="Selecione o órgão..."
          @change="applySearch"
        />

        <!-- Ano -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Ano</label>
          <select
            v-model="filters.ano"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium appearance-none cursor-pointer"
            @change="applySearch"
          >
            <option v-for="ano in anos" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>

        <!-- Mes -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mês</label>
          <select
            v-model="filters.mes"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium appearance-none cursor-pointer"
            @change="applySearch"
          >
            <option v-for="m in meses" :key="m.v" :value="m.v">{{ m.l }}</option>
          </select>
        </div>

        <!-- Ação -->
        <div class="flex items-end">
          <BaseButton :loading="isFetching" class="w-full h-[42px] gap-2 rounded-xl bg-slate-900 border-none shadow-lg shadow-slate-900/20" @click="applySearch">
            <Search class="w-4 h-4" />
            Aplicar Filtros
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <BaseTable :headers="tableHeaders" :items="data?.items || []" :is-loading="isInitialLoading && !data">
      <template #cell-nome_servidor="{ item }">
        <RouterLink
          :to="{
            name: 'remuneration-detail',
            params: { id: item.id },
            query: {
              nome: item.nome_servidor,
              cpf: item.cpf_servidor,
              ano: item.ano_exercicio,
              mes: item.mes_referencia,
              fonte: item.fonte,
            },
          }"
          class="font-bold text-slate-900 hover:text-slate-600 hover:underline decoration-slate-300 underline-offset-4"
        >
          {{ item.nome_servidor }}
        </RouterLink>
      </template>

      <template #cell-referencia="{ item }">
        <span class="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
          {{ formatCompetence(item.mes_referencia, item.ano_exercicio) }}
        </span>
      </template>

      <template #cell-orgao="{ item }">
        <span class="truncate max-w-[200px] inline-block" :title="item.nome_orgao || undefined">
          {{ item.nome_orgao }}
        </span>
      </template>

      <template #cell-valor_bruto="{ item }">
        <span class="font-bold text-slate-900">{{ formatCurrency(item.valor_bruto) }}</span>
      </template>

      <template #cell-valor_liquido="{ item }">
        <span class="text-slate-900 font-black">{{ formatCurrency(item.valor_liquido) }}</span>
      </template>
    </BaseTable>

    <!-- Paginação -->
    <div v-if="data && data.pages > 1" class="flex items-center justify-between pt-4">
      <p class="text-sm text-slate-500">
        Mostrando <span class="font-bold text-slate-900">{{ data.items.length }}</span> de
        <span class="font-bold text-slate-900">{{ data.total }}</span> registros
      </p>

      <div class="flex gap-2">
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="filters.page === 1"
          @click="setPage(filters.page! - 1)"
        >
          <ChevronLeft class="w-4 h-4 mr-1" /> Anterior
        </BaseButton>
        <div class="flex items-center px-4 text-sm font-bold text-slate-700 select-none">
          Página {{ filters.page }} de {{ data.pages }}
        </div>
        <BaseButton
          variant="outline"
          size="sm"
          :disabled="filters.page === data.pages"
          @click="setPage(filters.page! + 1)"
        >
          Próximo <ChevronRight class="w-4 h-4 ml-1" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
