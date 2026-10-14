export type TipoDeGrafico = 'barras' | 'colunas' | 'empilhado' | 'rosca' | 'numeros'

export interface Opcao {
  opcao: string
  percentual: number
}

export interface GrupoDeRespostas {
  grupo: string
  base: number
  opcoes: Opcao[]
}

export interface Pergunta {
  pergunta: number
  titulo: string
  resumo: string
  tipo: TipoDeGrafico
  destaque: string | null
  grupos: GrupoDeRespostas[]
}

export interface Indicador {
  valor: string
  rotulo: string
  detalhe: string
}

export interface ResumoDaPesquisa {
  respostasValidas: number
  indicadores: Indicador[]
  perguntas: Pergunta[]
}

export interface LinhaDaPesquisa {
  numero: number
  pergunta: string
  grupo: string
  resposta: string
  percentual: number
  pessoas: number
  base: number
}
