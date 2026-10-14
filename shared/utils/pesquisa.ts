import type { TipoDeGrafico } from '../types/pesquisa'

export interface MetadadosDaPergunta {
  titulo: string
  resumo: string
  tipo: TipoDeGrafico
  destaque: string | null
}

export const RESPOSTAS_VALIDAS = 99

export const PERGUNTA_HORARIO = 2
export const PERGUNTA_ROTINA = 7
export const PERGUNTA_PREVISIBILIDADE = 9

export const metadadosDasPerguntas: Record<number, MetadadosDaPergunta> = {
  1: { titulo: 'Como chega à região', resumo: 'Mais da metade vai de carro próprio.', tipo: 'rosca', destaque: 'Carro próprio' },
  2: { titulo: 'Horário de chegada', resumo: 'Três em cada quatro chegam entre 18h30 e 19h59.', tipo: 'colunas', destaque: '18h30–19h59' },
  3: { titulo: 'Tempo para achar vaga', resumo: 'Para 44%, a busca passa de 10 minutos.', tipo: 'colunas', destaque: '5 a 10 min' },
  4: { titulo: 'Onde costumam conseguir vaga', resumo: 'A Av. Vasconcelos Costa é a mais citada. Cada pessoa podia marcar mais de uma rua.', tipo: 'barras', destaque: 'Av. Vasconcelos Costa' },
  5: { titulo: 'Como avaliam o trecho a pé', resumo: '42% acham ruim ou mais ruim que bom; entre motoristas, 46%.', tipo: 'empilhado', destaque: null },
  6: { titulo: 'Usariam o Parô', resumo: 'Motoristas são os mais interessados: 71% dizem que sim.', tipo: 'empilhado', destaque: null },
  7: { titulo: 'Rotina de quem respondeu', resumo: 'Quem vai à região vai quase todo dia, no mesmo horário e pelo mesmo caminho.', tipo: 'numeros', destaque: null },
  8: { titulo: 'Como topariam ajudar a previsão', resumo: 'A maioria aceita compartilhar a localização só quando ligar a opção.', tipo: 'barras', destaque: 'Localização só quando eu ligar' },
}

export const rotulosCurtosDaRotina: Record<string, string> = {
  'estudam na ESAMC': 'estudam na ESAMC',
  'vão todos os dias úteis': 'todo dia útil',
  'saem entre 21h e 22h59': 'saem 21h–23h',
  'fazem sempre ou quase sempre o mesmo trajeto': 'mesmo trajeto',
}

export const notaDaRotina = 'Outros vínculos com a região: 19% trabalham, 8% moram, 3% vão por compras, serviços ou lazer e 1% é professor na ESAMC. Sobre o trajeto: 37% fazem sempre o mesmo e 59% quase sempre.'

export const notaDaBase = 'Base: 99 respostas que aceitaram o termo de participação. Percentuais arredondados; perguntas de múltipla escolha somam mais de 100%. Na pergunta sobre ajuda à previsão, 1% marcou nenhuma das opções.'
