import { describe, it, expect } from 'vitest'
import { computeKpis, identityChips, percentilText, latestEntry, clampPct } from './profile'

describe('computeKpis', () => {
  it('calcula descontos e percentual', () => {
    expect(computeKpis({ valor_bruto: 10000, valor_liquido: 7500 })).toEqual({
      bruto: 10000,
      liquido: 7500,
      descontos: 2500,
      descontosPct: 25,
    })
  })
  it('tolera bruto zero e ausência de dados', () => {
    expect(computeKpis({ valor_bruto: 0, valor_liquido: 0 })?.descontosPct).toBe(0)
    expect(computeKpis(null)).toBeNull()
  })
})

describe('latestEntry', () => {
  const h = (mes: string) => ({ ano: 2025, mes, valor_bruto: 1, valor_liquido: 1, componentes: {} })
  it('prefere ultimo e cai para o fim do histórico', () => {
    expect(latestEntry({ ultimo: h('05'), historico: [h('01')] })?.mes).toBe('05')
    expect(latestEntry({ ultimo: null, historico: [h('01'), h('02')] })?.mes).toBe('02')
    expect(latestEntry({ ultimo: null, historico: [] })).toBeNull()
  })
})

describe('identityChips', () => {
  it('ignora campos nulos/vazios e valores repetidos', () => {
    const chips = identityChips({ cargo: 'Analista', funcao: 'Analista', orgao: ' ', uf: 'DF', vinculo: 'Efetivo' })
    expect(chips.map((c) => c.key)).toEqual(['vinculo', 'uf', 'cargo'])
  })
  it('tolera undefined', () => {
    expect(identityChips(undefined)).toEqual([])
  })
})

describe('percentilText / clampPct', () => {
  it('descreve a posição', () => {
    expect(percentilText(80)).toBe('Ganha mais que 80% dos pares')
    expect(percentilText(20)).toBe('Ganha menos que 80% dos pares')
  })
  it('limita o percentual', () => {
    expect(clampPct(150)).toBe(100)
    expect(clampPct(-3)).toBe(0)
    expect(clampPct(NaN)).toBe(0)
  })
})
