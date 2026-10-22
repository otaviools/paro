import { describe, expect, it } from 'vitest'
import { combinarOcupacoes, novaReputacao, ocupacaoDoRelato, pesoDoRelato, relatadoHa } from '#shared/utils/relato'
import { confiancaCombinada, descreverConfianca, origemDaChance } from '#shared/utils/confianca'

describe('relato: tabela de equivalência', () => {
  it('converte estado e tempo em ocupação', () => {
    expect(ocupacaoDoRelato({ estado: 'lotado' })).toBe(0.95)
    expect(ocupacaoDoRelato({ tempo: 'desisti' })).toBe(1)
    expect(ocupacaoDoRelato({ estado: 'livre', tempo: 'ate_2' })).toBeCloseTo(0.475)
  })

  it('não vale sem resposta', () => {
    expect(ocupacaoDoRelato({})).toBeNull()
    expect(ocupacaoDoRelato({ estado: null, tempo: null })).toBeNull()
  })
})

describe('relato: peso e reputação', () => {
  it('pesa mais com e-mail verificado e perto da rua', () => {
    expect(pesoDoRelato({ verificado: false, perto: false, reputacao: 1 })).toBe(0.5)
    expect(pesoDoRelato({ verificado: false, perto: true, reputacao: 2 })).toBe(1)
    expect(pesoDoRelato({ verificado: true, perto: false, reputacao: 1 })).toBe(1)
    expect(pesoDoRelato({ verificado: true, perto: true, reputacao: 2 })).toBe(3)
  })

  it('a reputação sobe no acerto, cai no erro e fica entre 0,25 e 2', () => {
    expect(novaReputacao(1, 0.9, 0.95)).toBeCloseTo(1.1)
    expect(novaReputacao(1, 0.45, 0.95)).toBeCloseTo(0.8)
    expect(novaReputacao(1, 0.7, 0.95)).toBe(1)
    expect(novaReputacao(2, 0.9, 0.9)).toBe(2)
    expect(novaReputacao(0.3, 0.1, 0.9)).toBe(0.25)
  })
})

describe('relato: combinação das fontes', () => {
  it('a pesquisa vale cerca de cinco relatos', () => {
    const pesquisa = { ocupacao: 0.7, peso: 5 }
    const relatos = Array.from({ length: 5 }, () => ({ ocupacao: 0.95, peso: 1 }))
    expect(combinarOcupacoes([pesquisa, ...relatos])?.media).toBeCloseTo(0.825)
  })

  it('a margem encolhe com mais relatos e nunca é zero', () => {
    const poucos = combinarOcupacoes([{ ocupacao: 0.9, peso: 1 }, { ocupacao: 0.9, peso: 1 }])
    const muitos = combinarOcupacoes(Array.from({ length: 30 }, () => ({ ocupacao: 0.9, peso: 1 })))
    expect(poucos?.margem).toBeGreaterThan(muitos?.margem ?? 1)
    expect(muitos?.margem).toBeGreaterThan(0)
  })

  it('sem peso não há combinação', () => {
    expect(combinarOcupacoes([])).toBeNull()
  })

  it('descreve as fontes no selo', () => {
    const confianca = confiancaCombinada({ contagens: 0, pesquisa: 81, relatos: 12 }, 0.08)
    expect(confianca).toMatchObject({ origem: 'combinada', nivel: 'media', amostra: 12, margem: 8 })
    expect(descreverConfianca(confianca)).toBe('pesquisa + 12 relatos, ±8 p.p.')
    expect(origemDaChance({ medidoEm: null, confianca })).toBe('12 relatos')
  })

  it('conta os minutos desde o relato', () => {
    expect(relatadoHa(new Date('2026-10-16T22:00:00Z'), new Date('2026-10-16T22:08:30Z'))).toBe(8)
  })
})
