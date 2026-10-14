import type { PrevisaoRua } from '#shared/types/previsao'

export function useTelaDeRuas(ruaId: MaybeRefOrGetter<string | undefined>) {
  const { horario } = useHorario()
  const ordem = useState<'chance' | 'distancia'>('ordem-das-ruas', () => 'chance')
  const previsoes = usePrevisoes(horario)
  const pesquisa = usePesquisa()
  const ordenadas = computed<PrevisaoRua[]>(() => ordenarRuas(previsoes.data.value, ordem.value))
  const tabela = useTabelaDeRuas(ordenadas, pesquisa.data)
  const selecionada = computed(() => toValue(ruaId) ?? previsoes.data.value.find(previsao => previsao.chance)?.ruaId)
  const detalhe = useDetalheRua(selecionada, horario)
  const noite = useNoiteDaRua(selecionada, horario)
  const medidoEm = computed(() => previsoes.data.value.find(previsao => previsao.medidoEm)?.medidoEm)
  return { horario, ordem, previsoes, ordenadas, tabela, selecionada, detalhe, noite, medidoEm, carregar: () => Promise.all([previsoes, pesquisa, detalhe, noite]) }
}

function ordenarRuas(previsoes: PrevisaoRua[], ordem: 'chance' | 'distancia'): PrevisaoRua[] {
  if (ordem === 'chance') return previsoes
  return [...previsoes].sort((a, b) => Number(b.temMedicao) - Number(a.temMedicao) || a.distanciaM - b.distanciaM)
}
