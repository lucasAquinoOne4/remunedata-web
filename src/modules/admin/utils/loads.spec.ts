import { describe, it, expect } from 'vitest'
import { groupMonthsByYear, suggestNextPeriod, isValidPeriod, anyRunning } from './loads'

describe('loads utils', () => {
  it('agrupa meses por ano em ordem decrescente', () => {
    const groups = groupMonthsByYear([
      { ano: 2025, mes: '01', registros: 10 },
      { ano: 2026, mes: '01', registros: 5 },
      { ano: 2025, mes: '02', registros: 20 },
    ])
    expect(groups.map((g) => g.ano)).toEqual([2026, 2025])
    expect(groups[1].meses.map((m) => m.mes)).toEqual(['02', '01'])
    expect(groups[1].registros).toBe(30)
  })

  it('sugere o próximo período', () => {
    expect(suggestNextPeriod({ ano: 2025, mes: '03' })).toEqual({ ano: 2025, mes: '04' })
    expect(suggestNextPeriod({ ano: 2025, mes: '12' })).toEqual({ ano: 2026, mes: '01' })
    expect(suggestNextPeriod(null, new Date(2026, 4, 10))).toEqual({ ano: 2026, mes: '05' })
  })

  it('valida período', () => {
    expect(isValidPeriod(2025, '01')).toBe(true)
    expect(isValidPeriod(1999, '01')).toBe(false)
    expect(isValidPeriod(2025, '13')).toBe(false)
    expect(isValidPeriod(2025.5, '01')).toBe(false)
  })

  it('detecta carga em execução', () => {
    expect(anyRunning(undefined)).toBe(false)
    expect(
      anyRunning([{ fonte: 'DF', total_registros: 0, meses: [], ultimo: null, em_execucao: true }]),
    ).toBe(true)
  })
})
