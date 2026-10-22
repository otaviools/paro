import { z } from 'zod'

const consulta = z.object({
  ruaId: z.uuid('Escolha a rua'),
  data: z.iso.date('Data no formato AAAA-MM-DD'),
})

export default defineEventHandler(async (event) => {
  await exigirAdmin(event)
  const { ruaId, data } = await getValidatedQuery(event, validarCom(consulta))
  await buscarRua(ruaId)
  return listarContagensDoDia(ruaId, data)
})
