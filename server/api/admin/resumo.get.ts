import { asc, count, countDistinct, eq, max, sql } from 'drizzle-orm'
import { medicoes, ruas } from '../../db/schema'
import type { ResumoDaRua } from '../../../shared/types/admin'

export default defineEventHandler(async (event): Promise<ResumoDaRua[]> => {
  await exigirAdmin(event)
  const linhas = await useDb()
    .select({
      ruaId: ruas.id,
      nome: ruas.nome,
      capacidade: ruas.capacidade,
      contagens: count(medicoes.id),
      diasMedidos: countDistinct(sql`(${medicoes.medidoEm} at time zone 'America/Sao_Paulo')::date`),
      ultimaContagem: max(medicoes.medidoEm),
    })
    .from(ruas)
    .leftJoin(medicoes, eq(medicoes.ruaId, ruas.id))
    .groupBy(ruas.id)
    .orderBy(asc(ruas.nome))
  return linhas.map(linha => ({ ...linha, ultimaContagem: linha.ultimaContagem ? new Date(linha.ultimaContagem).toISOString() : null }))
})
