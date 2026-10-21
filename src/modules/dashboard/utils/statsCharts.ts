import type { StatsFaixa, StatsMonthly, StatsOrgao } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import { compactMoney } from '@/modules/remuneration/utils/charts'

const tooltip = {
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderWidth: 0,
  textStyle: { color: '#1e293b' },
  extraCssText: 'box-shadow:0 8px 24px rgba(15,23,42,.12);border-radius:12px;',
}

/** Barras (total bruto) + linha (média bruta) por mês, com eixos separados. */
export function buildMonthlyOption(mensal: StatsMonthly[]): Record<string, unknown> {
  return {
    tooltip: { ...tooltip, trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: '#64748b' } },
    grid: { left: 8, right: 8, top: 16, bottom: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: mensal.map((m) => formatCompetence(m.mes, m.ano)),
      axisLabel: { color: '#64748b' },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: [
      { type: 'value', axisLabel: { color: '#64748b', formatter: (v: number) => compactMoney(v) }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
      { type: 'value', axisLabel: { color: '#0d9488', formatter: (v: number) => compactMoney(v) }, splitLine: { show: false } },
    ],
    series: [
      {
        name: 'Total bruto',
        type: 'bar',
        data: mensal.map((m) => m.total_bruto),
        itemStyle: { color: '#cbd5e1', borderRadius: [6, 6, 0, 0] },
        tooltip: { valueFormatter: (v: number) => formatCurrency(v) },
      },
      {
        name: 'Média bruta',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: mensal.map((m) => m.media_bruto),
        lineStyle: { width: 3, color: '#0d9488' },
        itemStyle: { color: '#0d9488' },
        tooltip: { valueFormatter: (v: number) => formatCurrency(v) },
      },
    ],
  }
}

function shorten(name: string, max = 28): string {
  const n = name.trim()
  return n.length > max ? `${n.slice(0, max - 1)}…` : n
}

/** Barras horizontais com os órgãos de maior contingente. */
export function buildTopOrgaosOption(orgaos: StatsOrgao[]): Record<string, unknown> {
  return {
    tooltip: {
      ...tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const p = (params as { dataIndex: number }[])[0]
        const o = orgaos[p.dataIndex]
        return `<b>${o.nome}</b><br/>${o.registros.toLocaleString('pt-BR')} registros<br/>Média ${formatCurrency(o.media_bruto)}`
      },
    },
    grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: {
      type: 'category',
      inverse: true,
      data: orgaos.map((o) => shorten(o.nome)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#475569', fontWeight: 600 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        data: orgaos.map((o) => o.registros),
        itemStyle: { color: '#0f172a', borderRadius: 8 },
        label: { show: true, position: 'right', color: '#334155', formatter: (p: { value: number }) => p.value.toLocaleString('pt-BR') },
      },
    ],
  }
}

/** Colunas com a distribuição por faixa salarial. */
export function buildFaixasOption(faixas: StatsFaixa[]): Record<string, unknown> {
  return {
    tooltip: { ...tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: faixas.map((f) => f.faixa), axisLabel: { color: '#64748b', interval: 0, rotate: faixas.length > 6 ? 30 : 0 }, axisLine: { lineStyle: { color: '#e2e8f0' } } },
    yAxis: { type: 'value', axisLabel: { color: '#64748b', formatter: (v: number) => compactMoney(v) }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
    series: [
      {
        name: 'Registros',
        type: 'bar',
        data: faixas.map((f) => f.registros),
        itemStyle: { color: '#334155', borderRadius: [8, 8, 0, 0] },
        label: { show: faixas.length <= 8, position: 'top', color: '#334155', formatter: (p: { value: number }) => p.value.toLocaleString('pt-BR') },
      },
    ],
  }
}
