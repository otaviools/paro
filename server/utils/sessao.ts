import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { dispositivos } from '../db/schema'
import { preferenciasPadrao } from '../../shared/types/preferencias'

export async function dispositivoAtual(event: H3Event): Promise<string | null> {
  const sessao = await getUserSession(event)
  const id = sessao.user?.dispositivoId
  if (!id) return null
  const [existente] = await useDb().select({ id: dispositivos.id }).from(dispositivos).where(eq(dispositivos.id, id))
  return existente?.id ?? null
}

export async function exigirDispositivo(event: H3Event): Promise<string> {
  const atual = await dispositivoAtual(event)
  if (atual) return atual
  const [novo] = await useDb()
    .insert(dispositivos)
    .values({ preferencias: preferenciasPadrao })
    .returning({ id: dispositivos.id })
  if (!novo) throw createError({ statusCode: 500, statusMessage: 'Não foi possível iniciar a sessão. Tente de novo.' })
  await setUserSession(event, { user: { dispositivoId: novo.id } })
  return novo.id
}
