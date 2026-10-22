import { and, eq, inArray } from 'drizzle-orm'
import { estimativasDaPesquisa, medicoes, ruas } from '../db/schema'
import { chancePontual, classificarOcupacao, faixaDeChance, faixaDoIntervalo } from '../../shared/utils/ocupacao'
import { confiancaCombinada, confiancaDaPesquisa, confiancaDoCampo } from '../../shared/utils/confianca'
import { faixasDaNoite, rotuloCurtoDaFaixa } from '../../shared/utils/horario'
import { combinarOcupacoes, PESO_DA_CONTAGEM, PESO_DA_PESQUISA, type Componente } from '../../shared/utils/relato'
import type { PontoDaNoite, PrevisaoRua } from '../../shared/types/previsao'

export interface ConsultaPrevisao {
  areaId?: string
  ruaIds?: string[]
  diaSemana: number
  faixaInicio: string
  tempoReal?: boolean
}

const SEM_RELATOS: RelatosDaRua = { componentes: [], quantidade: 0, recente: null }

type Estimativa = typeof estimativasDaPesquisa.$inferSelect

export async function listarPrevisoesPorRua(consulta: ConsultaPrevisao): Promise<PrevisaoRua[]> {
  const [linhas, ruasComMedicao, estimativas, relatosDaConsulta] = await Promise.all([
    listarLinhas(consulta),
    listarRuasComMedicao(),
    listarEstimativas(),
    listarRelatos({ ruaIds: consulta.ruaIds, diaSemana: consulta.diaSemana, faixas: [consulta.faixaInicio], tempoReal: consulta.tempoReal ?? false }),
  ])
  const relatosPorRua = agruparRelatos(relatosDaConsulta)
  return [...agruparPorRua(linhas).values()]
    .map(grupo => montarPrevisao(grupo, ruasComMedicao, {
      estimativa: estimativas.get(grupo[0].ruaId),
      relatos: relatosPorRua.get(grupo[0].ruaId) ?? SEM_RELATOS,
    }))
    .sort(porMaiorChance)
}

export async function previsaoDaRua(ruaId: string, diaSemana: number, faixaInicio: string, tempoReal = false): Promise<PrevisaoRua | undefined> {
  const [previsao] = await listarPrevisoesPorRua({ ruaIds: [ruaId], diaSemana, faixaInicio, tempoReal })
  return previsao
}

export async function noiteDaRua(ruaId: string, diaSemana: number, faixaAtual: string): Promise<PontoDaNoite[]> {
  const [linhas, estimativas, relatosDaNoite] = await Promise.all([
    useDb()
      .select({ faixa: medicoes.faixaInicio, vagasTotais: medicoes.vagasTotais, vagasOcupadas: medicoes.vagasOcupadas })
      .from(medicoes)
      .where(and(eq(medicoes.ruaId, ruaId), eq(medicoes.diaSemana, diaSemana), inArray(medicoes.faixaInicio, [...faixasDaNoite]))),
    listarEstimativas(),
    listarRelatos({ ruaIds: [ruaId], diaSemana, faixas: faixasDaNoite.flatMap(faixa => [faixa, faixa.replace(':00', ':30')]), tempoReal: false }),
  ])
  const estimativa = estimativas.get(ruaId)
  return faixasDaNoite.map(faixa => ({
    faixa,
    rotulo: rotuloCurtoDaFaixa(faixa),
    agora: faixa.slice(0, 2) === faixaAtual.slice(0, 2),
    ...chanceDoPonto(taxasDaFaixa(linhas, faixa), estimativa, relatosDaFaixa(relatosDaNoite, faixa)),
  }))
}

