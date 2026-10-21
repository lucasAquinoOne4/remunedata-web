import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PersonHeader from './PersonHeader.vue'

describe('PersonHeader', () => {
  it('mostra identidade, CPF mascarado e aviso; ignora campos nulos', () => {
    const w = mount(PersonHeader, {
      props: {
        fonte: 'DF',
        nome: 'MARIA SILVA',
        identidade: { cpf_mascarado: '***.123.456-**', matricula: '12345', cargo: 'Professor', orgao: null, uf: 'DF' },
      },
    })
    expect(w.text()).toContain('MARIA SILVA')
    expect(w.text()).toContain('***.123.456-**')
    expect(w.text()).toContain('Matrícula 12345')
    expect(w.text()).toContain('mascarada')
    expect(w.text()).toContain('Professor')
    expect(w.text()).not.toContain('Órgão')
  })

  it('não mostra bloco de CPF quando ausente', () => {
    const w = mount(PersonHeader, { props: { fonte: 'SENADO', nome: 'X', identidade: {} } })
    expect(w.text()).not.toContain('mascarada')
  })
})
