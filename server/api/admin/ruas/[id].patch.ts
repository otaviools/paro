import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { ruas } from '../../../db/schema'
import { esquemaCapacidade } from '../../../../shared/types/admin'

const parametros = z.object({ id: z.uuid('Rua inválida') })

export default defineEventHandler(async (event) => {
  await exigirAdmin(event)
  const { id } = await getValidatedRouterParams(event, validarCom(parametros))
  const { capacidade } = await readValidatedBody(event, validarCom(esquemaCapacidade))
  await buscarRua(id)
  await useDb().update(ruas).set({ capacidade }).where(eq(ruas.id, id))
  return { ruaId: id, capacidade }
})
