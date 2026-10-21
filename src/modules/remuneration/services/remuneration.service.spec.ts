import { describe, it, expect, vi, beforeEach } from 'vitest'
import httpClient from '@/core/http/client'
import {
  RemunerationService,
  cleanParams,
  normalizeSearch,
  isMissingEndpoint,
} from './remuneration.service'

vi.mock('@/core/http/client', () => ({
  default: {
    get: vi.fn(),
  },
}))

const axiosError = (status: number) => ({ isAxiosError: true, response: { status } })

describe('RemunerationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('remove parâmetros vazios', () => {
    expect(cleanParams({ nome: 'ana', cargo: '', ano: undefined, page: 1 })).toEqual({
      nome: 'ana',
      page: 1,
    })
  })

  it('busca enviando apenas filtros preenchidos', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { items: [], total: 0, total_capped: false, page: 1, size: 25, pages: 0 },
    })
    const ac = new AbortController()
    await RemunerationService.search({ fonte: 'DF', nome: 'Alice', cargo: '' }, ac.signal)
    expect(httpClient.get).toHaveBeenCalledWith('remuneration/', {
      params: { fonte: 'DF', nome: 'Alice' },
      signal: ac.signal,
    })
  })

  it('normaliza resposta com campos ausentes', () => {
    expect(normalizeSearch({ items: undefined })).toMatchObject({ items: [], total: 0, pages: 0 })
    expect(normalizeSearch(undefined).total_capped).toBe(false)
  })

  it('retorna vazio quando a busca responde 501', async () => {
    vi.mocked(httpClient.get).mockRejectedValue(axiosError(501))
    const result = await RemunerationService.search({ nome: 'x' })
    expect(result.items).toEqual([])
  })

  it('propaga erros diferentes de 404/501', async () => {
    vi.mocked(httpClient.get).mockRejectedValue(axiosError(500))
    await expect(RemunerationService.search({ nome: 'x' })).rejects.toBeTruthy()
  })

  it('sugestões: devolve lista e tolera 404', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({
      data: { suggestions: [{ nome: 'ANA', fonte: 'DF', cargo: null, orgao: null }] },
    })
    expect(await RemunerationService.suggest('ana')).toHaveLength(1)
    vi.mocked(httpClient.get).mockRejectedValueOnce(axiosError(404))
    expect(await RemunerationService.suggest('ana')).toEqual([])
  })

  it('períodos: tolera 404', async () => {
    vi.mocked(httpClient.get).mockRejectedValueOnce(axiosError(404))
    expect(await RemunerationService.periods()).toEqual({})
  })

  it('perfil: normaliza campos ausentes e devolve null em 404', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { fonte: 'DF', id: '1' } })
    const p = await RemunerationService.person('DF', '1', '99')
    expect(httpClient.get).toHaveBeenCalledWith('remuneration/person', {
      params: { fonte: 'DF', id: '1', matricula: '99' },
      signal: undefined,
    })
    expect(p?.historico).toEqual([])
    expect(p?.outras_fontes).toEqual([])
    vi.mocked(httpClient.get).mockRejectedValueOnce(axiosError(404))
    expect(await RemunerationService.person('DF', '1')).toBeNull()
  })

  it('isMissingEndpoint só reconhece erros axios 404/501', () => {
    expect(isMissingEndpoint(new Error('x'))).toBe(false)
    expect(isMissingEndpoint(axiosError(404))).toBe(true)
  })
})
