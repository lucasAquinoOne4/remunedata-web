import type { PersonHistoryEntry } from '@/core/types/api'
import { collectComponentKeys, componentLabel } from './componentes'

const SEP = ';'

function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? value.toFixed(2).replace('.', ',') : ''
  // evita injeção de fórmulas em planilhas
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /["\n\r;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** Gera CSV (separador ';', decimal com vírgula, compatível com Excel pt-BR). */
export function historyToCsv(historico: PersonHistoryEntry[]): string {
  const keys = collectComponentKeys(historico)
  const header = ['Ano', 'Mês', 'Valor bruto', 'Valor líquido', ...keys.map(componentLabel)]
  const lines = [header.map(cell).join(SEP)]
  for (const h of historico) {
    const row: (string | number | null)[] = [
      String(h.ano),
      h.mes,
      h.valor_bruto,
      h.valor_liquido,
      ...keys.map((k) => (h.componentes?.[k] ?? null) as number | null),
    ]
    lines.push(row.map(cell).join(SEP))
  }
  return lines.join('\r\n')
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function csvFilename(nome: string | null | undefined, fonte: string): string {
  const slug = (nome ?? 'servidor')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `remuneracao-${fonte.toLowerCase()}-${slug || 'servidor'}.csv`
}
