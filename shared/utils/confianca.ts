import { horaLocal } from './horario'

export type NivelDeConfianca = 'baixa' | 'media' | 'alta'

export type OrigemDaChance = 'campo' | 'pesquisa' | 'combinada'

export interface FontesDaChance {
  contagens: number
  pesquisa: number | null
  relatos: number
}

export interface Confianca {
  origem: OrigemDaChance
  nivel: NivelDeConfianca
  amostra: number
  margem: number | null
  fontes?: FontesDaChance
}

export interface IntervaloDeWilson {
  centro: number
  min: number
  max: number
}

export const NIVEL_DE_CONFIANCA_PERCENTUAL = 95

const Z_95 = 1.96
const MARGEM_ALTA = 5
const MARGEM_MEDIA = 10
const CONTAGENS_PARA_ALTA = 6
const CONTAGENS_PARA_MEDIA = 3

export const rotuloDoNivel: Record<NivelDeConfianca, string> = {
  baixa: 'Confiança baixa',
  media: 'Confiança média',
  alta: 'Confiança alta',
}

export function intervaloDeWilson(proporcao: number, amostra: number, z = Z_95): IntervaloDeWilson {
  if (amostra <= 0) return { centro: proporcao, min: 0, max: 1 }
  const z2 = z * z
  const denominador = 1 + z2 / amostra
  const centro = (proporcao + z2 / (2 * amostra)) / denominador
  const meiaLargura = (z * Math.sqrt((proporcao * (1 - proporcao)) / amostra + z2 / (4 * amostra * amostra))) / denominador
  return { centro, min: Math.max(0, centro - meiaLargura), max: Math.min(1, centro + meiaLargura) }
}

export function confiancaDaPesquisa(proporcao: number, amostra: number): Confianca {
  const intervalo = intervaloDeWilson(proporcao, amostra)
  const margem = Math.round(((intervalo.max - intervalo.min) / 2) * 100)
  return { origem: 'pesquisa', nivel: nivelPelaMargem(margem), amostra, margem }
}

export function confiancaDoCampo(chances: number[]): Confianca {
  return {
    origem: 'campo',
    nivel: nivelPelasContagens(chances.length),
    amostra: chances.length,
    margem: margemDaMedia(chances),
  }
}

export function confiancaCombinada(fontes: FontesDaChance, margem: number): Confianca {
  const pontos = Math.round(margem * 100)
  return {
    origem: 'combinada',
    nivel: nivelPelaMargem(pontos),
    amostra: fontes.contagens + fontes.relatos,
    margem: pontos,
    fontes,
  }
}

export function origemDaChance(previsao: { medidoEm: string | null, confianca: Confianca | null }): string {
  if (previsao.medidoEm) return `medido às ${horaLocal(new Date(previsao.medidoEm))}`
  if (previsao.confianca?.origem === 'pesquisa') return 'pesquisa'
  if (previsao.confianca?.fontes) return `${previsao.confianca.fontes.relatos} ${previsao.confianca.fontes.relatos === 1 ? 'relato' : 'relatos'}`
  return 'chance'
}

export function descreverConfianca(confianca: Confianca): string {
  const margem = confianca.margem === null ? '' : `, ±${confianca.margem} p.p.`
  if (confianca.origem === 'pesquisa') return `estimativa da pesquisa${margem}`
  if (confianca.fontes) return `${descreverFontes(confianca.fontes)}${margem}`
  return `${descreverContagens(confianca.amostra)}${margem}`
}

export function descreverFontes(fontes: FontesDaChance): string {
  return [
    fontes.contagens ? descreverContagens(fontes.contagens) : null,
    fontes.pesquisa ? 'pesquisa' : null,
    fontes.relatos ? `${fontes.relatos} ${fontes.relatos === 1 ? 'relato' : 'relatos'}` : null,
  ].filter(Boolean).join(' + ')
}

function descreverContagens(contagens: number): string {
  return contagens === 1 ? '1 contagem de campo' : `${contagens} contagens de campo`
}

function nivelPelaMargem(margem: number): NivelDeConfianca {
  if (margem <= MARGEM_ALTA) return 'alta'
  if (margem <= MARGEM_MEDIA) return 'media'
  return 'baixa'
}

function nivelPelasContagens(contagens: number): NivelDeConfianca {
  if (contagens >= CONTAGENS_PARA_ALTA) return 'alta'
  if (contagens >= CONTAGENS_PARA_MEDIA) return 'media'
  return 'baixa'
}

function margemDaMedia(valores: number[]): number | null {
  if (valores.length < 2) return null
  const media = valores.reduce((soma, valor) => soma + valor, 0) / valores.length
  const variancia = valores.reduce((soma, valor) => soma + (valor - media) ** 2, 0) / (valores.length - 1)
  return Math.round(Z_95 * Math.sqrt(variancia / valores.length) * 100)
}
