import { z } from 'zod'
import type { OrigemDaChance } from '../utils/confianca'

export const esquemaContagem = z.object({
  faixa: z.string().regex(/^([01]\d|2[0-3]):[03]0$/, 'Faixa no formato HH:00 ou HH:30'),
  vagasTotais: z.number().int().min(1, 'Vagas totais precisa ser 1 ou mais').max(500),
  vagasOcupadas: z.number().int().min(0, 'Vagas ocupadas não pode ser negativo').max(500),
}).refine(contagem => contagem.vagasOcupadas <= contagem.vagasTotais, 'Ocupadas não pode passar das totais')

export const esquemaContagensDoDia = z.object({
  ruaId: z.uuid('Escolha a rua'),
  data: z.iso.date('Data no formato AAAA-MM-DD'),
  contagens: z.array(esquemaContagem).max(48),
})

export type Contagem = z.infer<typeof esquemaContagem>

export type ContagensDoDia = z.infer<typeof esquemaContagensDoDia>

export const esquemaCapacidade = z.object({
  capacidade: z.number().int().min(1, 'A capacidade precisa ser 1 ou mais').max(500).nullable(),
})

export interface ResumoDaRua {
  ruaId: string
  nome: string
  capacidade: number | null
  contagens: number
  diasMedidos: number
  ultimaContagem: string | null
}

export interface SessaoDeAdmin {
  admin: boolean
  configurado: boolean
}

export interface AcertoDaPrevisao {
  ruaId: string | null
  nome: string
  origem: OrigemDaChance | 'sem_rua' | null
  ajudou: number
  naoAjudou: number
}

export interface LinhaDeCalibracao {
  tipo: 'estado' | 'tempo'
  resposta: string
  rotulo: string
  valorDaTabela: number
  mediaDoCampo: number | null
  pares: number
}
