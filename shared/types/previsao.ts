import type { FeatureCollection, LineString, Point } from 'geojson'
import type { EstadoOcupacao, FaixaDeChance } from '../utils/ocupacao'

export interface PrevisaoRua {
  ruaId: string
  nome: string
  distanciaM: number
  estado: EstadoOcupacao
  chance: FaixaDeChance | null
  medidoEm: string | null
  temMedicao: boolean
}

export interface PontoDaNoite {
  faixa: string
  rotulo: string
  chance: number
  agora: boolean
}

export interface CitacaoNaPesquisa {
  percentual: number
  base: number
}

export interface DetalheRua {
  previsao: PrevisaoRua
  trajeto: LineString
  faixa: string
  citacao: CitacaoNaPesquisa | null
  alternativa: PrevisaoRua | null
}

export interface LugarDeReferencia {
  nome: string
  descricao: string
  areaId: string
}

export interface ResultadoDaBusca {
  ruas: PrevisaoRua[]
  lugares: LugarDeReferencia[]
  semPrevisao: PrevisaoRua[]
}

export interface PropriedadesDaRua {
  ruaId: string
  nome: string
  estado: EstadoOcupacao
  chance: string
  medidoEm: string | null
}

export interface MapaDaArea {
  referencia: Point
  nomeDaReferencia: string
  faixa: string
  ruas: FeatureCollection<LineString, PropriedadesDaRua>
}
