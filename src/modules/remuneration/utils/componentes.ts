import type { ComponentesMap, PersonHistoryEntry } from '@/core/types/api'

const LABELS: Record<string, string> = {
  // Senado
  remuneracao_basica: 'Remuneração básica',
  funcao_comissionada: 'Função comissionada',
  horas_extras: 'Horas extras',
  vantagens_indenizatorias: 'Vantagens indenizatórias',
  imposto_renda: 'Imposto de renda',
  previdencia: 'Previdência',
  reversao_teto_constitucional: 'Reversão do teto constitucional',
  // Federal
  abate_teto_natalina: 'Abate-teto do 13º',
  // Governo do DF
  valor_comissao_conselheiro: 'Comissão de conselheiro',
  valor_verbas_eventuais: 'Verbas eventuais',
  valor_verbas_judiciais: 'Verbas judiciais',
  valor_receitas_meses_anteriores: 'Receitas de meses anteriores',
  valor_reposicao_descontos_maior: 'Reposição de descontos a maior',
  valor_licenca_premio: 'Licença-prêmio',
  valor_redutor_teto: 'Redutor do teto',
  valor_descontos_meses_anteriores: 'Descontos de meses anteriores',
  valor_reposicao_pagamento_maior: 'Reposição de pagamento a maior',
  valor_expurgo: 'Expurgo',
  remuneracao_basica_bruta: 'Remuneração básica bruta',
  valor_remuneracao_basica: 'Remuneração básica',
  abate_teto: 'Abate-teto',
  gratificacao_natalina: 'Gratificação natalina (13º)',
  ferias: 'Férias',
  outras_eventuais: 'Outras remunerações eventuais',
  irrf: 'Imposto de renda (IRRF)',
  pss_rpgs: 'Previdência (PSS/RPGS)',
  demais_deducoes: 'Demais deduções',
  verbas_indenizatorias: 'Verbas indenizatórias',
  valor_beneficios: 'Benefícios',
  valor_funcoes: 'Funções e cargos em comissão',
  valor_hora_extra: 'Horas extras',
  valor_imposto_renda: 'Imposto de renda',
  valor_seguridade_social: 'Seguridade social',
  vantagens_pessoais: 'Vantagens pessoais',
  auxilios: 'Auxílios',
  diarias: 'Diárias',
  vantagens_eventuais: 'Vantagens eventuais',
  gratificacoes: 'Gratificações',
  adicionais: 'Adicionais',
  indenizacoes: 'Indenizações',
  abono_permanencia: 'Abono de permanência',
  jetons: 'Jetons',
  faltas: 'Faltas',
  redutor_teto: 'Redutor constitucional (teto)',
}

const DISCOUNT_HINTS = [
  'irrf',
  'pss',
  'deducao',
  'deducoes',
  'previdencia',
  'imposto',
  'seguridade',
  'abate',
  'faltas',
  'redutor',
  'reversao',
  'expurgo',
  'descontos',
]

/** Rótulo em português da chave de componente (com fallback legível). */
export function componentLabel(key: string): string {
  if (LABELS[key]) return LABELS[key]
  const words = key
    .replace(/^valor_/, '')
    .split(/[_\s]+/)
    .filter(Boolean)
    .join(' ')
  if (!words) return key
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function isDiscount(key: string): boolean {
  const k = key.toLowerCase()
  return DISCOUNT_HINTS.some((hint) => k.includes(hint))
}

export interface ComponentRow {
  key: string
  label: string
  value: number
}

/** Separa componentes em proventos e descontos (valor absoluto), maiores primeiro, sem zeros. */
export function splitComponents(componentes: ComponentesMap | null | undefined): {
  proventos: ComponentRow[]
  descontos: ComponentRow[]
} {
  const proventos: ComponentRow[] = []
  const descontos: ComponentRow[] = []
  for (const [key, raw] of Object.entries(componentes ?? {})) {
    const value = Number(raw)
    if (!Number.isFinite(value) || value === 0) continue
    const row = { key, label: componentLabel(key), value: Math.abs(value) }
    ;(isDiscount(key) ? descontos : proventos).push(row)
  }
  const byValue = (a: ComponentRow, b: ComponentRow) => b.value - a.value
  return { proventos: proventos.sort(byValue), descontos: descontos.sort(byValue) }
}

/** União ordenada das chaves de componentes presentes no histórico. */
export function collectComponentKeys(historico: PersonHistoryEntry[]): string[] {
  const keys = new Set<string>()
  for (const h of historico) for (const k of Object.keys(h.componentes ?? {})) keys.add(k)
  return [...keys].sort((a, b) => {
    const da = isDiscount(a) ? 1 : 0
    const db = isDiscount(b) ? 1 : 0
    return da - db || componentLabel(a).localeCompare(componentLabel(b), 'pt-BR')
  })
}
