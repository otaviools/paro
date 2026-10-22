import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { vagas } from '../../../db/schema'

const parametros = z.object({ id: z.uuid('Vaga inválida') })
const corpo = z.object({
  saidaPrevista: z.iso.datetime().nullable().optional(),
  avisarAoSair: z.boolean().optional(),
}).refine(dados => Object.keys(dados).length > 0, 'Informe a saída prevista ou o aviso de saída')

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, validarCom(parametros))
  const dados = await readValidatedBody(event, validarCom(corpo))
  const dispositivoId = await exigirDispositivo(event)
  await buscarVaga(dispositivoId, id)
  await useDb().update(vagas).set({
    ...(dados.saidaPrevista !== undefined && { saidaPrevista: dados.saidaPrevista ? new Date(dados.saidaPrevista) : null }),
    ...(dados.avisarAoSair !== undefined && { avisarAoSair: dados.avisarAoSair }),
  }).where(and(eq(vagas.id, id), vagaDoDono(dispositivoId)))
  return buscarVaga(dispositivoId, id)
})
