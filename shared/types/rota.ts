export type ModoDaRota = 'carro' | 'a_pe'

/** Traçado pelas ruas, calculado pelo OSRM (dados do OpenStreetMap). */
export interface RotaPelasRuas {
  pontos: [number, number][]
  distanciaM: number
  duracaoMin: number
}
