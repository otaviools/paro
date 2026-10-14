import { z } from 'zod'
import { sugestoesDeRua } from '../db/schema'

const corpo = z.object({
  nomeDaRua: z.string().trim().min(3, 'Escreva o nome da rua').max(120),
  periodos: z.array(z.enum(['manha', 'tarde', 'noite'])).max(3).default([]),
  motivo: z.string().trim().max(500, 'Use até 500 caracteres').optional(),
})

export default defineEventHandler(async (event) => {
  const dados = await readValidatedBody(event, validarCom(corpo))
  await useDb().insert(sugestoesDeRua).values({ ...dados, motivo: dados.motivo || null })
  setResponseStatus(event, 201)
  return { ok: true }
})
