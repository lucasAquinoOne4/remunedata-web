import type { Fonte, PeriodRef, PeriodsResponse, RemunerationItem } from '@/core/types/api'
import { FONTES } from '@/core/types/api'
import type { SearchParams } from '../services/remuneration.service'

export type FonteTab = 'ALL' | Fonte

export interface SearchState {
  nome: string
  fonte: FonteTab
  cargo: string
  orgao: string
  ano: number | null
  mes: string
  page: number
}

export const PAGE_SIZE = 25
export const PREVIEW_SIZE = 5
export const MIN_NAME_LENGTH = 2

export function defaultState(): SearchState {
  return { nome: '', fonte: 'ALL', cargo: '', orgao: '', ano: null, mes: '', page: 1 }
}

type RawQuery = Record<string, unknown>

function str(value: unknown): string {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' ? v : ''
}

export function isFonte(value: string): value is Fonte {
  return (FONTES as readonly string[]).includes(value)
}

/** Lê o estado da busca a partir da query da URL. */
export function stateFromQuery(query: RawQuery): SearchState {
  const fonte = str(query.fonte)
  const ano = Number(str(query.ano))
  const page = Number(str(query.page))
  const mes = str(query.mes)
  return {
    nome: str(query.nome),
    fonte: isFonte(fonte) ? fonte : 'ALL',
    cargo: str(query.cargo),
    orgao: str(query.orgao),
    ano: Number.isInteger(ano) && ano > 1900 ? ano : null,
    mes: /^(0[1-9]|1[0-2])$/.test(mes) ? mes : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

/** Converte o estado em query de URL (omitindo valores vazios/padrão). */
export function stateToQuery(state: SearchState): Record<string, string> {
  const q: Record<string, string> = {}
  if (state.nome.trim()) q.nome = state.nome.trim()
  if (state.fonte !== 'ALL') q.fonte = state.fonte
  if (state.cargo.trim()) q.cargo = state.cargo.trim()
  if (state.orgao.trim()) q.orgao = state.orgao.trim()
  if (state.ano && state.fonte !== 'ALL') q.ano = String(state.ano)
  if (state.mes && state.fonte !== 'ALL') q.mes = state.mes
  if (state.page > 1) q.page = String(state.page)
  return q
}

export function hasCriteria(state: Pick<SearchState, 'nome' | 'cargo' | 'orgao'>): boolean {
  return (
    state.nome.trim().length >= MIN_NAME_LENGTH ||
    state.cargo.trim().length > 0 ||
    state.orgao.trim().length > 0
  )
}

/**
 * Escolhe ano/mês da busca: o período escolhido pelo usuário (somente numa fonte
 * específica) ou o mais recente da fonte segundo /periods. Sem períodos, não filtra.
 */
export function resolvePeriod(
  fonte: Fonte,
  periods: PeriodsResponse | undefined,
  chosen?: { ano: number | null; mes: string },
): Partial<PeriodRef> {
  if (chosen?.ano) {
    if (chosen.mes) return { ano: chosen.ano, mes: chosen.mes }
    // ano escolhido sem mês: usa o mês mais recente disponível naquele ano
    const inYear = periods?.[fonte]?.find((p) => p.ano === chosen.ano)
    return inYear ? { ano: inYear.ano, mes: inYear.mes } : { ano: chosen.ano }
  }
  const latest = periods?.[fonte]?.[0]
  return latest ? { ano: latest.ano, mes: latest.mes } : {}
}

export interface BuildParamsOptions {
  fonte: Fonte
  state: SearchState
  periods: PeriodsResponse | undefined
  page: number
  size: number
}

export function buildSearchParams(opts: BuildParamsOptions): SearchParams {
  const { fonte, state, periods, page, size } = opts
  const chosen = state.fonte === fonte ? { ano: state.ano, mes: state.mes } : undefined
  return {
    fonte,
    nome: state.nome.trim() || undefined,
    cargo: state.cargo.trim() || undefined,
    orgao: state.orgao.trim() || undefined,
    ...resolvePeriod(fonte, periods, chosen),
    page,
    size,
  }
}

/** Anos disponíveis para a fonte (mais recente primeiro). */
export function yearsFor(periods: PeriodsResponse | undefined, fonte: Fonte): number[] {
  const years = new Set<number>()
  for (const p of periods?.[fonte] ?? []) years.add(p.ano)
  return [...years].sort((a, b) => b - a)
}

/** Meses (já em ordem do período mais recente ao mais antigo) disponíveis no ano. */
export function monthsFor(periods: PeriodsResponse | undefined, fonte: Fonte, ano: number): string[] {
  return (periods?.[fonte] ?? []).filter((p) => p.ano === ano).map((p) => p.mes)
}

/** Texto do total: "10.000+" quando limitado. */
export function formatTotal(total: number, capped: boolean): string {
  const text = total.toLocaleString('pt-BR')
  return capped ? `${text}+` : text
}

export function personRoute(item: Pick<RemunerationItem, 'fonte' | 'codigo_identificacao' | 'codigo_matricula'>) {
  return {
    name: 'person',
    params: { fonte: item.fonte, id: item.codigo_identificacao },
    query: item.codigo_matricula ? { matricula: item.codigo_matricula } : {},
  }
}

export const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function monthName(mes: string): string {
  return MESES[Number(mes) - 1] ?? mes
}
