import { isAxiosError } from 'axios'
import httpClient from '@/core/http/client'
import type {
  Fonte,
  PeriodsResponse,
  PersonProfile,
  RemunerationSearchResponse,
  SuggestResponse,
  Suggestion,
} from '@/core/types/api'

export type { Fonte }

export interface SearchParams {
  fonte?: Fonte
  nome?: string
  cargo?: string
  orgao?: string
  ano?: number
  mes?: string
  page?: number
  size?: number
}

export const EMPTY_SEARCH: RemunerationSearchResponse = {
  items: [],
  total: 0,
  total_capped: false,
  page: 1,
  size: 25,
  pages: 0,
}

/** Endpoint ainda não disponível no backend (404/501). */
export function isMissingEndpoint(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  return status === 404 || status === 501
}

/** Remove parâmetros vazios antes de enviar a requisição. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    out[key] = value
  }
  return out as Partial<T>
}

/** Normaliza a resposta da busca tolerando campos ausentes. */
export function normalizeSearch(
  raw: Partial<RemunerationSearchResponse> | null | undefined,
): RemunerationSearchResponse {
  const items = Array.isArray(raw?.items) ? raw.items : []
  return {
    items,
    total: raw?.total ?? items.length,
    total_capped: Boolean(raw?.total_capped),
    page: raw?.page ?? 1,
    size: raw?.size ?? items.length,
    pages: raw?.pages ?? (items.length ? 1 : 0),
  }
}

export const RemunerationService = {
  async search(params: SearchParams, signal?: AbortSignal): Promise<RemunerationSearchResponse> {
    try {
      const { data } = await httpClient.get<RemunerationSearchResponse>('remuneration/', {
        params: cleanParams(params),
        signal,
      })
      return normalizeSearch(data)
    } catch (error) {
      if (isMissingEndpoint(error)) return { ...EMPTY_SEARCH }
      throw error
    }
  },

  async suggest(q: string, fonte?: Fonte, signal?: AbortSignal): Promise<Suggestion[]> {
    try {
      const { data } = await httpClient.get<SuggestResponse>('remuneration/suggest', {
        params: cleanParams({ q, fonte }),
        signal,
      })
      return Array.isArray(data?.suggestions) ? data.suggestions : []
    } catch (error) {
      if (isMissingEndpoint(error)) return []
      throw error
    }
  },

  async periods(): Promise<PeriodsResponse> {
    try {
      const { data } = await httpClient.get<PeriodsResponse>('remuneration/periods')
      return data ?? {}
    } catch (error) {
      if (isMissingEndpoint(error)) return {}
      throw error
    }
  },

  /** Retorna null quando o endpoint ainda não existe. */
  async person(
    fonte: Fonte,
    id: string,
    matricula?: string,
    signal?: AbortSignal,
  ): Promise<PersonProfile | null> {
    try {
      const { data } = await httpClient.get<PersonProfile>('remuneration/person', {
        params: cleanParams({ fonte, id, matricula }),
        signal,
      })
      return {
        ...data,
        identidade: data?.identidade ?? {},
        historico: Array.isArray(data?.historico) ? data.historico : [],
        ultimo: data?.ultimo ?? null,
        pares: data?.pares ?? null,
        outras_fontes: Array.isArray(data?.outras_fontes) ? data.outras_fontes : [],
        ficha_federal: data?.ficha_federal ?? null,
      }
    } catch (error) {
      if (isMissingEndpoint(error)) return null
      throw error
    }
  },
}
