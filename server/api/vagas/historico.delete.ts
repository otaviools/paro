import { eq } from 'drizzle-orm'
import { vagas } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const dispositivoId = await dispositivoAtual(event)
  if (!dispositivoId) return { apagadas: 0 }
  const apagadas = await useDb().delete(vagas).where(eq(vagas.dispositivoId, dispositivoId)).returning({ id: vagas.id })
  return { apagadas: apagadas.length }
})
