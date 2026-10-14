export type EstadoOcupacao = 'livre' | 'apertado' | 'lotado' | 'sem_dado'

export interface FaixaDeChance {
  min: number
  max: number
}

const LIMITE_APERTADO = 0.6
const LIMITE_LOTADO = 0.85

export const estadosDeOcupacao: EstadoOcupacao[] = ['livre', 'apertado', 'lotado', 'sem_dado']

export const rotuloDoEstado: Record<EstadoOcupacao, string> = {
  livre: 'Livre',
  apertado: 'Apertado',
  lotado: 'Lotado',
  sem_dado: 'Sem dado',
}

export const leituraDoEstado: Record<EstadoOcupacao, string> = {
  livre: 'boa chance',
  apertado: 'vai precisar procurar',
  lotado: 'considere alternativa',
  sem_dado: 'ainda não medimos',
}

export function classificarOcupacao(taxa: number | null): EstadoOcupacao {
  if (taxa === null) return 'sem_dado'
  if (taxa > LIMITE_LOTADO) return 'lotado'
  if (taxa > LIMITE_APERTADO) return 'apertado'
  return 'livre'
}

export function faixaDeChance(taxas: number[]): FaixaDeChance | null {
  if (taxas.length === 0) return null
  const chances = ordenarChances(taxas)
  return {
    min: arredondarPara5(percentil(chances, 0.25)),
    max: arredondarPara5(percentil(chances, 0.75)),
  }
}

export function chancePontual(taxas: number[]): number | null {
  if (taxas.length === 0) return null
  return arredondarPara5(percentil(ordenarChances(taxas), 0.5))
}

export function formatarChance(faixa: FaixaDeChance | null): string {
  if (faixa === null) return '—'
  if (faixa.max <= 5) return 'até 5%'
  if (faixa.min === faixa.max) return `${faixa.max}%`
  return `${faixa.min}–${faixa.max}%`
}

function ordenarChances(taxas: number[]): number[] {
  return taxas.map(taxa => 1 - taxa).sort((a, b) => a - b)
}

function percentil(valores: number[], p: number): number {
  const indice = (valores.length - 1) * p
  const base = Math.floor(indice)
  const atual = valores[base] ?? 0
  const proximo = valores[base + 1] ?? atual
  return atual + (indice - base) * (proximo - atual)
}

function arredondarPara5(valor: number): number {
  return Math.round(Math.round(valor * 1000) / 50) * 5
}
