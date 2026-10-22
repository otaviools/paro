export const FUSO = 'America/Sao_Paulo'

const DIAS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const horariosDasAbas = ['19:00', '21:00', '22:00'] as const

export const faixasDaNoite = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] as const

export function diaDaSemanaAtual(agora = new Date()): number {
  const dia = new Intl.DateTimeFormat('en-US', { timeZone: FUSO, weekday: 'short' }).format(agora)
  return DIAS.indexOf(dia)
}

export function faixaDeTrintaMinutosAtual(agora = new Date()): string {
  const [hora = '00', minuto = '00'] = horaLocal(agora).split(':')
  return `${hora}:${Number(minuto) < 30 ? '00' : '30'}`
}

export function faixaDaHoraCheia(faixa: string): string {
  return `${faixa.slice(0, 2)}:00`
}

export function horaLocal(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(data)
}

export function hojePorExtenso(agora = new Date()): string {
  const data = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'short', day: 'numeric', month: 'short' }).format(agora)
  return `Hoje, ${data}`
}

export function saudacao(agora = new Date()): string {
  const hora = Number(horaLocal(agora).slice(0, 2))
  if (hora < 5 || hora >= 18) return 'Boa noite'
  if (hora < 12) return 'Bom dia'
  return 'Boa tarde'
}

export function rotuloDaFaixa(faixa: string): string {
  return faixa.replace(':', 'h')
}

export function rotuloCurtoDaFaixa(faixa: string): string {
  return `${Number(faixa.slice(0, 2))}h`
}

export function minutosLocais(data: Date): number {
  const [hora = 0, minuto = 0] = horaLocal(data).split(':').map(Number)
  return hora * 60 + minuto
}

export function dataLocal(agora = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(agora)
}
