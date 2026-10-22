import { asc, count, eq, isNotNull, sql } from 'drizzle-orm'
import { avaliacoes, ruas, vagas } from '../../db/schema'
import type { AcertoDaPrevisao } from '../../../shared/types/admin'

export default defineEventHandler(async (event): Promise<AcertoDaPrevisao[]> => {
  await exigirAdmin(event)
  const [porRua, geral] = await Promise.all([acertoPorRua(), acertoGeral()])
  return geral.ajudou + geral.naoAjudou ? [...porRua, geral] : porRua
})

async function acertoPorRua(): Promise<AcertoDaPrevisao[]> {
  const linhas = await useDb()
    .select({
      ruaId: ruas.id,
      nome: ruas.nome,
      origem: vagas.origemNaChegada,
      ajudou: sql<number>`count(*) filter (where ${vagas.previsaoAjudou})`.mapWith(Number),
      naoAjudou: sql<number>`count(*) filter (where not ${vagas.previsaoAjudou})`.mapWith(Number),
    })
    .from(vagas)
    .innerJoin(ruas, eq(ruas.id, vagas.ruaId))
    .where(isNotNull(vagas.previsaoAjudou))
    .groupBy(ruas.id, vagas.origemNaChegada)
    .orderBy(asc(ruas.nome))
  return linhas.map(linha => ({ ...linha, origem: linha.origem as AcertoDaPrevisao['origem'] }))
}

async function acertoGeral(): Promise<AcertoDaPrevisao> {
  const linhas = await useDb()
    .select({ previsaoAjudou: avaliacoes.previsaoAjudou, total: count() })
    .from(avaliacoes)
    .groupBy(avaliacoes.previsaoAjudou)
  const total = (valor: boolean) => linhas.find(linha => linha.previsaoAjudou === valor)?.total ?? 0
  return { ruaId: null, nome: 'Tela inicial, sem rua', origem: 'sem_rua', ajudou: total(true), naoAjudou: total(false) }
}
