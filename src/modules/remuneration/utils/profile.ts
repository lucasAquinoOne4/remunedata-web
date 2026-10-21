import type { PersonHistoryEntry, PersonIdentity, PersonProfile } from '@/core/types/api'

export interface Kpis {
  bruto: number
  liquido: number
  descontos: number
  descontosPct: number
}

/** KPIs do último mês: bruto, líquido e descontos (bruto - líquido) com percentual. */
export function computeKpis(ultimo: Pick<PersonHistoryEntry, 'valor_bruto' | 'valor_liquido'> | null): Kpis | null {
  if (!ultimo) return null
  const bruto = Number(ultimo.valor_bruto) || 0
  const liquido = Number(ultimo.valor_liquido) || 0
  const descontos = Math.max(0, bruto - liquido)
  return { bruto, liquido, descontos, descontosPct: bruto > 0 ? (descontos / bruto) * 100 : 0 }
}

/** Último registro: `ultimo` do contrato ou o final do histórico. */
export function latestEntry(profile: Pick<PersonProfile, 'ultimo' | 'historico'>): PersonHistoryEntry | null {
  return profile.ultimo ?? profile.historico[profile.historico.length - 1] ?? null
}

export interface IdentityChip {
  key: keyof PersonIdentity
  label: string
  value: string
}

const CHIP_FIELDS: [keyof PersonIdentity, string][] = [
  ['vinculo', 'Vínculo'],
  ['situacao', 'Situação'],
  ['regime', 'Regime'],
  ['jornada', 'Jornada'],
  ['tipo', 'Tipo'],
  ['uf', 'UF'],
  ['orgao', 'Órgão'],
  ['orgao_superior', 'Órgão superior'],
  ['lotacao', 'Lotação'],
  ['cargo', 'Cargo'],
  ['funcao', 'Função'],
]

/** Campos de identidade preenchidos (ignora nulos e vazios), sem repetir valores iguais. */
export function identityChips(identidade: Partial<PersonIdentity> | null | undefined): IdentityChip[] {
  const seen = new Set<string>()
  const chips: IdentityChip[] = []
  for (const [key, label] of CHIP_FIELDS) {
    const raw = identidade?.[key]
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (!value) continue
    const norm = `${key === 'uf' ? 'uf' : ''}${value.toLowerCase()}`
    if (seen.has(norm)) continue
    seen.add(norm)
    chips.push({ key, label, value })
  }
  return chips
}

/** Posição textual do percentil: "acima de X% dos pares". */
export function percentilText(percentil: number): string {
  const p = Math.round(Math.min(100, Math.max(0, percentil)))
  if (p >= 50) return `Ganha mais que ${p}% dos pares`
  return `Ganha menos que ${100 - p}% dos pares`
}

export function clampPct(value: number): number {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
}
