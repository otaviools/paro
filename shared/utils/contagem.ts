import { diaDaSemanaAtual } from './horario'

const DESLOCAMENTO_DE_SAO_PAULO = '-03:00'
const UM_DIA_EM_MS = 24 * 60 * 60 * 1000

export const faixasDeContagem = [
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
] as const

export function momentoDaContagem(data: string, faixa: string): Date {
  return new Date(`${data}T${faixa}:00${DESLOCAMENTO_DE_SAO_PAULO}`)
}

export function diaDaSemanaDaData(data: string): number {
  return diaDaSemanaAtual(momentoDaContagem(data, '12:00'))
}

export function limitesDoDia(data: string): { inicio: Date, fim: Date } {
  const inicio = momentoDaContagem(data, '00:00')
  return { inicio, fim: new Date(inicio.getTime() + UM_DIA_EM_MS) }
}

export function taxaDeOcupacao(vagasTotais: number, vagasOcupadas: number): number | null {
  if (vagasTotais <= 0 || vagasOcupadas < 0 || vagasOcupadas > vagasTotais) return null
  return vagasOcupadas / vagasTotais
}
