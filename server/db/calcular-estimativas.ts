import { carregarAmbiente } from './ambiente'
import { criarConexao } from './conexao'
import { calcularEstimativasDaPesquisa } from './estimativas'

const calculadas = await calcularEstimativasDaPesquisa(criarConexao(carregarAmbiente()))
console.info(`Estimativas da pesquisa calculadas para ${calculadas} ruas, com intervalo de confiança de 95% (Wilson).`)
process.exit(0)
