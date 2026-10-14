import type { Point } from 'geojson'

export interface Area {
  id: string
  nome: string
  cidade: string
  nomeDaReferencia: string
  referencia: Point
  ruasMedidas: number
}
