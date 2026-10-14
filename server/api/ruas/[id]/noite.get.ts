import { z } from 'zod'

const parametros = z.object({ id: z.uuid('Rua inválida') })
const consulta = z.object({ horario: esquemaHorario })

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, validarCom(parametros))
  const { horario } = await getValidatedQuery(event, validarCom(consulta))
  await buscarRua(id)
  const { diaSemana, faixaInicio } = momentoDaConsulta(horario)
  return noiteDaRua(id, diaSemana, faixaInicio)
})
