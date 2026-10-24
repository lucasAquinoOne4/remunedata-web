import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

const replace = vi.fn()
const route = { name: 'remuneration', query: {} as Record<string, string> }

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace }),
  useRoute: () => route,
}))

const queryCalls: { queryKey: unknown[]; enabled: { value: boolean } }[] = []
vi.mock('@tanstack/vue-query', () => ({
  useQuery: vi.fn((opts: { queryKey: unknown[]; enabled: { value: boolean } }) => {
    queryCalls.push(opts)
    return {
      data: ref(undefined),
      isFetching: ref(false),
      isFetched: ref(true),
      isError: ref(false),
    }
  }),
}))

vi.mock('../services/remuneration.service', () => ({
  RemunerationService: { search: vi.fn(), periods: vi.fn() },
}))

import { useRemunerationSearch } from './useRemunerationSearch'

function setup() {
  const scope = effectScope()
  const api = scope.run(() => useRemunerationSearch())!
  return { scope, api }
}

describe('useRemunerationSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    queryCalls.length = 0
    route.query = {}
  })
  afterEach(() => vi.useRealTimers())

  it('inicia a partir da URL', () => {
    route.query = { nome: 'ana', fonte: 'SENADO', page: '2' }
    const { scope, api } = setup()
    expect(api.state).toMatchObject({ nome: 'ana', fonte: 'SENADO', page: 2 })
    scope.stop()
  })

  it('só habilita as buscas com critério suficiente', async () => {
    const { scope, api } = setup()
    const enabled = () => queryCalls.filter((c) => c.queryKey[1] === 'search').map((c) => c.enabled.value)
    expect(api.criteria.value).toBe(false)
    expect(enabled()).toEqual(Array(8).fill(false))
    api.state.nome = 'maria'
    await nextTick()
    vi.advanceTimersByTime(260)
    await nextTick()
    expect(api.criteria.value).toBe(true)
    // só DF, Senado e Federal (sempre disponíveis); estados sem competências carregadas ficam desligados
    expect(enabled()).toEqual([true, true, true, false, false, false, false, false])
    expect(api.available.value).toEqual(['DF', 'SENADO', 'FEDERAL'])
    scope.stop()
  })

  it('aplica debounce de ~250ms e sincroniza a URL', async () => {
    const { scope, api } = setup()
    api.state.nome = 'jo'
    await nextTick()
    vi.advanceTimersByTime(200)
    await nextTick()
    expect(replace).not.toHaveBeenCalled()
    vi.advanceTimersByTime(60)
    await nextTick()
    expect(replace).toHaveBeenLastCalledWith({ query: { nome: 'jo' } })
    scope.stop()
  })

  it('trocar de fonte volta para a página 1 e limpa o período', () => {
    const { scope, api } = setup()
    api.setPage(4)
    api.state.ano = 2025
    api.state.mes = '03'
    api.setFonte('DF')
    expect(api.state).toMatchObject({ fonte: 'DF', page: 1, ano: null, mes: '' })
    scope.stop()
  })

  it('gera chips e permite removê-los', () => {
    const { scope, api } = setup()
    api.setFonte('DF')
    api.state.cargo = 'Analista'
    api.state.ano = 2025
    api.state.mes = '01'
    expect(api.chips.value.map((c) => c.key)).toEqual(['cargo', 'periodo'])
    api.clearFilter('cargo')
    api.clearFilter('periodo')
    expect(api.chips.value).toEqual([])
    scope.stop()
  })

  it('clearAll restaura o estado padrão', () => {
    const { scope, api } = setup()
    api.state.nome = 'x'
    api.setFonte('FEDERAL')
    api.clearAll()
    expect(api.state).toMatchObject({ nome: '', fonte: 'ALL', page: 1 })
    scope.stop()
  })
})
