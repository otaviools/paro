import { mkdirSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

const PREFIXO_PGLITE = 'pglite://'

export function usaPglite(url: string): boolean {
  return url.startsWith(PREFIXO_PGLITE)
}

export function criarConexao(url: string) {
  if (!url) throw new Error('Defina NUXT_DATABASE_URL no .env. Veja o .env.example.')
  if (usaPglite(url)) return conectarPglite(url.slice(PREFIXO_PGLITE.length))
  return drizzlePostgres(url, { schema, casing: 'snake_case' })
}

export type Banco = ReturnType<typeof criarConexao>

function conectarPglite(caminho: string) {
  if (caminho !== 'memoria') mkdirSync(caminho, { recursive: true })
  const cliente = caminho === 'memoria' ? new PGlite() : new PGlite(caminho)
  return drizzlePglite(cliente, { schema, casing: 'snake_case' }) as unknown as ReturnType<typeof drizzlePostgres<typeof schema>>
}
