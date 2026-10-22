import { describe, expect, it } from 'vitest'
import { diaDaSemanaDaData, faixasDeContagem, limitesDoDia, momentoDaContagem, taxaDeOcupacao } from '#shared/utils/contagem'
import { esquemaContagem } from '#shared/types/admin'

describe('contagem de campo', () => {
  it('grava o horário da faixa no fuso de São Paulo', () => {
    expect(momentoDaContagem('2026-10-13', '19:30').toISOString()).toBe('2026-10-13T22:30:00.000Z')
  })

  it('calcula o dia da semana pela data local', () => {
    expect(diaDaSemanaDaData('2026-10-13')).toBe(2)
    expect(diaDaSemanaDaData('2026-10-18')).toBe(0)
  })

  it('limita o dia de meia-noite a meia-noite em São Paulo', () => {
    const { inicio, fim } = limitesDoDia('2026-10-13')
    expect(inicio.toISOString()).toBe('2026-10-13T03:00:00.000Z')
    expect(fim.toISOString()).toBe('2026-10-14T03:00:00.000Z')
  })

  it('cobre a noite de 17h00 a 22h30 em faixas de 30 minutos', () => {
    expect(faixasDeContagem).toHaveLength(12)
    expect(faixasDeContagem[0]).toBe('17:00')
    expect(faixasDeContagem.at(-1)).toBe('22:30')
  })

  it('calcula a taxa e recusa contagens impossíveis', () => {
    expect(taxaDeOcupacao(40, 30)).toBe(0.75)
    expect(taxaDeOcupacao(0, 0)).toBeNull()
    expect(taxaDeOcupacao(10, 11)).toBeNull()
  })

  it('valida ocupadas até o total', () => {
    expect(esquemaContagem.safeParse({ faixa: '19:00', vagasTotais: 10, vagasOcupadas: 11 }).success).toBe(false)
    expect(esquemaContagem.safeParse({ faixa: '19:15', vagasTotais: 10, vagasOcupadas: 5 }).success).toBe(false)
    expect(esquemaContagem.safeParse({ faixa: '19:00', vagasTotais: 10, vagasOcupadas: 5 }).success).toBe(true)
  })
})
