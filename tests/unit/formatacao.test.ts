import { describe, expect, it } from 'vitest'
import { formatarDataCurta, formatarDistancia, formatarDuracao, formatarHora, formatarHoraCompacta, minutosAPe } from '#shared/utils/formatacao'
import { distanciaEmMetros } from '#shared/utils/geo'

describe('formatação', () => {
  it('formata a hora no fuso de São Paulo', () => {
    expect(formatarHora('2026-10-13T22:00:00Z')).toBe('19:00')
    expect(formatarHoraCompacta('2026-10-14T00:30:00Z')).toBe('21h30')
    expect(formatarHora(null)).toBe('—')
  })

  it('formata a duração na vaga', () => {
    expect(formatarDuracao(72)).toBe('1h 12min')
    expect(formatarDuracao(45)).toBe('45min')
    expect(formatarDuracao(180)).toBe('3h')
  })

  it('formata a data do histórico', () => {
    expect(formatarDataCurta('2026-09-21T21:51:00Z')).toBe('Seg, 21 set')
  })

  it('formata distâncias e tempo a pé', () => {
    expect(formatarDistancia(184)).toBe('180 m')
    expect(formatarDistancia(1250)).toBe('1,3 km')
    expect(minutosAPe(180)).toBe(3)
  })
})

describe('geo', () => {
  it('mede distâncias curtas em metros', () => {
    const distancia = distanciaEmMetros([-48.27969, -18.91238], [-48.27969, -18.91328])
    expect(Math.round(distancia)).toBe(100)
  })
})
