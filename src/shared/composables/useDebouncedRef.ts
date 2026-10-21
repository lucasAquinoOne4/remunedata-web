import { ref, watch, onScopeDispose, type Ref } from 'vue'

/**
 * Devolve uma cópia "atrasada" de `source`: só atualiza após `delay` ms sem mudanças.
 * `flush()` aplica o valor atual imediatamente (ex.: ao pressionar Enter).
 */
export function useDebouncedRef<T>(source: Ref<T>, delay = 250) {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  watch(source, (value) => {
    clear()
    timer = setTimeout(() => {
      debounced.value = value
      timer = null
    }, delay)
  })

  const flush = () => {
    clear()
    debounced.value = source.value
  }

  onScopeDispose(clear)

  return { debounced, flush }
}
