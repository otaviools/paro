import { count, eq } from 'drizzle-orm'
import { areas, ruas } from '../db/schema'
import type { Area } from '../../shared/types/area'

export default defineEventHandler(async (): Promise<Area[]> => {
  const linhas = await useDb()
    .select({
      id: areas.id,
      nome: areas.nome,
      cidade: areas.cidade,
      nomeDaReferencia: areas.nomeDaReferencia,
      referencia: areas.referencia,
      ruasMedidas: count(ruas.id),
    })
    .from(areas)
    .leftJoin(ruas, eq(ruas.areaId, areas.id))
    .groupBy(areas.id)
  return linhas.sort((a, b) => b.ruasMedidas - a.ruasMedidas)
})
