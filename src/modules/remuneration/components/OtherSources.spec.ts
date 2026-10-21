import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OtherSources from './OtherSources.vue'
import type { OtherSourceMatch } from '@/core/types/api'

const base: OtherSourceMatch = {
  fonte: 'SENADO',
  id: '10',
  nome: 'ANA PAULA',
  cargo: 'Analista',
  orgao: 'Senado',
  ano: 2025,
  mes: '03',
  valor_bruto: 1000,
  confianca: 'provavel',
  motivo: 'nome + CPF',
}

const stubs = { RouterLink: { template: '<a><slot /></a>' } }

describe('OtherSources', () => {
  it('mostra badges Provável e Possível e o aviso de homônimos', () => {
    const w = mount(OtherSources, {
      props: { matches: [base, { ...base, id: '11', confianca: 'possivel' }] },
      global: { stubs },
    })
    expect(w.text()).toContain('Provável')
    expect(w.text()).toContain('Possível')
    expect(w.text()).toContain('homônimos')
  })

  it('mostra mensagem quando não há correspondências', () => {
    const w = mount(OtherSources, { props: { matches: [] }, global: { stubs } })
    expect(w.text()).toContain('Nenhum registro correspondente')
  })
})
