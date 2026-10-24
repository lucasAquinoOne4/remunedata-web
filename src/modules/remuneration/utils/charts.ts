import type { PersonHistoryEntry } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'
import { formatCompetence } from '@/core/formatters/date'
import { splitComponents } from './componentes'

const tooltipBase = {
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderWidth: 0,
  textStyle: { color: '#1e293b' },
  extraCssText: 'box-shadow:0 8px 24px rgba(15,23,42,.12);border-radius:12px;',
}

const compactMoney = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
    : v >= 1_000
      ? `${(v / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
      : String(Math.round(v))

export { compactMoney }

/** Linha: evolução do bruto x líquido ao longo dos meses. */
export function buildEvolutionOption(
  historico: PersonHistoryEntry[],
  comLiquido = true,
): Record<string, unknown> {
  const labels = historico.map((h) => formatCompetence(h.mes, h.ano))
  return {
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      valueFormatter: (v: number) => formatCurrency(v),
    },
    legend: { bottom: 0, textStyle: { color: '#64748b' } },
    grid: { left: 8, right: 16, top: 16, bottom: 36, containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLabel: { color: '#64748b' },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', formatter: (v: number) => compactMoney(v) },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        name: 'Bruto',
        type: 'line',
        smooth: true,
        showSymbol: historico.length < 40,
        data: historico.map((h) => h.valor_bruto),
        lineStyle: { width: 3, color: '#0f172a' },
        itemStyle: { color: '#0f172a' },
        areaStyle: { color: 'rgba(15,23,42,0.06)' },
      },
      ...(comLiquido
        ? [
            {
              name: 'Líquido',
              type: 'line',
              smooth: true,
              showSymbol: historico.length < 40,
              data: historico.map((h) => h.valor_liquido),
              lineStyle: { width: 3, color: '#0d9488' },
              itemStyle: { color: '#0d9488' },
            },
          ]
        : []),
    ],
  }
}

/** Barras horizontais: proventos (slate) e descontos (rosa) do último mês. */
export function buildCompositionOption(
  componentes: Record<string, number> | null | undefined,
): Record<string, unknown> {
  const { proventos, descontos } = splitComponents(componentes)
  const rows = [
    ...proventos.map((r) => ({ ...r, tipo: 'Provento' })),
    ...descontos.map((r) => ({ ...r, tipo: 'Desconto' })),
  ]
  return {
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v: number) => formatCurrency(v),
    },
    grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: {
      type: 'category',
      inverse: true,
      data: rows.map((r) => r.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#475569', width: 150, overflow: 'truncate' },
    },
    series: [
      {
        name: 'Valor',
        type: 'bar',
        barWidth: 14,
        data: rows.map((r) => ({
          value: r.value,
          itemStyle: { color: r.tipo === 'Provento' ? '#0f172a' : '#e11d48', borderRadius: 6 },
        })),
        label: {
          show: true,
          position: 'right',
          color: '#334155',
          formatter: (p: { value: number }) => compactMoney(p.value),
        },
      },
    ],
  }
}
