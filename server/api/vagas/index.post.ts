import { z } from 'zod'
import { and, eq, isNull } from 'drizzle-orm'
import { vagas } from '../../db/schema'

const corpo = z.object({
  ruaId: z.uuid('Escolha a rua onde você parou'),
  chegada: z.iso.datetime().optional(),
  saidaPrevista: z.iso.datetime().nullable().optional(),
  avisarAoSair: z.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  const dados = await readValidatedBody(event, validarCom(corpo))
  await buscarRua(dados.ruaId)
  const dispositivoId = await exigirDispositivo(event)
  const agora = new Date()
  await useDb().update(vagas).set({ saida: agora }).where(and(eq(vagas.dispositivoId, dispositivoId), isNull(vagas.saida)))
  const [criada] = await useDb().insert(vagas).values({
    dispositivoId,
    ruaId: dados.ruaId,
    chegada: dados.chegada ? new Date(dados.chegada) : agora,
    saidaPrevista: dados.saidaPrevista ? new Date(dados.saidaPrevista) : null,
    avisarAoSair: dados.avisarAoSair,
  }).returning({ id: vagas.id })
  if (!criada) throw createError({ statusCode: 500, statusMessage: 'Não foi possível registrar a vaga. Tente de novo.' })
  setResponseStatus(event, 201)
  return buscarVaga(dispositivoId, criada.id)
})
