import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useDebouncedRef } from './useDebouncedRef'

describe('useDebouncedRef', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('só propaga o valor depois do atraso', async () => {
    const scope = effectScope()
    const source = ref('a')
    const api = scope.run(() => useDebouncedRef(source, 250))!
    source.value = 'ab'
    await nextTick()
    vi.advanceTimersByTime(200)
    expect(api.debounced.value).toBe('a')
    source.value = 'abc'
    await nextTick()
    vi.advanceTimersByTime(200)
    expect(api.debounced.value).toBe('a')
    vi.advanceTimersByTime(60)
    expect(api.debounced.value).toBe('abc')
    scope.stop()
  })

  it('flush aplica imediatamente', async () => {
    const scope = effectScope()
    const source = ref('')
    const api = scope.run(() => useDebouncedRef(source, 250))!
    source.value = 'x'
    await nextTick()
    api.flush()
    expect(api.debounced.value).toBe('x')
    scope.stop()
  })
})
