import { describe, it, expect } from 'vitest'
import { historyToCsv, csvFilename } from './csv'

describe('historyToCsv', () => {
  it('gera cabeçalho com componentes e valores com vírgula decimal', () => {
    const csv = historyToCsv([
      { ano: 2025, mes: '01', valor_bruto: 1000.5, valor_liquido: 800, componentes: { ferias: 10, irrf: 5 } },
      { ano: 2025, mes: '02', valor_bruto: 1100, valor_liquido: 900, componentes: { ferias: 20 } },
    ])
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('Ano;Mês;Valor bruto;Valor líquido;Férias;Imposto de renda (IRRF)')
    expect(lines[1]).toBe('2025;01;1000,50;800,00;10,00;5,00')
    expect(lines[2]).toBe('2025;02;1100,00;900,00;20,00;')
  })

  it('neutraliza fórmulas em textos', () => {
    const csv = historyToCsv([
      { ano: 2025, mes: '01', valor_bruto: 1, valor_liquido: 1, componentes: {} },
    ])
    expect(csv.split('\r\n')).toHaveLength(2)
  })

  it('gera nome de arquivo sem acentos', () => {
    expect(csvFilename('JOSÉ DA SILVA', 'DF')).toBe('remuneracao-df-jose-da-silva.csv')
    expect(csvFilename(null, 'SENADO')).toBe('remuneracao-senado-servidor.csv')
  })
})
