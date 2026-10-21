import { describe, it, expect } from 'vitest'
import { buildFichaSections, humanizeKey } from './ficha'

describe('buildFichaSections', () => {
  it('monta seções de dados gerais, objetos e listas', () => {
    const s = buildFichaSections({
      situacao: 'ATIVO',
      ativo: true,
      vazio: '',
      cargoEfetivo: { descricao: 'ANALISTA', codigo: 12, nulo: null },
      funcoes: [{ nome: 'DIRETOR' }, { nome: 'CHEFE' }],
      lixo: () => 1,
    })
    expect(s[0]).toEqual({
      title: 'Dados gerais',
      rows: [
        { label: 'Situacao', value: 'ATIVO' },
        { label: 'Ativo', value: 'Sim' },
      ],
    })
    expect(s.map((x) => x.title)).toEqual(['Dados gerais', 'Cargo efetivo', 'Funcoes #1', 'Funcoes #2'])
    expect(s[1].rows).toHaveLength(2)
  })

  it('tolera null e estruturas vazias', () => {
    expect(buildFichaSections(null)).toEqual([])
    expect(buildFichaSections({})).toEqual([])
  })

  it('humaniza chaves', () => {
    expect(humanizeKey('orgaoLotacao')).toBe('Orgao lotacao')
    expect(humanizeKey('data_ingresso')).toBe('Data ingresso')
  })
})
