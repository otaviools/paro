import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { avaliacoes, vagas } from '../db/schema'

const corpo = z.object({
  ajudou: z.boolean(),
  vagaId: z.uuid().optional(),
})

export default defineEventHandler(async (event) => {
  const { ajudou, vagaId } = await readValidatedBody(event, validarCom(corpo))
  if (vagaId) await marcarNaVaga(event, vagaId, ajudou)
  else await useDb().insert(avaliacoes).values({ previsaoAjudou: ajudou })
  setResponseStatus(event, 201)
  return { ok: true }
})

async function marcarNaVaga(event: Parameters<typeof dispositivoAtual>[0], vagaId: string, ajudou: boolean): Promise<void> {
  const dispositivoId = await dispositivoAtual(event)
  if (!dispositivoId) throw createError({ statusCode: 403, statusMessage: 'Esta vaga não é deste aparelho.' })
  await useDb().update(vagas).set({ previsaoAjudou: ajudou }).where(and(eq(vagas.id, vagaId), eq(vagas.dispositivoId, dispositivoId)))
}
