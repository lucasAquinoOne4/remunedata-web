export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface Remuneration {
  id: number
  fonte?: 'DF' | 'SENADO'
  ano_exercicio: number
  mes_referencia: string
  nome_servidor: string
  cpf_servidor: string
  nome_orgao: string
  cargo: string
  valor_bruto: number
  valor_liquido: number
  created_at: string
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
