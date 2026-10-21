import type { LoadMonth, LoadSource, PeriodRef } from '@/core/types/api'

export interface YearGroup {
  ano: number
  meses: LoadMonth[]
  registros: number
}

/** Agrupa os meses carregados por ano (anos e meses do mais recente ao mais antigo). */
export function groupMonthsByYear(meses: LoadMonth[]): YearGroup[] {
  const map = new Map<number, LoadMonth[]>()
  for (const m of meses) {
    const list = map.get(m.ano) ?? []
    list.push(m)
    map.set(m.ano, list)
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([ano, list]) => ({
      ano,
      meses: [...list].sort((a, b) => b.mes.localeCompare(a.mes)),
      registros: list.reduce((acc, m) => acc + m.registros, 0),
    }))
}

/** Sugestão de próximo período a carregar: mês seguinte ao último, ou o mês atual. */
export function suggestNextPeriod(ultimo: PeriodRef | null, now = new Date()): PeriodRef {
  if (!ultimo) return { ano: now.getFullYear(), mes: String(now.getMonth() + 1).padStart(2, '0') }
  const m = Number(ultimo.mes)
  if (m >= 12) return { ano: ultimo.ano + 1, mes: '01' }
  return { ano: ultimo.ano, mes: String(m + 1).padStart(2, '0') }
}

export function isValidPeriod(ano: number, mes: string): boolean {
  return Number.isInteger(ano) && ano >= 2000 && ano <= 2100 && /^(0[1-9]|1[0-2])$/.test(mes)
}

export function anyRunning(fontes: LoadSource[] | undefined): boolean {
  return Boolean(fontes?.some((f) => f.em_execucao))
}
