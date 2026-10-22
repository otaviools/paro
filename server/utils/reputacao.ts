import { and, eq, gte, inArray, isNotNull, lt, ne, or, sql } from 'drizzle-orm'
import { codigosDeVerificacao, medicoes, pessoas, relatos } from '../db/schema'
import { dataLocal } from '../../shared/utils/horario'
import { limitesDoDia } from '../../shared/utils/contagem'
import { combinarOcupacoes, novaReputacao, RELATOS_PARA_CONSENSO } from '../../shared/utils/relato'

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000

type RelatoParaAvaliar = { id: string, ruaId: string, faixa: string, ocupacao: number, relatadoEm: Date, pessoaId: string | null }

export async function anonimizarRelatosAntigos(agora = new Date()): Promise<{ anonimizados: number, avaliados: number }> {
  const limite = new Date(agora.getTime() - UM_DIA_EM_MS)
  const pendentes = await useDb()
    .select({ id: relatos.id, ruaId: relatos.ruaId, faixa: relatos.faixaInicio, ocupacao: relatos.ocupacao, relatadoEm: relatos.relatadoEm, pessoaId: relatos.pessoaId })
    .from(relatos)
    .where(and(lt(relatos.relatadoEm, limite), or(isNotNull(relatos.pessoaId), isNotNull(relatos.dispositivoId))))
  let avaliados = 0
  for (const relato of pendentes) {
    if (relato.pessoaId && await avaliarRelato(relato, relato.pessoaId)) avaliados += 1
  }
  if (pendentes.length) {
    await useDb().update(relatos).set({ pessoaId: null, dispositivoId: null }).where(inArray(relatos.id, pendentes.map(relato => relato.id)))
  }
  await useDb().delete(codigosDeVerificacao).where(lt(codigosDeVerificacao.expiraEm, limite))
  return { anonimizados: pendentes.length, avaliados }
}

async function avaliarRelato(relato: RelatoParaAvaliar, pessoaId: string): Promise<boolean> {
  const referencia = await referenciaDoRelato(relato)
  if (referencia === null) return false
  const [pessoa] = await useDb().select({ reputacao: pessoas.reputacao }).from(pessoas).where(eq(pessoas.id, pessoaId))
  if (!pessoa) return false
  await useDb()
    .update(pessoas)
    .set({ reputacao: novaReputacao(pessoa.reputacao, relato.ocupacao, referencia), relatosAvaliados: sql`${pessoas.relatosAvaliados} + 1` })
    .where(eq(pessoas.id, pessoaId))
  return true
}

export async function referenciaDoRelato(relato: RelatoParaAvaliar): Promise<number | null> {
  const { inicio, fim } = limitesDoDia(dataLocal(relato.relatadoEm))
  const contagens = await useDb()
    .select({ totais: medicoes.vagasTotais, ocupadas: medicoes.vagasOcupadas })
    .from(medicoes)
    .where(and(eq(medicoes.ruaId, relato.ruaId), eq(medicoes.faixaInicio, relato.faixa), eq(medicoes.fonte, 'campo'), gte(medicoes.medidoEm, inicio), lt(medicoes.medidoEm, fim)))
  if (contagens.length) return contagens.reduce((soma, linha) => soma + linha.ocupadas / linha.totais, 0) / contagens.length
  const outros = await useDb()
    .select({ ocupacao: relatos.ocupacao, peso: relatos.peso })
    .from(relatos)
    .where(and(eq(relatos.ruaId, relato.ruaId), eq(relatos.faixaInicio, relato.faixa), ne(relatos.id, relato.id), gte(relatos.relatadoEm, inicio), lt(relatos.relatadoEm, fim)))
  if (outros.length < RELATOS_PARA_CONSENSO) return null
  return combinarOcupacoes(outros)?.media ?? null
}
