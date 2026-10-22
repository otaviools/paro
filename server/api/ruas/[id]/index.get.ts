import { z } from 'zod'
import type { DetalheRua, PrevisaoRua } from '../../../../shared/types/previsao'

const parametros = z.object({ id: z.uuid('Rua inválida') })
const consulta = z.object({ horario: esquemaHorario })

export default defineEventHandler(async (event): Promise<DetalheRua> => {
  const { id } = await getValidatedRouterParams(event, validarCom(parametros))
  const { horario } = await getValidatedQuery(event, validarCom(consulta))
  const rua = await buscarRua(id)
  const momento = momentoDaConsulta(horario)
  const previsoes = await listarPrevisoesPorRua({ areaId: rua.areaId, ...momento })
  const previsao = previsoes.find(item => item.ruaId === id)
  if (!previsao) throw createError({ statusCode: 404, statusMessage: 'Rua sem previsão nesta área.' })
  return {
    previsao,
    trajeto: rua.trajeto,
    destino: (rua.destino?.coordinates as [number, number] | undefined) ?? null,
    capacidade: rua.capacidade,
    faixa: momento.faixaInicio,
    citacao: await citacaoNaPesquisa(rua.nome),
    alternativa: melhorAlternativa(previsoes, previsao),
  }
})

function melhorAlternativa(previsoes: PrevisaoRua[], atual: PrevisaoRua): PrevisaoRua | null {
  return previsoes.find(item => item.ruaId !== atual.ruaId && item.chance !== null && item.estado !== 'lotado') ?? null
}
