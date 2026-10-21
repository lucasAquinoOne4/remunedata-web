import { useQuery } from '@tanstack/vue-query'
import { RemunerationService } from '../services/remuneration.service'

/** Períodos (ano/mês) realmente carregados por fonte — cache longo. */
export function usePeriods() {
  return useQuery({
    queryKey: ['remuneration', 'periods'],
    queryFn: () => RemunerationService.periods(),
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 12,
  })
}
