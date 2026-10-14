import type { LineString } from 'geojson'
import type { EstadoOcupacao, FaixaDeChance } from '../utils/ocupacao'

export interface Vaga {
  id: string
  ruaId: string
  nomeDaRua: string
  trajeto: LineString
  chegada: string
  saidaPrevista: string | null
  saida: string | null
  previsaoAjudou: boolean | null
  avisarAoSair: boolean
  estadoNaChegada: EstadoOcupacao
  chanceNaChegada: FaixaDeChance | null
}

export interface RotinaNaRegiao {
  chegada: string | null
  saida: string | null
  diasPorSemana: number
}

export interface PainelDaVaga {
  atual: Vaga | null
  rotina: RotinaNaRegiao
}
