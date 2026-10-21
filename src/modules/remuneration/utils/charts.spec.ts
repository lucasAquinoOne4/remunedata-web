import { describe, it, expect } from 'vitest'
import { buildEvolutionOption, buildCompositionOption, compactMoney } from './charts'

describe('charts', () => {
  it('evolução tem duas séries alinhadas ao histórico', () => {
    const opt = buildEvolutionOption([
      { ano: 2025, mes: '01', valor_bruto: 10, valor_liquido: 8, componentes: {} },
      { ano: 2025, mes: '02', valor_bruto: 12, valor_liquido: 9, componentes: {} },
    ]) as { series: { data: number[] }[]; xAxis: { data: string[] } }
    expect(opt.series).toHaveLength(2)
    expect(opt.series[0].data).toEqual([10, 12])
    expect(opt.xAxis.data).toEqual(['Jan/2025', 'Fev/2025'])
  })

  it('composição colore proventos e descontos', () => {
    const opt = buildCompositionOption({ ferias: 100, irrf: 20 }) as {
      yAxis: { data: string[] }
      series: { data: { value: number; itemStyle: { color: string } }[] }[]
    }
    expect(opt.yAxis.data).toEqual(['Férias', 'Imposto de renda (IRRF)'])
    expect(opt.series[0].data[0].itemStyle.color).toBe('#0f172a')
    expect(opt.series[0].data[1].itemStyle.color).toBe('#e11d48')
  })

  it('compactMoney abrevia valores', () => {
    expect(compactMoney(1500)).toBe('1,5 mil')
    expect(compactMoney(2_000_000)).toBe('2 mi')
    expect(compactMoney(50)).toBe('50')
  })
})
