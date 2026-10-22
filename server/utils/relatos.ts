import { and, eq, gte, inArray } from 'drizzle-orm'
import { relatos } from '../db/schema'
import { classificarOcupacao } from '../../shared/utils/ocupacao'
import { combinarOcupacoes, MINUTOS_DE_TEMPO_REAL, MULTIPLICADOR_TEMPO_REAL, relatadoHa, type Componente, type EstadoRelatado } from '../../shared/utils/relato'
import type { RelatoRecente } from '../../shared/types/previsao'

const SEMANAS_DE_HISTORICO = 8
const UM_MINUTO_EM_MS = 60 * 1000
const UMA_SEMANA_EM_MS = 7 * 24 * 60 * UM_MINUTO_EM_MS

export interface RelatosDaRua {
  componentes: Componente[]
  quantidade: number
  recente: RelatoRecente | null
}

export interface ConsultaDeRelatos {
  ruaIds?: string[]
  diaSemana: number
  faixas: string[]
  tempoReal: boolean
}

type LinhaDeRelato = { id: string, ruaId: string, faixa: string, ocupacao: number, peso: number, relatadoEm: Date }

export async function listarRelatos(consulta: ConsultaDeRelatos): Promise<LinhaDeRelato[]> {
  const desde = new Date(Date.now() - SEMANAS_DE_HISTORICO * UMA_SEMANA_EM_MS)
  const [historicos, recentes] = await Promise.all([
    selecionarRelatos(and(
      eq(relatos.diaSemana, consulta.diaSemana),
      inArray(relatos.faixaInicio, consulta.faixas),
      gte(relatos.relatadoEm, desde),
      filtroDeRuas(consulta.ruaIds),
    )),
    consulta.tempoReal ? listarRecentes(consulta.ruaIds) : Promise.resolve([]),
  ])
  const vistos = new Set(recentes.map(linha => linha.id))
  return [...recentes.map(linha => ({ ...linha, peso: linha.peso * MULTIPLICADOR_TEMPO_REAL })), ...historicos.filter(linha => !vistos.has(linha.id))]
}

export function agruparRelatos(linhas: LinhaDeRelato[], agora = new Date()): Map<string, RelatosDaRua> {
  const grupos = new Map<string, LinhaDeRelato[]>()
  for (const linha of linhas) grupos.set(linha.ruaId, [...(grupos.get(linha.ruaId) ?? []), linha])
  return new Map([...grupos].map(([ruaId, grupo]) => [ruaId, resumirRelatos(grupo, agora)]))
}

export function relatosDaFaixa(linhas: LinhaDeRelato[], faixa: string): Componente[] {
  return linhas.filter(linha => linha.faixa.slice(0, 2) === faixa.slice(0, 2)).map(({ ocupacao, peso }) => ({ ocupacao, peso }))
}

function resumirRelatos(grupo: LinhaDeRelato[], agora: Date): RelatosDaRua {
  return {
    componentes: grupo.map(({ ocupacao, peso }) => ({ ocupacao, peso })),
    quantidade: grupo.length,
    recente: relatoRecente(grupo, agora),
  }
}

function relatoRecente(grupo: LinhaDeRelato[], agora: Date): RelatoRecente | null {
  const limite = agora.getTime() - MINUTOS_DE_TEMPO_REAL * UM_MINUTO_EM_MS
  const recentes = grupo.filter(linha => linha.relatadoEm.getTime() >= limite)
  const combinado = combinarOcupacoes(recentes)
  if (!combinado) return null
  const ultimo = Math.max(...recentes.map(linha => linha.relatadoEm.getTime()))
  return {
    estado: classificarOcupacao(combinado.media) as EstadoRelatado,
    minutos: relatadoHa(new Date(ultimo), agora),
    relatos: recentes.length,
  }
}

function listarRecentes(ruaIds: string[] | undefined) {
  const desde = new Date(Date.now() - MINUTOS_DE_TEMPO_REAL * UM_MINUTO_EM_MS)
  return selecionarRelatos(and(gte(relatos.relatadoEm, desde), filtroDeRuas(ruaIds)))
}

function selecionarRelatos(filtro: ReturnType<typeof and>) {
  return useDb()
    .select({ id: relatos.id, ruaId: relatos.ruaId, faixa: relatos.faixaInicio, ocupacao: relatos.ocupacao, peso: relatos.peso, relatadoEm: relatos.relatadoEm })
    .from(relatos)
    .where(filtro)
}

function filtroDeRuas(ruaIds: string[] | undefined) {
  return ruaIds ? inArray(relatos.ruaId, ruaIds) : undefined
}
