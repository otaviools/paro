import { z } from 'zod'

const parametros = z.object({ id: z.uuid('Vaga inválida') })

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, validarCom(parametros))
  const dispositivoId = await dispositivoAtual(event)
  if (!dispositivoId) throw createError({ statusCode: 404, statusMessage: 'Vaga não encontrada neste aparelho.' })
  return buscarVaga(dispositivoId, id)
})
