import { describe, expect, it } from 'vitest'
import { diaDaSemanaAtual, faixaDeTrintaMinutosAtual, hojePorExtenso, rotuloDaFaixa, saudacao } from '#shared/utils/horario'

describe('horário de São Paulo', () => {
  const noitePaulista = new Date('2026-10-14T02:10:00Z')

  it('mantém o dia local mesmo quando já é amanhã em UTC', () => {
    expect(diaDaSemanaAtual(noitePaulista)).toBe(2)
  })

  it('arredonda para a faixa de 30 minutos', () => {
    expect(faixaDeTrintaMinutosAtual(noitePaulista)).toBe('23:00')
    expect(faixaDeTrintaMinutosAtual(new Date('2026-10-13T22:45:00Z'))).toBe('19:30')
  })

  it('escreve a data de hoje para as abas', () => {
    expect(hojePorExtenso(noitePaulista)).toBe('Hoje, ter., 13 de out.')
  })

  it('escreve a faixa como nas abas', () => {
    expect(rotuloDaFaixa('19:00')).toBe('19h00')
  })

  it('cumprimenta pela hora local', () => {
    expect(saudacao(new Date('2026-10-13T12:00:00Z'))).toBe('Bom dia')
    expect(saudacao(noitePaulista)).toBe('Boa noite')
  })
})
