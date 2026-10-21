import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBox from './SearchBox.vue'
import type { Suggestion } from '@/core/types/api'

const suggestions: Suggestion[] = [
  { nome: 'ANA PAULA', fonte: 'DF', cargo: 'Analista', orgao: 'SEEDF' },
  { nome: 'ANA MARIA', fonte: 'SENADO', cargo: null, orgao: null },
]

function factory() {
  return mount(SearchBox, {
    props: { modelValue: 'ana', suggestions },
    attachTo: document.body,
  })
}

describe('SearchBox', () => {
  it('abre o dropdown ao focar e navega com as setas', async () => {
    const w = factory()
    const input = w.find('input')
    await input.trigger('focus')
    expect(w.findAll('[role="option"]')).toHaveLength(2)

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(w.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('true')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(w.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true')
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(w.findAll('[role="option"]')[0].attributes('aria-selected')).toBe('true')
    w.unmount()
  })

  it('Enter seleciona a sugestão ativa', async () => {
    const w = factory()
    const input = w.find('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('select')?.[0]).toEqual([suggestions[0]])
    w.unmount()
  })

  it('Enter sem item ativo dispara submit; Esc fecha a lista', async () => {
    const w = factory()
    const input = w.find('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'Escape' })
    expect(w.find('[role="listbox"]').exists()).toBe(false)
    await input.trigger('keydown', { key: 'Enter' })
    expect(w.emitted('submit')).toHaveLength(1)
    w.unmount()
  })

  it('emite update:modelValue ao digitar', async () => {
    const w = factory()
    await w.find('input').setValue('joao')
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['joao'])
    w.unmount()
  })

  it('atalho "/" foca o campo quando não se está digitando', () => {
    const w = factory()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }))
    expect(document.activeElement).toBe(w.find('input').element)
    w.unmount()
  })
})
