import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { areas } from '../../db/schema'
import type { LugarDeReferencia, PrevisaoRua, ResultadoDaBusca } from '../../../shared/types/previsao'

const consulta = z.object({
  q: z.string().trim().min(1, 'Digite ao menos uma letra').max(80),
  area: z.uuid(),
  horario: esquemaHorario,
})

export default defineEventHandler(async (event): Promise<ResultadoDaBusca> => {
  const { q, area, horario } = await getValidatedQuery(event, validarCom(consulta))
  const termo = normalizar(q)
  const previsoes = await listarPrevisoesPorRua({ areaId: area, ...momentoDaConsulta(horario) })
  const encontradas = previsoes.filter(previsao => normalizar(previsao.nome).includes(termo))
  return {
    ruas: encontradas.filter(previsao => previsao.temMedicao),
    semPrevisao: encontradas.filter(previsao => !previsao.temMedicao),
    lugares: await buscarLugares(area, termo, previsoes),
  }
})

async function buscarLugares(areaId: string, termo: string, previsoes: PrevisaoRua[]): Promise<LugarDeReferencia[]> {
  const [area] = await useDb().select().from(areas).where(eq(areas.id, areaId))
  if (!area || !normalizar(`${area.nomeDaReferencia} ${area.cidade}`).includes(termo)) return []
  const maisPerto = [...previsoes].sort((a, b) => a.distanciaM - b.distanciaM)[0]
  return [{
    nome: `${area.nomeDaReferencia} ${area.cidade}`,
    descricao: maisPerto ? `${maisPerto.nome} · ver ruas próximas` : 'ver ruas próximas',
    areaId: area.id,
  }]
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\b(rua|r|avenida|av)\b\.?/g, '').replace(/\s+/g, ' ').trim()
}
