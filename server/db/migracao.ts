import { migrate as migrarPostgres } from 'drizzle-orm/node-postgres/migrator'
import { migrate as migrarPglite } from 'drizzle-orm/pglite/migrator'
import type { PgliteDatabase } from 'drizzle-orm/pglite'
import { usaPglite, type Banco } from './conexao'

const PASTA_DE_MIGRACOES = './server/db/migrations'

export async function migrar(banco: Banco, url: string): Promise<void> {
  if (usaPglite(url)) {
    await migrarPglite(banco as unknown as PgliteDatabase, { migrationsFolder: PASTA_DE_MIGRACOES })
    return
  }
  await migrarPostgres(banco, { migrationsFolder: PASTA_DE_MIGRACOES })
}
