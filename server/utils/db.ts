import { criarConexao, type Banco } from '../db/conexao'

let instancia: Banco | undefined

export function useDb(): Banco {
  instancia ??= criarConexao(useRuntimeConfig().databaseUrl)
  return instancia
}