function chanceDoPonto(taxas: number[], estimativa: Estimativa | undefined, relatosDoPonto: Componente[]): Pick<PontoDaNoite, 'chance' | 'origem'> {
  const combinado = relatosDoPonto.length ? combinarOcupacoes([...componentesFixos(taxas, estimativa), ...relatosDoPonto]) : null
  if (combinado) return { chance: Math.round((1 - combinado.media) * 20) * 5, origem: 'combinada' }
  const campo = chancePontual(taxas)
  if (campo !== null) return { chance: campo, origem: 'campo' }
  if (estimativa) return { chance: Math.round(estimativa.percentual / 5) * 5, origem: 'pesquisa' }
  return { chance: 0, origem: null }
}

function componentesFixos(taxas: number[], estimativa: Estimativa | undefined): Componente[] {
  const contagens = taxas.map(taxa => ({ ocupacao: taxa, peso: PESO_DA_CONTAGEM }))
  if (!estimativa) return contagens
  return [...contagens, { ocupacao: 1 - estimativa.percentual / 100, peso: PESO_DA_PESQUISA }]
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

async function listarEstimativas(): Promise<Map<string, Estimativa>> {
  const linhas = await useDb().select().from(estimativasDaPesquisa)
  return new Map(linhas.map(linha => [linha.ruaId, linha]))
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

interface FontesDaRua {
  estimativa: Estimativa | undefined
  relatos: RelatosDaRua
}

type ChanceDaRua = Pick<PrevisaoRua, 'estado' | 'chance' | 'medidoEm' | 'confianca'>

function montarPrevisao(grupo: [LinhaMedicao, ...LinhaMedicao[]], ruasComMedicao: Set<string>, fontes: FontesDaRua): PrevisaoRua {
  const [primeira] = grupo
  const taxas = grupo.flatMap(linha =>
    linha.vagasTotais && linha.vagasOcupadas !== null ? [linha.vagasOcupadas / linha.vagasTotais] : [],
  )
  return {
    ruaId: primeira.ruaId,
    nome: primeira.nome,
    distanciaM: primeira.distanciaM,
    temMedicao: ruasComMedicao.has(primeira.ruaId) || fontes.estimativa !== undefined || fontes.relatos.quantidade > 0,
    relatoRecente: fontes.relatos.recente,
    ...(fontes.relatos.quantidade ? chanceCombinada(taxas, grupo, fontes) : chanceDaRua(taxas, grupo, fontes.estimativa)),
  }
}

function chanceCombinada(taxas: number[], grupo: LinhaMedicao[], { estimativa, relatos }: FontesDaRua): ChanceDaRua {
  const combinado = combinarOcupacoes([...componentesFixos(taxas, estimativa), ...relatos.componentes])
  if (!combinado) return chanceDaRua(taxas, grupo, estimativa)
  const chance = 1 - combinado.media
  return {
    estado: classificarOcupacao(combinado.media),
    chance: faixaDoIntervalo(Math.max(0, chance - combinado.margem), Math.min(1, chance + combinado.margem)),
    medidoEm: maisRecente(grupo.map(linha => linha.medidoEm))?.toISOString() ?? null,
    confianca: confiancaCombinada({ contagens: taxas.length, pesquisa: estimativa?.base ?? null, relatos: relatos.quantidade }, combinado.margem),
  }
}

function chanceDaRua(taxas: number[], grupo: LinhaMedicao[], estimativa: Estimativa | undefined): ChanceDaRua {
  if (taxas.length) {
    return {
      estado: classificarOcupacao(media(taxas)),
      chance: faixaDeChance(taxas),
      medidoEm: maisRecente(grupo.map(linha => linha.medidoEm))?.toISOString() ?? null,
      confianca: confiancaDoCampo(taxas.map(taxa => 1 - taxa)),
    }
  }
  if (estimativa) {
    const proporcao = estimativa.percentual / 100
    return {
      estado: classificarOcupacao(1 - proporcao),
      chance: faixaDoIntervalo(estimativa.intervaloMin, estimativa.intervaloMax),
      medidoEm: null,
      confianca: confiancaDaPesquisa(proporcao, estimativa.base),
    }
  }
  return { estado: 'sem_dado', chance: null, medidoEm: null, confianca: null }
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
