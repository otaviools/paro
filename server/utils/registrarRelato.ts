import { and, eq, gte, or } from 'drizzle-orm'
import type { LineString } from 'geojson'
import { relatos } from '../db/schema'
import { dataLocal, diaDaSemanaAtual, faixaDeTrintaMinutosAtual } from '../../shared/utils/horario'
import { limitesDoDia } from '../../shared/utils/contagem'
import { distanciaAteTrajeto } from '../../shared/utils/geo'
import { ocupacaoDoRelato, pesoDoRelato, RAIO_PERTO_DA_RUA_M } from '../../shared/utils/relato'
import type { NovoRelato, RelatoRegistrado } from '../../shared/types/relato'

interface Autor {
  dispositivoId: string
  pessoaId: string | null
}

export async function registrarRelato(dados: NovoRelato & { trajeto: LineString, dispositivoId: string }): Promise<RelatoRegistrado> {
  const ocupacao = ocupacaoDoRelato(dados)
  if (ocupacao === null) throw createError({ statusCode: 400, statusMessage: 'Responda como estava a rua ou quanto tempo levou.' })
  const pessoa = await pessoaDoDispositivo(dados.dispositivoId)
  const pertoDaRua = dados.posicao ? distanciaAteTrajeto(dados.posicao, dados.trajeto) <= RAIO_PERTO_DA_RUA_M : false
  const peso = pesoDoRelato({ verificado: pessoa !== null, perto: pertoDaRua, reputacao: pessoa?.reputacao ?? 1 })
  const agora = new Date()
  const faixaInicio = faixaDeTrintaMinutosAtual(agora)
  const autor = { dispositivoId: dados.dispositivoId, pessoaId: pessoa?.id ?? null }
  const substituiu = await apagarRelatoDaFaixa(dados.ruaId, faixaInicio, autor, agora)
  await useDb().insert(relatos).values({
    ruaId: dados.ruaId,
    diaSemana: diaDaSemanaAtual(agora),
    faixaInicio,
    relatadoEm: agora,
    estado: dados.estado ?? null,
    tempo: dados.tempo ?? null,
    ocupacao,
    peso,
    pertoDaRua,
    ...autor,
  })
  return { ocupacao, peso, pertoDaRua, substituiu }
}

async function apagarRelatoDaFaixa(ruaId: string, faixaInicio: string, autor: Autor, agora: Date): Promise<boolean> {
  const { inicio } = limitesDoDia(dataLocal(agora))
  const doAutor = autor.pessoaId
    ? or(eq(relatos.dispositivoId, autor.dispositivoId), eq(relatos.pessoaId, autor.pessoaId))
    : eq(relatos.dispositivoId, autor.dispositivoId)
  const apagados = await useDb()
    .delete(relatos)
    .where(and(eq(relatos.ruaId, ruaId), eq(relatos.faixaInicio, faixaInicio), gte(relatos.relatadoEm, inicio), doAutor))
    .returning({ id: relatos.id })
  return apagados.length > 0
}
