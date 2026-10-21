import { describe, it, expect } from 'vitest'
import { buildMonthlyOption, buildTopOrgaosOption, buildFaixasOption } from './statsCharts'

describe('statsCharts', () => {
  it('mensal: barras de total e linha de média no segundo eixo', () => {
    const opt = buildMonthlyOption([
      { ano: 2025, mes: '01', registros: 2, media_bruto: 10, total_bruto: 20 },
    ]) as { series: { type: string; data: number[]; yAxisIndex?: number }[]; xAxis: { data: string[] } }
    expect(opt.xAxis.data).toEqual(['Jan/2025'])
    expect(opt.series[0]).toMatchObject({ type: 'bar', data: [20] })
    expect(opt.series[1]).toMatchObject({ type: 'line', data: [10], yAxisIndex: 1 })
  })

  it('top órgãos: encurta nomes longos', () => {
    const nome = 'SECRETARIA DE ESTADO DE ECONOMIA DO DISTRITO FEDERAL'
    const opt = buildTopOrgaosOption([{ nome, registros: 5, media_bruto: 1 }]) as {
      yAxis: { data: string[] }
      series: { data: number[] }[]
    }
    expect(opt.yAxis.data[0].length).toBeLessThanOrEqual(28)
    expect(opt.yAxis.data[0].endsWith('…')).toBe(true)
    expect(opt.series[0].data).toEqual([5])
  })

  it('faixas: uma coluna por faixa', () => {
    const opt = buildFaixasOption([
      { faixa: 'até 5k', registros: 3 },
      { faixa: '5k-10k', registros: 7 },
    ]) as { series: { data: number[] }[] }
    expect(opt.series[0].data).toEqual([3, 7])
  })
})
