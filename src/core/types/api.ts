export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export type Fonte = 'DF' | 'SENADO' | 'FEDERAL' | 'CE' | 'PE' | 'GO' | 'SC' | 'JU'

export const FONTES: readonly Fonte[] = ['DF', 'SENADO', 'FEDERAL', 'CE', 'PE', 'GO', 'SC', 'JU'] as const

export const FONTE_LABEL: Record<Fonte, string> = {
  DF: 'Governo do DF',
  SENADO: 'Senado',
  FEDERAL: 'Executivo Federal',
  CE: 'Governo do Ceará',
  PE: 'Governo de Pernambuco',
  GO: 'Governo de Goiás',
  SC: 'Governo de Santa Catarina',
  JU: 'Justiça do DF',
}

/** Item de remuneração retornado pela busca (CPF sempre mascarado). */
export interface RemunerationItem {
  id: number
  fonte: Fonte
  ano_exercicio: number
  mes_referencia: string
  codigo_identificacao: string
  codigo_matricula: string
  nome_servidor: string
  cpf_servidor: string | null
  nome_orgao: string | null
  cargo: string | null
  valor_bruto: number
  valor_liquido: number
}

/** @deprecated use RemunerationItem */
export type Remuneration = RemunerationItem

export interface RemunerationSearchResponse {
  items: RemunerationItem[]
  total: number
  total_capped: boolean
  page: number
  size: number
  pages: number
}

export interface Suggestion {
  nome: string
  fonte: Fonte
  cargo: string | null
  orgao: string | null
}

export interface SuggestResponse {
  suggestions: Suggestion[]
}

export interface PeriodRef {
  ano: number
  mes: string
}

export type PeriodsResponse = Partial<Record<Fonte, PeriodRef[]>>

export interface StatsMonthly {
  ano: number
  mes: string
  registros: number
  media_bruto: number
  total_bruto: number
}

export interface StatsOrgao {
  nome: string
  registros: number
  media_bruto: number
}

export interface StatsFaixa {
  faixa: string
  registros: number
}

export interface StatsResponse {
  fonte: Fonte
  total_servidores: number
  media_bruto: number
  total_bruto: number
  mensal: StatsMonthly[]
  top_orgaos: StatsOrgao[]
  faixas: StatsFaixa[]
}

export type ComponentesMap = Record<string, number>

export interface PersonIdentity {
  nome: string | null
  cpf_mascarado: string | null
  matricula: string | null
  cargo: string | null
  funcao: string | null
  orgao: string | null
  lotacao: string | null
  orgao_superior: string | null
  situacao: string | null
  vinculo: string | null
  regime: string | null
  jornada: string | null
  uf: string | null
  tipo: string | null
}

/** Contexto econômico do mês (IPCA, salário mínimo e teto). Qualquer campo pode faltar. */
export interface HistoryContext {
  bruto_real: number | null
  salarios_minimos: number | null
  teto: number | null
  pct_teto: number | null
}

export interface PersonHistoryEntry {
  ano: number
  mes: string
  valor_bruto: number
  valor_liquido: number
  componentes: ComponentesMap
  contexto?: HistoryContext
}

export interface PersonPeers {
  criterio: string
  cargo: string | null
  ano: number
  mes: string
  n: number
  media_bruto: number
  mediana_bruto: number
  p90_bruto: number
  percentil: number
}

export type MatchConfidence = 'provavel' | 'possivel'

export interface OtherSourceMatch {
  fonte: Fonte
  id: string
  nome: string
  cargo: string | null
  orgao: string | null
  ano: number
  mes: string
  valor_bruto: number
  confianca: MatchConfidence
  motivo: string
}

export interface ContextoBase {
  referencia: string
  inflacao: string
  salario_minimo: string
  teto: string
}

export interface TseBem {
  tipo: string
  quantidade: number
  valor: number
}

export interface TseCandidatura {
  ano_eleicao: number
  cargo: string | null
  uf: string | null
  partido: string | null
  ocupacao: string | null
  situacao: string | null
  resultado: string | null
  patrimonio_declarado: number
  bens: TseBem[]
  confianca: MatchConfidence
  motivo: string
}

export interface PersonProfile {
  fonte: Fonte
  id: string
  identidade: Partial<PersonIdentity>
  historico: PersonHistoryEntry[]
  ultimo: PersonHistoryEntry | null
  pares: PersonPeers | null
  outras_fontes: OtherSourceMatch[]
  contexto_base?: ContextoBase | null
  candidaturas_tse?: TseCandidatura[]
  ficha_federal: Record<string, unknown> | null
}

export interface LoadMonth {
  ano: number
  mes: string
  registros: number
}

export interface LoadSource {
  fonte: Fonte
  total_registros: number
  meses: LoadMonth[]
  ultimo: PeriodRef | null
  em_execucao: boolean
}

export interface LoadDfCollection {
  id: number
  ano: number
  status: string
  meses_processados: number
  registros: number
}

export interface LoadsResponse {
  fontes: LoadSource[]
  coleta_df: LoadDfCollection[]
}

export interface TriggerLoadResponse {
  task_id: string
  status: 'queued' | 'skipped'
  detalhe?: string
}

export interface TopOrgao {
  nome_orgao: string
  total_servidores?: number
  count?: number
  media_salarial?: number
}

export interface Summary {
  total_servidores: number
  total_gasto_bruto: number
  media_salarial: number
  ano_referencia: number
  top_orgaos: TopOrgao[]
}

export interface MonthlyExecution {
  id?: number
  mes_referencia: string
  status: 'pending' | 'running' | 'success' | 'partial_success' | 'error'
  registros_coletados: number
}

export interface Execution {
  id: number
  ano_exercicio: number
  status: 'pending' | 'running' | 'success' | 'partial_success' | 'error'
  started_at: string
  finished_at: string | null
  total_registros_coletados: number
  error_message?: string | null
  monthly_executions?: MonthlyExecution[]
  monthlyExecutions?: MonthlyExecution[]
}
