import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { FONTES, type Fonte, type RemunerationSearchResponse } from '@/core/types/api'
import { useDebouncedRef } from '@/shared/composables/useDebouncedRef'
import { RemunerationService } from '../services/remuneration.service'
import { usePeriods } from './usePeriods'
import {
  PAGE_SIZE,
  PREVIEW_SIZE,
  buildSearchParams,
  defaultState,
  hasCriteria,
  stateFromQuery,
  stateToQuery,
  type FonteTab,
  type SearchState,
} from '../utils/search'

export const SEARCH_DEBOUNCE_MS = 250
export const SEARCH_STALE_MS = 1000 * 60 * 5

export type FilterKey = 'cargo' | 'orgao' | 'periodo'

export interface FilterChip {
  key: FilterKey
  label: string
  value: string
}

export function useRemunerationSearch() {
  const route = useRoute()
  const router = useRouter()

  const state = reactive<SearchState>({ ...defaultState(), ...stateFromQuery(route.query) })

  const nomeRef = computed({ get: () => state.nome, set: (v: string) => (state.nome = v) })
  const cargoRef = computed({ get: () => state.cargo, set: (v: string) => (state.cargo = v) })
  const orgaoRef = computed({ get: () => state.orgao, set: (v: string) => (state.orgao = v) })
  const { debounced: nome, flush: flushNome } = useDebouncedRef(nomeRef, SEARCH_DEBOUNCE_MS)
  const { debounced: cargo } = useDebouncedRef(cargoRef, SEARCH_DEBOUNCE_MS)
  const { debounced: orgao } = useDebouncedRef(orgaoRef, SEARCH_DEBOUNCE_MS)

  /** Estado efetivo: textos já com debounce; é ele que dispara requisições e a URL. */
  const effective = computed<SearchState>(() => ({
    ...state,
    nome: nome.value,
    cargo: cargo.value,
    orgao: orgao.value,
  }))

  const periodsQuery = usePeriods()
  const periods = computed(() => periodsQuery.data.value)
  const periodsReady = computed(() => periodsQuery.isFetched.value)

  const criteria = computed(() => hasCriteria(effective.value))

  function sourceQuery(fonte: Fonte) {
    const params = computed(() => {
      const isActive = state.fonte === fonte
      const size = state.fonte === 'ALL' ? PREVIEW_SIZE : isActive ? PAGE_SIZE : 1
      return buildSearchParams({
        fonte,
        state: effective.value,
        periods: periods.value,
        page: isActive ? state.page : 1,
        size,
      })
    })
    return useQuery({
      queryKey: ['remuneration', 'search', params],
      queryFn: ({ signal }) => RemunerationService.search(params.value, signal),
      enabled: computed(() => criteria.value && periodsReady.value),
      staleTime: SEARCH_STALE_MS,
      placeholderData: (previous: RemunerationSearchResponse | undefined) => previous,
    })
  }

  const sources = {
    DF: sourceQuery('DF'),
    SENADO: sourceQuery('SENADO'),
    FEDERAL: sourceQuery('FEDERAL'),
  } as const

  const counts = computed(() =>
    Object.fromEntries(
      FONTES.map((f) => {
        const d = criteria.value ? sources[f].data.value : undefined
        return [f, d ? { total: d.total, capped: d.total_capped } : null]
      }),
    ) as Record<Fonte, { total: number; capped: boolean } | null>,
  )

  /** Parâmetros da fonte ativa para exportar o resultado atual (nulo em 'Todas'). */
  const exportParams = computed(() => {
    if (state.fonte === 'ALL' || !criteria.value) return null
    const full = buildSearchParams({
      fonte: state.fonte,
      state: effective.value,
      periods: periods.value,
      page: 1,
      size: 1,
    })
    return { ...full, page: undefined, size: undefined }
  })

  const activeSource = computed(() => (state.fonte === 'ALL' ? null : sources[state.fonte]))
  const activeData = computed(() => (criteria.value ? activeSource.value?.data.value : undefined))

  const isFetching = computed(() =>
    state.fonte === 'ALL'
      ? FONTES.some((f) => sources[f].isFetching.value)
      : Boolean(activeSource.value?.isFetching.value),
  )
  const isInitialLoading = computed(() => {
    if (!criteria.value) return false
    if (!periodsReady.value) return true
    return state.fonte === 'ALL'
      ? FONTES.every((f) => !sources[f].data.value && sources[f].isFetching.value)
      : !activeData.value && Boolean(activeSource.value?.isFetching.value)
  })
  const isError = computed(() =>
    state.fonte === 'ALL'
      ? FONTES.every((f) => sources[f].isError.value)
      : Boolean(activeSource.value?.isError.value),
  )

  // Qualquer mudança de filtro volta para a página 1
  watch([nome, cargo, orgao, () => state.ano, () => state.mes], () => {
    state.page = 1
  })

  // URL compartilhável (só quando a query realmente muda)
  const urlQuery = computed(() => stateToQuery(effective.value))
  watch(
    () => JSON.stringify(urlQuery.value),
    () => {
      if (route.name !== 'remuneration') return
      router.replace({ query: urlQuery.value })
    },
  )

  const chips = computed<FilterChip[]>(() => {
    const out: FilterChip[] = []
    if (state.cargo.trim()) out.push({ key: 'cargo', label: 'Cargo', value: state.cargo.trim() })
    if (state.orgao.trim()) out.push({ key: 'orgao', label: 'Órgão', value: state.orgao.trim() })
    if (state.fonte !== 'ALL' && state.ano) {
      out.push({
        key: 'periodo',
        label: 'Período',
        value: state.mes ? `${state.mes}/${state.ano}` : String(state.ano),
      })
    }
    return out
  })

  function setFonte(fonte: FonteTab) {
    state.fonte = fonte
    state.page = 1
    // períodos são específicos de cada fonte
    state.ano = null
    state.mes = ''
  }

  function setPage(page: number) {
    state.page = Math.max(1, page)
  }

  function clearFilter(key: FilterKey) {
    if (key === 'cargo') state.cargo = ''
    else if (key === 'orgao') state.orgao = ''
    else {
      state.ano = null
      state.mes = ''
    }
    // limpar chip aplica na hora (sem esperar debounce)
    cargo.value = state.cargo
    orgao.value = state.orgao
  }

  function clearAll() {
    Object.assign(state, defaultState())
    nome.value = ''
    cargo.value = ''
    orgao.value = ''
  }

  return {
    state,
    effective,
    periods,
    criteria,
    sources,
    counts,
    activeData,
    exportParams,
    isFetching,
    isInitialLoading,
    isError,
    chips,
    setFonte,
    setPage,
    clearFilter,
    clearAll,
    flushNome,
  }
}
