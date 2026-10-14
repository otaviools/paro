import { and, eq } from 'drizzle-orm'
import { resultadosDaPesquisa, ruas } from '../db/schema'
import type { CitacaoNaPesquisa } from '../../shared/types/previsao'

export const PERGUNTA_ONDE_CONSEGUEM_VAGA = 4

export async function buscarRua(ruaId: string) {
  const [rua] = await useDb().select().from(ruas).where(eq(ruas.id, ruaId))
  if (!rua) throw createError({ statusCode: 404, statusMessage: 'Rua não encontrada. Volte e escolha outra rua.' })
  return rua
}

export async function citacaoNaPesquisa(nomeDaRua: string): Promise<CitacaoNaPesquisa | null> {
  const [linha] = await useDb()
    .select({ percentual: resultadosDaPesquisa.percentual, base: resultadosDaPesquisa.base })
    .from(resultadosDaPesquisa)
    .where(and(eq(resultadosDaPesquisa.pergunta, PERGUNTA_ONDE_CONSEGUEM_VAGA), eq(resultadosDaPesquisa.opcao, nomeDaRua)))
  return linha ?? null
}
