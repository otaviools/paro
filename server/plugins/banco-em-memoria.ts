import { migrar } from '../db/migracao'
import { semear } from '../db/semear'

const BANCO_EM_MEMORIA = 'pglite://memoria'

export default defineNitroPlugin(async () => {
  const url = useRuntimeConfig().databaseUrl
  if (url !== BANCO_EM_MEMORIA) return
  await migrar(useDb(), url)
  await semear(useDb())
})
