import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import type { Fonte } from '@/core/types/api'
import { AdminService } from '../services/admin.service'
import { anyRunning } from '../utils/loads'

export const LOADS_KEY = ['admin', 'loads'] as const

export function useLoads() {
  return useQuery({
    queryKey: LOADS_KEY,
    queryFn: () => AdminService.getLoads(),
    staleTime: 1000 * 15,
    retry: (count, error) => !(isAxiosError(error) && [403, 404, 501].includes(error.response?.status ?? 0)) && count < 1,
    // enquanto houver carga em execução, atualiza a cada 5s
    refetchInterval: (query) => (anyRunning(query.state.data?.fontes) ? 5000 : false),
  })
}

export function useTriggerLoad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { fonte: Fonte; ano: number; mes: string }) =>
      AdminService.triggerLoad(v.fonte, v.ano, v.mes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LOADS_KEY }),
  })
}
