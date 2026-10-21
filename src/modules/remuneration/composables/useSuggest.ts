import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDebouncedRef } from '@/shared/composables/useDebouncedRef'
import { RemunerationService } from '../services/remuneration.service'
import type { FonteTab } from '../utils/search'

export const SUGGEST_MIN_CHARS = 3

/** Sugestões de nomes enquanto digita (debounce + cancelamento da requisição anterior). */
export function useSuggest(
  term: Ref<string>,
  fonte: Readonly<Ref<FonteTab>>,
  active: Readonly<Ref<boolean>>,
) {
  const { debounced } = useDebouncedRef(term, 200)
  const q = computed(() => debounced.value.trim())
  const enabled = computed(() => active.value && q.value.length >= SUGGEST_MIN_CHARS)

  const query = useQuery({
    queryKey: ['remuneration', 'suggest', q, fonte],
    queryFn: ({ signal }) =>
      RemunerationService.suggest(q.value, fonte.value === 'ALL' ? undefined : fonte.value, signal),
    enabled,
    staleTime: 1000 * 60 * 10,
    placeholderData: (previous) => previous,
  })

  const suggestions = computed(() => (enabled.value ? (query.data.value ?? []) : []))
  return { suggestions, isFetching: query.isFetching }
}
