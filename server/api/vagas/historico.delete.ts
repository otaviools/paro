import { vagas } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const dispositivoId = await dispositivoAtual(event)
  if (!dispositivoId) return { apagadas: 0 }
  const apagadas = await useDb().delete(vagas).where(vagaDoDono(dispositivoId)).returning({ id: vagas.id })
  return { apagadas: apagadas.length }
})
