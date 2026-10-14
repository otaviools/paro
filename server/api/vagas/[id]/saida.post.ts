import { z } from 'zod'
import { and, eq, isNull } from 'drizzle-orm'
import { vagas } from '../../../db/schema'

const parametros = z.object({ id: z.uuid('Vaga inválida') })

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, validarCom(parametros))
  const dispositivoId = await exigirDispositivo(event)
  await buscarVaga(dispositivoId, id)
  await useDb()
    .update(vagas)
    .set({ saida: new Date() })
    .where(and(eq(vagas.id, id), eq(vagas.dispositivoId, dispositivoId), isNull(vagas.saida)))
  return buscarVaga(dispositivoId, id)
})
