import { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { Feature, LineString } from 'geojson'
import { areas, ruas } from '../db/schema'
import { formatarChance } from '../../shared/utils/ocupacao'
import type { MapaDaArea, PrevisaoRua, PropriedadesDaRua } from '../../shared/types/previsao'

const consulta = z.object({
  area: z.uuid(),
  horario: esquemaHorario,
})

export default defineEventHandler(async (event): Promise<MapaDaArea> => {
  const { area, horario } = await getValidatedQuery(event, validarCom(consulta))
  const momento = momentoDaConsulta(horario)
  const [registro] = await useDb().select().from(areas).where(eq(areas.id, area))
  if (!registro) throw createError({ statusCode: 404, statusMessage: 'Área não encontrada. Escolha outro local.' })
  const [trajetos, previsoes] = await Promise.all([
    useDb().select({ id: ruas.id, trajeto: ruas.trajeto }).from(ruas).where(eq(ruas.areaId, area)),
    listarPrevisoesPorRua({ areaId: area, ...momento }),
  ])
  return {
    referencia: registro.referencia,
    nomeDaReferencia: registro.nomeDaReferencia,
    faixa: momento.faixaInicio,
    ruas: { type: 'FeatureCollection', features: previsoes.flatMap(previsao => montarFeicao(previsao, trajetos)) },
  }
})

function montarFeicao(previsao: PrevisaoRua, trajetos: { id: string, trajeto: LineString }[]): Feature<LineString, PropriedadesDaRua>[] {
  const trajeto = trajetos.find(item => item.id === previsao.ruaId)?.trajeto
  if (!trajeto) return []
  return [{
    type: 'Feature',
    geometry: trajeto,
    properties: {
      ruaId: previsao.ruaId,
      nome: previsao.nome,
      estado: previsao.estado,
      chance: formatarChance(previsao.chance),
      medidoEm: previsao.medidoEm,
    },
  }]
}
