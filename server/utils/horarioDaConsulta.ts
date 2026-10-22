import { z } from 'zod'
import { diaDaSemanaAtual, faixaDeTrintaMinutosAtual } from '../../shared/utils/horario'

export const esquemaHorario = z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Use o formato HH:00 ou HH:30').optional()

export function momentoDaConsulta(horario: string | undefined): { diaSemana: number, faixaInicio: string, tempoReal: boolean } {
  const atual = faixaDeTrintaMinutosAtual()
  return { diaSemana: diaDaSemanaAtual(), faixaInicio: horario ?? atual, tempoReal: !horario || horario === atual }
}
