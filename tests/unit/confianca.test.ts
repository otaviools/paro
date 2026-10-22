import { describe, expect, it } from 'vitest'
import { confiancaDaPesquisa, confiancaDoCampo, descreverConfianca, intervaloDeWilson, origemDaChance } from '#shared/utils/confianca'
import { faixaDoIntervalo, formatarChance } from '#shared/utils/ocupacao'

describe('intervalo de Wilson a 95%', () => {
  it('calcula o intervalo de 31% em 81 respostas', () => {
    const intervalo = intervaloDeWilson(0.31, 81)
    expect(intervalo.min).toBeCloseTo(0.22, 2)
    expect(intervalo.max).toBeCloseTo(0.417, 2)
  })

  it('não passa de 0% nem de 100%', () => {
    const intervalo = intervaloDeWilson(0.02, 81)
    expect(intervalo.min).toBeGreaterThanOrEqual(0)
    expect(intervaloDeWilson(1, 10).max).toBeLessThanOrEqual(1)
  })

  it('vira faixa de chance arredondada de 5 em 5', () => {
    const intervalo = intervaloDeWilson(0.31, 81)
    expect(formatarChance(faixaDoIntervalo(intervalo.min, intervalo.max))).toBe('20–40%')
  })
})

describe('nível de confiança', () => {
  it('classifica a pesquisa pela margem de erro', () => {
    expect(confiancaDaPesquisa(0.31, 81)).toEqual({ origem: 'pesquisa', nivel: 'media', amostra: 81, margem: 10 })
    expect(confiancaDaPesquisa(0.47, 81).nivel).toBe('baixa')
    expect(confiancaDaPesquisa(0.31, 1000).nivel).toBe('alta')
  })

  it('classifica o campo pelo número de contagens', () => {
    expect(confiancaDoCampo([0.3]).nivel).toBe('baixa')
    expect(confiancaDoCampo([0.3]).margem).toBeNull()
    expect(confiancaDoCampo([0.3, 0.35, 0.4, 0.45])).toEqual({ origem: 'campo', nivel: 'media', amostra: 4, margem: 6 })
    expect(confiancaDoCampo([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]).nivel).toBe('alta')
  })

  it('descreve a origem para quem lê', () => {
    expect(descreverConfianca(confiancaDaPesquisa(0.31, 81))).toBe('estimativa da pesquisa, ±10 p.p.')
    expect(descreverConfianca(confiancaDoCampo([0.3]))).toBe('1 contagem de campo')
    expect(origemDaChance({ medidoEm: null, confianca: confiancaDaPesquisa(0.31, 81) })).toBe('pesquisa')
    expect(origemDaChance({ medidoEm: '2026-10-13T22:00:00Z', confianca: null })).toBe('medido às 19:00')
  })
})
