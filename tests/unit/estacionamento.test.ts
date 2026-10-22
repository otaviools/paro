import { describe, expect, it } from 'vitest'
import { detectarEstacionamento, type LeituraDeGps, type RuaParaDeteccao } from '#shared/utils/estacionamento'

const ESAMC: [number, number] = [-48.27969, -18.91238]
const ruas: RuaParaDeteccao[] = [
  { ruaId: 'vasconcelos', nome: 'Av. Vasconcelos Costa', trajeto: { type: 'LineString', coordinates: [[-48.2800, -18.9124], [-48.2790, -18.9124]] } },
]
const NA_RUA: [number, number] = [-48.2794, -18.91242]
const UM_SEGUNDO = 1000

function trajeto(passos: { de: [number, number], para: [number, number], segundos: number }[], intervalo = 10): LeituraDeGps[] {
  const leituras: LeituraDeGps[] = []
  let tempo = 0
  for (const { de, para, segundos } of passos) {
    for (let t = 0; t <= segundos; t += intervalo) {
      const fracao = segundos === 0 ? 1 : t / segundos
      leituras.push({ posicao: [de[0] + (para[0] - de[0]) * fracao, de[1] + (para[1] - de[1]) * fracao], tempo: tempo + t * UM_SEGUNDO })
    }
    tempo += segundos * UM_SEGUNDO
  }
  return leituras
}

const LONGE: [number, number] = [-48.2860, -18.9124]

describe('detecção de estacionamento', () => {
  it('detecta quem chegou de carro e parou 90 s numa rua medida', () => {
    const leituras = trajeto([{ de: LONGE, para: NA_RUA, segundos: 60 }, { de: NA_RUA, para: NA_RUA, segundos: 100 }])
    expect(detectarEstacionamento(leituras, ruas, ESAMC)).toMatchObject({ ruaId: 'vasconcelos', desde: 60 * UM_SEGUNDO })
  })

  it('não pergunta no semáforo, antes dos 90 s parado', () => {
    const leituras = trajeto([{ de: LONGE, para: NA_RUA, segundos: 60 }, { de: NA_RUA, para: NA_RUA, segundos: 40 }])
    expect(detectarEstacionamento(leituras, ruas, ESAMC)).toBeNull()
  })

  it('não pergunta para quem chegou a pé', () => {
    const leituras = trajeto([{ de: [-48.2804, -18.9124], para: NA_RUA, segundos: 300 }, { de: NA_RUA, para: NA_RUA, segundos: 100 }])
    expect(detectarEstacionamento(leituras, ruas, ESAMC)).toBeNull()
  })

  it('não pergunta longe de uma rua medida ou fora do entorno', () => {
    const foraDaRua: [number, number] = [-48.2794, -18.9140]
    const longeDaEsamc: [number, number] = [-48.2950, -18.9124]
    const ruaLonge: RuaParaDeteccao = { ruaId: 'longe', nome: 'Rua longe', trajeto: { type: 'LineString', coordinates: [longeDaEsamc, [-48.2951, -18.9124]] } }
    const semRua = trajeto([{ de: LONGE, para: foraDaRua, segundos: 60 }, { de: foraDaRua, para: foraDaRua, segundos: 100 }])
    const foraDoEntorno = trajeto([{ de: [-48.3010, -18.9124], para: longeDaEsamc, segundos: 60 }, { de: longeDaEsamc, para: longeDaEsamc, segundos: 100 }])
    expect(detectarEstacionamento(semRua, ruas, ESAMC)).toBeNull()
    expect(detectarEstacionamento(foraDoEntorno, [ruaLonge], ESAMC)).toBeNull()
  })
})

describe('distância até a rua', () => {
  it('mede até o segmento, não só até os vértices', async () => {
    const { distanciaAteTrajeto } = await import('#shared/utils/geo')
    const rua = { type: 'LineString' as const, coordinates: [[-48.2810, -18.9124], [-48.2780, -18.9124]] }
    expect(distanciaAteTrajeto([-48.2795, -18.9124], rua)).toBeLessThan(1)
    expect(distanciaAteTrajeto([-48.2795, -18.9133], rua)).toBeCloseTo(100, -1)
  })
})
