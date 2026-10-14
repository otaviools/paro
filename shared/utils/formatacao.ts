import { FUSO, horaLocal } from './horario'

export function formatarHora(data: Date | string | null | undefined): string {
  if (!data) return '—'
  return horaLocal(new Date(data))
}

export function formatarHoraCompacta(data: Date | string | null | undefined): string {
  if (!data) return '—'
  return horaLocal(new Date(data)).replace(':', 'h')
}

export function formatarDuracao(minutos: number): string {
  const total = Math.max(0, Math.round(minutos))
  const horas = Math.floor(total / 60)
  const resto = total % 60
  if (horas === 0) return `${resto}min`
  if (resto === 0) return `${horas}h`
  return `${horas}h ${String(resto).padStart(2, '0')}min`
}

export function minutosEntre(inicio: Date | string, fim: Date | string): number {
  return (new Date(fim).getTime() - new Date(inicio).getTime()) / 60000
}

export function formatarDataCurta(data: Date | string): string {
  const partes = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'short', day: 'numeric', month: 'short' }).formatToParts(new Date(data))
  const valor = (tipo: Intl.DateTimeFormatPartTypes) => partes.find(parte => parte.type === tipo)?.value.replace('.', '') ?? ''
  return `${capitalizar(valor('weekday'))}, ${valor('day')} ${valor('month')}`
}

export function formatarDistancia(metros: number): string {
  if (metros >= 1000) return `${(metros / 1000).toFixed(1).replace('.', ',')} km`
  return `${Math.round(metros / 10) * 10} m`
}

export function minutosAPe(metros: number): number {
  return Math.max(1, Math.round(metros / 70))
}

export function minutosDeCarro(metros: number): number {
  return Math.max(1, Math.round(metros / 250))
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
