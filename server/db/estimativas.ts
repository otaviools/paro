import { and, eq } from 'drizzle-orm'
import type { Banco } from './conexao'
import { estimativasDaPesquisa, resultadosDaPesquisa, ruas } from './schema'
import { intervaloDeWilson, NIVEL_DE_CONFIANCA_PERCENTUAL } from '../../shared/utils/confianca'

export const PERGUNTA_ONDE_CONSEGUEM_VAGA = 4
const GRUPO_GERAL = 'Todos'
const METODO = 'wilson'

export async function calcularEstimativasDaPesquisa(banco: Banco): Promise<number> {
  const linhas = await banco
    .select({ ruaId: ruas.id, percentual: resultadosDaPesquisa.percentual, base: resultadosDaPesquisa.base })
    .from(resultadosDaPesquisa)
    .innerJoin(ruas, eq(ruas.nome, resultadosDaPesquisa.opcao))
    .where(and(eq(resultadosDaPesquisa.pergunta, PERGUNTA_ONDE_CONSEGUEM_VAGA), eq(resultadosDaPesquisa.grupo, GRUPO_GERAL)))
  const estimativas = linhas.map(({ ruaId, percentual, base }) => {
    const intervalo = intervaloDeWilson(percentual / 100, base)
    return {
      ruaId,
      pergunta: PERGUNTA_ONDE_CONSEGUEM_VAGA,
      percentual,
      base,
      intervaloMin: intervalo.min,
      intervaloMax: intervalo.max,
      nivelDeConfianca: NIVEL_DE_CONFIANCA_PERCENTUAL,
      metodo: METODO,
    }
  })
  await banco.delete(estimativasDaPesquisa)
  if (estimativas.length) await banco.insert(estimativasDaPesquisa).values(estimativas)
  return estimativas.length
}
