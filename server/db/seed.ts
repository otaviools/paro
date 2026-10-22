import { carregarAmbiente } from './ambiente'
import { criarConexao } from './conexao'
import { semear } from './semear'

await semear(criarConexao(carregarAmbiente()))
console.info('Seed concluído: área Martins, cinco ruas e resultados da pesquisa. Registre as contagens de campo em /admin.')
process.exit(0)
