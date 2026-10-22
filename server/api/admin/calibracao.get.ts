import { and, eq, sql, type AnyColumn } from 'drizzle-orm'
import { medicoes, relatos } from '../../db/schema'
import { rotuloDoEstado } from '../../../shared/utils/ocupacao'
import { estadosRelatados, ocupacaoDoEstado, ocupacaoDoTempo, rotuloDoTempo, temposParaAchar } from '../../../shared/utils/relato'
import type { LinhaDeCalibracao } from '../../../shared/types/admin'

const DIA_LOCAL = (coluna: AnyColumn) => sql`(${coluna} at time zone 'America/Sao_Paulo')::date`

export default defineEventHandler(async (event): Promise<LinhaDeCalibracao[]> => {
  await exigirAdmin(event)
  const [porEstado, porTempo] = await Promise.all([mediasPor(relatos.estado), mediasPor(relatos.tempo)])
  return [
    ...estadosRelatados.map(estado => linha('estado', estado, rotuloDoEstado[estado], ocupacaoDoEstado[estado], porEstado.get(estado))),
    ...temposParaAchar.map(tempo => linha('tempo', tempo, rotuloDoTempo[tempo], ocupacaoDoTempo[tempo], porTempo.get(tempo))),
  ]
})

async function mediasPor(coluna: typeof relatos.estado | typeof relatos.tempo): Promise<Map<string, { media: number, pares: number }>> {
  const linhas = await useDb()
    .select({
      resposta: coluna,
      media: sql<number>`avg(${medicoes.vagasOcupadas}::float / ${medicoes.vagasTotais})`.mapWith(Number),
      pares: sql<number>`count(*)`.mapWith(Number),
    })
    .from(relatos)
    .innerJoin(medicoes, and(
      eq(medicoes.ruaId, relatos.ruaId),
      eq(medicoes.faixaInicio, relatos.faixaInicio),
      eq(medicoes.fonte, 'campo'),
      sql`${DIA_LOCAL(medicoes.medidoEm)} = ${DIA_LOCAL(relatos.relatadoEm)}`,
    ))
    .where(sql`${coluna} is not null`)
    .groupBy(coluna)
  return new Map(linhas.flatMap(item => (item.resposta ? [[item.resposta, { media: item.media, pares: item.pares }]] : [])))
}

function linha(tipo: LinhaDeCalibracao['tipo'], resposta: string, rotulo: string, valorDaTabela: number, medida?: { media: number, pares: number }): LinhaDeCalibracao {
  return { tipo, resposta, rotulo, valorDaTabela, mediaDoCampo: medida?.media ?? null, pares: medida?.pares ?? 0 }
}
