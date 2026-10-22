import { z } from 'zod'
import { estadosRelatados, temposParaAchar } from '../utils/relato'

export const esquemaRelato = z.object({
  ruaId: z.uuid('Escolha a rua'),
  estado: z.enum(estadosRelatados).nullable().optional(),
  tempo: z.enum(temposParaAchar).nullable().optional(),
  posicao: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]).nullable().optional(),
}).refine(relato => relato.estado || relato.tempo, 'Responda como estava a rua ou quanto tempo levou')

export type NovoRelato = z.infer<typeof esquemaRelato>

export interface RelatoRegistrado {
  ocupacao: number
  peso: number
  pertoDaRua: boolean
  substituiu: boolean
}
