import { eq } from 'drizzle-orm'
import { dispositivos } from '../db/schema'
import { esquemaPreferencias, preferenciasPadrao, type Preferencias } from '../../shared/types/preferencias'

const corpo = esquemaPreferencias.partial()

export default defineEventHandler(async (event): Promise<Preferencias> => {
  const mudancas = await readValidatedBody(event, validarCom(corpo))
  const dispositivoId = await exigirDispositivo(event)
  const [registro] = await useDb().select({ preferencias: dispositivos.preferencias }).from(dispositivos).where(eq(dispositivos.id, dispositivoId))
  const preferencias = { ...preferenciasPadrao, ...registro?.preferencias, ...mudancas }
  await useDb().update(dispositivos).set({ preferencias }).where(eq(dispositivos.id, dispositivoId))
  return preferencias
})
