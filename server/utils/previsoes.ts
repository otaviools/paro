import { and, eq, inArray } from 'drizzle-orm'
import { medicoes, ruas } from '../db/schema'
import { chancePontual, classificarOcupacao, faixaDeChance } from '../../shared/utils/ocupacao'
import { faixasDaNoite, rotuloCurtoDaFaixa } from '../../shared/utils/horario'
import type { PontoDaNoite, PrevisaoRua } from '../../shared/types/previsao'

export interface ConsultaPrevisao {
  areaId?: string
  ruaIds?: string[]
  diaSemana: number
  faixaInicio: string
}

export async function listarPrevisoesPorRua(consulta: ConsultaPrevisao): Promise<PrevisaoRua[]> {
  const [linhas, ruasComMedicao] = await Promise.all([listarLinhas(consulta), listarRuasComMedicao()])
  return [...agruparPorRua(linhas).values()]
    .map(grupo => montarPrevisao(grupo, ruasComMedicao))
    .sort(porMaiorChance)
}

export async function previsaoDaRua(ruaId: string, diaSemana: number, faixaInicio: string): Promise<PrevisaoRua | undefined> {
  const [previsao] = await listarPrevisoesPorRua({ ruaIds: [ruaId], diaSemana, faixaInicio })
  return previsao
}

export async function noiteDaRua(ruaId: string, diaSemana: number, faixaAtual: string): Promise<PontoDaNoite[]> {
  const linhas = await useDb()
    .select({ faixa: medicoes.faixaInicio, vagasTotais: medicoes.vagasTotais, vagasOcupadas: medicoes.vagasOcupadas })
    .from(medicoes)
    .where(and(eq(medicoes.ruaId, ruaId), eq(medicoes.diaSemana, diaSemana), inArray(medicoes.faixaInicio, [...faixasDaNoite])))
  return faixasDaNoite.map(faixa => ({
    faixa,
    rotulo: rotuloCurtoDaFaixa(faixa),
    chance: chancePontual(taxasDaFaixa(linhas, faixa)) ?? 0,
    agora: faixa.slice(0, 2) === faixaAtual.slice(0, 2),
  }))
}

function taxasDaFaixa(linhas: { faixa: string, vagasTotais: number, vagasOcupadas: number }[], faixa: string): number[] {
  return linhas.filter(linha => linha.faixa.startsWith(faixa)).map(linha => linha.vagasOcupadas / linha.vagasTotais)
}

function listarLinhas(consulta: ConsultaPrevisao) {
  return useDb()
    .select({
      ruaId: ruas.id,
      nome: ruas.nome,
      distanciaM: ruas.distanciaDaReferenciaM,
      vagasTotais: medicoes.vagasTotais,
      vagasOcupadas: medicoes.vagasOcupadas,
      medidoEm: medicoes.medidoEm,
    })
    .from(ruas)
    .leftJoin(medicoes, and(
      eq(medicoes.ruaId, ruas.id),
      eq(medicoes.diaSemana, consulta.diaSemana),
      eq(medicoes.faixaInicio, consulta.faixaInicio),
    ))
    .where(filtroDaConsulta(consulta))
}

function filtroDaConsulta(consulta: ConsultaPrevisao) {
  if (consulta.ruaIds) return inArray(ruas.id, consulta.ruaIds)
  return eq(ruas.areaId, consulta.areaId ?? '')
}

async function listarRuasComMedicao(): Promise<Set<string>> {
  const linhas = await useDb().selectDistinct({ ruaId: medicoes.ruaId }).from(medicoes)
  return new Set(linhas.map(linha => linha.ruaId))
}

type LinhaMedicao = Awaited<ReturnType<typeof listarLinhas>>[number]

function agruparPorRua(linhas: LinhaMedicao[]): Map<string, [LinhaMedicao, ...LinhaMedicao[]]> {
  const grupos = new Map<string, [LinhaMedicao, ...LinhaMedicao[]]>()
  for (const linha of linhas) {
    const grupo = grupos.get(linha.ruaId)
    if (grupo) grupo.push(linha)
    else grupos.set(linha.ruaId, [linha])
  }
  return grupos
}

function montarPrevisao(grupo: [LinhaMedicao, ...LinhaMedicao[]], ruasComMedicao: Set<string>): PrevisaoRua {
  const [primeira] = grupo
  const taxas = grupo.flatMap(linha =>
    linha.vagasTotais && linha.vagasOcupadas !== null ? [linha.vagasOcupadas / linha.vagasTotais] : [],
  )
  return {
    ruaId: primeira.ruaId,
    nome: primeira.nome,
    distanciaM: primeira.distanciaM,
    estado: classificarOcupacao(taxas.length ? media(taxas) : null),
    chance: faixaDeChance(taxas),
    medidoEm: maisRecente(grupo.map(linha => linha.medidoEm))?.toISOString() ?? null,
    temMedicao: ruasComMedicao.has(primeira.ruaId),
  }
}

function porMaiorChance(a: PrevisaoRua, b: PrevisaoRua): number {
  return (b.chance?.max ?? -1) - (a.chance?.max ?? -1) || a.distanciaM - b.distanciaM
}

function media(valores: number[]): number {
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length
}

function maisRecente(datas: (Date | null)[]): Date | null {
  return datas.reduce<Date | null>((atual, data) => (data && (!atual || data > atual) ? data : atual), null)
}
