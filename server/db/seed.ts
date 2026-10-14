import { carregarAmbiente } from './ambiente'
import { criarConexao } from './conexao'
import { semear } from './semear'

await semear(criarConexao(carregarAmbiente()))
console.info('Seed concluído: área Martins, seis ruas, medições de campo e resultados da pesquisa.')
process.exit(0)
