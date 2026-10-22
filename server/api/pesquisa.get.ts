import { asc } from 'drizzle-orm'
import { resultadosDaPesquisa } from '../db/schema'
import { metadadosDasPerguntas, PERGUNTA_HORARIO, PERGUNTA_PREVISIBILIDADE, RESPOSTAS_VALIDAS } from '../../shared/utils/pesquisa'
import type { GrupoDeRespostas, Indicador, Pergunta, ResumoDaPesquisa } from '../../shared/types/pesquisa'

type Linha = typeof resultadosDaPesquisa.$inferSelect

export default defineEventHandler(async (): Promise<ResumoDaPesquisa> => {
  const linhas = await useDb().select().from(resultadosDaPesquisa).orderBy(asc(resultadosDaPesquisa.pergunta), asc(resultadosDaPesquisa.ordem))
  return {
    respostasValidas: RESPOSTAS_VALIDAS,
    indicadores: montarIndicadores(linhas),
    perguntas: montarPerguntas(linhas),
  }
})

function montarPerguntas(linhas: Linha[]): Pergunta[] {
  return Object.entries(metadadosDasPerguntas).map(([numero, metadados]) => ({
    pergunta: Number(numero),
    ...metadados,
    grupos: agruparPorGrupo(linhas.filter(linha => linha.pergunta === Number(numero))),
  }))
}

function agruparPorGrupo(linhas: Linha[]): GrupoDeRespostas[] {
  const nomes = [...new Set(linhas.map(linha => linha.grupo))]
  return nomes.map((grupo) => {
    const doGrupo = linhas.filter(linha => linha.grupo === grupo)
    return {
      grupo,
      base: doGrupo[0]?.base ?? 0,
      opcoes: doGrupo.map(linha => ({ opcao: linha.opcao, percentual: linha.percentual })),
    }
  })
}

function montarIndicadores(linhas: Linha[]): Indicador[] {
  const valor = (pergunta: number, opcao: string, grupo = 'Todos') =>
    linhas.find(linha => linha.pergunta === pergunta && linha.opcao === opcao && linha.grupo === grupo)
  const pico = valor(PERGUNTA_HORARIO, '18h30–19h59')
  const pouco = valor(PERGUNTA_PREVISIBILIDADE, 'acham a vaga pouco previsível')
  const previsivel = valor(PERGUNTA_PREVISIBILIDADE, 'acham a vaga previsível')
  const sim = valor(6, 'Sim')
  const talvez = valor(6, 'Talvez')
  return [
    { valor: `${pico?.percentual ?? 0}%`, rotulo: 'chegam entre 18h30 e 19h59', detalhe: 'pico de chegada' },
    { valor: `${pouco?.percentual ?? 0}%`, rotulo: 'acham a vaga pouco previsível', detalhe: `${previsivel?.percentual ?? 0}% acham previsível` },
    { valor: `${(sim?.percentual ?? 0) + (talvez?.percentual ?? 0)}%`, rotulo: 'usariam o Parô', detalhe: `${sim?.percentual ?? 0}% sim e ${talvez?.percentual ?? 0}% talvez` },
  ]
}
