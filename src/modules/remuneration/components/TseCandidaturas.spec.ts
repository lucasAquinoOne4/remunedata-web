import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TseCandidaturas from './TseCandidaturas.vue'
import type { TseCandidatura } from '@/core/types/api'

const cand: TseCandidatura = {
  ano_eleicao: 2022,
  cargo: 'Deputado Distrital',
  uf: 'DF',
  partido: 'ABC',
  ocupacao: 'Servidor público',
  situacao: 'Deferido',
  resultado: 'Não eleito',
  patrimonio_declarado: 450000.5,
  bens: [
    { tipo: 'Casa', quantidade: 2, valor: 400000.5 },
    { tipo: 'Veículo', quantidade: 1, valor: 50000 },
  ],
  confianca: 'provavel',
  motivo: 'mesmo nome e mesmos 6 dígitos centrais do CPF',
}

describe('TseCandidaturas', () => {
  it('mostra a candidatura, o patrimônio e os bens com o aviso de cruzamento provável', () => {
    const w = mount(TseCandidaturas, { props: { candidaturas: [cand] } })
    expect(w.text()).toContain('2022')
    expect(w.text()).toContain('Deputado Distrital')
    expect(w.get('[data-test="tse-patrimonio"]').text()).toContain('450.000,50')
    expect(w.text()).toContain('Casa')
    expect(w.text()).toContain('Não é confirmação de identidade')
  })

  it('não renderiza nada sem candidaturas', () => {
    const w = mount(TseCandidaturas, { props: { candidaturas: [] } })
    expect(w.find('[data-test="tse"]').exists()).toBe(false)
  })
})
