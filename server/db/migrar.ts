import { carregarAmbiente } from './ambiente'
import { criarConexao } from './conexao'
import { migrar } from './migracao'

const url = carregarAmbiente()
await migrar(criarConexao(url), url)
console.info('Migrações aplicadas.')
process.exit(0)
