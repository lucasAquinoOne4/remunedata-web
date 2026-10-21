import { describe, it, expect } from 'vitest'
import { componentLabel, isDiscount, splitComponents, collectComponentKeys } from './componentes'

describe('componentLabel', () => {
  it('usa o dicionário', () => {
    expect(componentLabel('abate_teto')).toBe('Abate-teto')
    expect(componentLabel('pss_rpgs')).toBe('Previdência (PSS/RPGS)')
  })
  it('formata chaves desconhecidas', () => {
    expect(componentLabel('valor_adicional_noturno')).toBe('Adicional noturno')
    expect(componentLabel('outra_coisa')).toBe('Outra coisa')
  })
})

describe('isDiscount', () => {
  it.each(['irrf', 'pss_rpgs', 'demais_deducoes', 'valor_imposto_renda', 'valor_seguridade_social', 'abate_teto', 'faltas', 'redutor_x', 'previdencia'])(
    '%s é desconto',
    (k) => expect(isDiscount(k)).toBe(true),
  )
  it.each(['ferias', 'valor_funcoes', 'auxilios', 'diarias'])('%s é provento', (k) =>
    expect(isDiscount(k)).toBe(false),
  )
})

describe('splitComponents', () => {
  it('separa, ordena e remove zeros usando valor absoluto', () => {
    const r = splitComponents({ ferias: 100, auxilios: 300, irrf: -50, pss_rpgs: 80, diarias: 0 })
    expect(r.proventos.map((x) => x.key)).toEqual(['auxilios', 'ferias'])
    expect(r.descontos.map((x) => [x.key, x.value])).toEqual([
      ['pss_rpgs', 80],
      ['irrf', 50],
    ])
  })
  it('tolera null', () => {
    expect(splitComponents(null)).toEqual({ proventos: [], descontos: [] })
  })
})

describe('collectComponentKeys', () => {
  it('une chaves com proventos antes de descontos', () => {
    const keys = collectComponentKeys([
      { ano: 2025, mes: '01', valor_bruto: 1, valor_liquido: 1, componentes: { irrf: 1, ferias: 2 } },
      { ano: 2025, mes: '02', valor_bruto: 1, valor_liquido: 1, componentes: { auxilios: 3 } },
    ])
    expect(keys).toEqual(['auxilios', 'ferias', 'irrf'])
  })
})
