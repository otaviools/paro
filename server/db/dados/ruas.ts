import trajetos from './trajetos.json'

export interface RuaDoSeed {
  nome: string
  distanciaM: number
  vagasTotais: number
  trajeto: [number, number][]
  chancePorHora: (number | null)[]
}

const trajetoAproximadoDaAlexandreMarquez: [number, number][] = [
  [-48.28225, -18.91505],
  [-48.28105, -18.91470],
  [-48.27985, -18.91437],
  [-48.27865, -18.91404],
]

export const referenciaEsamc: [number, number] = [-48.27969, -18.91238]

export const ruasDoSeed: RuaDoSeed[] = [
  {
    nome: 'R. Arlindo Teixeira',
    distanciaM: 350,
    vagasTotais: 40,
    trajeto: trajetos['R. Arlindo Teixeira'] as [number, number][],
    chancePorHora: [0.75, 0.7, 0.65, 0.65, 0.7, 0.8],
  },
  {
    nome: 'R. Rivalino Pereira',
    distanciaM: 200,
    vagasTotais: 40,
    trajeto: trajetos['R. Rivalino Pereira'] as [number, number][],
    chancePorHora: [0.55, 0.45, 0.35, 0.4, 0.55, 0.7],
  },
  {
    nome: 'Av. Belo Horizonte',
    distanciaM: 150,
    vagasTotais: 40,
    trajeto: trajetos['Av. Belo Horizonte'] as [number, number][],
    chancePorHora: [0.55, 0.4, 0.3, 0.35, 0.5, 0.7],
  },
  {
    nome: 'Av. Vasconcelos Costa',
    distanciaM: 120,
    vagasTotais: 40,
    trajeto: trajetos['Av. Vasconcelos Costa'] as [number, number][],
    chancePorHora: [0.2, 0.1, 0.025, 0.025, 0.1, 0.3],
  },
  {
    nome: 'R. Alexandre Marquez',
    distanciaM: 400,
    vagasTotais: 40,
    trajeto: trajetoAproximadoDaAlexandreMarquez,
    chancePorHora: [0.6, 0.5, null, null, null, null],
  },
  {
    nome: 'R. Duque de Caxias',
    distanciaM: 900,
    vagasTotais: 40,
    trajeto: trajetos['R. Duque de Caxias'] as [number, number][],
    chancePorHora: [null, null, null, null, null, null],
  },
]
