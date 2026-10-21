import { describe, it, expect } from 'vitest'
import {
  stateFromQuery,
  stateToQuery,
  defaultState,
  hasCriteria,
  resolvePeriod,
  buildSearchParams,
  formatTotal,
  personRoute,
  yearsFor,
  monthsFor,
} from './search'
import type { PeriodsResponse } from '@/core/types/api'

const periods: PeriodsResponse = {
  DF: [
    { ano: 2026, mes: '03' },
    { ano: 2026, mes: '02' },
    { ano: 2025, mes: '12' },
  ],
  SENADO: [{ ano: 2026, mes: '01' }],
}

describe('estado da busca <-> URL', () => {
  it('lê a query com valores inválidos tolerados', () => {
    const s = stateFromQuery({ nome: 'ana', fonte: 'XX', ano: 'abc', mes: '13', page: '-2' })
    expect(s).toMatchObject({ nome: 'ana', fonte: 'ALL', ano: null, mes: '', page: 1 })
  })

  it('faz round-trip omitindo vazios', () => {
    const state = { ...defaultState(), nome: ' maria ', fonte: 'DF' as const, ano: 2025, mes: '12', page: 3 }
    const q = stateToQuery(state)
    expect(q).toEqual({ nome: 'maria', fonte: 'DF', ano: '2025', mes: '12', page: '3' })
    expect(stateFromQuery(q)).toMatchObject({ nome: 'maria', fonte: 'DF', ano: 2025, mes: '12', page: 3 })
  })

  it('não serializa período na aba Todas', () => {
    expect(stateToQuery({ ...defaultState(), nome: 'x1', ano: 2025, mes: '01' })).toEqual({ nome: 'x1' })
  })
})

describe('hasCriteria', () => {
  it('exige nome com 2+ caracteres, cargo ou órgão', () => {
    expect(hasCriteria({ nome: 'a', cargo: '', orgao: '' })).toBe(false)
    expect(hasCriteria({ nome: 'an', cargo: '', orgao: '' })).toBe(true)
    expect(hasCriteria({ nome: '', cargo: 'Analista', orgao: '' })).toBe(true)
  })
})

describe('resolvePeriod', () => {
  it('usa o período mais recente da fonte por padrão', () => {
    expect(resolvePeriod('DF', periods)).toEqual({ ano: 2026, mes: '03' })
    expect(resolvePeriod('FEDERAL', periods)).toEqual({})
    expect(resolvePeriod('DF', undefined)).toEqual({})
  })

  it('respeita o período escolhido', () => {
    expect(resolvePeriod('DF', periods, { ano: 2025, mes: '12' })).toEqual({ ano: 2025, mes: '12' })
    expect(resolvePeriod('DF', periods, { ano: 2025, mes: '' })).toEqual({ ano: 2025, mes: '12' })
    expect(resolvePeriod('DF', undefined, { ano: 2024, mes: '' })).toEqual({ ano: 2024 })
  })
})

describe('buildSearchParams', () => {
  it('ignora ano/mes escolhidos para fontes diferentes da aba ativa', () => {
    const state = { ...defaultState(), nome: 'ana', fonte: 'DF' as const, ano: 2025, mes: '12' }
    const df = buildSearchParams({ fonte: 'DF', state, periods, page: 2, size: 25 })
    const sen = buildSearchParams({ fonte: 'SENADO', state, periods, page: 1, size: 1 })
    expect(df).toMatchObject({ fonte: 'DF', nome: 'ana', ano: 2025, mes: '12', page: 2, size: 25 })
    expect(sen).toMatchObject({ fonte: 'SENADO', ano: 2026, mes: '01', size: 1 })
  })
})

describe('helpers', () => {
  it('formatTotal mostra 10.000+ quando limitado', () => {
    expect(formatTotal(10000, true)).toBe('10.000+')
    expect(formatTotal(42, false)).toBe('42')
  })

  it('personRoute monta rota com matrícula opcional', () => {
    expect(
      personRoute({ fonte: 'DF', codigo_identificacao: '123', codigo_matricula: '9' }),
    ).toEqual({ name: 'person', params: { fonte: 'DF', id: '123' }, query: { matricula: '9' } })
    expect(
      personRoute({ fonte: 'SENADO', codigo_identificacao: '5', codigo_matricula: '' }).query,
    ).toEqual({})
  })

  it('yearsFor / monthsFor', () => {
    expect(yearsFor(periods, 'DF')).toEqual([2026, 2025])
    expect(monthsFor(periods, 'DF', 2026)).toEqual(['03', '02'])
    expect(yearsFor(undefined, 'DF')).toEqual([])
  })
})
