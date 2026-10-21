import { describe, it, expect, vi, beforeEach } from 'vitest'
import httpClient from '@/core/http/client'
import { StatsService } from './stats.service'

vi.mock('@/core/http/client', () => ({ default: { get: vi.fn() } }))

describe('StatsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('envia fonte e ano e normaliza campos ausentes', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: { total_servidores: 10 } })
    const r = await StatsService.get('DF', 2025)
    expect(httpClient.get).toHaveBeenCalledWith('remuneration/stats', {
      params: { fonte: 'DF', ano: 2025 },
      signal: undefined,
    })
    expect(r).toMatchObject({ fonte: 'DF', total_servidores: 10, mensal: [], top_orgaos: [], faixas: [] })
  })

  it('omite ano quando não informado e devolve vazio em 404', async () => {
    vi.mocked(httpClient.get).mockRejectedValue({ isAxiosError: true, response: { status: 404 } })
    const r = await StatsService.get('SENADO')
    expect(vi.mocked(httpClient.get).mock.calls[0][1]).toMatchObject({ params: { fonte: 'SENADO' } })
    expect(r.total_servidores).toBe(0)
  })
})
