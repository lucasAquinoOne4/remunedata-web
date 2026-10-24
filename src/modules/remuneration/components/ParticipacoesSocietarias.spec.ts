import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ParticipacoesSocietarias from './ParticipacoesSocietarias.vue'
import type { ParticipacaoSocietaria } from '@/core/types/api'

const base: ParticipacaoSocietaria = {
  cnpj_basico: '12345678',
  razao_social: 'EMPRESA EXEMPLO LTDA',
  nome_fantasia: 'Exemplo',
  situacao_cadastral: 'Ativa',
  data_situacao: '2015-03-10',
  data_inicio_atividade: '2010-01-05',
  cnae_principal: '4781400',
  cnae_descricao: 'Comércio varejista de artigos do vestuário',
  uf: 'DF',
  natureza_juridica: 'Sociedade Empresária Limitada',
  porte: 'Microempresa',
  capital_social: 150000.5,
  qualificacao: 'Sócio-Administrador',
  data_entrada: '2012-07-20',
  faixa_etaria: '41 a 50 anos',
  confianca: 'provavel',
  motivo: 'mesmo nome e mesmos 6 dígitos centrais do CPF',
}

const baixada: ParticipacaoSocietaria = {
  ...base,
  cnpj_basico: '87654321',
  razao_social: 'OUTRA EMPRESA SA',
  nome_fantasia: null,
  situacao_cadastral: 'Baixada',
  data_situacao: '2020-12-31',
}

describe('ParticipacoesSocietarias', () => {
  it('mostra empresas ativa e baixada com capital, datas e CNPJ raiz formatados', () => {
    const w = mount(ParticipacoesSocietarias, { props: { participacoes: [base, baixada] } })
    expect(w.findAll('[data-test="rfb-item"]')).toHaveLength(2)
    expect(w.text()).toContain('EMPRESA EXEMPLO LTDA')
    expect(w.text()).toContain('OUTRA EMPRESA SA')
    expect(w.text()).toContain('CNPJ (raiz) 12.345.678')
    expect(w.text()).toContain('Sócio-Administrador')
    expect(w.text()).toContain('20/07/2012')
    expect(w.text()).toContain('4781400')
    const situacoes = w.findAll('[data-test="rfb-situacao"]')
    expect(situacoes[0].text()).toContain('Ativa')
    expect(situacoes[0].classes().join(' ')).toContain('emerald')
    expect(situacoes[1].text()).toContain('Baixada')
    expect(situacoes[1].text()).toContain('31/12/2020')
    expect(situacoes[1].classes().join(' ')).toContain('slate')
    expect(w.get('[data-test="rfb-capital"]').text()).toContain('150.000,50')
  })

  it('mostra o aviso de cruzamento provável e de que não indica irregularidade', () => {
    const w = mount(ParticipacoesSocietarias, { props: { participacoes: [base] } })
    expect(w.text()).toContain('Cruzamento provável')
    expect(w.text()).toContain('não é confirmação de identidade')
    expect(w.text()).toContain('não indica irregularidade')
  })

  it('lida com campos nulos sem quebrar', () => {
    const vazio: ParticipacaoSocietaria = {
      ...base,
      razao_social: null,
      nome_fantasia: null,
      situacao_cadastral: null,
      data_situacao: null,
      data_inicio_atividade: null,
      cnae_principal: null,
      cnae_descricao: null,
      uf: null,
      natureza_juridica: null,
      porte: null,
      capital_social: null,
      qualificacao: null,
      data_entrada: null,
      faixa_etaria: null,
    }
    const w = mount(ParticipacoesSocietarias, { props: { participacoes: [vazio] } })
    expect(w.text()).toContain('CNPJ (raiz) 12.345.678')
    expect(w.find('[data-test="rfb-capital"]').exists()).toBe(false)
    expect(w.find('[data-test="rfb-situacao"]').exists()).toBe(false)
    expect(w.text()).not.toContain('null')
    expect(w.text()).not.toContain('Invalid')
  })

  it('não renderiza nada com lista vazia', () => {
    const w = mount(ParticipacoesSocietarias, { props: { participacoes: [] } })
    expect(w.find('[data-test="rfb"]').exists()).toBe(false)
  })
})
