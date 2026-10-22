import { and, asc, eq, gte, lt } from 'drizzle-orm'
import { medicoes } from '../db/schema'
import { diaDaSemanaDaData, limitesDoDia, momentoDaContagem } from '../../shared/utils/contagem'
import type { Contagem, ContagensDoDia } from '../../shared/types/admin'

export function filtroDoDia(ruaId: string, data: string) {
  const { inicio, fim } = limitesDoDia(data)
  return and(eq(medicoes.ruaId, ruaId), gte(medicoes.medidoEm, inicio), lt(medicoes.medidoEm, fim))
}

export async function listarContagensDoDia(ruaId: string, data: string): Promise<Contagem[]> {
  const linhas = await useDb()
    .select({ faixa: medicoes.faixaInicio, vagasTotais: medicoes.vagasTotais, vagasOcupadas: medicoes.vagasOcupadas })
    .from(medicoes)
    .where(filtroDoDia(ruaId, data))
    .orderBy(asc(medicoes.faixaInicio))
  return linhas.map(linha => ({ ...linha, faixa: linha.faixa.slice(0, 5) }))
}

export async function substituirContagensDoDia({ ruaId, data, contagens }: ContagensDoDia): Promise<number> {
  const diaSemana = diaDaSemanaDaData(data)
  const linhas = contagens.map(contagem => ({
    ruaId,
    diaSemana,
    faixaInicio: contagem.faixa,
    vagasTotais: contagem.vagasTotais,
    vagasOcupadas: contagem.vagasOcupadas,
    fonte: 'campo' as const,
    medidoEm: momentoDaContagem(data, contagem.faixa),
  }))
  await useDb().transaction(async (transacao) => {
    await transacao.delete(medicoes).where(filtroDoDia(ruaId, data))
    if (linhas.length) await transacao.insert(medicoes).values(linhas)
  })
  return linhas.length
}

export function exigirDataPassada(data: string): void {
  if (momentoDaContagem(data, '00:00').getTime() > Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'A data da contagem não pode ser no futuro.' })
  }
}

export function exigirFaixasUnicas(contagens: Contagem[]): void {
  const faixas = contagens.map(contagem => contagem.faixa)
  if (new Set(faixas).size !== faixas.length) {
    throw createError({ statusCode: 400, statusMessage: 'Cada faixa de horário só pode aparecer uma vez.' })
  }
}
