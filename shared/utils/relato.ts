import type { EstadoOcupacao } from './ocupacao'

export type EstadoRelatado = Exclude<EstadoOcupacao, 'sem_dado'>

export type TempoParaAchar = 'ate_2' | 'de_2_a_5' | 'mais_de_5' | 'desisti'

export interface RespostaDoRelato {
  estado?: EstadoRelatado | null
  tempo?: TempoParaAchar | null
}

export interface Componente {
  ocupacao: number
  peso: number
}

export const estadosRelatados: EstadoRelatado[] = ['livre', 'apertado', 'lotado']

export const temposParaAchar: TempoParaAchar[] = ['ate_2', 'de_2_a_5', 'mais_de_5', 'desisti']

export const rotuloDoTempo: Record<TempoParaAchar, string> = {
  ate_2: 'Menos de 2 min',
  de_2_a_5: '2 a 5 min',
  mais_de_5: 'Mais de 5 min',
  desisti: 'Desisti',
}

export const ocupacaoDoEstado: Record<EstadoRelatado, number> = {
  livre: 0.45,
  apertado: 0.75,
  lotado: 0.95,
}

export const ocupacaoDoTempo: Record<TempoParaAchar, number> = {
  ate_2: 0.5,
  de_2_a_5: 0.75,
  mais_de_5: 0.9,
  desisti: 1,
}

export const PESO_SEM_EMAIL = 0.5
export const PESO_COM_EMAIL = 1
export const BONUS_PERTO_DA_RUA = 0.5
export const PESO_DA_PESQUISA = 5
export const PESO_DA_CONTAGEM = 10
export const MULTIPLICADOR_TEMPO_REAL = 3
export const MINUTOS_DE_TEMPO_REAL = 20
export const RAIO_PERTO_DA_RUA_M = 150
export const REPUTACAO_MINIMA = 0.25
export const REPUTACAO_MAXIMA = 2
export const RELATOS_PARA_CONSENSO = 3

const Z_95 = 1.96
const VARIANCIA_MINIMA = 0.01
const DIFERENCA_DE_ACERTO = 0.15
const DIFERENCA_DE_ERRO = 0.3
const PREMIO_DE_ACERTO = 0.1
const CASTIGO_DE_ERRO = 0.2

export function ocupacaoDoRelato({ estado, tempo }: RespostaDoRelato): number | null {
  const valores = [estado ? ocupacaoDoEstado[estado] : null, tempo ? ocupacaoDoTempo[tempo] : null]
    .filter((valor): valor is number => valor !== null)
  if (valores.length === 0) return null
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length
}

export function pesoDoRelato({ verificado, perto, reputacao }: { verificado: boolean, perto: boolean, reputacao: number }): number {
  const base = (verificado ? PESO_COM_EMAIL : PESO_SEM_EMAIL) + (perto ? BONUS_PERTO_DA_RUA : 0)
  return verificado ? base * limitarReputacao(reputacao) : base
}

export function limitarReputacao(reputacao: number): number {
  return Math.min(REPUTACAO_MAXIMA, Math.max(REPUTACAO_MINIMA, reputacao))
}

export function novaReputacao(reputacao: number, ocupacaoRelatada: number, referencia: number): number {
  const diferenca = Math.abs(ocupacaoRelatada - referencia)
  if (diferenca <= DIFERENCA_DE_ACERTO) return limitarReputacao(reputacao + PREMIO_DE_ACERTO)
  if (diferenca > DIFERENCA_DE_ERRO) return limitarReputacao(reputacao - CASTIGO_DE_ERRO)
  return limitarReputacao(reputacao)
}

export function combinarOcupacoes(componentes: Componente[]): { media: number, margem: number } | null {
  const pesoTotal = componentes.reduce((soma, item) => soma + item.peso, 0)
  if (pesoTotal <= 0) return null
  const media = componentes.reduce((soma, item) => soma + item.ocupacao * item.peso, 0) / pesoTotal
  const variancia = componentes.reduce((soma, item) => soma + item.peso * (item.ocupacao - media) ** 2, 0) / pesoTotal
  const somaDosQuadrados = componentes.reduce((soma, item) => soma + item.peso ** 2, 0)
  const amostraEfetiva = pesoTotal ** 2 / somaDosQuadrados
  return { media, margem: Z_95 * Math.sqrt((variancia + VARIANCIA_MINIMA) / amostraEfetiva) }
}

export function relatadoHa(relatadoEm: Date, agora = new Date()): number {
  return Math.max(0, Math.floor((agora.getTime() - relatadoEm.getTime()) / 60000))
}
