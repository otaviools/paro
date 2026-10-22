import trajetos from './trajetos.json'

export interface RuaDoSeed {
  nome: string
  distanciaM: number
  trajeto: [number, number][]
  destino: [number, number]
}

export const referenciaEsamc: [number, number] = [-48.27969, -18.91238]

export const ruasDoSeed: RuaDoSeed[] = [
  {
    nome: 'R. Arlindo Teixeira',
    distanciaM: 350,
    trajeto: trajetos['R. Arlindo Teixeira'] as [number, number][],
    destino: [-48.2803036, -18.9123663],
  },
  {
    nome: 'R. Rivalino Pereira',
    distanciaM: 200,
    trajeto: trajetos['R. Rivalino Pereira'] as [number, number][],
    destino: [-48.2786894, -18.9133725],
  },
  {
    nome: 'Av. Belo Horizonte',
    distanciaM: 150,
    trajeto: trajetos['Av. Belo Horizonte'] as [number, number][],
    destino: [-48.2796407, -18.9118043],
  },
  {
    nome: 'Av. Vasconcelos Costa',
    distanciaM: 120,
    trajeto: trajetos['Av. Vasconcelos Costa'] as [number, number][],
    destino: [-48.2794091, -18.912425],
  },
  {
    nome: 'R. Alexandre Marquez',
    distanciaM: 400,
    trajeto: trajetos['R. Alexandre Marquez'] as [number, number][],
    destino: [-48.27839, -18.913417],
  },
]
