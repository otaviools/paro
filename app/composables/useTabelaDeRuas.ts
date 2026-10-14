import type { PrevisaoRua } from '#shared/types/previsao'
import type { ResumoDaPesquisa } from '#shared/types/pesquisa'

const PERGUNTA_ONDE_CONSEGUEM_VAGA = 4

export function useTabelaDeRuas(previsoes: Ref<PrevisaoRua[]>, pesquisa: Ref<ResumoDaPesquisa | null>) {
  const citacoes = computed(() => {
    const pergunta = pesquisa.value?.perguntas.find(item => item.pergunta === PERGUNTA_ONDE_CONSEGUEM_VAGA)
    return pergunta?.grupos[0] ?? null
  })

  const linhas = computed(() => previsoes.value.map(previsao => ({
    ...previsao,
    citacao: citacoes.value?.opcoes.find(opcao => opcao.opcao === previsao.nome)?.percentual ?? null,
  })))

  const contraste = computed(() => {
    const maisCitada = [...linhas.value].sort((a, b) => (b.citacao ?? 0) - (a.citacao ?? 0))[0]
    const melhor = linhas.value.find(linha => linha.chance !== null)
    if (!maisCitada?.citacao || !melhor || maisCitada.ruaId === melhor.ruaId) return null
    return {
      titulo: 'A rua mais citada na pesquisa não é a de maior chance agora',
      texto: `${maisCitada.citacao}% dos respondentes costumam parar na ${maisCitada.nome}, que está ${rotuloDoEstado[maisCitada.estado].toLowerCase()}${maisCitada.medidoEm ? ` às ${formatarHora(maisCitada.medidoEm)}` : ''}. A ${melhor.nome}${melhor.citacao ? `, citada por ${melhor.citacao}%,` : ''} tem a maior chance.`,
    }
  })

  return { linhas, contraste, base: computed(() => citacoes.value?.base ?? 0) }
}
