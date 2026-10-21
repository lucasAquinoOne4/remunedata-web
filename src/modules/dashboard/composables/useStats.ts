import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { Fonte } from '@/core/types/api'
import { StatsService } from '../services/stats.service'

export const STATS_STALE_MS = 1000 * 60 * 60

export function useStats(fonte: Readonly<Ref<Fonte>>, ano: Readonly<Ref<number | null>>, ready: Readonly<Ref<boolean>>) {
  return useQuery({
    queryKey: ['dashboard', 'stats', fonte, ano],
    queryFn: ({ signal }) => StatsService.get(fonte.value, ano.value ?? undefined, signal),
    enabled: computed(() => ready.value),
    staleTime: STATS_STALE_MS,
    gcTime: 1000 * 60 * 60 * 3,
    placeholderData: (previous) => previous,
  })
}
