import { eq } from 'drizzle-orm'
import { dispositivos } from '../db/schema'
import { preferenciasPadrao, type Preferencias } from '../../shared/types/preferencias'

export default defineEventHandler(async (event): Promise<Preferencias> => {
  const dispositivoId = await dispositivoAtual(event)
  if (!dispositivoId) return preferenciasPadrao
  const [registro] = await useDb().select({ preferencias: dispositivos.preferencias }).from(dispositivos).where(eq(dispositivos.id, dispositivoId))
  return { ...preferenciasPadrao, ...registro?.preferencias }
})
