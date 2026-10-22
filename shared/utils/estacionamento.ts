import type { LineString, Position } from 'geojson'
import { distanciaAteTrajeto, distanciaEmMetros } from './geo'

export interface LeituraDeGps {
  posicao: [number, number]
  tempo: number
}

export interface RuaParaDeteccao {
  ruaId: string
  nome: string
  trajeto: LineString
}

export interface EstacionamentoDetectado {
  ruaId: string
  nome: string
  desde: number
  ponto: [number, number]
}

export const JANELA_DE_MOVIMENTO_MS = 5 * 60 * 1000
export const VELOCIDADE_DE_CARRO_MS = 15 / 3.6
export const TEMPO_PARADO_MS = 90 * 1000
export const RAIO_PARADO_M = 15
export const RAIO_DA_RUA_M = 50
export const RAIO_DO_ENTORNO_M = 800

export function detectarEstacionamento(leituras: LeituraDeGps[], ruas: RuaParaDeteccao[], referencia: Position): EstacionamentoDetectado | null {
  const parada = trechoParado(leituras)
  if (!parada) return null
  const [primeira] = parada
  if (!primeira || !vinhaDeCarro(leituras, primeira.tempo)) return null
  if (distanciaEmMetros(primeira.posicao, referencia) > RAIO_DO_ENTORNO_M) return null
  const rua = ruaMaisProxima(primeira.posicao, ruas)
  if (!rua) return null
  return { ruaId: rua.ruaId, nome: rua.nome, desde: primeira.tempo, ponto: primeira.posicao }
}

export function trechoParado(leituras: LeituraDeGps[]): LeituraDeGps[] | null {
  const ultima = leituras.at(-1)
  if (!ultima) return null
  let inicio = leituras.length - 1
  while (inicio > 0 && distanciaEmMetros(leituras[inicio - 1]!.posicao, ultima.posicao) <= RAIO_PARADO_M) inicio -= 1
  const trecho = leituras.slice(inicio)
  return ultima.tempo - trecho[0]!.tempo >= TEMPO_PARADO_MS ? trecho : null
}

export function vinhaDeCarro(leituras: LeituraDeGps[], antesDe: number): boolean {
  const janela = leituras.filter(leitura => leitura.tempo <= antesDe && leitura.tempo >= antesDe - JANELA_DE_MOVIMENTO_MS)
  return janela.some((leitura, indice) => {
    const anterior = janela[indice - 1]
    if (!anterior || leitura.tempo === anterior.tempo) return false
    const velocidade = distanciaEmMetros(anterior.posicao, leitura.posicao) / ((leitura.tempo - anterior.tempo) / 1000)
    return velocidade > VELOCIDADE_DE_CARRO_MS
  })
}

export function ruaMaisProxima(ponto: Position, ruas: RuaParaDeteccao[]): RuaParaDeteccao | null {
  const comDistancia = ruas.map(rua => ({ rua, distancia: distanciaAteTrajeto(ponto, rua.trajeto) }))
  const perto = comDistancia.filter(item => item.distancia <= RAIO_DA_RUA_M).sort((a, b) => a.distancia - b.distancia)
  return perto[0]?.rua ?? null
}
