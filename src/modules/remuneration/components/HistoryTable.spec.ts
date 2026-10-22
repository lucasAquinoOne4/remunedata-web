import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryTable from './HistoryTable.vue'
import { componentLabel, isDiscount } from '../utils/componentes'

const mk = (ano: number, mes: string, bruto: number, comps: Record<string, number> = {}) => ({
  ano,
  mes,
  valor_bruto: bruto,
  valor_liquido: bruto * 0.8,
  componentes: comps,
})

const historico = [
  mk(2025, '01', 1000, { remuneracao_basica: 1000 }),
  mk(2025, '02', 1000, { remuneracao_basica: 1000 }),
  mk(2026, '01', 2000, { remuneracao_basica: 2000, gratificacao_natalina: 500 }),
  mk(2026, '02', 2000, { remuneracao_basica: 2000, previdencia: -300 }),
]

describe('HistoryTable (paginação por anos)', () => {
  it('abre no ano mais recente e mostra só as competências dele', () => {
    const w = mount(HistoryTable, { props: { historico } })
    const rows = w.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(w.text()).toContain('2026')
    expect(w.get('[data-test="resumo-ano"]').text()).toContain('2 competências')
  })

  it('troca de ano ao clicar e só mostra as colunas com valor no ano escolhido', async () => {
    const w = mount(HistoryTable, { props: { historico } })
    expect(w.text()).toContain('Gratificação natalina') // existe em 2026
    const y2025 = w.findAll('nav button').find((b) => b.text() === '2025')!
    await y2025.trigger('click')
    expect(w.findAll('tbody tr')).toHaveLength(2)
    expect(w.text()).not.toContain('Gratificação natalina')
    expect(w.text()).not.toContain('Previdência')
  })

  it('"Todos" lista tudo e as setas navegam entre os anos', async () => {
    const w = mount(HistoryTable, { props: { historico } })
    await w.findAll('nav button').find((b) => b.text() === 'Todos')!.trigger('click')
    expect(w.findAll('tbody tr')).toHaveLength(4)
    await w.findAll('nav button').find((b) => b.text() === '2026')!.trigger('click')
    const older = w.get('button[aria-label="Ano mais antigo"]')
    const newer = w.get('button[aria-label="Ano mais recente"]')
    expect(newer.attributes('disabled')).toBeDefined() // já no mais recente
    await older.trigger('click')
    expect(w.findAll('tbody tr')).toHaveLength(2)
    expect(w.get('[data-test="resumo-ano"]').text()).toContain('2 competências')
    expect(older.attributes('disabled')).toBeDefined() // 2025 é o mais antigo
  })

  it('com um único ano não mostra a paginação', () => {
    const w = mount(HistoryTable, { props: { historico: historico.slice(0, 2) } })
    expect(w.find('nav').exists()).toBe(false)
    expect(w.findAll('tbody tr')).toHaveLength(2)
  })
})

describe('rótulos dos componentes (Senado, Federal e DF)', () => {
  it('têm acento e classificação certa', () => {
    expect(componentLabel('remuneracao_basica')).toBe('Remuneração básica')
    expect(componentLabel('previdencia')).toBe('Previdência')
    expect(componentLabel('imposto_renda')).toBe('Imposto de renda')
    expect(componentLabel('valor_licenca_premio')).toBe('Licença-prêmio')
    expect(isDiscount('previdencia')).toBe(true)
    expect(isDiscount('reversao_teto_constitucional')).toBe(true)
    expect(isDiscount('remuneracao_basica')).toBe(false)
  })
})
