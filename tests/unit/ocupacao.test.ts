import { describe, expect, it } from 'vitest'
import { chancePontual, classificarOcupacao, faixaDeChance, formatarChance } from '#shared/utils/ocupacao'

describe('classificarOcupacao', () => {
  it.each([
    [0.6, 'livre'],
    [0.61, 'apertado'],
    [0.85, 'apertado'],
    [0.86, 'lotado'],
    [null, 'sem_dado'],
  ] as const)('classifica %s como %s', (taxa, estado) => {
    expect(classificarOcupacao(taxa)).toBe(estado)
  })
})

describe('formatarChance', () => {
  it('mostra faixa quando há medições', () => {
    expect(formatarChance(faixaDeChance([0.3, 0.35, 0.4, 0.45]))).toBe('60–65%')
  })

  it('mostra traço sem medições', () => {
    expect(formatarChance(faixaDeChance([]))).toBe('—')
  })

  it('mostra até 5% quando a chance é quase nula', () => {
    expect(formatarChance(faixaDeChance([1, 0.975, 0.95, 0.925]))).toBe('até 5%')
  })

  it('mostra um número só quando a faixa é estreita', () => {
    expect(formatarChance({ min: 40, max: 40 })).toBe('40%')
  })
})

describe('faixaDeChance', () => {
  it('usa os percentis 25 e 75, arredondados de 5 em 5', () => {
    expect(faixaDeChance([0.75, 0.725, 0.675, 0.65])).toEqual({ min: 25, max: 35 })
  })
})

describe('chancePontual', () => {
  it('usa a mediana das chances', () => {
    expect(chancePontual([0.75, 0.725, 0.675, 0.65])).toBe(30)
  })

  it('devolve nulo sem medições', () => {
    expect(chancePontual([])).toBeNull()
  })
})
