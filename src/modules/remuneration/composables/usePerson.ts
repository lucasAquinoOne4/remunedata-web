import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import type { Fonte } from '@/core/types/api'
import { RemunerationService } from '../services/remuneration.service'

export function usePerson(
  fonte: Readonly<Ref<Fonte>>,
  id: Readonly<Ref<string>>,
  matricula: Readonly<Ref<string | undefined>>,
) {
  return useQuery({
    queryKey: ['remuneration', 'person', fonte, id, matricula],
    queryFn: ({ signal }) => RemunerationService.person(fonte.value, id.value, matricula.value, signal),
    enabled: computed(() => Boolean(id.value)),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  })
}
