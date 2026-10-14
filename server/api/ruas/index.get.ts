import { z } from 'zod'

const consulta = z.object({
  area: z.uuid(),
  horario: esquemaHorario,
})

export default defineEventHandler(async (event) => {
  const { area, horario } = await getValidatedQuery(event, validarCom(consulta))
  return listarPrevisoesPorRua({ areaId: area, ...momentoDaConsulta(horario) })
})
