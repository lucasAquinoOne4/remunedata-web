import { ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { RemunerationService, type SearchFilters } from '../services/remuneration.service'

export function useRemunerationSearch() {
  const route = useRoute()
  const router = useRouter()

  const appliedFilters = ref<SearchFilters>({
    fonte: route.query.fonte === 'SENADO' ? 'SENADO' : 'DF',
    nome: (route.query.nome as string) || '',
    cpf: (route.query.cpf as string) || '',
    ano: route.query.ano ? Number(route.query.ano) : 2025,
    mes: (route.query.mes as string) || '01',
    cargo: (route.query.cargo as string) || '',
    orgao: (route.query.orgao as string) || '',
    page: route.query.page ? Number(route.query.page) : 1,
    size: route.query.size ? Number(route.query.size) : 25,
  })

  // Filtros locais para Edição (Vinculados aos inputs)
  const localFilters = ref<SearchFilters>({ ...appliedFilters.value })

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['remuneration', 'search', appliedFilters],
    queryFn: () => RemunerationService.search(appliedFilters.value),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache para navegação
    placeholderData: (previousData) => previousData,
  })

  // Sincroniza filtros ATIVOS com a URL
  watch(
    appliedFilters,
    (newFilters) => {
      const query = { ...newFilters } as LocationQueryRaw
      // Remover campos vazios da URL
      Object.keys(query).forEach((key) => {
        if (!query[key]) delete query[key]
      })

      router.push({ query })
    },
    { deep: true },
  )

  const applySearch = () => {
    appliedFilters.value = { 
      ...localFilters.value,
      page: 1 // Reinicia a página ao pesquisar
    }
  }

  const setPage = (page: number) => {
    appliedFilters.value.page = page
    localFilters.value.page = page
  }

  const clearFilters = () => {
    const defaults: SearchFilters = {
      fonte: appliedFilters.value.fonte,
      nome: '',
      cpf: '',
      cargo: '',
      orgao: '',
      ano: 2024,
      mes: '01',
      page: 1,
    }
    localFilters.value = { ...defaults }
    appliedFilters.value = { ...defaults }
  }

  return {
    filters: localFilters,
    appliedFilters,
    data,
    isLoading,
    isFetching,
    setPage,
    applySearch,
    clearFilters,
    refetch,
  }
}
