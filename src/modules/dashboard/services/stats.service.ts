import { isAxiosError } from 'axios'
import httpClient from '@/core/http/client'
import type { Fonte, StatsResponse } from '@/core/types/api'

export function emptyStats(fonte: Fonte): StatsResponse {
  return { fonte, total_servidores: 0, media_bruto: 0, total_bruto: 0, mensal: [], top_orgaos: [], faixas: [] }
}

export const StatsService = {
  /** Estatísticas agregadas por fonte/ano. Tolera campos ausentes e endpoint inexistente. */
  async get(fonte: Fonte, ano?: number, signal?: AbortSignal): Promise<StatsResponse> {
    try {
      const { data } = await httpClient.get<Partial<StatsResponse>>('remuneration/stats', {
        params: { fonte, ...(ano ? { ano } : {}) },
        signal,
      })
      return {
        fonte: data?.fonte ?? fonte,
        total_servidores: data?.total_servidores ?? 0,
        media_bruto: data?.media_bruto ?? 0,
        total_bruto: data?.total_bruto ?? 0,
        mensal: Array.isArray(data?.mensal) ? data.mensal : [],
        top_orgaos: Array.isArray(data?.top_orgaos) ? data.top_orgaos : [],
        faixas: Array.isArray(data?.faixas) ? data.faixas : [],
      }
    } catch (error) {
      if (isAxiosError(error) && [404, 501].includes(error.response?.status ?? 0)) return emptyStats(fonte)
      throw error
    }
  },
}
