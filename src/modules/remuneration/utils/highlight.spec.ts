import { describe, it, expect } from 'vitest'
import { highlightParts, foldText } from './highlight'

describe('highlightParts', () => {
  it('marca o trecho ignorando acentos e caixa', () => {
    expect(highlightParts('JOSÉ DA SILVA', 'jose')).toEqual([
      { text: 'JOSÉ', match: true },
      { text: ' DA SILVA', match: false },
    ])
  })

  it('marca várias palavras', () => {
    const parts = highlightParts('Maria Aparecida Souza', 'maria souza')
    expect(parts.filter((p) => p.match).map((p) => p.text)).toEqual(['Maria', 'Souza'])
  })

  it('devolve texto inteiro sem marcação quando não há termo ou correspondência', () => {
    expect(highlightParts('ANA', '')).toEqual([{ text: 'ANA', match: false }])
    expect(highlightParts('ANA', 'xyz')).toEqual([{ text: 'ANA', match: false }])
    expect(highlightParts('', 'ana')).toEqual([])
  })

  it('une trechos sobrepostos', () => {
    const parts = highlightParts('ANANAS', 'ana nan')
    expect(parts.filter((p) => p.match).map((p) => p.text)).toEqual(['ANANA'])
  })

  it('foldText remove acentos', () => {
    expect(foldText('Ação Çé')).toBe('acao ce')
  })
})
